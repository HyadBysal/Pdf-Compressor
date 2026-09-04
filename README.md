# PDF Utility Platform POC

A minimal local POC for an iLovePDF/Smallpdf-style processing platform.

## Features

- Upload PDF files
- Create asynchronous processing jobs
- Supported operations:
  - compress
  - merge
  - rotate
- Poll job status
- Download processed output
- Local object-storage abstraction
- In-memory job queue
- Worker thread for asynchronous processing
- Basic file-size validation
- Automatic job metadata tracking

## Architecture

Client
  -> FastAPI
  -> LocalStorage
  -> Job Queue
  -> Worker
  -> PyPDF
  -> Output Storage
  -> Download API

The POC deliberately keeps infrastructure local.

Production replacements:

- LocalStorage -> S3 / GCS
- Queue -> SQS / PubSub / Kafka
- Worker thread -> Celery / KEDA / Kubernetes workers
- In-memory job state -> PostgreSQL / Redis
- API auth -> OAuth / JWT
- Download endpoint -> signed object-storage URL

## Run

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open:

http://127.0.0.1:8000/docs

## Example flow

### 1. Upload a PDF

POST `/v1/files`

Multipart form:
- `file`: PDF file

Response:

```json
{
  "file_id": "..."
}
```

### 2. Compress

POST `/v1/jobs`

```json
{
  "operation": "compress",
  "file_ids": ["FILE_ID"]
}
```

### 3. Merge

Upload at least two PDFs, then:

```json
{
  "operation": "merge",
  "file_ids": ["FILE_1", "FILE_2"]
}
```

### 4. Rotate

```json
{
  "operation": "rotate",
  "file_ids": ["FILE_ID"],
  "options": {
    "degrees": 90
  }
}
```

### 5. Check status

GET `/v1/jobs/{job_id}`

### 6. Download result

GET `/v1/files/{output_file_id}/download`

## Important

This is a proof of concept, not production-ready. Production deployment should add:

- malware scanning
- sandboxed processors
- authenticated users
- quota / entitlement service
- durable queue
- PostgreSQL
- Redis
- signed upload/download URLs
- encrypted object storage
- TTL deletion
- observability
- idempotency keys
