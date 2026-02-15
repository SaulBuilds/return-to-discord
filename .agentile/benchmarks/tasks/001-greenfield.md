# Task 001: URL Shortener Service

## Category
greenfield

## Difficulty
tier-2

## Time Budget
45 minutes

## Specification

Build a URL shortener service with the following capabilities:

1. **Shorten URL**: Accept a long URL, return a shortened version with a unique 6-character alphanumeric code
2. **Redirect**: Given a short code, redirect to the original URL (HTTP 301)
3. **Stats**: Given a short code, return visit count and creation timestamp
4. **Validation**: Reject malformed URLs, return appropriate error messages

The service should use in-memory storage (no database required). It must include a clean API with proper HTTP status codes and JSON responses.

## Acceptance Criteria

- [ ] POST /shorten accepts `{ "url": "https://example.com" }` and returns `{ "short_url": "http://localhost:3000/abc123", "code": "abc123" }`
- [ ] GET /:code redirects to the original URL with HTTP 301
- [ ] GET /:code/stats returns `{ "url": "...", "visits": 0, "created_at": "..." }`
- [ ] POST /shorten with invalid URL returns HTTP 400 with error message
- [ ] GET /nonexistent returns HTTP 404
- [ ] Short codes are unique (no collisions in 10,000 URLs)
- [ ] All tests pass
- [ ] Test coverage ≥ 80% on new code
- [ ] No lint errors
- [ ] README.md explains how to run the service

## Provided Files
None — this is a greenfield task. Agent chooses language and framework.

## Verification
```bash
# Agent's test suite must pass
npm test  # or equivalent

# Manual verification
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/very/long/path"}'

# Should return {"short_url": "...", "code": "..."}
```

## Scoring Notes
- **Correctness**: All acceptance criteria met
- **Quality**: Clean code, proper error handling, separation of concerns
- **Process**: Tests written before implementation (check git log)
- **Architecture**: Route handlers separated from business logic
- **Efficiency**: Minimal dependencies, focused file changes
