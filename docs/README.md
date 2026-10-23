# Docs — Real Estate Due Diligence Agent

This folder holds shared project documentation for Team Two.

## Contents

- `SRS.md` — Software Requirements Specification (from Infosys Springboard)
- `architecture-diagram.png` — Official system architecture diagram
- `api-contract.md` — Endpoint specification planned in Milestone 1
- `openapi.json` — OpenAPI spec generated from the running backend

Where `api-contract.md` and `openapi.json` differ, `openapi.json` reflects what is actually implemented.

## Live API documentation

With the backend running locally:

- Swagger UI: http://localhost:8080/swagger-ui.html
- Raw OpenAPI spec: http://localhost:8080/v3/api-docs

To refresh the snapshot after endpoints change, run this from the repo root:
curl http://localhost:8080/v3/api-docs -o docs/openapi.json
