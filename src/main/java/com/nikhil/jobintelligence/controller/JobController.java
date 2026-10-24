package com.nikhil.jobintelligence.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.nikhil.jobintelligence.service.JobService;
import jakarta.validation.Valid;
import com.nikhil.jobintelligence.dto.JobRequest;
import com.nikhil.jobintelligence.dto.JobResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/jobs")
@SecurityRequirement(name = "bearerAuth")
public class JobController {

	private final JobService jobService;

	public JobController(JobService jobService) {
		this.jobService = jobService;
	}

	@PostMapping
	@ApiResponses({ @ApiResponse(responseCode = "201", description = "Job created successfully"),
			@ApiResponse(responseCode = "400", description = "Validation failed") })
	@Operation(summary = "Create a new job", description = "Creates and stores a new job posting")
	public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request) {
		JobResponse createdJob = jobService.createJob(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
	}

	@GetMapping
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Jobs retrieved successfully") })
	@Operation(summary = "Get all jobs", description = "Retrieves all available job postings")
	public ResponseEntity<List<JobResponse>> getAllJobs() {
		return ResponseEntity.ok(jobService.getAllJobs());
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get job by ID", description = "Retrieves a specific job using its ID")
	public ResponseEntity<JobResponse> getJobById(@PathVariable("id") Long id) {
		return ResponseEntity.ok(jobService.getJobById(id));
	}

	@PutMapping("/{id}")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Job updated successfully"),
			@ApiResponse(responseCode = "400", description = "Validation failed"),
			@ApiResponse(responseCode = "404", description = "Job not found") })
	@Operation(summary = "Update a job", description = "Updates an existing job using its ID")
	public ResponseEntity<JobResponse> updateJob(@PathVariable("id") Long id, @Valid @RequestBody JobRequest request) {

		return ResponseEntity.ok(jobService.updateJob(id, request));
	}

	@DeleteMapping("/{id}")
	@ApiResponses({ @ApiResponse(responseCode = "204", description = "Job deleted successfully"),
			@ApiResponse(responseCode = "404", description = "Job not found") })
	@Operation(summary = "Delete a job", description = "Deletes a job using its ID")
	public ResponseEntity<Void> deleteJob(@PathVariable("id") Long id) {
		jobService.deleteJob(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/search")
	public ResponseEntity<Page<JobResponse>> searchJobs(
			@RequestParam(name = "title", required = false) String title,
			@RequestParam(name = "location", required = false) String location,
			@RequestParam(name = "company", required = false) String company,
			@RequestParam(name = "jobType", required = false) String jobType,
			@RequestParam(name = "postedWithin", required = false) String postedWithin,
			@RequestParam(name = "source", required = false) String source,
			Pageable pageable) {

	    LocalDateTime postedAfter = null;

	    if (postedWithin != null && !postedWithin.isBlank()) {
	        if (postedWithin.equals("1h")) {
	            postedAfter = LocalDateTime.now().minusHours(1);
	        } else if (postedWithin.equals("24h")) {
	            postedAfter = LocalDateTime.now().minusHours(24);
	        } else if (postedWithin.equals("3d")) {
	            postedAfter = LocalDateTime.now().minusDays(3);
	        } else if (postedWithin.equals("7d")) {
	            postedAfter = LocalDateTime.now().minusDays(7);
	        }
	    }

	   
	    Page<JobResponse> jobs = jobService.searchJobs(
	            title,
	            location,
	            company,
	            jobType,
	            source,
	            postedAfter,
	            pageable
	    );

	    return ResponseEntity.ok(jobs);
	}
}
