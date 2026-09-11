package com.devhub.backend.repo.repoimpl;

import com.devhub.backend.model.UserProgress;
import com.devhub.backend.repo.ProgressRepo;
import com.devhub.backend.rowmapper.ProgressRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static com.devhub.backend.query.ProgressQuery.SELECT_PROGRESS_BY_USER_ID_QUERY;
import static com.devhub.backend.query.ProgressQuery.UPSERT_PROGRESS_QUERY;

/** JDBC implementation of {@link ProgressRepo} using {@link NamedParameterJdbcTemplate}. */
@Repository
@RequiredArgsConstructor
public class ProgressRepoImpl implements ProgressRepo {

    private final NamedParameterJdbcTemplate jdbc;

    @Override
    public Optional<UserProgress> findByUserId(Long userId) {
        try {
            return Optional.of(jdbc.queryForObject(SELECT_PROGRESS_BY_USER_ID_QUERY,
                    new MapSqlParameterSource("userId", userId), new ProgressRowMapper()));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public void upsert(Long userId, String data) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("userId", userId)
                .addValue("data", data);
        jdbc.update(UPSERT_PROGRESS_QUERY, params);
    }
}
