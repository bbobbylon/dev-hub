package com.devhub.backend.rowmapper;

import com.devhub.backend.model.UserProgress;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

/** Maps a {@code user_progress} row to a {@link UserProgress}. */
public class ProgressRowMapper implements RowMapper<UserProgress> {

    @Override
    public UserProgress mapRow(ResultSet rs, int rowNum) throws SQLException {
        return UserProgress.builder()
                .userId(rs.getLong("user_id"))
                .data(rs.getString("data"))
                .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
                .build();
    }
}
