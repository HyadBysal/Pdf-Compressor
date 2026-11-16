const API_BASE = import.meta.env.VITE_API_URL || "";

async function errorDetail(res, fallback) {
  const body = await res.json().catch(() => null);
  return body?.detail || fallback;
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/v1/files`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(await errorDetail(res, "Upload failed"));
  return (await res.json()).file_id;
}

export async function createJob(operation, fileIds, options = {}) {
  const res = await fetch(`${API_BASE}/v1/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, file_ids: fileIds, options }),
  });
  if (!res.ok) throw new Error(await errorDetail(res, "Could not create job"));
  return res.json();
}

export async function pollJob(jobId) {
  while (true) {
    const res = await fetch(`${API_BASE}/v1/jobs/${jobId}`);
    const job = await res.json();
    if (job.status === "COMPLETED" || job.status === "FAILED") return job;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

export function downloadUrl(fileId) {
  return `${API_BASE}/v1/files/${fileId}/download`;
}
