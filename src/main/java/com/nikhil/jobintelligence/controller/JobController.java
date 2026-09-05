package com.nikhil.jobintelligence.controller;

import java.util.List;

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
	public Job createJob(@Valid @RequestBody Job job) {
		return jobService.createJob(job);
	}

	@GetMapping
	public List<Job> getAllJobs() {
		return jobService.getAllJobs();
	}

	@GetMapping("/{id}")
	public Job getJobById(@PathVariable("id") Long id) {
		return jobService.getJobById(id);
	}

	@PutMapping("/{id}")
	public Job updateJob(@PathVariable("id") Long id, @Valid @RequestBody Job job) {
		return jobService.updateJob(id, job);
	}

	@DeleteMapping("/{id}")
	public void deleteJob(@PathVariable("id") Long id) {
		jobService.deleteJob(id);
	}
}
