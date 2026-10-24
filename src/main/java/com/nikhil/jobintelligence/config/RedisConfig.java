package com.nikhil.jobintelligence.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import com.nikhil.jobintelligence.dto.JobResponse;

import tools.jackson.databind.JavaType;
import tools.jackson.databind.ObjectMapper;
import java.time.Duration;

@Configuration
public class RedisConfig {

	@Bean
	public RedisCacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {

		ObjectMapper objectMapper = new ObjectMapper();

		JavaType jobListType = objectMapper.getTypeFactory().constructCollectionType(List.class, JobResponse.class);

		JacksonJsonRedisSerializer<List<JobResponse>> serializer = new JacksonJsonRedisSerializer<>(objectMapper,
				jobListType);
		RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(10))
				.serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer));
		return RedisCacheManager.builder(redisConnectionFactory).cacheDefaults(config).build();
	}
}