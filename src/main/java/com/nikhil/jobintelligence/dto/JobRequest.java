package com.nikhil.jobintelligence.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;

public class JobRequest {
	
	@NotBlank(message = "Title is required")
	private String title;

	@NotBlank(message = "Company is required")
	private String company;

	@NotBlank(message = "Location is required")
	private String location;

	@NotBlank(message = "Job type is required")
	private String jobType;

	@NotBlank(message = "Source is required")
	private String source;

	@NotBlank(message = "Job URL is required")
	private String jobUrl;
	
	private LocalDateTime postedAt;

	private String externalId;
	

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getCompany() {
		return company;
	}

	public void setCompany(String company) {
		this.company = company;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getJobType() {
		return jobType;
	}

	public void setJobType(String jobType) {
		this.jobType = jobType;
	}

	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
	}

	public String getJobUrl() {
		return jobUrl;
	}

	public void setJobUrl(String jobUrl) {
		this.jobUrl = jobUrl;
	}

	public LocalDateTime getPostedAt() {
		return postedAt;
	}

	public void setPostedAt(LocalDateTime postedAt) {
		this.postedAt = postedAt;
	}

	public String getExternalId() {
		return externalId;
	}

	public void setExternalId(String externalId) {
		this.externalId = externalId;
	}
	
	
	
	

}
