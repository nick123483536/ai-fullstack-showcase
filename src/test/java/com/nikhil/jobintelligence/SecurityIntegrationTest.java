package com.nikhil.jobintelligence;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void unauthenticatedUserCannotAccessJobs() throws Exception {
		mockMvc.perform(get("/api/jobs")).andExpect(status().isUnauthorized());
	}

	@Test
	void userCanAccessJobs() throws Exception {
		mockMvc.perform(get("/api/jobs").with(user("testuser").roles("USER"))).andExpect(status().isOk());
	}

	@Test
	void userCannotCreateJob() throws Exception {
		mockMvc.perform(post("/api/jobs").with(user("testuser").roles("USER"))).andExpect(status().isForbidden());
	}

	@Test
	void adminCanCreateJob() throws Exception {
		

		String uniqueJobUrl = "https://example.com/security-test-job-" + System.currentTimeMillis();

		String jobJson = """
		        {
		            "title": "Software Engineer",
		            "company": "Test Company",
		            "location": "Kochi",
		            "jobType": "FULL_TIME",
		            "source": "TEST",
		            "jobUrl": "%s"
		        }
		        """.formatted(uniqueJobUrl);

		mockMvc.perform(
				post("/api/jobs").with(user("nikhil").roles("ADMIN")).contentType("application/json").content(jobJson))
				.andExpect(status().isCreated());
	}

	@Test
	void userCannotUpdateJob() throws Exception {

		String uniqueJobUrl = "https://example.com/security-test-job-" + System.currentTimeMillis();

		String jobJson = """
		        {
		            "title": "Software Engineer",
		            "company": "Test Company",
		            "location": "Kochi",
		            "jobType": "FULL_TIME",
		            "source": "TEST",
		            "jobUrl": "%s"
		        }
		        """.formatted(uniqueJobUrl);
		mockMvc.perform(put("/api/jobs/1").with(user("testuser").roles("USER")).contentType("application/json")
				.content(jobJson)).andExpect(status().isForbidden());
	}

	@Test
	void userCannotDeleteJob() throws Exception {

		mockMvc.perform(delete("/api/jobs/1").with(user("testuser").roles("USER"))).andExpect(status().isForbidden());
	}

	@Test
	void invalidTokenCannotAccessJobs() throws Exception {

		mockMvc.perform(get("/api/jobs").header("Authorization", "Bearer invalid-token"))
				.andExpect(status().isUnauthorized());
	}
}