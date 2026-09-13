# Dev Hub backend (Spring Boot + JDBC + JWT)

Dev Hub's backend: stateless JWT auth plus cross-device sync for the frontend's localStorage
progress blob, with the core domain persisted via `NamedParameterJdbcTemplate` (no JPA). Scaffolded
from the `scaffold-spring-backend` skill, then extended with the `user_progress` aggregate.

Dev Hub itself (`../app/`) is a static React app on GitHub Pages with **no backend by default** —
it works fully offline-first from `localStorage`. This backend is opt-in: the frontend only calls
it when `VITE_API_BASE_URL` is set at build time, to add optional sign-in and cross-device sync on
top of that offline-first baseline. Deploying this backend somewhere reachable over HTTPS is a
separate, not-yet-done step (see the repo root's `DEPLOYMENT.md`).

## Prerequisites
- JDK 21, Maven (or the bundled `./mvnw`), and a MySQL database.

## Setup
1. `cp .env.example .env` and fill in `JWT_SECRET` (>= 32 chars) and the MySQL vars.
2. Create the database, then load the schema:
   `mysql -u <user> -p <db> < src/main/resources/schema.sql`
3. Ensure the `.env` values are exported into the environment, then run:
   `./mvnw spring-boot:run`

## Endpoints
| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | `{ firstName, lastName, email, password }` |
| POST | `/api/auth/login` | public | `{ email, password }` → returns `{ user, token }` |
| GET  | `/api/auth/profile` | Bearer token | — |
| GET  | `/api/progress` | Bearer token | — → returns `{ progress }`, the caller's saved state (or `{}` if never synced) |
| PUT  | `/api/progress` | Bearer token | the frontend's whole `ProgressState` JSON object, stored verbatim |

Send the token as `Authorization: Bearer <token>` on protected routes. `/api/progress` always reads
and writes only the authenticated caller's own row — there is no user id in the URL or body.

## Layout (the conventions)
- `controller/` thin REST controllers returning the `HttpResponse` envelope.
- `service/` + `service/serviceimpl/` business logic.
- `repo/` + `repo/repoimpl/` persistence via `NamedParameterJdbcTemplate`.
- `query/` SQL string constants (named params). `rowmapper/` `ResultSet`→model.
- `model/`, `dto/` + `dtomapper/`, `form/`, `configuration/`, `filter/`, `handler/`,
  `exception/`, `tokenprovider/`, `constants/`.

## Add a new resource
Repeat the `user` pattern: `XQuery` → `XRowMapper` → `XRepo`/`XRepoImpl` → `XService`/`XServiceImpl`
→ `XController`, add the table to `schema.sql`, and gate endpoints with
`requestMatchers(...).hasAuthority("…")` in `SecurityConfig` (above `anyRequest().authenticated()`).

## Deploying (groundwork only — not yet live, see `BACKLOG.md` item 1)
The `Dockerfile` builds a runtime image on the `prod` profile (`application-prod.yml`), which talks
TLS (`sslMode=VERIFY_IDENTITY`) to a managed MySQL instance instead of `application.yml`'s permissive
local default. Which MySQL host and which app host actually run this is still an open decision (a
free-tier managed MySQL — e.g. Aiven — plus a free-tier app host — Railway/Render/Fly.io — are the
candidates in `BACKLOG.md`); once that's picked:

1. Download that MySQL instance's CA certificate and save it as `server/mysql-ca.pem` (gitignored,
   never commit it).
2. `docker build -t devhub-backend server/` — this also bakes `mysql-ca.pem` into a truststore the
   image reads at `/app/truststore.p12`; the build fails without that file present.
3. On the host, set real env vars: `JWT_SECRET`, `SPRING_ACTIVE_PROFILES=prod`, `MYSQL_HOST`,
   `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USERNAME`, `MYSQL_PASSWORD` — never the `.env` file itself.
4. Load `schema.sql` against that instance once, by hand, same as local setup.
5. Once the app is reachable over HTTPS, set `VITE_API_BASE_URL` in
   `.github/workflows/deploy-pages.yml` to its URL — see the root `DEPLOYMENT.md` for the routes
   coupling that comes with it.

## Notes
- `schema.sql` is idempotent and run by hand (`spring.sql.init.mode: never`). No Flyway by design.
- Ships no tests — add them. Keep business logic in the service layer as the app grows.
