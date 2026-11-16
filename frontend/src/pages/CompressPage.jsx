import { useEffect, useRef, useState } from "react";
import { createJob, downloadUrl, pollJob, uploadFile } from "../lib/api.js";

const LEVELS = [
  { id: "recommended", label: "Recommended Compression" },
  { id: "medium", label: "Medium Level Compression" },
  { id: "low", label: "Low Level Compression" },
];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdf(file) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function UploadIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export default function CompressPage() {
  const inputRef = useRef(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [level, setLevel] = useState("recommended");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Compress PDF — ipdfplumber";
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

  async function compressOne(item) {
    try {
      update(item.id, { status: "uploading" });
      const fileId = await uploadFile(item.file);
      update(item.id, { status: "compressing" });
      const job = await createJob("compress", [fileId], { level });
      const finished = await pollJob(job.job_id);
      if (finished.status !== "COMPLETED") {
        throw new Error(finished.error || "Compression failed");
      }
      const res = await fetch(downloadUrl(finished.output_file_id));
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      update(item.id, {
        status: "done",
        outputSize: blob.size,
        url: URL.createObjectURL(blob),
      });
    } catch (err) {
      update(item.id, { status: "error", message: err.message || "Something went wrong" });
    }
  }

  function handleFiles(fileList) {
    const all = Array.from(fileList || []);
    const pdfs = all.filter(isPdf);
    setError(pdfs.length < all.length ? "Only PDF files can be compressed — other files were skipped." : "");
    if (!pdfs.length) return;

    const newItems = pdfs.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      status: "queued",
    }));
    setItems((prev) => [...newItems, ...prev]);
    // Process one at a time so large batches don't overload the server.
    (async () => {
      for (const item of newItems) await compressOne(item);
    })();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="compress-page">
      <header className="compress-page__head">
        <h1 className="compress-page__title">Compress PDF</h1>
        <p className="compress-page__lead">
          Shrink large PDFs so they&rsquo;re easier to email and share.
          Compress one file or a whole batch in seconds &mdash; free, no
          sign-up, no watermark.
        </p>
        <div className="size-chips" role="group" aria-label="Compression level">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={level === l.id ? "size-chip is-active" : "size-chip"}
              aria-pressed={level === l.id}
              onClick={() => setLevel(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      <section className="compress-tool" aria-label="Upload PDFs to compress">
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
            <span className="dropzone__title">Select or drop PDFs to compress</span>
            <span className="dropzone__meta">
              Batch supported <span aria-hidden="true">•</span> Preserves all links, forms &amp; annotations
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
                    {formatSize(it.file.size)}
                    {it.status === "done" && (
                      <>
                        {" → "}
                        {formatSize(it.outputSize)}
                        {it.outputSize < it.file.size &&
                          ` (−${Math.round((1 - it.outputSize / it.file.size) * 100)}%)`}
                      </>
                    )}
                  </span>
                </div>
                {it.status === "done" ? (
                  <a
                    className="file-row__download"
                    href={it.url}
                    download={it.file.name.replace(/\.pdf$/i, "") + "-compressed.pdf"}
                  >
                    Download
                  </a>
                ) : (
                  <span className={it.status === "error" ? "file-row__status is-error" : "file-row__status"}>
                    {it.status === "queued" && "Waiting…"}
                    {it.status === "uploading" && "Uploading…"}
                    {it.status === "compressing" && "Compressing…"}
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
