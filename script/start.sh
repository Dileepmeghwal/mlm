#!/bin/bash
cd /home/ec2-user/ml
export PM2_HOME=/home/ec2-user/.pm2
pm2 restart mlm || pm2 start npm --name mlm -- start