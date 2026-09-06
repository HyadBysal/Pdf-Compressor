const API_BASE = "";

const toolTabs = document.querySelectorAll(".tool-tab");

const toolTitle = document.getElementById("toolTitle");
const toolDescription = document.getElementById("toolDescription");

const uploadArea = document.getElementById("uploadArea");

const fileInput = document.getElementById("fileInput");

const filesContainer =
    document.getElementById("filesContainer");

const fileList =
    document.getElementById("fileList");

const addFilesButton =
    document.getElementById("addFilesButton");

const compressOptions =
    document.getElementById("compressOptions");

const splitOptions =
    document.getElementById("splitOptions");

const actionButton =
    document.getElementById("actionButton");

const statusArea =
    document.getElementById("statusArea");

const statusText =
    document.getElementById("statusText");

const downloadLink =
    document.getElementById("downloadLink");


let activeTool = "compress";

let selectedFiles = [];


/* --------------------------------
   Tool configuration
-------------------------------- */

const toolData = {

    compress: {
        title: "Compress your PDF",

        description:
            "Reduce the file size of your PDF while keeping good quality.",

        button:
            "Compress PDF"
    },

    merge: {
        title: "Merge your PDF files",

        description:
            "Combine multiple PDF files into a single document.",

        button:
            "Merge PDFs"
    },

    split: {
        title: "Split your PDF",

        description:
            "Extract specific pages from your PDF.",

        button:
            "Split PDF"
    }

};


/* --------------------------------
   Tool switching
-------------------------------- */

toolTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        activeTool = tab.dataset.tool;

        toolTabs.forEach((item) => {
            item.classList.remove("active");
        });

        tab.classList.add("active");

        updateTool();

    });

});


function updateTool() {

    const data = toolData[activeTool];

    toolTitle.textContent = data.title;

    toolDescription.textContent =
        data.description;

    fileInput.value = "";

    selectedFiles = [];

    fileList.innerHTML = "";

    filesContainer.hidden = true;

    compressOptions.hidden =
        activeTool !== "compress";

    splitOptions.hidden =
        activeTool !== "split";

    actionButton.hidden = true;

    actionButton.disabled = false;

    actionButton.textContent =
        data.button;

    hideStatus();

    updateUploadSettings();

}


/* --------------------------------
   Upload settings
-------------------------------- */

function updateUploadSettings() {

    if (activeTool === "merge") {

        fileInput.multiple = true;

        uploadArea.querySelector("h3").textContent =
            "Drop your PDF files here";

        uploadArea.querySelector("p").textContent =
            "or choose multiple files from your device";

        uploadArea.querySelector(".choose-button").textContent =
            "Choose PDFs";

    } else {

        fileInput.multiple = false;

        uploadArea.querySelector("h3").textContent =
            "Drop your PDF here";

        uploadArea.querySelector("p").textContent =
            "or choose a file from your device";

        uploadArea.querySelector(".choose-button").textContent =
            "Choose PDF";

    }

}


/* --------------------------------
   File input
-------------------------------- */

fileInput.addEventListener("change", () => {

    const files = Array.from(fileInput.files);

    addFiles(files);

});


addFilesButton.addEventListener("click", () => {

    fileInput.click();

});


/* --------------------------------
   Drag & Drop
-------------------------------- */

uploadArea.addEventListener("dragover", (event) => {

    event.preventDefault();

    uploadArea.classList.add("dragging");

});


uploadArea.addEventListener("dragleave", () => {

    uploadArea.classList.remove("dragging");

});


uploadArea.addEventListener("drop", (event) => {

    event.preventDefault();

    uploadArea.classList.remove("dragging");

    const files =
        Array.from(event.dataTransfer.files);

    addFiles(files);

});


/* --------------------------------
   Add files
-------------------------------- */

function addFiles(files) {

    const pdfFiles = files.filter((file) => {

        return (
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf")
        );

    });


    if (pdfFiles.length === 0) {

        alert("Please select PDF files only.");

        return;

    }


    if (activeTool === "merge") {

        selectedFiles = [
            ...selectedFiles,
            ...pdfFiles
        ];

    } else {

        selectedFiles = [
            pdfFiles[0]
        ];

    }


    hideStatus();

    renderFiles();

}


/* --------------------------------
   Render files
-------------------------------- */

function renderFiles() {

    fileList.innerHTML = "";


    selectedFiles.forEach((file, index) => {

        const fileItem =
            document.createElement("div");

        fileItem.className = "file-item";


        fileItem.innerHTML = `

            <div class="file-info">

                <div class="pdf-icon">
                    PDF
                </div>

                <div>

                    <div class="file-name">
                        ${escapeHTML(file.name)}
                    </div>

                    <div class="file-size">
                        ${formatFileSize(file.size)}
                    </div>

                </div>

            </div>


            <button
                type="button"
                class="remove-file"
                data-index="${index}"
            >
                Remove
            </button>

        `;


        fileList.appendChild(fileItem);

    });


    filesContainer.hidden =
        selectedFiles.length === 0;


    actionButton.hidden =
        selectedFiles.length === 0;


    document
        .querySelectorAll(".remove-file")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const index =
                    Number(button.dataset.index);

                selectedFiles.splice(index, 1);

                renderFiles();

            });

        });

}


/* --------------------------------
   File size
-------------------------------- */

function formatFileSize(bytes) {

    if (bytes < 1024) {
        return `${bytes} Bytes`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}


/* --------------------------------
   Prevent HTML injection
-------------------------------- */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


/* --------------------------------
   Status helpers
-------------------------------- */

function showStatus(message, isError = false) {

    statusArea.hidden = false;

    statusText.textContent = message;

    statusText.classList.toggle("error", isError);

}


function hideStatus() {

    statusArea.hidden = true;

    downloadLink.hidden = true;

    downloadLink.removeAttribute("href");

}


function setBusy(isBusy) {

    actionButton.disabled = isBusy;

    addFilesButton.disabled = isBusy;

}


/* --------------------------------
   API calls
-------------------------------- */

async function uploadFile(file) {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(`${API_BASE}/v1/files`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const detail = await safeErrorDetail(response);
        throw new Error(detail || "Upload failed");
    }

    const data = await response.json();

    return data.file_id;

}


async function createJob(operation, fileIds, options = {}) {

    const response = await fetch(`${API_BASE}/v1/jobs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            operation,
            file_ids: fileIds,
            options
        })
    });

    if (!response.ok) {
        const detail = await safeErrorDetail(response);
        throw new Error(detail || "Could not create job");
    }

    return response.json();

}


async function getJob(jobId) {

    const response = await fetch(`${API_BASE}/v1/jobs/${jobId}`);

    if (!response.ok) {
        const detail = await safeErrorDetail(response);
        throw new Error(detail || "Could not fetch job status");
    }

    return response.json();

}


async function safeErrorDetail(response) {

    try {
        const data = await response.json();
        return data.detail;
    } catch (err) {
        return null;
    }

}


async function pollJob(jobId) {

    while (true) {

        const job = await getJob(jobId);

        if (job.status === "COMPLETED" || job.status === "FAILED") {
            return job;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

    }

}


/* --------------------------------
   Action button
-------------------------------- */

actionButton.addEventListener("click", async () => {

    if (activeTool === "split") {

        showStatus(
            "Split isn't available yet — the server only supports compress and merge.",
            true
        );

        return;

    }

    if (selectedFiles.length === 0) {
        return;
    }

    setBusy(true);
    downloadLink.hidden = true;

    try {

        showStatus("Uploading file(s)...");

        const fileIds = [];

        for (const file of selectedFiles) {
            const fileId = await uploadFile(file);
            fileIds.push(fileId);
        }

        const options = {};

        if (activeTool === "compress") {
            const level = document.querySelector(
                'input[name="compression"]:checked'
            );

            options.level = level ? level.value : "recommended";
        }

        showStatus("Processing...");

        const job = await createJob(activeTool, fileIds, options);

        const finishedJob = await pollJob(job.job_id);

        if (finishedJob.status === "COMPLETED") {

            showStatus("Done! Your file is ready.");

            downloadLink.href =
                `${API_BASE}/v1/files/${finishedJob.output_file_id}/download`;

            downloadLink.setAttribute("download", "");

            downloadLink.hidden = false;

        } else {

            showStatus(
                finishedJob.error || "Processing failed.",
                true
            );

        }

    } catch (err) {

        showStatus(err.message || "Something went wrong.", true);

    } finally {

        setBusy(false);

    }

});


/* --------------------------------
   Initial state
-------------------------------- */

updateTool();
