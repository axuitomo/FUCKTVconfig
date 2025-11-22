#!/bin/sh

# Create .dev.vars file from environment variables
echo "Generating .dev.vars from environment variables..."
echo "KEY=$KEY" > .dev.vars
echo "APIURL=$APIURL" >> .dev.vars
echo "APIKEY=$APIKEY" >> .dev.vars
echo "MODEL=$MODEL" >> .dev.vars

# Start Wrangler
echo "Starting Wrangler..."
exec npx wrangler dev --ip 0.0.0.0 --port 8787 --local
