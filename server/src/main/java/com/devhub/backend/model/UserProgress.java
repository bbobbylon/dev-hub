package com.devhub.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * One user's synced learning progress, mapped from the {@code user_progress} table by
 * {@code ProgressRowMapper}. {@code data} is the frontend's whole {@code ProgressState} blob
 * (quiz scores, flashcard schedules, milestones, activity) stored verbatim as JSON text — the
 * backend never parses its shape beyond confirming it is valid JSON, since that shape is owned
 * and versioned by the client (see {@code lib/progress.ts} in the frontend).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProgress {
    private Long userId;
    private String data;
    private LocalDateTime updatedAt;
}
