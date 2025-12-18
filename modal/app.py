#!/usr/bin/env python3
# Copyright (c) 2025 Tylt LLC. All rights reserved.
# CONFIDENTIAL AND PROPRIETARY. Unauthorized use, copying, or distribution
# is strictly prohibited. For licensing inquiries: hello@claimhawk.app

"""
Dataset Viewer Modal Deployment

Deploys the Next.js dataset viewer app on Modal with auto wake/sleep.
Reads datasets from the claimhawk-lora-training volume.

Usage:
    modal deploy modal/app.py      # Deploy to Modal
    modal serve modal/app.py       # Run locally for testing
"""

import os
import subprocess

import modal

APP_NAME = "dataset-viewer"
VOLUME_NAME = "claimhawk-lora-training"

app = modal.App(APP_NAME)

# Volume with training datasets
datasets_volume = modal.Volume.from_name(VOLUME_NAME, create_if_missing=False)

# Node.js image with Next.js app pre-built
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("nodejs", "npm", "curl", "git")
    .run_commands("npm install -g npm@latest")
    # Copy source code
    .copy_local_dir(".", "/app", ignore=[".next", "node_modules", ".git", "modal"])
    # Install dependencies and build
    .run_commands(
        "cd /app && npm ci --legacy-peer-deps",
        "cd /app && npm run build",
    )
)


@app.function(
    image=image,
    volumes={"/datasets": datasets_volume},
    memory=1024,
    cpu=1,
    allow_concurrent_inputs=10,
    container_idle_timeout=300,  # 5 min idle before sleep
)
@modal.web_server(3000, startup_timeout=60)
def web() -> None:
    """Serve the Next.js dataset viewer."""
    # Reload volume to get latest datasets
    datasets_volume.reload()

    # Start Next.js production server
    subprocess.Popen(
        ["npm", "run", "start"],
        cwd="/app",
        env={
            **os.environ,
            "PORT": "3000",
            "HOSTNAME": "0.0.0.0",
            "NODE_ENV": "production",
        },
    )


@app.local_entrypoint()
def main() -> None:
    """Display deployment info."""
    print(f"Dataset Viewer deployed to Modal")
    print(f"Volume: {VOLUME_NAME}")
    print(f"Access at: https://claimhawk--{APP_NAME}-web.modal.run")
