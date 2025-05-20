#!/bin/bash
set -e
echo "Running before.sh"
# Remove existing files
rm -rf /home/ec2-user/ml/*
rm -f /home/ec2-user/ml/.gitignore
# Ensure the directory exists and has correct ownership/permissions
mkdir -p /home/ec2-user/ml
chown ec2-user:ec2-user /home/ec2-user/ml
chmod 755 /home/ec2-user/ml
echo "Finished before.sh"