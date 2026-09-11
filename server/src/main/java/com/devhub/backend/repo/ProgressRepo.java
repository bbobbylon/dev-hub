package com.devhub.backend.repo;

import com.devhub.backend.model.UserProgress;

import java.util.Optional;

/** Persistence contract for synced progress — one row per user. */
public interface ProgressRepo {

    /** @return the user's saved progress, or empty if they have never synced. */
    Optional<UserProgress> findByUserId(Long userId);

    /** Creates or overwrites the user's progress row with {@code data} (raw JSON text). */
    void upsert(Long userId, String data);
}
