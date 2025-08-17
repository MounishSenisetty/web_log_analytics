#!/bin/bash

# Start Flume agent
flume-ng agent \
  --name agent \
  --conf-file flume-weblog.conf \
  -Dflume.root.logger=INFO,console
