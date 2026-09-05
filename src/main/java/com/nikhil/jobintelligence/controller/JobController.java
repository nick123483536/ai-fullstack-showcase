package com.nikhil.jobintelligence.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nikhil.jobintelligence.entity.Job;
import com.nikhil.jobintelligence.service.JobService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

	private final JobService jobService;

	public JobController(JobService jobService) {
		this.jobService = jobService;
	}

	@PostMapping
	public ResponseEntity<Job> createJob(@Valid @RequestBody Job job) {
		Job createdJob = jobService.createJob(job);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
	}

	@GetMapping
	public ResponseEntity<List<Job>> getAllJobs() {
		return ResponseEntity.ok(jobService.getAllJobs());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Job> getJobById(@PathVariable("id") Long id) {
		return ResponseEntity.ok(jobService.getJobById(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<Job> updateJob(@PathVariable("id") Long id, @Valid @RequestBody Job job) {

		return ResponseEntity.ok(jobService.updateJob(id, job));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteJob(@PathVariable("id") Long id) {
		jobService.deleteJob(id);
		return ResponseEntity.noContent().build();
	}
}
