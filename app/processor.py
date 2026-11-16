import re
import zipfile
from io import BytesIO
from pathlib import Path
from pypdf import PdfReader, PdfWriter


# JPEG quality used when re-encoding images; None keeps images untouched.
COMPRESSION_LEVELS = {
    "recommended": 60,
    "medium": 75,
    "low": None,
}


def compress_pdf(input_path: Path, output_path: Path, level: str = "recommended") -> None:
    if level not in COMPRESSION_LEVELS:
        raise ValueError("level must be one of: recommended, medium, low")
    image_quality = COMPRESSION_LEVELS[level]

    writer = PdfWriter(clone_from=str(input_path))

    for page in writer.pages:
        if image_quality is not None:
            for image in page.images:
                try:
                    # Skip images with transparency or unusual colour modes,
                    # which JPEG can't represent faithfully.
                    if image.image.mode not in {"RGB", "L"}:
                        continue
                    image.replace(image.image, quality=image_quality)
                except Exception:
                    pass
        try:
            page.compress_content_streams(level=9)
        except Exception:
            pass

    try:
        writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)
    except Exception:
        pass

    with output_path.open("wb") as f:
        writer.write(f)

    # Never hand back a bigger file than the user uploaded.
    if output_path.stat().st_size >= input_path.stat().st_size:
        output_path.write_bytes(input_path.read_bytes())


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


def _parse_ranges(spec: str, page_count: int) -> list[tuple[int, int]]:
    """Parse "1-3, 5, 8-10" into 0-based inclusive (start, end) tuples."""
    ranges = []
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        match = re.fullmatch(r"(\d+)\s*(?:-\s*(\d+))?", part)
        if not match:
            raise ValueError(f'Invalid page range "{part}". Use a format like 1-3, 5, 8-10.')
        start = int(match.group(1))
        end = int(match.group(2) or start)
        if start < 1 or end < start or end > page_count:
            raise ValueError(f'Page range "{part}" is outside 1-{page_count}.')
        ranges.append((start - 1, end - 1))
    if not ranges:
        raise ValueError("Enter at least one page range.")
    return ranges


def _chapter_ranges(reader: PdfReader) -> list[tuple[int, int, str]]:
    """Use the PDF's top-level bookmarks as chapter boundaries."""
    starts: dict[int, str] = {}
    for item in reader.outline:
        if isinstance(item, list):  # nested sub-bookmarks
            continue
        try:
            page = reader.get_destination_page_number(item)
        except Exception:
            continue
        if page is not None and page >= 0 and page not in starts:
            starts[page] = str(item.title or "").strip()

    if not starts:
        raise ValueError("This PDF has no chapters (bookmarks) to split by. Try splitting by pages.")

    page_count = len(reader.pages)
    ordered = sorted(starts.items())
    chapters = []
    if ordered[0][0] > 0:
        chapters.append((0, ordered[0][0] - 1, "Front matter"))
    for i, (start, title) in enumerate(ordered):
        end = ordered[i + 1][0] - 1 if i + 1 < len(ordered) else page_count - 1
        chapters.append((start, end, title or f"Chapter {i + 1}"))
    return chapters


def _safe_name(text: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9 _-]+", "", text).strip().replace(" ", "-")
    return cleaned[:60] or "part"


def split_pdf(input_path: Path, output_path: Path, mode: str = "pages", ranges: str = "") -> None:
    """Split a PDF by page ranges or by chapter.

    One resulting part is written as a PDF; several parts are written as a
    ZIP archive of PDFs (the download endpoint detects which by its bytes).
    """
    reader = PdfReader(str(input_path))
    page_count = len(reader.pages)

    if mode == "chapters":
        parts = [(s, e, f"{i + 1:02d}-{_safe_name(t)}") for i, (s, e, t) in enumerate(_chapter_ranges(reader))]
    elif ranges.strip():
        parts = [(s, e, f"pages-{s + 1}-{e + 1}" if s != e else f"page-{s + 1}") for s, e in _parse_ranges(ranges, page_count)]
    else:
        if page_count < 2:
            raise ValueError("This PDF has only one page, so there is nothing to split.")
        parts = [(i, i, f"page-{i + 1}") for i in range(page_count)]

    def build(start: int, end: int) -> PdfWriter:
        writer = PdfWriter()
        for index in range(start, end + 1):
            writer.add_page(reader.pages[index])
        return writer

    if len(parts) == 1:
        start, end, _ = parts[0]
        with output_path.open("wb") as f:
            build(start, end).write(f)
        return

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for start, end, name in parts:
            buffer = BytesIO()
            build(start, end).write(buffer)
            archive.writestr(f"{name}.pdf", buffer.getvalue())
