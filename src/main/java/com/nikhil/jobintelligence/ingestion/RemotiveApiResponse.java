
package com.nikhil.jobintelligence.ingestion;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RemotiveApiResponse {

    private List<RemotiveJobResponse> jobs;

    public List<RemotiveJobResponse> getJobs() {
        return jobs;
    }

    public void setJobs(List<RemotiveJobResponse> jobs) {
        this.jobs = jobs;
    }
}