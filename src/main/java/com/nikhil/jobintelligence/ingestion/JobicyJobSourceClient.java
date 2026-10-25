package com.nikhil.jobintelligence.ingestion;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.nikhil.jobintelligence.dto.JobRequest;

/**
 * Jobicy's free remote jobs API (no key). Engineering roles open to
 * Asia-Pacific and to anywhere. Jobicy asks for no more than one sync an hour
 * and for its listing URL to be kept as the source, so the job URL is Jobicy's
 * own page.
 */
@Component
public class JobicyJobSourceClient implements JobSourceClient {

	private static final Logger logger = LoggerFactory.getLogger(JobicyJobSourceClient.class);

	/** Regions an applicant in India can apply from. */
	private static final List<String> GEOS = List.of("apac", "anywhere");

	private final RestClient restClient;

	public JobicyJobSourceClient() {
		this.restClient = RestClient.builder().baseUrl("https://jobicy.com/api/v2").build();
	}

	@Override
	public String getSourceName() {
		return "JOBICY";
	}

	@Override
	public List<JobRequest> fetchJobs() {
		// Keyed by URL, so a role listed for both regions is kept once.
		Map<String, JobRequest> jobs = new LinkedHashMap<>();
		for (String geo : GEOS) {
			try {
				JobicyApiResponse response = restClient.get()
						.uri(uri -> uri.path("/remote-jobs").queryParam("count", 50).queryParam("geo", geo)
								.queryParam("industry", "engineering").build())
						.retrieve().body(JobicyApiResponse.class);

				if (response == null || response.getJobs() == null) {
					continue;
				}
				for (JobicyApiResponse.Job job : response.getJobs()) {
					JobRequest request = mapToJobRequest(job);
					if (request != null) {
						jobs.putIfAbsent(request.getJobUrl(), request);
					}
				}
			} catch (Exception e) {
				logger.error("Failed to fetch {} jobs from Jobicy: {}", geo, e.getMessage());
			}
		}
		return new ArrayList<>(jobs.values());
	}

	private JobRequest mapToJobRequest(JobicyApiResponse.Job job) {
		if (isBlank(job.getJobTitle()) || isBlank(job.getCompanyName()) || isBlank(job.getUrl())) {
			return null;
		}

		JobRequest request = new JobRequest();
		request.setTitle(job.getJobTitle().trim());
		request.setCompany(job.getCompanyName().trim());
		request.setLocation(isBlank(job.getJobGeo()) ? "Remote" : "Remote, " + job.getJobGeo().trim());
		request.setJobType(
				job.getJobType() == null || job.getJobType().isEmpty() ? "Full Time" : job.getJobType().get(0));
		request.setSource(getSourceName());
		request.setJobUrl(job.getUrl());
		request.setPostedAt(parseDate(job.getPubDate()));
		request.setExternalId(job.getId() == null ? null : String.valueOf(job.getId()));
		return request;
	}

	/** Jobicy sends ISO 8601 with an offset, e.g. 2026-09-30T12:00:00+00:00. */
	private LocalDateTime parseDate(String pubDate) {
		if (isBlank(pubDate)) {
			return null;
		}
		try {
			return OffsetDateTime.parse(pubDate).atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
		} catch (Exception e) {
			return null;
		}
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
