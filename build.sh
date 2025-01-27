#!/usr/bin/env bash
# exit on error
set -o errexit

# Add Debian backports for FFmpeg
echo "deb http://deb.debian.org/debian bullseye-backports main" >> /etc/apt/sources.list

# Install FFmpeg
apt-get update && apt-get install -y ffmpeg

# Install Python dependencies
pip install -r requirements.txt 