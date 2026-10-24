package com.nikhil.jobintelligence.ingestion;

import java.util.List;

import org.springframework.stereotype.Component;

import com.nikhil.jobintelligence.dto.JobRequest;
import java.time.LocalDateTime;


public class LinkedInJobSourceClient implements JobSourceClient {

	@Override
	public String getSourceName() {
		return "LinkedIn";
	}

	public List<JobRequest> fetchJobs() {
		return List.of(
				createJob("Software Engineer", "Example Company", "Remote", "Full Time", "LinkedIn",
						"https://example.com/job/1", LocalDateTime.now().minusHours(2)),
				createJob("Backend Engineer", "Tech Company", "Bangalore", "Full Time", "LinkedIn",
						"https://example.com/job/2", LocalDateTime.now().minusDays(3)));
	}

	private JobRequest createJob(String title, String company, String location, String jobType, String source,
			String jobUrl, LocalDateTime postedAt) {

		JobRequest request = new JobRequest();

		request.setTitle(title);
		request.setCompany(company);
		request.setLocation(location);
		request.setJobType(jobType);
		request.setSource(source);
		request.setJobUrl(jobUrl);
		request.setPostedAt(postedAt);
		return request;
	}
}