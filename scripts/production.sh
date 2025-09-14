#!/bin/sh

# Provide default values for proxy environment variables
# The proxy should be directed to the same ingress as the frontend
: "${CLIENT_PROXY_SCHEME:=__PLACEHOLDER_CLIENT_PROXY_SCHEME__}"
: "${CLIENT_PROXY_HOST:=__PLACEHOLDER_CLIENT_PROXY_HOST__}"
: "${CLIENT_PROXY_PORT:=__PLACEHOLDER_CLIENT_PROXY_PORT__}"
: "${CLIENT_PROXY_PATH:=__PLACEHOLDER_CLIENT_PROXY_PATH__}"
: "${CLIENT_API_SCHEME:=__PLACEHOLDER_CLIENT_API_SCHEME__}"

for i in $(env | grep CLIENT_); do
  key=$(echo $i | cut -d '=' -f 1)
  value=$(echo $i | cut -d '=' -f 2-)
  echo $key=$value

  placeholder="__PLACEHOLDER_${key}__"

  find /app/frontend/assets -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${placeholder}|${value}|g" '{}' +
done
