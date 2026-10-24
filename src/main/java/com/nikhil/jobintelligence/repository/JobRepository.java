package com.nikhil.jobintelligence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.nikhil.jobintelligence.entity.Job;

public interface JobRepository extends JpaRepository<Job,Long>,JpaSpecificationExecutor<Job> {

	List<Job> findByTitleContainingIgnoreCase(String title);

	List<Job> findByLocationContainingIgnoreCase(String location);

	List<Job> findByCompanyContainingIgnoreCase(String company);

	List<Job> findByJobTypeContainingIgnoreCase(String jobType);

    Optional<Job> findByJobUrl(String jobUrl);
}
