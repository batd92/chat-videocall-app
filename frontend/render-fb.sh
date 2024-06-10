#!/bin/bash

cp ./public/firebase-config.js ./public/env.js

sed -i -e "s/NEXT_PUBLIC_FIREBASE_API_KEY/$(grep NEXT_PUBLIC_FIREBASE_API_KEY .env.local | cut -d '=' -f2)/g" ./public/env.js
sed -i -e "s/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN/$(grep NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN .env.local | cut -d '=' -f2)/g" ./public/env.js
sed -i -e "s/NEXT_PUBLIC_FIREBASE_PROJECT_ID/$(grep NEXT_PUBLIC_FIREBASE_PROJECT_ID .env.local | cut -d '=' -f2)/g" ./public/env.js
sed -i -e "s/NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET/$(grep NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET .env.local | cut -d '=' -f2)/g" ./public/env.js
sed -i -e "s/NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID/$(grep NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID .env.local | cut -d '=' -f2)/g" ./public/env.js
sed -i -e "s/NEXT_PUBLIC_FIREBASE_APP_ID/$(grep NEXT_PUBLIC_FIREBASE_APP_ID .env.local | cut -d '=' -f2)/g" ./public/env.js
sed -i -e "s/NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID/$(grep NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID .env.local | cut -d '=' -f2)/g" ./public/env.js
