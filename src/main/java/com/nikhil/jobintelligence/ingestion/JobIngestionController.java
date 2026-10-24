package com.nikhil.jobintelligence.ingestion;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nikhil.jobintelligence.dto.JobRequest;
import com.nikhil.jobintelligence.dto.JobResponse;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ingestion")
public class JobIngestionController {

    private final JobIngestionService ingestionService;

    public JobIngestionController(JobIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<JobResponse> ingestJob(@Valid @RequestBody JobRequest request) {
        JobResponse response = ingestionService.ingestJob(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/source")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<JobResponse>> ingestFromSource() {

        List<JobResponse> jobs =
                ingestionService.ingestJobsFromSource();

        return ResponseEntity.ok(jobs);
    }
}