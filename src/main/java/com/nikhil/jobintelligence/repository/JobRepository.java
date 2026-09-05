package com.nikhil.jobintelligence.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nikhil.jobintelligence.entity.Job;

public interface JobRepository extends JpaRepository<Job,Long> {

}
