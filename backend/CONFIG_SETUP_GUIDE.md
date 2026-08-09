# ProjectXia Production Credential Configuration Guide

This guide walks you through setting up real production credentials across all 5 verification and persistence layers for your startup.

---

### 1. 📧 Gmail App Password (Email OTP & Agency Inquiry Delivery)
Used for automated OTP delivery and dispatching customer enquiry emails to `theprojectxia@gmail.com`.

1. Go to your **Google Account Security Settings**: [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure **2-Step Verification** is turned **ON**.
3. Under *2-Step Verification*, scroll to **App passwords** (or visit [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Enter an App name: `ProjectXia`.
5. Click **Create** to generate a **16-character password** (e.g. `abcd efgh ijkl mnop`).
6. Paste into [backend/.env](file:///c:/Users/chris/OneDrive/Desktop/ProjecTxia/backend/.env):
   ```env
   GMAIL_USER=theprojectxia@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

---

### 2. 📱 Twilio SMS Credentials (Mobile SMS OTP)
Used for dispatching SMS verification codes to real Indian & international mobile numbers.

1. Create a free/production account at [https://console.twilio.com](https://console.twilio.com).
2. On your Twilio Dashboard, find:
   - **Account SID** (e.g. `ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
   - **Auth Token** (e.g. `your_auth_token_here`)
   - **My Twilio Phone Number** (e.g. `+1234567890`)
3. Paste into [backend/.env](file:///c:/Users/chris/OneDrive/Desktop/ProjecTxia/backend/.env):
   ```env
   TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

---

### 3. 🌐 Firebase Web Config (Google Sign-In & Frontend Auth)
Used by the React client for 1-click Google OAuth authentication and instant token issuance.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create or select your project: `projectxia-marketplace`.
3. Under **Authentication > Sign-in method**, enable **Google** and **Email/Password**.
4. Under **Project Settings > General > Your apps**, select **Web app (`</>`)** to view your Firebase SDK snippet.
5. Paste into [frontend/.env](file:///c:/Users/chris/OneDrive/Desktop/ProjecTxia/frontend/.env):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=projectxia-auth.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=projectxia-marketplace
   VITE_FIREBASE_STORAGE_BUCKET=projectxia-marketplace.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=987654321000
   VITE_FIREBASE_APP_ID=1:987654321000:web:abcdef1234567890
   ```

---

### 4. 🛡️ Firebase Admin Credentials (Backend Secure Token Verification)
Used by Express.js to verify Google OAuth ID tokens securely on the server.

1. In Firebase Console, go to **Project Settings > Service accounts**.
2. Click **Generate new private key** to download your service account JSON file.
3. Add the values into [backend/.env](file:///c:/Users/chris/OneDrive/Desktop/ProjecTxia/backend/.env):
   ```env
   FIREBASE_PROJECT_ID=projectxia-marketplace
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@projectxia-marketplace.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgI...\n-----END PRIVATE KEY-----\n"
   ```

---

### 5. 🍃 MongoDB Database (User & Audit Persistence)
Used to permanently store registered innovators, project listings, escrow orders, and security audit logs.

- **Option A (Local MongoDB)**:
  Make sure MongoDB service is running locally on port 27017:
  ```env
  MONGO_URI=mongodb://127.0.0.1:27017/projectxia
  ```
- **Option B (MongoDB Atlas Cloud)**:
  Create a free cloud cluster at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and copy your connection string:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/projectxia?retryWrites=true&w=majority
  ```

---

### 🚀 Verification & Live Status
The ProjectXia backend includes **zero-crash fallback layers**:
- If any service credentials are still in setup mode, the system automatically falls back to secure simulation and console verification logging without throwing runtime errors or disrupting website uptime.
