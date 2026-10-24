package com.nikhil.jobintelligence.specification;

import org.springframework.data.jpa.domain.Specification;

import com.nikhil.jobintelligence.entity.Job;
import java.time.LocalDateTime;
public class JobSpecification {

    public static Specification<Job> hasTitle(String title) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + title.toLowerCase() + "%"
                );
    }

    public static Specification<Job> hasLocation(String location) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("location")),
                        "%" + location.toLowerCase() + "%"
                );
    }

    public static Specification<Job> hasCompany(String company) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("company")),
                        "%" + company.toLowerCase() + "%"
                );
    }

    public static Specification<Job> hasJobType(String jobType) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("jobType")),
                        "%" + jobType.toLowerCase() + "%"
                );
    }
    
    public static Specification<Job> postedAfter(LocalDateTime time) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("postedAt"),
                        time
                );
    }
}