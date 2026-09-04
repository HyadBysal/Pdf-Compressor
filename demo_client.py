import argparse
import time
import requests


def upload(base_url: str, path: str) -> str:
    with open(path, "rb") as f:
        response = requests.post(
            f"{base_url}/v1/files",
            files={"file": (path, f, "application/pdf")},
        )
    response.raise_for_status()
    return response.json()["file_id"]


def create_job(base_url: str, operation: str, file_ids: list[str], degrees: int = 90):
    body = {
        "operation": operation,
        "file_ids": file_ids,
        "options": {"degrees": degrees} if operation == "rotate" else {},
    }
    response = requests.post(f"{base_url}/v1/jobs", json=body)
    response.raise_for_status()
    return response.json()["job_id"]


def wait_for_job(base_url: str, job_id: str):
    while True:
        response = requests.get(f"{base_url}/v1/jobs/{job_id}")
        response.raise_for_status()
        data = response.json()
        print(data)
        if data["status"] in {"COMPLETED", "FAILED"}:
            return data
        time.sleep(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("operation", choices=["compress", "rotate"])
    parser.add_argument("pdf")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--degrees", type=int, default=90)
    args = parser.parse_args()

    file_id = upload(args.base_url, args.pdf)
    print("Uploaded:", file_id)

    job_id = create_job(
        args.base_url,
        args.operation,
        [file_id],
        args.degrees,
    )
    print("Job:", job_id)

    result = wait_for_job(args.base_url, job_id)

    if result["status"] == "COMPLETED":
        print(
            "Download:",
            f'{args.base_url}/v1/files/{result["output_file_id"]}/download'
        )
