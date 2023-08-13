#!/bin/bash

# Read .env file and load variables
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" =~ ^[[:alpha:]_][[:alnum:]_]*= ]]; then
    export "$line"
  fi
done < .env

export POSTGRESQL_URL="postgres://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?sslmode=disable"

if [ "$1" == "up" ]; then
  migrate -database "${POSTGRESQL_URL}" -path db/migrations up
elif [ "$1" == "down" ]; then
  migrate -database "${POSTGRESQL_URL}" -path db/migrations down
elif [ "$1" == "create" ]; then
  if [ -z "$2" ]; then
    echo "File name is missing. Usage: ./script.sh create [file_name]"
    exit 1
  fi
  migrate create -ext sql -dir db/migrations -seq "$2"
else
  echo "Invalid command. Usage: ./script.sh [up|down]"
fi