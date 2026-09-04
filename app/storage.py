from pathlib import Path
from uuid import uuid4
import shutil


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
