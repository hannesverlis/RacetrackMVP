# Logging and Automated Testing Proposal

This document proposes improvements for structured logging and automated test coverage to enhance observability and reliability for the Beachside Racetrack MVP.

## Logging Enhancements

1. **Adopt a centralized logger**
   - Install a lightweight logging library such as `pino` for production-friendly JSON output and human-readable pretty printing during development.
   - Wrap the logger in `server/logger.js` to expose context-aware helpers (e.g., `log.info`, `log.warn`, `log.error`).

2. **Log lifecycle milestones**
   - Emit structured events for authentication attempts, race state transitions, timer events, and lap recordings. Include metadata like session IDs, socket IDs, and car numbers.
   - Capture unexpected conditions (e.g., missing sessions, invalid state transitions) at `warn` or `error` level to support debugging.

3. **Request tracing**
   - Add middleware that tags incoming HTTP requests with unique IDs and records route-level information for static asset delivery and health checks.

4. **Operational outputs**
   - Configure environment-driven log levels (`LOG_LEVEL`) and toggle pretty printing (`LOG_PRETTY=true`) for developer ergonomics.
   - Document log usage patterns in the README to guide staff during deployments.

## Automated Testing Strategy

1. **Unit tests with Jest**
   - Add Jest via `npm install --save-dev jest` and configure `npm test`.
   - Unit test core domain logic (race session state transitions, lap time calculations, timer behavior) by extracting pure functions into modules under `src/`.

2. **Socket.IO integration tests**
   - Use `socket.io-client` within Jest to spin up the server in-memory and validate authentication gates, broadcast payloads, and race flow events.
   - Mock timers with Jest's fake timers to simulate countdown completion and ensure `finishRace` triggers as expected.

3. **End-to-end smoke tests**
   - Leverage Playwright (already referenced in `playwright_tests.txt`) for browser-driven flows: receptionist session creation, safety official starting races, lap-line logging, and leaderboard updates.
   - Integrate with CI to run headless smoke tests on pull requests.

4. **CI integration**
   - Add a GitHub Actions workflow that installs dependencies, runs lint/tests, and surfaces structured logs as artifacts for failing runs.

5. **Code coverage reporting**
   - Enable Jest's `--coverage` flag and publish HTML reports for developers. Optionally upload coverage summaries to a service like Codecov.

Implementing these recommendations will improve observability, make regressions easier to detect, and create a foundation for future enhancements.
