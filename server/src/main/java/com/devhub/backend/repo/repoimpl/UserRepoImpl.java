package com.devhub.backend.repo.repoimpl;

import com.devhub.backend.exception.ApiException;
import com.devhub.backend.model.User;
import com.devhub.backend.model.UserPrincipal;
import com.devhub.backend.repo.UserRepo;
import com.devhub.backend.rowmapper.UserRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Repository;

import java.util.Objects;

import static com.devhub.backend.query.UserQuery.COUNT_USER_EMAIL_QUERY;
import static com.devhub.backend.query.UserQuery.INSERT_USER_QUERY;
import static com.devhub.backend.query.UserQuery.SELECT_USER_BY_EMAIL_QUERY;
import static com.devhub.backend.query.UserQuery.SELECT_USER_BY_ID_QUERY;

/**
 * JDBC implementation of {@link UserRepo} using {@link NamedParameterJdbcTemplate}, and Spring
 * Security's {@link UserDetailsService} (so the auth provider can load a {@link UserPrincipal}
 * during login). Not-found is surfaced as a generic {@link ApiException} to avoid leaking whether
 * an email exists.
 */
@Repository
@RequiredArgsConstructor
public class UserRepoImpl implements UserRepo, UserDetailsService {

    private final NamedParameterJdbcTemplate jdbc;

    @Override
    public User create(User user) {
        if (getEmailCount(user.getEmail()) > 0) {
            throw new ApiException("Unable to register with the details provided.");
        }
        KeyHolder holder = new GeneratedKeyHolder();
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("firstName", user.getFirstName())
                .addValue("lastName", user.getLastName())
                .addValue("email", user.getEmail())
                .addValue("password", user.getPassword())
                .addValue("role", user.getRole())
                .addValue("permissions", user.getPermissions());
        jdbc.update(INSERT_USER_QUERY, params, holder);
        user.setId(Objects.requireNonNull(holder.getKey()).longValue());
        return user;
    }

    @Override
    public User getUserByEmail(String email) {
        try {
            return jdbc.queryForObject(SELECT_USER_BY_EMAIL_QUERY,
                    new MapSqlParameterSource("email", email), new UserRowMapper());
        } catch (EmptyResultDataAccessException e) {
            throw new ApiException("No user found.");
        }
    }

    @Override
    public User getUserById(Long id) {
        try {
            return jdbc.queryForObject(SELECT_USER_BY_ID_QUERY,
                    new MapSqlParameterSource("id", id), new UserRowMapper());
        } catch (EmptyResultDataAccessException e) {
            throw new ApiException("No user found.");
        }
    }

    private Integer getEmailCount(String email) {
        return jdbc.queryForObject(COUNT_USER_EMAIL_QUERY,
                new MapSqlParameterSource("email", email), Integer.class);
    }

    /**
     * Loads a user for authentication. Wraps the domain user in a {@link UserPrincipal}; any
     * lookup failure becomes {@link UsernameNotFoundException}, which the provider (with
     * hide-not-found enabled) reports as bad credentials — no email enumeration.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            return new UserPrincipal(getUserByEmail(email));
        } catch (Exception e) {
            throw new UsernameNotFoundException("Invalid credentials.");
        }
    }
}
