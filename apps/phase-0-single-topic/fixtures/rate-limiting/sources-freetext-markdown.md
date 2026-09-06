## Title

Understanding rate limiting

## Source

API Gateway design decision, ADR-014

## Description

Sliding window limiter. On limit exceeded: 429 status, X-RateLimit-Reset header. Explains what rate limiting is and why the API responds with a wait time instead of just failing, so integrators understand the reasoning behind the 429 behavior rather than just the mechanics of it.
