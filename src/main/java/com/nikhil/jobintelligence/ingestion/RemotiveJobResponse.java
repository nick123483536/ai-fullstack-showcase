
package com.nikhil.jobintelligence.ingestion;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RemotiveJobResponse {

    private String title;

    @JsonProperty("company_name")
    private String companyName;

    private String category;

    @JsonProperty("candidate_required_location")
    private String candidateRequiredLocation;

    @JsonProperty("publication_date")
    private String publicationDate;

    private String url;

    public String getTitle() {
        return title;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getCategory() {
        return category;
    }

    public String getCandidateRequiredLocation() {
        return candidateRequiredLocation;
    }

    public String getPublicationDate() {
        return publicationDate;
    }

    public String getUrl() {
        return url;
    }
}