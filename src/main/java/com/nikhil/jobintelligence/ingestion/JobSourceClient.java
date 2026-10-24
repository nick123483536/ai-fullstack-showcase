package com.nikhil.jobintelligence.ingestion;

import java.util.List;

import com.nikhil.jobintelligence.dto.JobRequest;

public interface JobSourceClient {

    String getSourceName();

    List<JobRequest> fetchJobs();

    /**
     * Whether the scheduler may call this source every hour. Sources whose
     * terms ask for fewer requests return false and run four times a day.
     */
    default boolean hourly() {
        return false;
    }
}
