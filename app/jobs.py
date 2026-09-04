from __future__ import annotations

from dataclasses import dataclass, field
from queue import Queue
from threading import Lock, Thread
from typing import Any
from uuid import uuid4

from .models import JobStatus, Operation
from .processor import compress_pdf, merge_pdfs, rotate_pdf
from .storage import LocalStorage


@dataclass
class Job:
    job_id: str
    operation: Operation
    file_ids: list[str]
    options: dict[str, Any]
    status: JobStatus = JobStatus.queued
    output_file_id: str | None = None
    error: str | None = None


class JobManager:
    def __init__(self, storage: LocalStorage):
        self.storage = storage
        self.jobs: dict[str, Job] = {}
        self.queue: Queue[str] = Queue()
        self.lock = Lock()

        self.worker = Thread(target=self._work, daemon=True)
        self.worker.start()

    def create(self, operation: Operation, file_ids: list[str], options: dict[str, Any]) -> Job:
        # validate input files exist before accepting job
        for file_id in file_ids:
            self.storage.input_path(file_id)

        if operation != Operation.merge and len(file_ids) != 1:
            raise ValueError(f"{operation.value} expects exactly one input file")

        if operation == Operation.merge and len(file_ids) < 2:
            raise ValueError("merge expects at least two input files")

        job = Job(
            job_id=str(uuid4()),
            operation=operation,
            file_ids=file_ids,
            options=options,
        )

        with self.lock:
            self.jobs[job.job_id] = job

        self.queue.put(job.job_id)
        return job

    def get(self, job_id: str) -> Job:
        with self.lock:
            if job_id not in self.jobs:
                raise KeyError(job_id)
            return self.jobs[job_id]

    def _work(self) -> None:
        while True:
            job_id = self.queue.get()
            try:
                self._process(job_id)
            finally:
                self.queue.task_done()

    def _process(self, job_id: str) -> None:
        job = self.get(job_id)

        with self.lock:
            job.status = JobStatus.processing

        try:
            input_paths = [self.storage.input_path(fid) for fid in job.file_ids]
            output_file_id, output_path = self.storage.create_output_path()

            if job.operation == Operation.compress:
                compress_pdf(input_paths[0], output_path)

            elif job.operation == Operation.merge:
                merge_pdfs(input_paths, output_path)

            elif job.operation == Operation.rotate:
                rotate_pdf(
                    input_paths[0],
                    output_path,
                    int(job.options.get("degrees", 90)),
                )

            with self.lock:
                job.status = JobStatus.completed
                job.output_file_id = output_file_id

        except Exception as exc:
            with self.lock:
                job.status = JobStatus.failed
                job.error = str(exc)
