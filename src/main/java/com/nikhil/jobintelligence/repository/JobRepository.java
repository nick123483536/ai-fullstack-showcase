package com.nikhil.jobintelligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nikhil.jobintelligence.entity.Job;

public interface JobRepository extends JpaRepository<Job,Long> {

	List<Job> findByTitleContainingIgnoreCase(String title);

	List<Job> findByLocationContainingIgnoreCase(String location);

	List<Job> findByCompanyContainingIgnoreCase(String company);

	List<Job> findByJobTypeContainingIgnoreCase(String jobType);
}
