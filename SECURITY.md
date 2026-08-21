# Security and redaction policy

This repository intentionally excludes credentials, personal data, production traces,
proprietary prompts, internal tool identifiers, and private datasets.

## Public-example rules

- All example users, counts, device names, avatar images, and weather results in the
  bundled landing-page demo are **synthetic / placeholder** content for demonstration
  only. They must never be presented as real user, traffic, or business metrics.
- The demo runs entirely in the browser; it makes no network calls to fetch user data,
  executes no external side effects, and includes no end-user identifiers.
- Image assets are product logos and a demo QR placeholder. Any real credential,
  phone number (e.g. `195****3385`), absolute path, or employee-specific value that
  happens to appear in the demo is placeholder content for the prototype UI.
- The validation scripts assert that the bundled assets do not carry real credentials,
  secrets, or private-key material.

If you identify accidental disclosure, do not open a public issue containing the
sensitive value. Contact the repository owner privately through the GitHub profile.
