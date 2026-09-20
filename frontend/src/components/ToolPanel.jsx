import { useEffect, useRef, useState } from "react";
import DocIcon from "./icons/DocIcon.jsx";
import uploadArrow from "../assets/icons/upload-arrow.svg";
import chevronDown from "../assets/icons/chevron-down.svg";
import { TOOLS } from "../data/content.js";

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/v1/files", { method: "POST", body: formData });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.detail || "Upload failed");
  return (await res.json()).file_id;
}

async function createJob(operation, fileIds) {
  const res = await fetch("/v1/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, file_ids: fileIds, options: {} }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.detail || "Could not create job");
  return res.json();
}

async function pollJob(jobId) {
  while (true) {
    const res = await fetch(`/v1/jobs/${jobId}`);
    const job = await res.json();
    if (job.status === "COMPLETED" || job.status === "FAILED") return job;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

export default function ToolPanel({ activeTool, onSelectTool }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState(null); // { message, isError, downloadUrl }
  const inputRef = useRef(null);

  useEffect(() => {
    setFiles([]);
    setStatus(null);
  }, [activeTool]);

  async function handleFiles(fileList) {
    const pdfFiles = Array.from(fileList).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfFiles.length === 0) return;

    setFiles(pdfFiles);
    setStatus(null);

    if (activeTool === "split") {
      setStatus({ message: "Split isn't available yet — the server only supports compress and merge.", isError: true });
      return;
    }
    if (activeTool === "merge" && pdfFiles.length < 2) {
      setStatus({ message: "Select at least two PDFs to merge.", isError: true });
      return;
    }

    try {
      setStatus({ message: "Uploading..." });
      const fileIds = [];
      for (const file of pdfFiles) fileIds.push(await uploadFile(file));

      setStatus({ message: "Processing..." });
      const job = await createJob(activeTool, fileIds);
      const finished = await pollJob(job.job_id);

      if (finished.status === "COMPLETED") {
        setStatus({ message: "Done!", downloadUrl: `/v1/files/${finished.output_file_id}/download` });
      } else {
        setStatus({ message: finished.error || "Processing failed.", isError: true });
      }
    } catch (err) {
      setStatus({ message: err.message || "Something went wrong.", isError: true });
    }
  }

  return (
    <div className="tool-panel">
      <div className="tool-panel__tabs">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={
              tool.id === activeTool
                ? "tool-panel__tab is-active"
                : "tool-panel__tab"
            }
            onClick={() => onSelectTool(tool.id)}
          >
            {tool.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div
        className={
          isDragging ? "tool-panel__dropzone is-dragging" : "tool-panel__dropzone"
        }
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="tool-panel__content">
          <div className="tool-panel__doc">
            <DocIcon />
            <div className="tool-panel__doc-badge">
              <img src={uploadArrow} alt="" style={{ width: 15.109, height: 18.615 }} />
            </div>
          </div>

          <div className="tool-panel__actions">
            <button
              type="button"
              className="upload-button"
              onClick={() => inputRef.current?.click()}
            >
              <span>UPLOAD YOUR PDF</span>
              <span className="upload-button__chevron">
                <img src={chevronDown} alt="" width={10} height={5} />
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple={activeTool === "merge"}
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
            <span className="tool-panel__hint">
              {status?.downloadUrl ? (
                <a className="upload-button" href={status.downloadUrl} download>
                  <span>DOWNLOAD RESULT</span>
                </a>
              ) : status ? (
                status.message
              ) : files.length ? (
                files.map((f) => f.name).join(", ")
              ) : (
                "or drop PDF here"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
