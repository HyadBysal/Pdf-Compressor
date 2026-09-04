from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from .jobs import JobManager
from .models import CreateJobRequest, JobResponse
from .storage import LocalStorage


MAX_FILE_SIZE = 50 * 1024 * 1024

app = FastAPI(
    title="PDF Utility Platform POC",
    version="0.1.0",
    description="Minimal asynchronous PDF-processing platform.",
)

storage = LocalStorage()
jobs = JobManager(storage)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/v1/files")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # enforce a simple POC file-size limit
    content = await file.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")

    if not content.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="File does not look like a PDF")

    from io import BytesIO
    file_id, path = storage.save_upload(BytesIO(content), file.filename or "upload.pdf")

    return {
        "file_id": file_id,
        "filename": file.filename,
        "size_bytes": len(content),
    }


@app.post("/v1/jobs", response_model=JobResponse)
def create_job(request: CreateJobRequest):
    try:
        job = jobs.create(
            operation=request.operation,
            file_ids=request.file_ids,
            options=request.options,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="One or more input files not found")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return JobResponse(
        job_id=job.job_id,
        operation=job.operation,
        file_ids=job.file_ids,
        status=job.status,
        output_file_id=job.output_file_id,
        error=job.error,
    )


@app.get("/v1/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: str):
    try:
        job = jobs.get(job_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobResponse(
        job_id=job.job_id,
        operation=job.operation,
        file_ids=job.file_ids,
        status=job.status,
        output_file_id=job.output_file_id,
        error=job.error,
    )


@app.get("/v1/files/{file_id}/download")
def download_file(file_id: str):
    try:
        path = storage.output_path(file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Output file not found")

    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=f"{file_id}.pdf",
    )
