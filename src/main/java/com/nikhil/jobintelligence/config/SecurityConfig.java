package com.nikhil.jobintelligence.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

import com.nikhil.jobintelligence.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http.csrf(csrf -> csrf.disable())

				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				.authorizeHttpRequests(auth -> auth

						.requestMatchers("/api/auth/register", "/api/auth/login", "/swagger-ui/**", "/swagger-ui.html",
								"/v3/api-docs/**", "/webjars/**", "/error")
						.permitAll()

						.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/jobs/**")
						.hasAnyRole("USER", "ADMIN")

						.requestMatchers(org.springframework.http.HttpMethod.POST, "/api/jobs/**").hasRole("ADMIN")

						.requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/jobs/**").hasRole("ADMIN")

						.requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/jobs/**").hasRole("ADMIN")

						.requestMatchers("/api/ingestion/**").hasRole("ADMIN")

						.anyRequest().authenticated())
				.exceptionHandling(exception -> exception
						.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))

				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {

		return configuration.getAuthenticationManager();
	}

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
}