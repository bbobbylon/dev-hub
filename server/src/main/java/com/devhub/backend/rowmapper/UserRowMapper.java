package com.devhub.backend.rowmapper;

import com.devhub.backend.model.User;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Maps a {@code users} row to a {@link User}. Spring JDBC calls {@link #mapRow} for each row; the
 * snake_case columns are read explicitly into the camelCase builder fields.
 */
public class UserRowMapper implements RowMapper<User> {

    @Override
    public User mapRow(ResultSet rs, int rowNum) throws SQLException {
        return User.builder()
                .id(rs.getLong("id"))
                .firstName(rs.getString("first_name"))
                .lastName(rs.getString("last_name"))
                .email(rs.getString("email"))
                .password(rs.getString("password"))
                .role(rs.getString("role"))
                .permissions(rs.getString("permissions"))
                .enabled(rs.getBoolean("enabled"))
                .notLocked(rs.getBoolean("non_locked"))
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .build();
    }
}
