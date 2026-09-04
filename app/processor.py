from pathlib import Path
from pypdf import PdfReader, PdfWriter


def compress_pdf(input_path: Path, output_path: Path) -> None:
    reader = PdfReader(str(input_path))
    writer = PdfWriter()

    for page in reader.pages:
        try:
            page.compress_content_streams()
        except Exception:
            pass
        writer.add_page(page)

    with output_path.open("wb") as f:
        writer.write(f)


def merge_pdfs(input_paths: list[Path], output_path: Path) -> None:
    writer = PdfWriter()
    for path in input_paths:
        reader = PdfReader(str(path))
        for page in reader.pages:
            writer.add_page(page)

    with output_path.open("wb") as f:
        writer.write(f)


def rotate_pdf(input_path: Path, output_path: Path, degrees: int = 90) -> None:
    if degrees not in {90, 180, 270}:
        raise ValueError("degrees must be one of 90, 180, 270")

    reader = PdfReader(str(input_path))
    writer = PdfWriter()

    for page in reader.pages:
        page.rotate(degrees)
        writer.add_page(page)

    with output_path.open("wb") as f:
        writer.write(f)
