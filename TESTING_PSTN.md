# Twilio PSTN Integration - Setup & Testing Guide

## 📋 Table of Contents

1. [Implementation Status](#-implementation-status)
2. [Prerequisites](#-prerequisites)
3. [Manual Setup Steps](#-manual-setup-steps)
4. [Testing Procedures](#-testing-procedures)
5. [Troubleshooting](#-troubleshooting)
6. [Success Criteria](#-success-criteria)
7. [Future Features](#-future-features)

## ✅ Implementation Status

All implementation tasks are **COMPLETE**:

- ✅ Database schema with PhoneNumber and PBXRoutingRule tables
- ✅ PSTN types added to shared package
- ✅ Twilio SDK installed in backend
- ✅ TwilioService for token/TwiML generation
- ✅ RoutingService for PBX routing logic
- ✅ CallStorage extended with PSTN call tracking
- ✅ TwilioController with webhook endpoints
- ✅ All services wired up in backend
- ✅ Twilio Voice SDK installed in ucaas-client
- ✅ TwilioDeviceService wrapper created
- ✅ SoftphoneContext extended with dual call path logic
- ✅ Frontend build successful (no TypeScript errors)
- ✅ Test data created in database

## 🔧 Prerequisites

Before starting, ensure you have:

### Required Accounts
- ✅ **Twilio Account** (Sign up at https://www.twilio.com/try-twilio)
  - Free trial includes $15 credit
  - Can receive calls but caller ID will show "Unknown" on trial
  - Upgrade for full features

### ⚠️ IMPORTANT: Country Voice Support & Regulatory Requirements

**Not all countries support voice calling via Twilio!**

Before purchasing a phone number, verify that your country supports **Voice** (not just SMS):

1. **Check Twilio's capabilities**: https://www.twilio.com/en-us/voice/coverage
2. **Search your country** and verify "Voice" is supported (not just "SMS")

### 📋 Regulatory Requirements (Production Consideration)

⚠️ **Important**: While any country's number works for **development/testing**, **production use** has different regulatory requirements per country:

| Country | Dev/Test | Production Requirements | Complexity |
|---------|----------|------------------------|------------|
| 🇺🇸 **United States** | ✅ Easy | ✅ **None** - Ready immediately | ⭐ Low |
| 🇨🇦 **Canada** | ✅ Easy | ✅ Minimal verification | ⭐ Low |
| 🇬🇧 **United Kingdom** | ✅ Easy | ⚠️ Address verification | ⭐⭐ Medium |
| 🇩🇪 **Germany** | ✅ Easy | ❌ Business docs, ID, address proof | ⭐⭐⭐ High |
| 🇫🇷 **France** | ✅ Easy | ❌ Similar to Germany | ⭐⭐⭐ High |

**For this tutorial (development only)**: Use a **US or Canadian number** - no regulatory requirements, works immediately.

**For production**: Consider these options:
1. **App-only calling** (no direct phone numbers) - Bypasses regulations
2. **US/Canada numbers** - Easiest for global deployment
3. **Local numbers** - Only if legally required, budget compliance time

**Countries that typically support Voice**:
- ✅ United States
- ✅ Canada
- ✅ United Kingdom
- ✅ **Germany** (both mobile and local/geographic numbers)
- ✅ France
- ✅ Netherlands
- ✅ Australia
- ✅ Many others...

**Countries with LIMITED support** (SMS only, NO Voice):
- ❌ **Sweden** - SMS only, voice NOT supported
- ❌ Many other countries - check before purchasing!

**Options if your country doesn't support voice**:
- **Recommended for development**: **US or Canada number** (~$1/month)
  - ✅ No regulatory requirements
  - ✅ Instant setup (5 minutes)
  - ✅ Works from anywhere
  - ✅ Covered by trial credit
- Alternative: Germany/UK (but complex for production)
  - German local/geographic: ~$1-2/month
  - ⚠️ Production requires business docs, ID verification (weeks)
- Test from any location
- **For production**: Use US/Canada numbers OR app-only calling (see above)

**Number Types**: Any type works (Mobile, Local/Geographic, Toll-free, National) as long as it has **Voice** capability!

### ❓ Can I Use Test Numbers?

**No** - There are no "test" phone numbers for PSTN calling:
- Twilio provides test credentials for API development
- BUT for real phone calls, you need a real number (connects to real phone network)
- **Trial account solution**: $15 free credit covers development costs
- Numbers are ~$1/month, covered by trial credit
- This is the industry standard approach

### Required Tools
- ✅ **VS Code** (for built-in port forwarding) OR **ngrok** (alternative)
  - VS Code: Already installed, no additional setup
  - ngrok: Free tier works fine, requires account (https://ngrok.com)
- ✅ **Node.js** v18+ installed
- ✅ **pnpm** package manager
- ✅ **PostgreSQL** database running
- ✅ **Mobile phone** or **softphone** for testing calls

### Required Environment
- ✅ Backend server can run on port 5000
- ✅ Frontend server can run on port 3002
- ✅ Database is accessible and seeded
- ✅ No firewall blocking WebRTC (UDP ports)

## 📊 Test Data Summary

```
Phone Number: +15551234567
Status: active
Assigned To: Jane Smith
Extension: 102
Email: jane@acme.com
Routing Rule: Configured (24/7, all callers)
```

## 📝 Manual Setup Steps

Follow these steps **in order** to set up the PSTN integration.

---

### STEP 1: Expose Local Server to the Internet

You need to expose your local backend (port 5000) to the internet so Twilio can send webhooks. Choose one option:

---

#### OPTION A: VS Code Port Forwarding (Recommended - Built-in)

**Advantages**: Built into VS Code, no installation, free, easy to use

1. **Open VS Code** with your project
2. **Start your backend** on port 5000
3. **Forward the port**:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: "Forward a Port"
   - Enter: `5000`
4. **Make it public**:
   - Open the "PORTS" panel (bottom of VS Code, next to Terminal)
   - Right-click on port 5000
   - Select: "Port Visibility" → "Public"
5. **Copy the forwarded URL**:
   - It will look like: `https://abcd1234-5000.app.github.dev`
   - This is your webhook base URL
6. **Keep VS Code running** during testing

⚠️ **Note**: The URL changes each time you restart VS Code, so you'll need to update Twilio webhook URLs when that happens.

---

#### OPTION B: ngrok (Classic Method)

**Advantages**: URL persists across restarts (with paid plan), works outside VS Code

##### B.1 Install ngrok

**Option 1: Download from website**
```bash
# Visit https://ngrok.com/download
# Download for your OS and move to /usr/local/bin
```

**Option 2: Using Homebrew (macOS/Linux)**
```bash
brew install ngrok/ngrok/ngrok
```

**Option 3: Using npm**
```bash
npm install -g ngrok
```

##### B.2 Sign up and authenticate

1. Create account at https://dashboard.ngrok.com/signup
2. Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
   ```

##### B.3 Start ngrok tunnel

```bash
ngrok http 5000
```

You should see output like:
```
Session Status                online
Account                       your@email.com
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:5000
```

**⚠️ IMPORTANT**:
- Copy the HTTPS URL (e.g., `https://abc123def456.ngrok-free.app`)
- This is your webhook base URL
- Keep this terminal window open - closing it will break the tunnel
- The URL changes each time you restart ngrok (use paid plan for static URLs)

---

**For the rest of this guide, we'll use `YOUR_WEBHOOK_URL` to refer to either your VS Code forwarded URL or ngrok URL.**

---

### STEP 2: Configure Twilio Account

#### 2.1 Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up with email and verify your phone number
3. You'll receive $15 trial credit

**Trial Account Limitations**:
- Can only call verified phone numbers
- Caller ID shows as "Unknown" or "Restricted"
- Outbound calls include trial message
- To remove limitations, upgrade account (requires credit card)

#### 2.2 Verify Your Phone Number (Trial Accounts Only)

1. Go to https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click **Add a new Caller ID**
3. Enter your mobile phone number
4. Enter verification code sent via SMS
5. This allows you to call your Twilio number from your mobile

---

### STEP 3: Create TwiML App

TwiML Apps define how Twilio handles voice calls. This tells Twilio where to send webhook requests.

#### 3.1 Create the TwiML App

1. Go to https://console.twilio.com/us1/develop/voice/manage/twiml-apps
2. Click **Create new TwiML App** button
3. Fill in the form:

   **Friendly Name**: `UCaaS PSTN Integration`

   **Voice Configuration**:
   - **Request URL**: `https://YOUR_WEBHOOK_URL/api/v1/twilio/voice/incoming`
     - Replace `YOUR_WEBHOOK_URL` with your forwarded URL from Step 1
     - VS Code example: `https://abcd1234-5000.app.github.dev/api/v1/twilio/voice/incoming`
     - ngrok example: `https://abc123def456.ngrok-free.app/api/v1/twilio/voice/incoming`
     - **Method**: `HTTP POST`

   **Status Callback URL**: `https://YOUR_WEBHOOK_URL/api/v1/twilio/voice/status`
     - Replace with your forwarded URL from Step 1
     - VS Code example: `https://abcd1234-5000.app.github.dev/api/v1/twilio/voice/status`
     - ngrok example: `https://abc123def456.ngrok-free.app/api/v1/twilio/voice/status`
     - **Method**: `HTTP POST`

4. Click **Save**

#### 3.2 Copy the TwiML App SID

After saving, you'll see the app details page. Copy the **SID** field:
- Format: `APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Starts with `AP`
- You'll need this for the `.env` file

**Screenshot locations to help**:
- Voice Configuration: Under "Voice" section
- Status Callback: Under "Status Callback URL" field
- SID: At the top of the page after saving

---

### STEP 4: Create API Key

API Keys allow your backend to generate Twilio access tokens for the frontend.

#### 4.1 Create the API Key

1. Go to https://console.twilio.com/us1/account/keys-credentials/api-keys
2. Click **Create API key** button
3. Fill in the form:

   **Friendly Name**: `UCaaS Backend`

   **Key Type**: `Standard` (not Main - Main keys have full account access)

   **Region**: `Auto` or select your region

4. Click **Create API Key**

#### 4.2 Copy the Credentials

**⚠️ CRITICAL**: The secret is shown **ONLY ONCE** - you cannot retrieve it later!

After creation, you'll see:
- **SID**: Format `SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (starts with `SK`)
- **Secret**: Long random string - **COPY THIS NOW!**

**Save both values immediately** - you'll need them for the `.env` file.

If you lose the secret, you must delete the key and create a new one.

---

### STEP 5: Purchase/Configure Phone Number

⚠️ **REMINDER**: Make sure your country supports Voice calling! See the Prerequisites section above. **Sweden and many other countries only support SMS, not voice.**

**💡 RECOMMENDATION FOR DEVELOPMENT/TESTING:**

Use a **🇺🇸 US number** or **🇨🇦 Canadian number** - Here's why:
- ✅ **No regulatory requirements** (instant setup)
- ✅ **Cheapest** (~$1/month, covered by trial credit)
- ✅ **Works from anywhere** (including Sweden)
- ✅ **Production-ready** (no compliance needed later)
- ✅ **Industry standard** for global SaaS products

**Alternative countries** (⚠️ complex for production):
- 🇩🇪 Germany - Requires business docs, ID, address proof for production
- 🇬🇧 United Kingdom - Requires address verification for production
- Both work for dev/testing, but production compliance takes weeks

#### 5.1 Purchase a Phone Number

1. Go to https://console.twilio.com/us1/develop/phone-numbers/manage/search

2. **Select search criteria** (Recommended: US number):
   - **Country**: **United States** ⭐ (recommended)
   - **Number Type**: **Local** (cheapest)
   - **Number or Location**: Leave blank or enter any US area code
     - Examples: 415 (San Francisco), 212 (NYC), 310 (LA), 512 (Austin)
     - Pick any city you like - doesn't matter for functionality
   - **Capabilities**: ✅ **Check Voice** (must be checked!)

3. Click **Search**

4. Verify results show numbers with **Voice** capability (look for phone icon)

5. Browse available numbers and click **Buy** on any one
   - All work the same - pick any number you like
   - Cost: ~$1/month
   - Trial accounts can purchase (uses trial credit)

6. Confirm purchase

**If no results**: Try a different area code or just leave the location blank.

**Alternative countries** (if you really want them):
- 🇨🇦 Canada - Similar to US, no regulatory issues
- 🇬🇧 UK / 🇩🇪 Germany - Work for testing, but production compliance is complex

#### 5.2 Configure the Number

After purchasing, you'll be on the phone number configuration page. If not, go to:
https://console.twilio.com/us1/develop/phone-numbers/manage/incoming

1. Click on your phone number
2. Scroll to **Voice Configuration** section
3. Configure:
   - **Configure with**: Select `TwiML App` (dropdown)
   - **TwiML App**: Select `UCaaS PSTN Integration` (the app you created in Step 3)
4. Scroll down and click **Save configuration**

**Verify Configuration**:
- Voice Configuration shows "TwiML App: UCaaS PSTN Integration"
- No errors in the UI

---

### STEP 6: Get Account SID and Auth Token

You need your account credentials for the backend.

#### 6.1 Find Account SID

1. Go to https://console.twilio.com/
2. Look at the **Account Info** box on the dashboard
3. Copy **Account SID**
   - Format: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Starts with `AC`

#### 6.2 Get Auth Token

1. In the same **Account Info** box, you'll see **Auth Token**
2. Click the eye icon to reveal it
3. Copy the **Auth Token**
   - Long random string
   - Keep this secret!

**Security Note**: Never commit the Auth Token to git or share it publicly.

---

### STEP 7: Update Environment Variables

Now we'll configure the backend with all the Twilio credentials.

#### 7.1 Edit the .env file

Open `/apps/backend/.env` in your editor and update the Twilio section:

```env
# Existing variables (leave as-is)
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3001
UCAAS_CLIENT_URL=http://localhost:3002
DATABASE_URL="postgresql://postgres:voxera_dev_password@localhost:5432/voxera_ucaas?schema=public"

# Twilio Configuration (UPDATE THESE)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # From Step 6.1
TWILIO_AUTH_TOKEN=your_auth_token_here                  # From Step 6.2
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx      # From Step 4.2 (SID)
TWILIO_API_SECRET=your_api_secret_here                  # From Step 4.2 (Secret)
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx # From Step 3.2
```

**Replace the placeholder values** with your actual credentials from the previous steps.

#### 7.2 Verify .env file

Double-check that:
- ✅ All five Twilio variables are set
- ✅ No quotes around the values
- ✅ No spaces before or after the `=`
- ✅ Account SID starts with `AC`
- ✅ API Key SID starts with `SK`
- ✅ TwiML App SID starts with `AP`

---

### STEP 8: Update Database Phone Number

The test data uses a placeholder phone number. Update it to match your Twilio number.

#### 8.1 Run the update script

**Replace `+15551234567` with your actual Twilio number** (in E.164 format: `+1234567890`):

```bash
cd /Users/privat/repos/ucaas

pnpm exec tsx -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from 'dotenv';

config();

const url = new URL(process.env.DATABASE_URL || 'postgresql://postgres:voxera_dev_password@localhost:5432/voxera_ucaas?schema=public');
const pool = new pg.Pool({
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  database: url.pathname.slice(1).split('?')[0],
  user: url.username,
  password: url.password,
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const updated = await prisma.phoneNumber.updateMany({
    where: { number: '+15551234567' },
    data: { number: '+15551234567' }  // 👈 CHANGE THIS to your Twilio number
  });
  console.log('✅ Updated', updated.count, 'phone number(s)');
  await pool.end();
  await prisma.\$disconnect();
})();
"
```

**Example**: If your Twilio number is `(415) 555-1234`, change the data line to:
```javascript
data: { number: '+14155551234' }
```

#### 8.2 Verify the update

Check that the phone number was updated:

```bash
pnpm exec tsx -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from 'dotenv';

config();

const url = new URL(process.env.DATABASE_URL || 'postgresql://postgres:voxera_dev_password@localhost:5432/voxera_ucaas?schema=public');
const pool = new pg.Pool({
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  database: url.pathname.slice(1).split('?')[0],
  user: url.username,
  password: url.password,
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const phoneNumber = await prisma.phoneNumber.findFirst({ include: { routingRules: true } });
  const user = await prisma.user.findFirst({ where: { extension: { not: null } } });

  console.log('\\n📞 Test Configuration:');
  console.log('=====================');
  if (phoneNumber) {
    console.log('Phone Number:', phoneNumber.number);
    console.log('Assigned To:', phoneNumber.assignedToName);
    console.log('Routing Rules:', phoneNumber.routingRules.length);
  }
  if (user) {
    console.log('\\nTest User:', user.firstName, user.lastName);
    console.log('Email:', user.email);
    console.log('Extension:', user.extension);
  }

  await pool.end();
  await prisma.\$disconnect();
})();
"
```

You should see your Twilio number displayed.

---

### ✅ Manual Setup Complete!

You've now configured:
- ✅ Port forwarding (VS Code or ngrok) for webhooks
- ✅ Twilio TwiML App
- ✅ Twilio API Key
- ✅ Twilio phone number
- ✅ Backend environment variables
- ✅ Database phone number

**Next**: Proceed to the Testing Procedures section below.

---

## 🧪 Testing Procedures

Follow these steps to test the PSTN integration end-to-end.

---

### TEST 1: Start All Services

You need **port forwarding** and **2 terminal windows** running simultaneously.

#### Step 1: Expose Port 5000

**Option A: VS Code Port Forwarding**
1. Press `Cmd+Shift+P` (or `Ctrl+Shift+P`)
2. Type "Forward a Port" and press Enter
3. Enter `5000` and press Enter
4. Right-click port 5000 in Ports panel → "Port Visibility" → "Public"
5. Copy the forwarded URL (e.g., `https://abcd1234-5000.app.github.dev`)

✅ **Verify**: Port 5000 shows as "Public" in the Ports panel
❌ **If failed**: Check that VS Code has internet connection

**Option B: ngrok**
```bash
ngrok http 5000
```

**Expected output**:
```
Session Status                online
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000
```

✅ **Verify**: You see the HTTPS forwarding URL
❌ **If failed**: Check ngrok authentication (Step 1.2 of setup)

**Keep the tunnel active** - don't close it!

---

#### Step 2: Backend Server (Terminal 1)

```bash
cd /Users/privat/repos/ucaas/apps/backend
pnpm dev
```

**Expected output**:
```
Server running on http://localhost:5000
Socket.io server initialized
API routes mounted at /api/v1
Database connection config: { host: 'localhost', port: 5432, ... }
```

✅ **Verify**: You see "Server running" message
❌ **If failed**: Check PostgreSQL is running, .env file is correct

**Keep this terminal open** and watch for incoming webhook logs during testing.

---

#### Step 3: UCaaS Client (Terminal 2)

```bash
cd /Users/privat/repos/ucaas/apps/ucaas-client
pnpm dev
```

**Expected output**:
```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:3002/
➜  Network: use --host to expose
```

✅ **Verify**: You see "ready" message and local URL
❌ **If failed**: Check port 3002 is not in use

---

### TEST 2: Login and Verify Twilio Device Registration

#### 2.1 Open the Application

1. Open **Google Chrome** or **Firefox** (Safari may have WebRTC issues)
2. Navigate to: `http://localhost:3002`
3. Open **Developer Tools** (F12 or Cmd+Option+I on Mac)
4. Go to the **Console** tab

#### 2.2 Login

Use the test user credentials:
- **Email**: `jane@acme.com`
- **Password**: Whatever you set in your authentication system (check with admin)

If you haven't set up authentication yet, you may be auto-logged in.

#### 2.3 Verify Twilio Device Registration

**Watch the browser console** for these log messages in order:

```
[Softphone] Fetching Twilio token...
[Softphone] Twilio token received, initializing Device...
[Twilio Device] Registered successfully
```

✅ **Success**: You see all three messages
❌ **If failed**: Check backend terminal for errors, verify .env has correct credentials

**Also check the browser console for errors** - there should be none related to Twilio.

---

### TEST 3: Make Incoming PSTN Call

Now for the moment of truth - let's receive a real phone call!

#### 3.1 Prepare for the Call

**Before calling**:
1. ✅ Port forwarding is active (VS Code Ports panel shows Public, or ngrok is running)
2. ✅ Backend and ucaas-client terminals are running
3. ✅ Browser is open to `http://localhost:3002` with console visible
4. ✅ User is logged in as jane@acme.com
5. ✅ Console shows "Twilio Device Registered successfully"
6. ✅ Backend terminal shows "Server running"
7. ✅ You have your mobile phone ready

#### 3.2 Make the Call

**From your mobile phone**:
1. **Dial your Twilio number** (the one you purchased in Step 5)
   - Example: `+1 415 555 1234`
   - If using trial account, **this must be a verified number**
2. **Wait 2-3 seconds** for the call to process

#### 3.3 Watch Backend Logs (Terminal 2)

You should see logs like this appear in **real-time**:

```
POST /api/v1/twilio/voice/incoming
[Twilio] Incoming call from: +1YOURCELLPHONE
[Routing] Looking up phone number: +15551234567
[Routing] Found phone number: +15551234567 (ID: cmk...)
[Routing] Evaluating routing rules...
[Routing] Found routing rule: Default Route to Jane (Priority 1)
[Routing] Route matched: user (Jane Smith)
[ChatStorage] Checking if user is online: cmk2f0vbn00016z8t8twl9the
[ChatStorage] User is online
[CallStorage] Checking if user is in call...
[CallStorage] User not in call, proceeding
[Twilio] Returning TwiML: <Response><Dial>...</Dial></Response>
[Socket.io] Emitting incoming call event to user: cmk2f0vbn00016z8t8twl9the
```

✅ **Success**: You see all these logs
❌ **If failed**: See troubleshooting section

#### 3.4 Watch Frontend UI and Console

In the **browser window** you should see:

**Visual Changes**:
- 🔔 Incoming call notification appears
- 📱 Shows caller's phone number (or "Unknown" on trial)
- 🎵 **Ringtone starts playing**
- 🟢 Green "Answer" button
- 🔴 Red "Reject" button

**Browser Console Logs**:
```
[Softphone] Incoming call from: +1YOURCELLPHONE
Incoming call from: +1YOURCELLPHONE
```

**On your mobile phone**, you should hear:
- Ringing sound (waiting for answer)

✅ **Success**: You see the incoming call UI and hear ringtone
❌ **If failed**: Check Socket.io connection in browser console

---

### TEST 4: Answer the Call

#### 4.1 Click Answer

In the browser, **click the green "Answer" button**.

#### 4.2 Verify Connection

**Browser Changes**:
- ✅ Ringtone stops
- ✅ Call state shows "Connected"
- ✅ Mute button appears
- ✅ End call button appears

**Browser Console**:
```
[Twilio Device] Call connected
[Twilio Device] Answered call
```

**On your mobile phone**:
- ✅ Ringing stops
- ✅ Call timer starts
- ✅ **You should hear silence or your own voice if you speak**

#### 4.3 Test Bidirectional Audio

1. **Speak into your mobile phone**: "Hello, can you hear me?"
2. **Listen in your computer speakers/headphones**: You should hear your mobile voice
3. **Speak into your computer microphone**: "Yes, I can hear you!"
4. **Listen on your mobile phone**: You should hear your computer voice

✅ **Success**: Audio flows both directions clearly
❌ **If failed**:
- Check browser asked for microphone permission
- Check computer volume is not muted
- Check mobile phone volume is up
- See troubleshooting section for WebRTC issues

---

### TEST 5: Test Call Controls

While the call is connected, test each control.

#### 5.1 Test Mute

1. **Click the "Mute" button** in the browser
2. **Speak into your computer microphone**
3. **Listen on your mobile phone** - you should hear silence
4. **Browser console shows**: `[Twilio Device] Mute toggled: true`

✅ **Success**: Mobile phone can't hear you
❌ **If failed**: Check browser console for errors

#### 5.2 Test Unmute

1. **Click the "Mute" button again** to unmute
2. **Speak into your computer microphone**
3. **Listen on your mobile phone** - you should hear your voice again
4. **Browser console shows**: `[Twilio Device] Mute toggled: false`

✅ **Success**: Mobile phone can hear you again

#### 5.3 Test End Call

1. **Click the "End Call" button** in the browser
2. **Expected behavior**:
   - Browser: Call UI disappears or resets to idle
   - Mobile: Call disconnects, you hear dial tone or silence
   - Browser console: `[Twilio Device] Hung up call`, `[Twilio Device] Call disconnected`
   - Backend logs: Status callback received

✅ **Success**: Call ends cleanly on both sides

---

### TEST 6: Verify Call History

After ending the call, verify it was logged correctly.

#### 6.1 Check Frontend Call History

1. In the browser, navigate to the **Call History** section
2. **Verify the entry shows**:
   - ✅ Contact: Your mobile phone number (or "Unknown")
   - ✅ Direction: Inbound
   - ✅ Duration: Matches how long the call lasted
   - ✅ Timestamp: Shows the correct time
   - ✅ Answered: Yes (green checkmark or indicator)

#### 6.2 Check Backend Database

Run this query to verify the call was logged:

```bash
pnpm exec tsx -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from 'dotenv';

config();

const url = new URL(process.env.DATABASE_URL || 'postgresql://postgres:voxera_dev_password@localhost:5432/voxera_ucaas?schema=public');
const pool = new pg.Pool({
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  database: url.pathname.slice(1).split('?')[0],
  user: url.username,
  password: url.password,
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const calls = await prisma.callHistory.findMany({
    where: { callType: 'pstn_inbound' },
    orderBy: { timestamp: 'desc' },
    take: 5
  });

  console.log('\\n📞 Recent PSTN Calls:');
  console.log('===================');
  calls.forEach((call, i) => {
    console.log(\`\${i + 1}. \${call.contactName} - \${call.phoneNumber}\`);
    console.log(\`   Direction: \${call.direction}, Duration: \${call.duration}s\`);
    console.log(\`   Answered: \${call.answered}, Time: \${call.timestamp}\`);
    console.log(\`   Twilio SID: \${call.twilioCallSid}\`);
    console.log('');
  });

  await pool.end();
  await prisma.\$disconnect();
})();
"
```

You should see your call logged with:
- ✅ Call type: `pstn_inbound`
- ✅ Phone number: Your mobile number
- ✅ Duration: Matches the call length
- ✅ Answered: `true`
- ✅ Twilio Call SID: Starts with `CA`

---

### TEST 7: Test Call Rejection

Test that rejecting calls works properly.

#### 7.1 Make Another Call

1. From your mobile phone, **call your Twilio number again**
2. Wait for the incoming call notification in the browser

#### 7.2 Reject the Call

1. **Click the "Reject" button** (red button)
2. **Expected behavior**:
   - Browser: Call UI disappears
   - Mobile: Call ends, you hear hangup tone
   - Browser console: `[Twilio Device] Rejected call`

#### 7.3 Verify in Call History

1. Check call history in browser
2. The rejected call should show:
   - ✅ Answered: No (or red X indicator)
   - ✅ Duration: 0 or undefined
   - ✅ Still logged with timestamp and caller info

---

### TEST 8: Test User Busy Scenario

Test what happens when the user is already in a call.

#### 8.1 Start an Internal Call

1. If you have another user with an extension, start a call between extensions
2. OR: Just mark yourself as busy in the system (you may need to hack this for testing)

#### 8.2 Call from Mobile

1. From your mobile phone, **call your Twilio number**
2. **Expected behavior**:
   - You hear a busy message: "The person you are calling is currently unavailable"
   - Call disconnects automatically
   - No incoming call notification in browser

✅ **Success**: Busy users don't receive PSTN calls

## 🧪 Expected Results

### ✅ Successful Call Flow

```
1. External caller dials Twilio number
   ↓
2. Twilio sends webhook to /api/v1/twilio/voice/incoming
   ↓
3. Backend evaluates routing rules
   ↓
4. Backend checks user availability (online + not busy)
   ↓
5. Backend returns TwiML with <Dial><Client>
   ↓
6. Backend emits Socket.io event to notify user
   ↓
7. User sees incoming call in browser
   ↓
8. User clicks Answer
   ↓
9. Twilio Device SDK connects the call
   ↓
10. Audio flows: PSTN ↔ Twilio ↔ WebRTC ↔ Browser
    ↓
11. Call ends, history logged
```

## 🔧 Troubleshooting

### Problem: Can't find phone numbers with Voice capability

**Symptoms**: When searching for phone numbers, no results appear, or numbers only show SMS capability

**Cause**: **Your country doesn't support voice calling via Twilio**

**Common countries WITHOUT voice support**:
- ❌ Sweden (SMS only)
- ❌ Many other countries

**Solutions**:
1. **Check voice coverage**: https://www.twilio.com/en-us/voice/coverage
   - Search for your country
   - Look for "Voice" in the capabilities column (not just SMS)

2. **✅ RECOMMENDED: Use a US or Canadian number**:
   - ✅ **United States** - No regulatory requirements, instant setup (~$1/month)
   - ✅ **Canada** - Similar to US, minimal requirements
   - Works from anywhere in the world (including Sweden)
   - Production-ready (no compliance needed later)
   - Covered by trial credit

3. **Alternative countries** (⚠️ complex for production):
   - 🇬🇧 United Kingdom - Works for testing, requires address verification for production
   - 🇩🇪 Germany - Works for testing, requires business docs/ID/address for production (weeks)
   - 🇫🇷 France, Netherlands, Australia - Similar regulatory requirements

4. **For Sweden specifically**:
   - You can call from Sweden to any Twilio number (US, Germany, etc.)
   - Your mobile carrier may charge international rates
   - The backend/webhooks work the same regardless of number location

5. **Any number type works**: Mobile, Local/Geographic, Toll-free, National
   - Local/Geographic is usually the cheapest
   - For simplicity: Just get a US Local number

6. **For production**: See "Production Considerations" section below

**Important**: Even if you're located in Sweden, you can buy a US number and test it from Sweden. The number location doesn't restrict where you can use it or deploy your backend.

---

### Problem: Port forwarding not working

**Symptoms**: Twilio webhooks fail with connection errors, backend doesn't receive requests

**VS Code Port Forwarding Solutions**:
1. Verify port 5000 is forwarded in Ports panel (bottom of VS Code)
2. Check port visibility is set to "Public" (not "Private")
3. Try removing and re-adding the port forward
4. Verify VS Code has internet connection
5. Check firewall isn't blocking VS Code

**ngrok Solutions**:
1. Verify ngrok is installed: `ngrok version`
2. Check authentication: `ngrok config check`
3. Try restarting: Kill ngrok and start again
4. Check for free tier limitations (URL expiry)
5. Check port 5000 is not in use: `lsof -i :5000`

---

### Problem: Backend won't start

**Symptoms**: `Error: connect ECONNREFUSED` or database errors

**Solutions**:
1. **Check PostgreSQL is running**:
   ```bash
   psql -h localhost -U postgres -d voxera_ucaas
   ```
2. **Verify .env file** has correct DATABASE_URL
3. **Check port 5000** is not in use: `lsof -i :5000`
4. **Rebuild dependencies**:
   ```bash
   cd apps/backend
   rm -rf node_modules
   pnpm install
   ```

---

### Problem: Twilio Device not registering

**Symptoms**: No "Registered successfully" log in browser console

**Solutions**:
1. **Check backend logs** for token generation errors
2. **Verify .env credentials**:
   - TWILIO_ACCOUNT_SID starts with `AC`
   - TWILIO_API_KEY starts with `SK`
   - TWILIO_API_SECRET is not empty
   - TWILIO_TWIML_APP_SID starts with `AP`
3. **Check browser console** for specific errors
4. **Try refreshing** the page (token may have expired)
5. **Verify user has extension** - users without extensions can't register

---

### Problem: No incoming call notification

**Symptoms**: Call doesn't appear in browser, but backend receives webhook

**Solutions**:
1. **Check Socket.io connection** in browser console:
   ```javascript
   // Look for "socket connected" message
   ```
2. **Verify user is logged in** with correct credentials
3. **Check ChatStorage** - user must be marked as "online"
4. **Verify phone number** in database matches Twilio number
5. **Check routing rules** - ensure there's a rule for the phone number:
   ```bash
   pnpm exec tsx -e "
   import { PrismaClient } from '@prisma/client';
   import { PrismaPg } from '@prisma/adapter-pg';
   import pg from 'pg';
   import { config } from 'dotenv';

   config();

   const url = new URL(process.env.DATABASE_URL || 'postgresql://postgres:voxera_dev_password@localhost:5432/voxera_ucaas?schema=public');
   const pool = new pg.Pool({
     host: url.hostname,
     port: parseInt(url.port || '5432'),
     database: url.pathname.slice(1).split('?')[0],
     user: url.username,
     password: url.password,
   });

   const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

   (async () => {
     const rules = await prisma.pBXRoutingRule.findMany();
     console.log('Routing Rules:', rules.length);
     rules.forEach(r => console.log('  -', r.name, '(enabled:', r.enabled + ')'));
     await pool.end();
     await prisma.\$disconnect();
   })();
   "
   ```

---

### Problem: Call connects but no audio

**Symptoms**: Call shows "Connected" but can't hear anything

**Solutions**:
1. **Check microphone permission** in browser:
   - Click padlock icon in address bar
   - Verify "Microphone" is allowed
2. **Check computer volume**:
   - Unmute speakers/headphones
   - Check system volume is up
3. **Test with different browser** (Chrome recommended)
4. **Check WebRTC connection** in browser console:
   ```javascript
   // Look for ICE connection errors
   // Should see "Remote stream received"
   ```
5. **Firewall issues**:
   - WebRTC needs UDP ports open
   - Try disabling firewall temporarily to test
   - Check corporate network restrictions
6. **Try wired connection** instead of WiFi

---

### Problem: Backend returns "User busy"

**Symptoms**: Mobile hears busy message, no call notification in browser

**Solutions**:
1. **Check if user is in another call**:
   - End any active calls
   - Refresh browser to reset state
2. **Verify CallStorage** is not marking user as busy incorrectly
3. **Check backend logs** for:
   ```
   [CallStorage] User not in call, proceeding
   ```
   If you see "User is in call", investigate why

---

### Problem: Webhook returns 500 error

**Symptoms**: Twilio Debugger shows 500 error for incoming call webhook

**Solutions**:
1. **Check backend logs** for stack trace
2. **Common causes**:
   - Database connection failed
   - Phone number not found in database
   - Missing routing rules
   - Invalid JSON in conditions field
3. **Verify webhook URL** in Twilio console matches your forwarded URL exactly
4. **Test webhook manually** with curl:
   ```bash
   curl -X POST https://YOUR_WEBHOOK_URL/api/v1/twilio/voice/incoming \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "CallSid=CAtest123" \
     -d "From=+15551234567" \
     -d "To=+15551234567" \
     -d "CallStatus=ringing"
   ```

---

### Problem: Twilio Debugger shows errors

**Symptoms**: Calls fail with errors in Twilio debugger

**Solutions**:
1. Go to https://console.twilio.com/us1/monitor/logs/debugger
2. **Look for recent errors**:
   - Error 11200: HTTP retrieval failure (port forwarding down or wrong URL)
   - Error 11205: HTTP connection failure (backend not running)
   - Error 11215: TwiML invalid (check backend response)
3. **Click on error** to see details and request/response

---

### Problem: Trial account limitations

**Symptoms**: Caller ID shows "Unknown" or can't call from unverified number

**Solutions**:
1. **Verify your phone number** at:
   https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. **Upgrade account** to remove limitations (requires credit card)
3. **Expect trial message** at start of outbound calls (normal)

---

### Debugging Tools

#### 1. Port Forwarding Inspector

**VS Code Ports Panel**:
- Bottom of VS Code window
- Shows all forwarded ports
- Check port visibility (Public vs Private)
- View forwarded URLs

**ngrok Web Interface** (if using ngrok):
Visit `http://localhost:4040` to inspect:
- All HTTP requests to your backend
- Request/response payloads
- Status codes and timing

#### 2. Twilio Debugger
Visit https://console.twilio.com/us1/monitor/logs/debugger
- Real-time call logs
- Error messages
- TwiML responses

#### 3. Browser DevTools
- **Console**: Check for JavaScript errors
- **Network**: Verify API calls to backend
- **Application → Storage**: Check if user is logged in

#### 4. Backend Logs
Watch backend terminal for:
- Incoming webhooks
- Routing decisions
- Database queries
- Error messages

#### 5. Prisma Studio
```bash
pnpm prisma studio
```
Browse database tables to verify:
- Phone numbers configured correctly
- Routing rules exist
- Users have extensions
- Call history is being saved

## 📞 Additional Testing Scenarios

### Scenario 1: User Offline
1. Logout from ucaas-client
2. Call Twilio number
3. Expected: Busy message plays and call hangs up

### Scenario 2: User Busy
1. Login and join an internal call (extension-to-extension)
2. Call Twilio number from external phone
3. Expected: Busy message plays and call hangs up

### Scenario 3: Multiple Routing Rules
1. Create additional routing rule with higher priority
2. Test time-based routing (e.g., business hours vs after hours)
3. Test caller ID patterns (e.g., specific numbers go to specific users)

### Scenario 4: Call Rejection
1. Receive incoming call
2. Click **Reject** button
3. Expected: Call terminates, caller hears hangup, history shows "not answered"

## 🔍 Debugging Tools

### Backend Logs
```bash
cd apps/backend
pnpm dev
# Watch for:
# - Incoming webhook requests
# - Routing evaluation
# - TwiML generation
# - Socket.io events
```

### Browser Console
```javascript
// Check Twilio Device state
window.location.reload()
// Look for registration logs

// Check Socket.io connection
// Look for "socket connected" messages
```

### Prisma Studio
```bash
cd apps/backend
pnpm prisma studio
# Browse:
# - PhoneNumber table
# - PBXRoutingRule table
# - CallHistory table
# - User table
```

### Port Forwarding Inspection

**VS Code**:
- Check Ports panel for forwarding status
- Verify port visibility is "Public"

**ngrok** (if using):
Visit `http://localhost:4040` to inspect:
- Incoming webhook requests
- Request/response payloads
- Status codes

## 🏭 Production Considerations

### Is a Real Phone Number Required for Production?

**Short answer**: It depends on your product design.

### Option 1: App-Only Calling (No Direct Phone Numbers) ⭐ RECOMMENDED

**How it works**:
- Users call **each other within your app only**
- No direct phone numbers are exposed to users
- Twilio provides the voice infrastructure
- Your app handles call routing

**Benefits**:
- ✅ **No regulatory compliance** needed
- ✅ **No phone number costs**
- ✅ Simpler implementation
- ✅ Works globally without restrictions
- ✅ Examples: Zoom, Slack, Discord, WhatsApp calls

**This is what your current implementation already supports!** (Extension-to-extension calling)

### Option 2: US/Canada Numbers for Global Deployment ⭐ SIMPLE

**How it works**:
- Give each user a US or Canadian phone number
- External callers dial these numbers
- Twilio routes to your app

**Benefits**:
- ✅ **No regulatory compliance** (instant setup)
- ✅ Production-ready immediately
- ✅ Common for global B2B SaaS
- ✅ Low cost (~$1/number/month)

**Drawbacks**:
- ⚠️ International calling rates for non-US/CA callers
- ⚠️ Not "local" numbers for international users

**Use case**: B2B SaaS products, virtual phone systems, call centers

### Option 3: Local Numbers in Multiple Countries ⚠️ COMPLEX

**How it works**:
- Provide local phone numbers in each country where you have users
- Germany users get German numbers, UK users get UK numbers, etc.

**Benefits**:
- ✅ Local phone numbers (better for end users)
- ✅ No international calling rates

**Drawbacks**:
- ❌ **Regulatory compliance per country**
- ❌ Weeks of approval time
- ❌ Legal/compliance costs
- ❌ Ongoing compliance maintenance

**Regulatory requirements examples**:
- 🇩🇪 Germany: Business registration, ID verification, German address proof
- 🇬🇧 UK: Address verification, business validation
- 🇫🇷 France: Similar to Germany
- 🇺🇸 US: None ✅
- 🇨🇦 Canada: Minimal ✅

**Use case**: Enterprise products where local numbers are legally required or critical for business

### Recommendation

**For development/testing**:
- Use a US number (~$1/month, no compliance)

**For production**:
1. **Start with app-only calling** (no direct numbers) - Simplest, no compliance
2. **Or start with US/Canada numbers** - If users need dialable numbers
3. **Add local numbers later** - Only if business requires it

Most successful SaaS companies start with Option 1 or 2, and only add local numbers when customers specifically request them.

---

## 🎯 Success Criteria

✅ External caller dials Twilio number
✅ Backend evaluates routing rules correctly
✅ User sees incoming call notification in browser
✅ User can answer/reject call
✅ Bidirectional audio works
✅ Call logged to CallHistory with correct metadata
✅ User can end call
✅ Mute/unmute works
✅ Busy users don't receive calls
✅ Offline users get busy message
✅ Call history shows correct information

## 🚨 Important Notes

1. **Twilio Costs**: Each call incurs Twilio charges (voice minutes + phone number rental)
2. **Token Expiry**: Twilio access tokens expire after 1 hour - user must refresh/re-login
3. **Development Mode**: This setup uses ngrok for webhooks - not suitable for production
4. **WebRTC Firewall**: Some corporate firewalls block WebRTC - test on open network first
5. **Dual Call Paths**: Internal calls still use WebRTC peer-to-peer (no Twilio cost)

## 🚀 Future Features

See `PSTN_ROADMAP.md` for a comprehensive roadmap of planned features.

### High Priority (Next Sprint)

1. **Outbound PSTN Calls** (Extension → External Phone)
   - Click-to-call from contact list
   - Dial pad in softphone UI
   - Twilio `<Dial>` with number parameter
   - Call history for outbound calls

2. **Token Refresh Mechanism**
   - Auto-refresh Twilio tokens before 1-hour expiry
   - Background token renewal
   - Graceful fallback if refresh fails

3. **Call Recording**
   - Enable Twilio call recording
   - Store recordings in S3
   - Playback in call history
   - Download recording files

### Medium Priority (Next Month)

4. **Voicemail System**
   - After-hours routing to voicemail
   - Record voicemail messages
   - Visual voicemail inbox
   - Voicemail-to-email notifications

5. **Call Queues**
   - Queue incoming calls when all agents busy
   - Hold music
   - Estimated wait time
   - Queue position announcements

6. **Advanced Routing Rules**
   - Multiple rules per number with priorities
   - Failover to backup extensions
   - Round-robin distribution
   - Skills-based routing

7. **SMS Integration**
   - Send/receive SMS via Twilio
   - SMS inbox in ucaas-client
   - SMS-to-email forwarding
   - Group messaging

### Low Priority (Future)

8. **Conference Calls**
   - Multi-party calls
   - Host controls (mute participants, remove, etc.)
   - Dial-in numbers
   - Conference recording

9. **Call Analytics Dashboard**
   - Call volume metrics
   - Average call duration
   - Answer rate
   - Busy/missed call statistics
   - Cost tracking

10. **Mobile Apps**
    - iOS/Android native apps
    - Push notifications for incoming calls
    - Background call support
    - Contact sync

11. **Call Transfer**
    - Warm transfer (announce before connecting)
    - Blind transfer (direct forward)
    - Transfer to external numbers
    - Transfer to voicemail

12. **IVR (Interactive Voice Response)**
    - Visual IVR flow builder
    - Multi-level menus
    - Text-to-speech announcements
    - DTMF input handling

13. **Call Screening**
    - Caller ID lookup
    - Spam detection
    - Block/allow lists
    - Custom greetings per caller

14. **Advanced Features**
    - Call whisper (supervisor listens)
    - Call barging (supervisor joins)
    - Call monitoring dashboard
    - Real-time call quality metrics

### Technical Improvements

- **Production Deployment**:
  - Deploy backend to AWS/GCP/Azure
  - Use production-grade webhook URLs (no VS Code/ngrok)
  - Environment-specific configurations
  - Load balancing for high volume

- **Monitoring & Observability**:
  - Error tracking (Sentry/Rollbar)
  - APM monitoring (New Relic/Datadog)
  - Twilio usage dashboards
  - Call quality metrics
  - Alert on failed calls

- **Security Enhancements**:
  - Webhook signature verification
  - Rate limiting on endpoints
  - IP whitelisting
  - Audit logs for all calls

- **Performance Optimization**:
  - Redis for call state (instead of in-memory)
  - Database connection pooling
  - CDN for static assets
  - Lazy loading for frontend

See `PSTN_ROADMAP.md` for detailed implementation plans for each feature.

---

## 📊 Success Criteria

### Core Functionality ✅

- ✅ External caller dials Twilio number
- ✅ Backend evaluates routing rules correctly
- ✅ User sees incoming call notification in browser
- ✅ User can answer/reject call
- ✅ Bidirectional audio works clearly
- ✅ Call logged to CallHistory with correct metadata
- ✅ User can end call
- ✅ Mute/unmute works correctly
- ✅ Busy users don't receive calls (hear busy message)
- ✅ Offline users don't receive calls (hear busy message)
- ✅ Call history shows correct information
- ✅ Dual call paths work (internal WebRTC + PSTN Twilio)

### Quality Metrics

- **Call Connection Time**: < 3 seconds from dial to ring
- **Audio Latency**: < 150ms one-way
- **Call Success Rate**: > 95% (excluding user rejections)
- **Token Generation**: < 500ms
- **Routing Evaluation**: < 100ms

### Reliability Targets

- **Uptime**: 99.9% backend availability
- **Webhook Success**: > 99% successful webhook deliveries
- **Database Queries**: < 50ms average
- **WebRTC Connection**: > 95% successful ICE negotiation

## 🆘 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review backend logs for error messages
3. Check Twilio debugger: https://console.twilio.com/us1/monitor/logs/debugger
4. Verify all environment variables are set correctly
5. Ensure test data exists in database

---

**Implementation Date**: 2026-01-07
**Version**: 1.0.0
**Status**: ✅ Ready for Testing
