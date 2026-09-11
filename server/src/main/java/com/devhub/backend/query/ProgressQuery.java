package com.devhub.backend.query;

/**
 * SQL constants for the {@code user_progress} table, using NAMED parameters bound via
 * {@code MapSqlParameterSource}. One row per user; {@link #UPSERT_PROGRESS_QUERY} both creates
 * and updates it, since a user has at most one progress row.
 */
public final class ProgressQuery {

    private ProgressQuery() {
    }

    public static final String SELECT_PROGRESS_BY_USER_ID_QUERY =
            "SELECT * FROM user_progress WHERE user_id = :userId";

    public static final String UPSERT_PROGRESS_QUERY =
            "INSERT INTO user_progress (user_id, data) VALUES (:userId, :data) " +
            "ON DUPLICATE KEY UPDATE data = :data";
}
