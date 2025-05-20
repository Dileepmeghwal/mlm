#!/bin/bash
set -e
echo "Running after_install.sh"
cd /home/ec2-user/ml
# Ensure permissions for the ml directory
chown -R ec2-user:ec2-user /home/ec2-user/ml
chmod -R 755 /home/ec2-user/ml
# Run npm install
npm install
npm run build
echo "Finished after_install.sh"