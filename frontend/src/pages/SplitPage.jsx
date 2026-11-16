import { useEffect, useRef, useState } from "react";
import { createJob, downloadUrl, pollJob, uploadFile } from "../lib/api.js";

const MODES = [
  { id: "pages", label: "By Pages" },
  { id: "chapters", label: "By Chapter" },
];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdf(file) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function baseName(name) {
  return name.replace(/\.pdf$/i, "");
}

function UploadIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export default function SplitPage() {
  const inputRef = useRef(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState("pages");
  const [ranges, setRanges] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Split PDF — ipdfplumber";
    return () => {
      document.title = "ipdfplumber — Everything PDF. All in One Place.";
    };
  }, []);

  // Release object URLs when the page unmounts.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(
    () => () => itemsRef.current.forEach((it) => it.url && URL.revokeObjectURL(it.url)),
    []
  );

  function update(id, patch) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function splitOne(item, options) {
    try {
      update(item.id, { status: "uploading" });
      const fileId = await uploadFile(item.file);
      update(item.id, { status: "splitting" });
      const job = await createJob("split", [fileId], options);
      const finished = await pollJob(job.job_id);
      if (finished.status !== "COMPLETED") throw new Error(finished.error || "Split failed");
      const res = await fetch(downloadUrl(finished.output_file_id));
      if (!res.ok) throw new Error("Download failed");
      const isZip = (res.headers.get("content-type") || "").includes("zip");
      const blob = await res.blob();
      update(item.id, {
        status: "done",
        url: URL.createObjectURL(blob),
        size: blob.size,
        downloadName: `${baseName(item.file.name)}-split.${isZip ? "zip" : "pdf"}`,
        isZip,
      });
    } catch (err) {
      update(item.id, { status: "error", message: err.message || "Something went wrong" });
    }
  }

  function handleFiles(fileList) {
    const all = Array.from(fileList || []);
    const pdfs = all.filter(isPdf);
    setError(pdfs.length < all.length ? "Only PDF files can be split — other files were skipped." : "");
    if (!pdfs.length) return;

    const options = mode === "pages" ? { mode, ranges: ranges.trim() } : { mode };
    const newItems = pdfs.map((file) => ({
      id: `${file.name}-${Math.random().toString(36).slice(2)}`,
      file,
      status: "queued",
      modeLabel:
        mode === "chapters" ? "By chapter" : options.ranges ? `Pages ${options.ranges}` : "Every page",
    }));
    setItems((prev) => [...newItems, ...prev]);
    // Process one at a time so large batches don't overload the server.
    (async () => {
      for (const item of newItems) await splitOne(item, options);
    })();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="compress-page">
      <header className="compress-page__head">
        <h1 className="compress-page__title">Split PDF</h1>
        <p className="compress-page__lead">
          Break a PDF into smaller files by page range or by chapter. Split
          documents in seconds &mdash; free, no sign-up, no watermark.
        </p>
        <div className="size-chips" role="group" aria-label="Split method">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={mode === m.id ? "size-chip is-active" : "size-chip"}
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="split-options">
          {mode === "pages" ? (
            <label className="split-options__field">
              <span className="split-options__label">Page ranges (optional)</span>
              <input
                type="text"
                className="split-options__input"
                placeholder="e.g. 1-3, 5, 8-10"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                inputMode="numeric"
              />
              <span className="split-options__help">
                Leave empty to save every page as its own PDF.
              </span>
            </label>
          ) : (
            <p className="split-options__help">
              Splits at the PDF&rsquo;s top-level bookmarks, one file per chapter.
            </p>
          )}
        </div>
      </header>

      <section className="compress-tool" aria-label="Upload PDFs to split">
        <button
          type="button"
          className={isDragging ? "dropzone is-dragging" : "dropzone"}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            dragDepth.current += 1;
            setIsDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => {
            dragDepth.current -= 1;
            if (dragDepth.current <= 0) setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            dragDepth.current = 0;
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <span className="dropzone__inner">
            <span className="dropzone__icon">
              <UploadIcon />
            </span>
            <span className="dropzone__title">Select or drop PDFs to split</span>
            <span className="dropzone__meta">
              Batch supported <span aria-hidden="true">•</span> Each file is split separately
            </span>
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />

        {error && <p className="compress-tool__error">{error}</p>}

        {items.length > 0 && (
          <ul className="file-list">
            {items.map((it) => (
              <li key={it.id} className="file-row">
                <div className="file-row__info">
                  <span className="file-row__name">{it.file.name}</span>
                  <span className="file-row__meta">
                    {formatSize(it.file.size)} · {it.modeLabel}
                    {it.status === "done" && ` → ${it.isZip ? "ZIP" : "PDF"}, ${formatSize(it.size)}`}
                  </span>
                </div>
                {it.status === "done" ? (
                  <a className="file-row__download" href={it.url} download={it.downloadName}>
                    Download
                  </a>
                ) : (
                  <span className={it.status === "error" ? "file-row__status is-error" : "file-row__status"}>
                    {it.status === "queued" && "Waiting…"}
                    {it.status === "uploading" && "Uploading…"}
                    {it.status === "splitting" && "Splitting…"}
                    {it.status === "error" && it.message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
