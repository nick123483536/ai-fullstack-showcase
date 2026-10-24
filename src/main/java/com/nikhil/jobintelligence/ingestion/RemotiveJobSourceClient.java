
package com.nikhil.jobintelligence.ingestion;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.nikhil.jobintelligence.dto.JobRequest;

@Component
public class RemotiveJobSourceClient implements JobSourceClient {

    private static final Logger logger =
            LoggerFactory.getLogger(RemotiveJobSourceClient.class);

    private final RestClient restClient;

    public RemotiveJobSourceClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://remotive.com")
                .build();
    }

    @Override
    public String getSourceName() {
        return "REMOTIVE";
    }

    @Override
    public List<JobRequest> fetchJobs() {
        try {
            RemotiveApiResponse response = restClient.get()
                    .uri("/api/remote-jobs?limit=50")
                    .retrieve()
                    .body(RemotiveApiResponse.class);

            if (response == null || response.getJobs() == null) {
                return List.of();
            }

            return response.getJobs().stream()
                    .filter(job -> job.getTitle() != null)
                    .filter(job -> job.getCategory() != null)
                    .filter(job -> job.getCategory()
                            .equalsIgnoreCase("Software Development")
                            || job.getCategory()
                            .equalsIgnoreCase("Artificial Intelligence"))
                    .map(job -> {
                        JobRequest request = new JobRequest();

                        request.setTitle(job.getTitle());
                        request.setCompany(job.getCompanyName());
                        request.setLocation(
                                job.getCandidateRequiredLocation());
                        request.setJobType("REMOTE");
                        request.setSource(getSourceName());
                        request.setJobUrl(job.getUrl());

                        String publishedAt = job.getPublicationDate();
                        if (publishedAt != null) {
                        	request.setPostedAt(
                        	        LocalDateTime.parse(
                        	                publishedAt,
                        	                DateTimeFormatter.ISO_LOCAL_DATE_TIME
                        	        )
                        	);
                        }

                        return request;
                    })
                    .toList();

        } catch (Exception e) {
            logger.error("Failed to fetch jobs from Remotive: {}",
                    e.getMessage());
            return List.of();
        }
    }
}