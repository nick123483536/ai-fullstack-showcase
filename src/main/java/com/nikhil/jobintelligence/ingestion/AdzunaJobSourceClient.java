package com.nikhil.jobintelligence.ingestion;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import com.nikhil.jobintelligence.dto.JobRequest;

/**
 * Adzuna's free job search API. It covers India (country code "in") and needs
 * a free App ID and key from https://developer.adzuna.com. Without them the
 * source stays switched off and returns no jobs.
 */
@Component
public class AdzunaJobSourceClient implements JobSourceClient {

    private static final Logger logger =
            LoggerFactory.getLogger(AdzunaJobSourceClient.class);

    /** Two pages of 50 every hour is 48 calls a day, inside the free quota. */
    private static final int PAGES = 2;
    private static final int PER_PAGE = 50;

    private final RestClient restClient;
    private final String appId;
    private final String appKey;
    private final String country;
    private final String what;

    public AdzunaJobSourceClient(
            @Value("${adzuna.app-id:}") String appId,
            @Value("${adzuna.app-key:}") String appKey,
            @Value("${adzuna.country:in}") String country,
            @Value("${adzuna.what:software developer}") String what) {

        this.appId = appId;
        this.appKey = appKey;
        this.country = country;
        this.what = what;

        this.restClient = RestClient.builder()
                .baseUrl("https://api.adzuna.com/v1/api")
                .build();
    }

    @Override
    public String getSourceName() {
        return "ADZUNA";
    }

    @Override
    public boolean hourly() {
        return true;
    }

    @Override
    public List<JobRequest> fetchJobs() {
        if (appId.isBlank() || appKey.isBlank()) {
            logger.info("Adzuna is not configured (set ADZUNA_APP_ID and ADZUNA_APP_KEY). Skipping.");
            return List.of();
        }

        List<JobRequest> jobs = new ArrayList<>();
        for (int page = 1; page <= PAGES; page++) {
            int current = page;
            try {
                AdzunaApiResponse response = restClient.get()
                        .uri(uri -> uri
                                .path("/jobs/{country}/search/{page}")
                                .queryParam("app_id", appId)
                                .queryParam("app_key", appKey)
                                .queryParam("results_per_page", PER_PAGE)
                                .queryParam("what", what)
                                .queryParam("sort_by", "date")
                                .queryParam("max_days_old", 7)
                                .queryParam("content-type", "application/json")
                                .build(country, current))
                        .retrieve()
                        .body(AdzunaApiResponse.class);

                if (response == null || response.getResults() == null || response.getResults().isEmpty()) {
                    break;
                }
                response.getResults().stream()
                        .map(this::mapToJobRequest)
                        .filter(Objects::nonNull)
                        .forEach(jobs::add);

            } catch (HttpClientErrorException.TooManyRequests e) {
                logger.warn("Adzuna rate limit reached on page {}. Keeping what was fetched.", current);
                break;
            } catch (Exception e) {
                logger.error("Failed to fetch page {} from Adzuna: {}", current, e.getMessage());
                break;
            }
        }
        return jobs;
    }

    private JobRequest mapToJobRequest(AdzunaApiResponse.Result job) {
        String title = clean(job.getTitle());
        String company = job.getCompany() == null ? null : clean(job.getCompany().getDisplayName());
        if (title == null || company == null || job.getRedirectUrl() == null) {
            return null;
        }

        JobRequest request = new JobRequest();
        request.setTitle(title);
        request.setCompany(company);
        String location = job.getLocation() == null ? null : clean(job.getLocation().getDisplayName());
        request.setLocation(location == null ? "India" : location);
        request.setJobType(jobType(job));
        request.setSource(getSourceName());
        request.setJobUrl(job.getRedirectUrl());
        request.setPostedAt(parseDate(job.getCreated()));
        return request;
    }

    /** contract_time says full or part time; contract_type says permanent or contract. */
    private String jobType(AdzunaApiResponse.Result job) {
        if ("part_time".equals(job.getContractTime())) {
            return "Part Time";
        }
        if ("contract".equals(job.getContractType())) {
            return "Contract";
        }
        return "Full Time";
    }

    /**
     * Adzuna marks `created` with a Z (e.g. 2026-10-24T08:16:17Z), but for India the
     * time is already Indian local time: read as UTC, fresh listings landed hours in
     * the future. So the zone marker is dropped and the time kept as local, like the
     * other sources.
     */
    private LocalDateTime parseDate(String created) {
        if (created == null || created.isBlank()) {
            return null;
        }
        try {
            String local = created.trim().replaceFirst("(Z|[+-]\\d{2}:?\\d{2})$", "");
            LocalDateTime posted = LocalDateTime.parse(local);
            LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
            return posted.isAfter(now) ? now : posted;
        } catch (Exception e) {
            return null;
        }
    }

    /** Adzuna highlights search words with <strong> tags; strip any markup and blank values. */
    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String text = value.replaceAll("<[^>]+>", "").trim();
        return text.isEmpty() ? null : text;
    }
}
