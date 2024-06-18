#!/bin/bash

# Define the source and destination files
SOURCE_FILE="./public/firebase-config.js"
DEST_FILE="./public/env.js"

# Copy the source file to the destination file
cp $SOURCE_FILE $DEST_FILE

# Function to replace environment variables in the destination file
replace_env_var() {
    local var_name=$1
    local env_value=$(grep $var_name .env.local | cut -d '=' -f2)

    if [ -z "$env_value" ]; then
        echo "Warning: $var_name not found in .env.local"
    else
        sed -i -e "s/$var_name/$env_value/g" $DEST_FILE
    fi
}

# List of environment variables to replace
env_vars=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
)

# Loop through each environment variable and replace it in the destination file
for var in "${env_vars[@]}"; do
    replace_env_var $var
done
