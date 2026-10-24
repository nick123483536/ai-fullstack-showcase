package com.nikhil.jobintelligence.ingestion;

import java.util.List;

import org.springframework.stereotype.Component;

import com.nikhil.jobintelligence.dto.JobRequest;

public class IndeedJobSourceClient implements JobSourceClient {

    @Override
    public String getSourceName() {
        return "Indeed";
    }

    @Override
    public List<JobRequest> fetchJobs() {
        return List.of(
            createJob(
                "Java Backend Developer",
                "Indeed Example Company",
                "Kochi",
                "Full Time",
                "https://example.com/indeed/job/1"
            ),
            createJob(
                "React Developer",
                "Indeed Tech Company",
                "Remote",
                "Full Time",
                "https://example.com/indeed/job/2"
            )
        );
    }

    private JobRequest createJob(
            String title,
            String company,
            String location,
            String jobType,
            String jobUrl) {

        JobRequest request = new JobRequest();
        request.setTitle(title);
        request.setCompany(company);
        request.setLocation(location);
        request.setJobType(jobType);
        request.setJobUrl(jobUrl);

        return request;
    }
}