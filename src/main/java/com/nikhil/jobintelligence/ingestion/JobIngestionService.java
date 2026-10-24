package com.nikhil.jobintelligence.ingestion;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.nikhil.jobintelligence.dto.JobRequest;
import com.nikhil.jobintelligence.dto.JobResponse;
import com.nikhil.jobintelligence.entity.Job;
import com.nikhil.jobintelligence.repository.JobRepository;
import com.nikhil.jobintelligence.service.JobService;

@Service
public class JobIngestionService {

    private static final Logger log =
            LoggerFactory.getLogger(JobIngestionService.class);

    private final JobService jobService;
    private final JobRepository jobRepository;
    private final List<JobSourceClient> jobSourceClients;

    public JobIngestionService(
            JobService jobService,
            JobRepository jobRepository,
            List<JobSourceClient> jobSourceClients) {
        this.jobService = jobService;
        this.jobRepository = jobRepository;
        this.jobSourceClients = jobSourceClients;
    }

    public JobResponse ingestJob(JobRequest request) {
        Optional<Job> existingJob =
                jobRepository.findByJobUrl(request.getJobUrl());

        if (existingJob.isPresent()) {
            Job job = existingJob.get();

            JobResponse response = new JobResponse();
            response.setId(job.getId());
            response.setTitle(job.getTitle());
            response.setCompany(job.getCompany());
            response.setLocation(job.getLocation());
            response.setJobType(job.getJobType());
            response.setSource(job.getSource());
            response.setJobUrl(job.getJobUrl());
            response.setPostedAt(job.getPostedAt());

            return response;
        }

        return jobService.createJob(request);
    }

    /** Fetches and stores one source. A failing source logs and returns nothing, so the others still run. */
    private List<JobResponse> ingestFromClient(
            JobSourceClient client) {

        String sourceName = client.getSourceName();
        log.info("Starting job ingestion for source: {}", sourceName);

        try {
            List<JobRequest> fetchedJobs = client.fetchJobs();

            List<JobResponse> results = fetchedJobs.stream()
                    .peek(job -> job.setSource(sourceName))
                    .filter(this::isComplete)
                    .map(this::ingestJob)
                    .toList();

            log.info(
                    "Completed ingestion for {}. Fetched: {}, stored or already present: {}",
                    sourceName, fetchedJobs.size(), results.size());

            return results;
        } catch (Exception e) {
            log.error("Ingestion failed for {}: {}", sourceName, e.getMessage());
            return List.of();
        }
    }

    /** The job table requires every field; a listing missing one is skipped rather than failing the run. */
    private boolean isComplete(JobRequest job) {
        return notBlank(job.getTitle()) && notBlank(job.getCompany())
                && notBlank(job.getLocation()) && notBlank(job.getJobType())
                && notBlank(job.getJobUrl());
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }

    /** Manual sync from the app: every source, once. */
    public List<JobResponse> ingestJobsFromSource() {
        return jobSourceClients.stream()
                .flatMap(client -> ingestFromClient(client).stream())
                .toList();
    }

    /** Every hour: sources that allow it (Adzuna). */
    @Scheduled(fixedRate = 3600000)
    public void scheduledHourlyIngestion() {
        log.info("Starting hourly ingestion");
        jobSourceClients.stream()
                .filter(JobSourceClient::hourly)
                .forEach(this::ingestFromClient);
    }

    /** Four times a day: sources that ask for fewer requests (Jobicy, Remotive). */
    @Scheduled(cron = "0 0 0,6,12,18 * * *")
    public void scheduledDailyIngestion() {
        log.info("Starting four-times-a-day ingestion");
        jobSourceClients.stream()
                .filter(client -> !client.hourly())
                .forEach(this::ingestFromClient);
    }
}
