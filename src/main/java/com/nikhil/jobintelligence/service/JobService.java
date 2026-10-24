package com.nikhil.jobintelligence.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.nikhil.jobintelligence.entity.Job;
import com.nikhil.jobintelligence.exception.JobNotFoundException;
import com.nikhil.jobintelligence.repository.JobRepository;
import com.nikhil.jobintelligence.specification.JobSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.nikhil.jobintelligence.dto.JobRequest;
import com.nikhil.jobintelligence.dto.JobResponse;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
public class JobService {

	private final JobRepository jobRepository;

	public JobService(JobRepository jobRepository) {
		this.jobRepository = jobRepository;
	}

	@CacheEvict(value = "jobs", allEntries = true)
	public JobResponse createJob(JobRequest request) {

		Job job = new Job();

		job.setTitle(request.getTitle());
		job.setCompany(request.getCompany());
		job.setLocation(request.getLocation());
		job.setJobType(request.getJobType());
		job.setSource(request.getSource());
		job.setJobUrl(request.getJobUrl());
		job.setPostedAt(request.getPostedAt());

		Job savedJob = jobRepository.save(job);

		return mapToResponse(savedJob);
	}

	@Cacheable("jobs")
	public List<JobResponse> getAllJobs() {
		return jobRepository.findAll().stream().map(this::mapToResponse).toList();
	}

	public JobResponse getJobById(Long id) {

		Job job = jobRepository.findById(id).orElseThrow(() -> new JobNotFoundException(id));

		return mapToResponse(job);
	}

	@CacheEvict(value = "jobs", allEntries = true)
	public JobResponse updateJob(Long id, JobRequest request) {

		Job existingJob = jobRepository.findById(id).orElseThrow(() -> new JobNotFoundException(id));

		existingJob.setTitle(request.getTitle());
		existingJob.setCompany(request.getCompany());
		existingJob.setLocation(request.getLocation());
		existingJob.setJobType(request.getJobType());
		existingJob.setSource(request.getSource());
		existingJob.setJobUrl(request.getJobUrl());
		existingJob.setPostedAt(request.getPostedAt());

		Job updatedJob = jobRepository.save(existingJob);
		return mapToResponse(updatedJob);
	}

	@CacheEvict(value = "jobs", allEntries = true)

	public void deleteJob(Long id) {

		Job job = jobRepository.findById(id).orElseThrow(() -> new JobNotFoundException(id));

		jobRepository.delete(job);
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

	public Page<JobResponse> searchJobs(String title, String location, String company, String jobType, String source,LocalDateTime postedAfter,
			Pageable pageable) {

		Specification<Job> specification = (root, query, criteriaBuilder) -> null;

		if (title != null && !title.isBlank()) {
			specification = specification.and(JobSpecification.hasTitle(title));
		}
		
		if (source != null && !source.isBlank()) {
		    specification = specification.and(
		            (root, query, criteriaBuilder) ->
		                    criteriaBuilder.equal(
		                            criteriaBuilder.upper(root.get("source")),
		                            source.trim().toUpperCase()
		                    )
		    );
		}

		if (location != null && !location.isBlank()) {
			specification = specification.and(JobSpecification.hasLocation(location));
		}

		if (company != null && !company.isBlank()) {
			specification = specification.and(JobSpecification.hasCompany(company));
		}

		if (jobType != null && !jobType.isBlank()) {
			specification = specification.and(JobSpecification.hasJobType(jobType));
		}
		if (postedAfter != null) {
		    specification = specification.and(
		            JobSpecification.postedAfter(postedAfter)
		    );
		}

		return jobRepository.findAll(specification, pageable).map(this::mapToResponse);
	}

	private JobResponse mapToResponse(Job job) {

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
}
