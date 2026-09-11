-- Idempotent schema (no DROPs). Run by hand to initialise a fresh database:
--   mysql -u <user> -p <db> < src/main/resources/schema.sql
-- Safe to re-run; safe to enable spring.sql.init.mode=always.

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(80)  NOT NULL,
    last_name   VARCHAR(80)  NOT NULL,
    email       VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(40)  NOT NULL DEFAULT 'ROLE_USER',
    permissions VARCHAR(255) NOT NULL DEFAULT 'READ:USER,UPDATE:USER',
    enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    non_locked  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS user_progress (
    user_id     BIGINT    NOT NULL PRIMARY KEY,
    data        JSON      NOT NULL,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
