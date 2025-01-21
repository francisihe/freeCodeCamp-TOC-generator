#!/bin/bash

# Ensure API_BASE_URL is set
if [ -z "$API_BASE_URL" ]; then
  echo "Error: API_BASE_URL environment variable is not set."
  exit 1  # Exit the script to stop the deployment
fi

echo "Using API endpoint: $API_BASE_URL"

# Define the desired Netlify configuration
NETLIFY_CONFIG="
[build]
  command = \"npm install && npm run build\"
  base = \"client\"
  publish = \"dist\"

[[redirects]]
  from = \"/api/v1/*\"
  to = \"$API_BASE_URL/:splat\"
  status = 200
  force = true

[[redirects]]
  from = \"/*\"
  to = \"/index.html\"
  status = 200
"

# Create or update the netlify.toml file
if [ ! -f "netlify.toml" ]; then
  echo "Creating netlify.toml file..."
else
  echo "Updating existing netlify.toml file..."
fi

echo "$NETLIFY_CONFIG" > netlify.toml

# Confirm successful configuration
echo "netlify.toml file has been configured successfully!"