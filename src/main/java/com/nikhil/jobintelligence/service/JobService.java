package com.nikhil.jobintelligence.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nikhil.jobintelligence.entity.Job;
import com.nikhil.jobintelligence.exception.JobNotFoundException;
import com.nikhil.jobintelligence.repository.JobRepository;

@Service
public class JobService {

	private final JobRepository jobRepository;

	public JobService(JobRepository jobRepository) {
		this.jobRepository = jobRepository;
	}

	public Job createJob(Job job) {
		return jobRepository.save(job);
	}

	public List<Job> getAllJobs() {
		return jobRepository.findAll();
	}

	public Job getJobById(Long id) {
		return jobRepository.findById(id).orElseThrow(() -> new JobNotFoundException("Job not found with id: " + id));
	}

	public Job updateJob(Long id, Job job) {
		Job existingJob = jobRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Job not found with id: " + id));

		existingJob.setTitle(job.getTitle());
		existingJob.setCompany(job.getCompany());
		existingJob.setLocation(job.getLocation());
		existingJob.setJobType(job.getJobType());
		existingJob.setSource(job.getSource());
		existingJob.setJobUrl(job.getJobUrl());

		return jobRepository.save(existingJob);
	}

	public void deleteJob(Long id) {
		jobRepository.deleteById(id);
	}

	public List<Job> searchByTitle(String title) {
		return jobRepository.findByTitleContainingIgnoreCase(title);
	}

	public List<Job> searchByLocation(String location) {
		return jobRepository.findByLocationContainingIgnoreCase(location);
	}

	public List<Job> searchByCompany(String company) {
		return jobRepository.findByCompanyContainingIgnoreCase(company);
	}

	public List<Job> searchByJobType(String jobType) {
		return jobRepository.findByJobTypeContainingIgnoreCase(jobType);
	}
}
