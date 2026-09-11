package com.devhub.backend.service;

/** Business logic for cross-device progress sync. */
public interface ProgressService {

    /** @return the user's saved progress as raw JSON text, or {@code "{}"} if never synced. */
    String getProgress(Long userId);

    /** Validates {@code json} is well-formed and stores it, replacing any previous value. */
    void saveProgress(Long userId, String json);
}
