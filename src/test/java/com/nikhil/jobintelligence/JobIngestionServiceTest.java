package com.nikhil.jobintelligence;

import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.nikhil.jobintelligence.dto.JobRequest;
import com.nikhil.jobintelligence.dto.JobResponse;
import com.nikhil.jobintelligence.entity.Job;
import com.nikhil.jobintelligence.ingestion.JobIngestionService;
import com.nikhil.jobintelligence.ingestion.JobSourceClient;
import com.nikhil.jobintelligence.repository.JobRepository;
import com.nikhil.jobintelligence.service.JobService;

@ExtendWith(MockitoExtension.class)
class JobIngestionServiceTest {

    @Mock
    private JobSourceClient jobSourceClient;

    @Test
    void shouldReturnExistingJobWhenDuplicateUrlIsFound() {

        // Arrange
        JobService jobService = mock(JobService.class);
        JobRepository jobRepository = mock(JobRepository.class);

        JobIngestionService ingestionService =
                new JobIngestionService(
                        jobService,
                        jobRepository,
                        List.of(jobSourceClient)
                );

        JobRequest request = new JobRequest();

        request.setTitle("Backend Engineer");
        request.setCompany("Test Company");
        request.setLocation("Kochi");
        request.setJobType("FULL_TIME");
        request.setSource("TEST");
        request.setJobUrl("https://example.com/job-1");

        Job existingJob = new Job();

        existingJob.setId(1L);
        existingJob.setTitle("Backend Engineer");
        existingJob.setCompany("Test Company");
        existingJob.setLocation("Kochi");
        existingJob.setJobType("FULL_TIME");
        existingJob.setSource("TEST");
        existingJob.setJobUrl("https://example.com/job-1");

        when(jobRepository.findByJobUrl(request.getJobUrl()))
                .thenReturn(Optional.of(existingJob));

        // Act
        JobResponse response =
                ingestionService.ingestJob(request);

        // Assert
        verify(jobRepository)
                .findByJobUrl(request.getJobUrl());

        verify(jobService, never())
                .createJob(any());

        System.out.println(
                "Returned job ID: " + response.getId()
        );
    }

    @Test
    void shouldCreateJobWhenUrlDoesNotExist() {

        // Arrange
        JobService jobService = mock(JobService.class);
        JobRepository jobRepository = mock(JobRepository.class);

        JobIngestionService ingestionService =
                new JobIngestionService(
                        jobService,
                        jobRepository,
                        List.of(jobSourceClient)
                );

        JobRequest request = new JobRequest();

        request.setTitle("Java Developer");
        request.setCompany("New Company");
        request.setLocation("Kochi");
        request.setJobType("FULL_TIME");
        request.setSource("TEST");
        request.setJobUrl("https://example.com/new-job");

        JobResponse expectedResponse = new JobResponse();

        expectedResponse.setId(2L);
        expectedResponse.setTitle("Java Developer");
        expectedResponse.setCompany("New Company");
        expectedResponse.setLocation("Kochi");
        expectedResponse.setJobType("FULL_TIME");
        expectedResponse.setSource("TEST");
        expectedResponse.setJobUrl("https://example.com/new-job");

        when(jobRepository.findByJobUrl(request.getJobUrl()))
                .thenReturn(Optional.empty());

        when(jobService.createJob(request))
                .thenReturn(expectedResponse);

        // Act
        JobResponse response =
                ingestionService.ingestJob(request);

        // Assert
        verify(jobRepository)
                .findByJobUrl(request.getJobUrl());

        verify(jobService)
                .createJob(request);

        System.out.println(
                "Created job ID: " + response.getId()
        );
    }
}