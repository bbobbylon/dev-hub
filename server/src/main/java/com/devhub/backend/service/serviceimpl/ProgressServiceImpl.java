package com.devhub.backend.service.serviceimpl;

import com.devhub.backend.exception.ApiException;
import com.devhub.backend.model.UserProgress;
import com.devhub.backend.repo.ProgressRepo;
import com.devhub.backend.service.ProgressService;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Default {@link ProgressService}. Validates that an incoming payload is actually JSON before it
 * ever reaches storage — the one structural rule that applies to an otherwise-opaque blob.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProgressServiceImpl implements ProgressService {

    private static final String EMPTY_PROGRESS = "{}";

    private final ProgressRepo progressRepo;
    private final ObjectMapper objectMapper;

    @Override
    public String getProgress(Long userId) {
        return progressRepo.findByUserId(userId)
                .map(UserProgress::getData)
                .orElse(EMPTY_PROGRESS);
    }

    @Override
    public void saveProgress(Long userId, String json) {
        try {
            objectMapper.readTree(json);
        } catch (Exception e) {
            throw new ApiException("Invalid progress payload.");
        }
        progressRepo.upsert(userId, json);
    }
}
