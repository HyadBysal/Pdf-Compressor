import os
import tempfile
from pathlib import Path
from uuid import uuid4
import shutil

import boto3
from botocore.exceptions import ClientError


class LocalStorage:
    def __init__(self, root: str = "storage"):
        self.root = Path(root)
        self.uploads = self.root / "uploads"
        self.outputs = self.root / "outputs"
        self.uploads.mkdir(parents=True, exist_ok=True)
        self.outputs.mkdir(parents=True, exist_ok=True)

    def save_upload(self, source, original_name: str) -> tuple[str, Path]:
        file_id = str(uuid4())
        suffix = Path(original_name).suffix.lower() or ".pdf"
        path = self.uploads / f"{file_id}{suffix}"
        with path.open("wb") as f:
            shutil.copyfileobj(source, f)
        return file_id, path

    def input_path(self, file_id: str) -> Path:
        matches = list(self.uploads.glob(f"{file_id}.*"))
        if not matches:
            raise FileNotFoundError(file_id)
        return matches[0]

    def create_output_path(self) -> tuple[str, Path]:
        file_id = str(uuid4())
        return file_id, self.outputs / f"{file_id}.pdf"

    def output_path(self, file_id: str) -> Path:
        path = self.outputs / f"{file_id}.pdf"
        if not path.exists():
            raise FileNotFoundError(file_id)
        return path

    def finalize_output(self, file_id: str, path: Path) -> None:
        pass


class S3Storage:
    """Same interface as LocalStorage, backed by S3. pypdf still reads/writes
    local files, so uploads are downloaded to a temp dir and outputs are
    pushed to S3 after processing finishes.
    """

    def __init__(self, bucket: str | None = None):
        self.bucket = bucket or os.environ["S3_BUCKET"]
        self.s3 = boto3.client("s3")
        self._tmpdir = Path(tempfile.mkdtemp(prefix="pdfdoc-"))

    def _find_key(self, prefix: str) -> str:
        resp = self.s3.list_objects_v2(Bucket=self.bucket, Prefix=prefix, MaxKeys=1)
        contents = resp.get("Contents") or []
        if not contents:
            raise FileNotFoundError(prefix)
        return contents[0]["Key"]

    def save_upload(self, source, original_name: str) -> tuple[str, Path]:
        file_id = str(uuid4())
        suffix = Path(original_name).suffix.lower() or ".pdf"
        key = f"uploads/{file_id}{suffix}"
        self.s3.upload_fileobj(source, self.bucket, key)
        return file_id, self._tmpdir / f"{file_id}{suffix}"

    def input_path(self, file_id: str) -> Path:
        key = self._find_key(f"uploads/{file_id}")
        local_path = self._tmpdir / Path(key).name
        try:
            self.s3.download_file(self.bucket, key, str(local_path))
        except ClientError as exc:
            raise FileNotFoundError(file_id) from exc
        return local_path

    def create_output_path(self) -> tuple[str, Path]:
        file_id = str(uuid4())
        return file_id, self._tmpdir / f"{file_id}.pdf"

    def output_path(self, file_id: str) -> Path:
        key = f"outputs/{file_id}.pdf"
        local_path = self._tmpdir / f"{file_id}.pdf"
        try:
            self.s3.download_file(self.bucket, key, str(local_path))
        except ClientError as exc:
            raise FileNotFoundError(file_id) from exc
        return local_path

    def finalize_output(self, file_id: str, path: Path) -> None:
        self.s3.upload_file(str(path), self.bucket, f"outputs/{file_id}.pdf")
