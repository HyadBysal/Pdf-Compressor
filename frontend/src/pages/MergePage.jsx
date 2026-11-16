import { useEffect, useRef, useState } from "react";
import { createJob, downloadUrl, pollJob, uploadFile } from "../lib/api.js";

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

export default function MergePage() {
  const inputRef = useRef(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]); // [{ id, file }]
  const [error, setError] = useState("");
  // idle | working | done | error
  const [job, setJob] = useState({ phase: "idle" });

  useEffect(() => {
    document.title = "Merge PDF — ipdfplumber";
    return () => {
      document.title = "ipdfplumber — Everything PDF. All in One Place.";
    };
  }, []);

  // Release the result's object URL when it changes or the page unmounts.
  useEffect(() => () => job.url && URL.revokeObjectURL(job.url), [job.url]);

  function addFiles(fileList) {
    const all = Array.from(fileList || []);
    const pdfs = all.filter(isPdf);
    setError(pdfs.length < all.length ? "Only PDF files can be merged — other files were skipped." : "");
    if (!pdfs.length) return;
    setFiles((prev) => [
      ...prev,
      ...pdfs.map((file) => ({ id: `${file.name}-${Math.random().toString(36).slice(2)}`, file })),
    ]);
    setJob({ phase: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index, delta) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setJob({ phase: "idle" });
  }

  function remove(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setJob({ phase: "idle" });
  }

  async function merge() {
    try {
      setJob({ phase: "working", message: "Uploading…" });
      const ids = [];
      for (const { file } of files) ids.push(await uploadFile(file));
      setJob({ phase: "working", message: "Merging…" });
      const created = await createJob("merge", ids);
      const finished = await pollJob(created.job_id);
      if (finished.status !== "COMPLETED") throw new Error(finished.error || "Merge failed");
      const res = await fetch(downloadUrl(finished.output_file_id));
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      setJob({ phase: "done", url: URL.createObjectURL(blob), size: blob.size });
    } catch (err) {
      setJob({ phase: "error", message: err.message || "Something went wrong" });
    }
  }

  const busy = job.phase === "working";
  const canMerge = files.length >= 2 && !busy;

  return (
    <div className="compress-page">
      <header className="compress-page__head">
        <h1 className="compress-page__title">Merge PDF</h1>
        <p className="compress-page__lead">
          Combine multiple PDFs into a single document in the order you want.
          Merge files in seconds &mdash; free, no sign-up, no watermark.
        </p>
      </header>

      <section className="compress-tool" aria-label="Upload PDFs to merge">
        <button
          type="button"
          className={isDragging ? "dropzone is-dragging" : "dropzone"}
          onClick={() => inputRef.current?.click()}
          disabled={busy}
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
            if (!busy) addFiles(e.dataTransfer.files);
          }}
        >
          <span className="dropzone__inner">
            <span className="dropzone__icon">
              <UploadIcon />
            </span>
            <span className="dropzone__title">
              {files.length ? "Add more PDFs" : "Select or drop PDFs to merge"}
            </span>
            <span className="dropzone__meta">
              Select 2 or more files <span aria-hidden="true">•</span> Arrange them in any order
            </span>
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />

        {error && <p className="compress-tool__error">{error}</p>}

        {files.length > 0 && (
          <>
            <ol className="file-list">
              {files.map(({ id, file }, i) => (
                <li key={id} className="file-row">
                  <span className="file-row__index">{i + 1}</span>
                  <div className="file-row__info">
                    <span className="file-row__name">{file.name}</span>
                    <span className="file-row__meta">{formatSize(file.size)}</span>
                  </div>
                  <div className="file-row__controls">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0 || busy}
                      aria-label={`Move ${file.name} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => move(i, 1)}
                      disabled={i === files.length - 1 || busy}
                      aria-label={`Move ${file.name} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => remove(id)}
                      disabled={busy}
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ol>

            <div className="merge-actions">
              {job.phase === "done" ? (
                <a className="primary-button" href={job.url} download="merged.pdf">
                  Download merged PDF ({formatSize(job.size)})
                </a>
              ) : (
                <button type="button" className="primary-button" onClick={merge} disabled={!canMerge}>
                  {busy ? job.message : `Merge ${files.length} PDF${files.length === 1 ? "" : "s"}`}
                </button>
              )}
              <p className={job.phase === "error" ? "merge-actions__hint is-error" : "merge-actions__hint"}>
                {job.phase === "error"
                  ? job.message
                  : files.length < 2
                    ? "Add at least one more PDF to merge."
                    : job.phase === "done"
                      ? "Change the order or add files to merge again."
                      : "Files are merged top to bottom."}
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
