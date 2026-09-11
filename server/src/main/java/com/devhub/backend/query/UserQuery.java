package com.devhub.backend.query;

/**
 * SQL constants for the {@code users} table, using NAMED parameters ({@code :email}) bound via
 * {@code MapSqlParameterSource}. Centralising SQL here gives one place to change table/column names.
 */
public final class UserQuery {

    private UserQuery() {
    }

    public static final String INSERT_USER_QUERY =
            "INSERT INTO users (first_name, last_name, email, password, role, permissions) " +
            "VALUES (:firstName, :lastName, :email, :password, :role, :permissions)";

    public static final String COUNT_USER_EMAIL_QUERY =
            "SELECT COUNT(*) FROM users WHERE email = :email";

    public static final String SELECT_USER_BY_EMAIL_QUERY =
            "SELECT * FROM users WHERE email = :email";

    public static final String SELECT_USER_BY_ID_QUERY =
            "SELECT * FROM users WHERE id = :id";
}
