package com.nikhil.jobintelligence.ingestion;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/** The parts of Adzuna's /jobs/{country}/search response that the client maps. */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AdzunaApiResponse {

    private List<Result> results;

    public List<Result> getResults() {
        return results;
    }

    public void setResults(List<Result> results) {
        this.results = results;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {

        private String id;
        private String title;
        private String created;

        @JsonProperty("redirect_url")
        private String redirectUrl;

        @JsonProperty("contract_time")
        private String contractTime;

        @JsonProperty("contract_type")
        private String contractType;

        private Named company;
        private Named location;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getCreated() {
            return created;
        }

        public void setCreated(String created) {
            this.created = created;
        }

        public String getRedirectUrl() {
            return redirectUrl;
        }

        public void setRedirectUrl(String redirectUrl) {
            this.redirectUrl = redirectUrl;
        }

        public String getContractTime() {
            return contractTime;
        }

        public void setContractTime(String contractTime) {
            this.contractTime = contractTime;
        }

        public String getContractType() {
            return contractType;
        }

        public void setContractType(String contractType) {
            this.contractType = contractType;
        }

        public Named getCompany() {
            return company;
        }

        public void setCompany(Named company) {
            this.company = company;
        }

        public Named getLocation() {
            return location;
        }

        public void setLocation(Named location) {
            this.location = location;
        }
    }

    /** Adzuna wraps company and location names in an object with a display_name. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Named {

        @JsonProperty("display_name")
        private String displayName;

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }
    }
}
