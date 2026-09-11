package com.devhub.backend.repo;

import com.devhub.backend.model.User;

/**
 * Persistence contract for users. The implementation also serves as Spring Security's
 * {@code UserDetailsService} (the authentication seam).
 */
public interface UserRepo {

    /**
     * Persists a new user (after checking email uniqueness) and returns it with its generated id.
     */
    User create(User user);

    /** @return the user with the given email, or throws if none exists */
    User getUserByEmail(String email);

    /** @return the user with the given id, or throws if none exists */
    User getUserById(Long id);
}
