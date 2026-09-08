# Synthetic & Dummy Datasets Directory

This directory is designated for storing **synthetic and dummy datasets** used exclusively during development and testing of the Criminal Network Intelligence Platform.

## ⚠️ Security & Compliance Notice
- **STRICTLY SYNTHETIC DATA ONLY**: This folder must contain **ONLY** synthetic/dummy datasets for local testing and schema validation.
- **NO REAL-WORLD DATA**: Absolutely no real personal data, personally identifiable information (PII), or confidential law enforcement/criminal investigation data should ever be placed or stored in this directory.

## Directory Structure & Supported Formats

- `fir/`: First Information Reports.
  - **Supported formats**: `.pdf`, `.txt`
- `cdr/`: Call Detail Records.
  - **Supported formats**: `.csv`, `.json`
- `transactions/`: Financial and banking transaction logs.
  - **Supported formats**: `.csv`, `.json`
- `reports/`: Intelligence briefs, forensic analysis, and summary reports.
  - **Supported formats**: `.pdf`, `.txt`, `.json`
- `surveillance/`: Field surveillance logs, observations, and telemetry.
  - **Supported formats**: `.txt`, `.json`, `.csv`
- `social_media/`: Extracted social media activity records and metadata.
  - **Supported formats**: `.json`, `.csv`
- `json/`: General structured JSON datasets, schemas, and graph topology seed data.
  - **Supported formats**: `.json`

*Note: No fake datasets are generated automatically in this initial foundation phase.*
