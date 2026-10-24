package com.nikhil.jobintelligence.ingestion;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** The parts of Jobicy's /api/v2/remote-jobs response that the client maps. */
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobicyApiResponse {

    private List<Job> jobs;

    public List<Job> getJobs() {
        return jobs;
    }

    public void setJobs(List<Job> jobs) {
        this.jobs = jobs;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Job {

        private Long id;
        private String url;
        private String jobTitle;
        private String companyName;
        private List<String> jobType;
        private String jobGeo;
        private String pubDate;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getJobTitle() {
            return jobTitle;
        }

        public void setJobTitle(String jobTitle) {
            this.jobTitle = jobTitle;
        }

        public String getCompanyName() {
            return companyName;
        }

        public void setCompanyName(String companyName) {
            this.companyName = companyName;
        }

        public List<String> getJobType() {
            return jobType;
        }

        public void setJobType(List<String> jobType) {
            this.jobType = jobType;
        }

        public String getJobGeo() {
            return jobGeo;
        }

        public void setJobGeo(String jobGeo) {
            this.jobGeo = jobGeo;
        }

        public String getPubDate() {
            return pubDate;
        }

        public void setPubDate(String pubDate) {
            this.pubDate = pubDate;
        }
    }
}
