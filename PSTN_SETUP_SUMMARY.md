# Twilio PSTN Integration - Quick Start Summary

## 📄 Documentation Overview

This is a quick reference guide to all PSTN integration documentation.

### Main Documents

1. **TESTING_PSTN.md** - Complete setup and testing guide
   - Prerequisites and requirements
   - Step-by-step manual setup (8 steps)
   - Comprehensive testing procedures (8 test scenarios)
   - Troubleshooting guide with solutions
   - Success criteria and quality metrics

2. **PSTN_ROADMAP.md** - Future features and implementation plans
   - Phased development roadmap
   - Detailed implementation plans for each feature
   - Effort estimates and complexity ratings
   - Cost considerations
   - Timeline projections

3. **This File** - Quick reference summary

---

## 🚀 Quick Start (30-Minute Setup)

### Prerequisites Checklist
- [ ] Twilio account created (get $15 free credit)
- [ ] ⚠️ **Must buy real phone number** - No test numbers available for PSTN
- [ ] ⚠️ **Recommended: US/Canada number** - No regulatory requirements (Sweden doesn't support voice)
- [ ] Port forwarding tool (VS Code built-in OR ngrok)
- [ ] PostgreSQL running
- [ ] Mobile phone for testing

### Setup Steps (Abbreviated)

1. **Expose port 5000** → Use VS Code "Forward a Port" (recommended) OR `ngrok http 5000`
2. **Twilio Console** → Create TwiML App with your webhook URLs
3. **Twilio Console** → Create API Key (save secret!)
4. **Twilio Console** → Purchase phone number, assign to TwiML App
5. **Backend** → Update `.env` with 5 Twilio credentials
6. **Database** → Update phone number to match Twilio number
7. **Test** → Start all services (port forwarding, backend, frontend)
8. **Call** → Dial your Twilio number from mobile phone

**Detailed instructions**: See `TESTING_PSTN.md`

---

## 📋 Manual Steps Required

### One-Time Setup (Before First Test)

#### Step 1: Twilio Account Setup (~10 min)
- Sign up at https://www.twilio.com/try-twilio
- Verify your mobile phone number (trial accounts)
- Get $15 free credit

#### Step 2: Twilio Configuration (~15 min)
- Create TwiML App with webhook URLs
- Create API Key and Secret (save the secret immediately!)
- **Purchase a real phone number** (~$1/month, covered by trial credit)
  - ⚠️ **No test numbers available** - Must buy real number for PSTN calling
  - ✅ **Strongly recommended: 🇺🇸 US number**
    - No regulatory requirements (instant setup)
    - Production-ready (no compliance later)
    - Cheapest option (~$1/month)
  - Alternative: 🇨🇦 Canada (similar to US)
  - ⚠️ Avoid: Germany/UK (complex production compliance)
  - Check voice coverage: https://www.twilio.com/en-us/voice/coverage
- Configure number to use TwiML App

#### Step 3: Local Environment (~5 min)
- Install port forwarding tool (VS Code built-in or ngrok)
- Update `.env` with Twilio credentials
- Update database phone number

### Every Testing Session

1. **Expose port 5000**:
   - **VS Code**: Forward port 5000, make it public
   - **OR ngrok**: Run `ngrok http 5000` in terminal
2. **Start backend** (Terminal): `cd apps/backend && pnpm dev`
3. **Start frontend** (Terminal): `cd apps/ucaas-client && pnpm dev`
4. **Open browser**: `http://localhost:3002`
5. **Login** as test user: `jane@acme.com`
6. **Verify** console shows "Twilio Device Registered successfully"

**If webhook URL changed**: Update Twilio TwiML App webhook URLs in console

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Incoming call appears in browser with ringtone
- [ ] Answer button connects the call
- [ ] Bidirectional audio works clearly
- [ ] Mute/unmute controls work
- [ ] End call button disconnects properly
- [ ] Call appears in call history
- [ ] Database logs call with correct metadata

### Edge Cases
- [ ] Reject call works (call ends, logged as missed)
- [ ] User busy scenario (busy message plays, no notification)
- [ ] User offline scenario (busy message plays)
- [ ] Multiple rapid calls handled correctly
- [ ] Token refresh (test after 55+ minutes)

### Quality Checks
- [ ] Call connects within 3 seconds
- [ ] No audio delays or echoes
- [ ] Clear audio quality
- [ ] No dropped calls
- [ ] Correct caller ID displayed

---

## 🔧 Common Issues & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Can't find voice numbers for my country | ⚠️ Your country may not support voice (Sweden doesn't) - use Germany/US/UK/CA number instead |
| No incoming call in browser | Check Socket.io connection in console |
| Twilio Device not registering | Verify .env credentials start with AC/SK/AP |
| Backend webhook 500 error | Check backend logs, verify phone number in DB |
| No audio during call | Check browser microphone permission |
| Webhook URL changed/expired | Update Twilio TwiML App with new forwarded URL |

**Full troubleshooting**: See `TESTING_PSTN.md` § Troubleshooting

---

## 🏭 Production Considerations

### Should You Buy Numbers for Production?

**It depends on your use case:**

#### ✅ Option 1: App-Only Calling (Recommended for SaaS)
- Users call **within your app only** (no direct phone numbers)
- Use Twilio Voice SDK for infrastructure
- **No regulatory requirements**
- **No phone numbers needed**
- Examples: Zoom, Slack calls, WhatsApp

#### ✅ Option 2: US/Canada Numbers (Easiest for Global SaaS)
- Give users US/Canada phone numbers
- **No regulatory compliance** needed
- Works worldwide
- Users pay international rates if calling from outside US/CA
- Common for global B2B SaaS products

#### ⚠️ Option 3: Local Numbers in Multiple Countries
- Requires regulatory compliance **per country**
- Germany: Business docs, ID, address proof (weeks of approval)
- UK: Address verification
- Complex and time-consuming
- Only if legally required or critical for business

### Regulatory Complexity by Country

| Country | Production Approval Time | Requirements |
|---------|-------------------------|--------------|
| 🇺🇸 US | ✅ Instant | None |
| 🇨🇦 Canada | ✅ 1-2 days | Minimal |
| 🇬🇧 UK | ⚠️ 3-7 days | Address verification |
| 🇩🇪 Germany | ❌ 1-4 weeks | Business registration, ID, address |
| 🇫🇷 France | ❌ 1-4 weeks | Similar to Germany |

**Recommendation**: Start with US numbers or app-only calling. Add local numbers only when absolutely necessary.

---

## 📊 What's Implemented

### ✅ Complete Features

#### Backend
- ✅ TwilioService for token and TwiML generation
- ✅ RoutingService for PBX routing logic
- ✅ TwilioController with webhook endpoints
- ✅ CallStorage extended for PSTN calls
- ✅ Database schema with PhoneNumber and PBXRoutingRule tables

#### Frontend
- ✅ TwilioDeviceService wrapper for Voice SDK
- ✅ SoftphoneContext with dual call path logic
- ✅ Incoming call UI with ringtone
- ✅ Call controls (answer, reject, mute, end)
- ✅ Call history with PSTN call logging

#### Infrastructure
- ✅ Webhook endpoints for Twilio
- ✅ Socket.io real-time notifications
- ✅ Database persistence
- ✅ Type-safe implementation (TypeScript)
- ✅ Zero build errors

### 🔄 Call Flow

```
External Phone → Twilio Number → Webhook
    ↓
Backend Routing → Check User Availability
    ↓
TwiML <Dial><Client> → Socket.io Notification
    ↓
Browser Twilio Device → Ring → Answer
    ↓
Twilio Media Bridge → WebRTC Connection
    ↓
Bidirectional Audio (PSTN ↔ Browser)
    ↓
End Call → Status Callback → Save to Database
```

---

## 🚧 Not Yet Implemented

See `PSTN_ROADMAP.md` for details.

### High Priority (Next)
- ⏳ Outbound calls (Extension → Phone)
- ⏳ Token auto-refresh (before 1hr expiry)
- ⏳ Call recording with S3 storage

### Medium Priority
- ⏳ Voicemail system
- ⏳ Call queues
- ⏳ Advanced routing rules
- ⏳ SMS integration

### Low Priority
- ⏳ Conference calls
- ⏳ Call transfer
- ⏳ IVR flow builder
- ⏳ Mobile apps
- ⏳ Analytics dashboard

---

## 💰 Cost Estimate

### Twilio Costs (varies by country)

**US Numbers**:
- Phone number: **$1/month**
- Incoming calls: **$0.0085/minute**
- Outgoing calls: **$0.013/minute** (future)

**German Numbers**:
- Phone number (local): **$1-2/month**
- Incoming calls: **$0.01-0.02/minute**
- Outgoing calls: **$0.01-0.03/minute** (future)

**Recording** (all countries): **$0.0025/minute** (future)

⚠️ **Caller Rates Note**:
- **Calling from Sweden to German number**: Usually NO international rates (EU roaming)
- **Calling from Sweden to US number**: Caller pays international rates from their mobile carrier
- Twilio costs above are separate and charged to your Twilio account

### Example Monthly Cost
- 100 users
- 500 minutes of calls/user/month
- Average call: 5 minutes

**Calculation**:
- Phone numbers: 100 × $1 = $100
- Inbound minutes: 25,000 × $0.0085 = $212.50
- Outbound minutes: 25,000 × $0.013 = $325 (future)

**Total**: ~$312/month (inbound only), ~$637/month (with outbound)

**Per user per month**: ~$3-6 depending on usage

---

## 📈 Success Criteria

### Must Have (MVP)
- ✅ Receive incoming PSTN calls
- ✅ Bidirectional audio quality
- ✅ Call logging and history
- ✅ PBX-style routing
- ✅ User availability checking
- ✅ Dual call paths (internal WebRTC + PSTN Twilio)

### Nice to Have (Future)
- ⏳ Outbound calling
- ⏳ Call recording
- ⏳ Voicemail
- ⏳ Call queues
- ⏳ Mobile apps

### Quality Metrics
- **Call Success Rate**: Target > 95%
- **Call Setup Time**: Target < 3 seconds
- **Audio Quality**: MOS score > 4.0
- **Uptime**: Target > 99.9%

---

## 🔗 Useful Links

### Documentation
- **Setup Guide**: `TESTING_PSTN.md`
- **Roadmap**: `PSTN_ROADMAP.md`
- **Architecture**: See implementation plan in `TESTING_PSTN.md`

### Twilio Resources
- **Console**: https://console.twilio.com
- **Debugger**: https://console.twilio.com/us1/monitor/logs/debugger
- **Docs**: https://www.twilio.com/docs/voice
- **Voice SDK**: https://www.twilio.com/docs/voice/sdks/javascript

### Tools
- **VS Code Ports Panel**: View/manage forwarded ports (bottom panel)
- **ngrok Dashboard** (if using ngrok): `http://localhost:4040`
- **Prisma Studio**: Run `pnpm prisma studio`
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3002`

---

## 📞 Support & Resources

### Internal Documentation
1. Read `TESTING_PSTN.md` for comprehensive guide
2. Check `PSTN_ROADMAP.md` for feature plans
3. Review code comments in key files:
   - `apps/backend/src/services/twilioService.ts`
   - `apps/backend/src/controllers/TwilioController.ts`
   - `apps/ucaas-client/src/services/twilioDeviceService.ts`
   - `apps/ucaas-client/src/contexts/SoftphoneContext.tsx`

### Debugging Steps
1. Check backend terminal logs
2. Check browser console logs
3. Check Twilio Debugger for webhook errors
4. Check forwarding status:
   - VS Code: Ports panel (bottom of window)
   - ngrok: Web interface at `localhost:4040`
5. Verify database state with Prisma Studio

### Getting Help
- Review troubleshooting section in `TESTING_PSTN.md`
- Check Twilio docs for SDK issues
- Test with curl to isolate frontend/backend issues

---

## 🎯 Next Actions

### For Development
1. ✅ **Complete**: Inbound PSTN calls
2. ⏳ **Next**: Implement outbound calls (see `PSTN_ROADMAP.md`)
3. ⏳ **Then**: Add token auto-refresh
4. ⏳ **Future**: Call recording and voicemail

### For Testing
1. Follow `TESTING_PSTN.md` setup steps
2. Complete all 8 test scenarios
3. Verify success criteria are met
4. Report any issues found

### For Production
1. Deploy backend to cloud (AWS/GCP/Azure)
2. Use production webhook URLs (not ngrok)
3. Set up monitoring (Sentry, New Relic, etc.)
4. Configure production Twilio credentials
5. Test with real users
6. Monitor costs and usage

---

**Version**: 1.0.0
**Last Updated**: 2026-01-07
**Status**: ✅ Ready for Testing
