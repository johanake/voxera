# PSTN Integration - Feature Roadmap

## 📋 Overview

This document outlines the future development roadmap for the UCaaS PSTN integration. Features are prioritized based on business value, technical complexity, and user demand.

**Current Status**: ✅ Inbound PSTN calls fully implemented

**Last Updated**: 2026-01-07

---

## 🎯 Prioritization Framework

Features are prioritized using these criteria:
- **Business Value**: Impact on users and revenue
- **Technical Complexity**: Implementation difficulty (1-5, 5 = most complex)
- **Dependencies**: What else must be built first
- **Estimated Effort**: Developer days

---

## 🚀 Phase 1: Core Call Features (Q1 2026)

### Feature 1.1: Outbound PSTN Calls

**Priority**: 🔴 Critical
**Effort**: 5 days
**Complexity**: 2/5
**Dependencies**: None

**Description**: Allow users to dial external phone numbers from their softphone.

**User Story**:
> As a user, I want to call external phone numbers from my softphone so that I don't need to use my mobile phone for business calls.

**Implementation Plan**:

#### Backend Changes

1. **Create Outbound TwiML Endpoint** (`POST /api/v1/twilio/voice/outbound`)
   ```typescript
   // apps/backend/src/controllers/TwilioController.ts
   handleOutboundCall = asyncHandler(async (req, res) => {
     const { userId, toNumber } = req.body

     // Validate user has permission
     // Generate TwiML to dial the number
     const twiml = twilioService.generateDialNumberTwiML(toNumber)

     // Create call session
     // Return TwiML
   })
   ```

2. **Update TwilioService** with dial number TwiML
   ```typescript
   generateDialNumberTwiML(phoneNumber: string): string {
     return `
       <Response>
         <Dial callerId="${this.config.outboundCallerId}">
           <Number>${phoneNumber}</Number>
         </Dial>
       </Response>
     `
   }
   ```

3. **Add permission checks**
   - Verify user has outbound calling enabled
   - Check user's calling plan limits
   - Validate phone number format

#### Frontend Changes

1. **Add Dial Pad Component**
   ```typescript
   // apps/ucaas-client/src/components/softphone/DialPad.tsx
   export const DialPad = () => {
     const [number, setNumber] = useState('')
     const { initiateOutboundCall } = useSoftphone()

     // Render number pad (0-9, *, #, backspace, call button)
     // Call initiateOutboundCall(number) on submit
   }
   ```

2. **Extend SoftphoneContext**
   ```typescript
   const initiateOutboundCall = async (phoneNumber: string) => {
     if (currentCall.callType === 'pstn_outbound') {
       // Use Twilio Device SDK to connect
       const params = {
         To: phoneNumber,
         userId: currentUser.id,
       }
       const call = await twilioDeviceRef.current.connect(params)
       // Set up call object and state
     }
   }
   ```

3. **UI Updates**
   - Add dial pad button to softphone UI
   - Show recent call history for click-to-dial
   - Display outbound call in progress with disconnect option

#### Database Changes

- Update `CallHistory` to track outbound calls correctly
- Add `outboundCallerId` to `User` model (optional)

**Testing**:
- User can open dial pad
- User can enter phone number
- Call connects to external number
- Audio works bidirectionally
- Call is logged with `pstn_outbound` type

**Acceptance Criteria**:
- ✅ User can dial any valid phone number
- ✅ Call connects within 5 seconds
- ✅ Call history shows outbound calls
- ✅ User can end outbound call
- ✅ Costs are tracked correctly

---

### Feature 1.2: Token Auto-Refresh

**Priority**: 🟠 High
**Effort**: 2 days
**Complexity**: 2/5
**Dependencies**: None

**Description**: Automatically refresh Twilio access tokens before they expire (1 hour).

**User Story**:
> As a user, I want my softphone to stay registered all day without having to refresh the page.

**Implementation Plan**:

1. **Backend**: Add token refresh endpoint
   ```typescript
   // POST /api/v1/twilio/token/refresh
   refreshToken = asyncHandler(async (req, res) => {
     const { userId, extension } = req.body
     const newToken = twilioService.generateAccessToken(userId, extension)
     res.json({ token: newToken })
   })
   ```

2. **Frontend**: Auto-refresh 5 minutes before expiry
   ```typescript
   useEffect(() => {
     const REFRESH_INTERVAL = 55 * 60 * 1000 // 55 minutes

     const refreshToken = async () => {
       const response = await fetch('/api/v1/twilio/token/refresh', {
         method: 'POST',
         body: JSON.stringify({ userId, extension }),
       })
       const { token } = await response.json()

       // Update Twilio Device with new token
       twilioDeviceRef.current.updateToken(token)
     }

     const interval = setInterval(refreshToken, REFRESH_INTERVAL)
     return () => clearInterval(interval)
   }, [userId, extension])
   ```

3. **Listen for `tokenWillExpire` event**
   ```typescript
   device.on('tokenWillExpire', async () => {
     await refreshToken()
   })
   ```

**Testing**:
- Token refreshes automatically after 55 minutes
- User stays registered without interruption
- Calls can still be made after token refresh
- No errors if page is open for 24+ hours

---

### Feature 1.3: Call Recording

**Priority**: 🟠 High
**Effort**: 4 days
**Complexity**: 3/5
**Dependencies**: AWS S3 setup

**Description**: Record calls and store recordings in S3 for playback later.

**Implementation Plan**:

1. **Backend**: Enable recording in TwiML
   ```typescript
   generateDialClientTwiML(userId: string, extension: string, callId: string): string {
     return `
       <Response>
         <Dial record="record-from-ringing-dual" recordingStatusCallback="${this.getRecordingCallbackUrl()}">
           <Client>${extension}</Client>
         </Dial>
       </Response>
     `
   }
   ```

2. **Create Recording Callback Endpoint**
   ```typescript
   // POST /api/v1/twilio/recordings/callback
   handleRecordingCallback = asyncHandler(async (req, res) => {
     const { RecordingUrl, RecordingSid, CallSid } = req.body

     // Download recording from Twilio
     const recordingData = await twilioService.downloadRecording(RecordingSid)

     // Upload to S3
     const s3Url = await s3Service.uploadRecording(recordingData, CallSid)

     // Update CallHistory with S3 URL
     await prisma.callHistory.update({
       where: { twilioCallSid: CallSid },
       data: { recordingUrl: s3Url }
     })
   })
   ```

3. **Frontend**: Add playback in call history
   ```typescript
   {call.recordingUrl && (
     <audio controls src={call.recordingUrl}>
       Your browser does not support audio playback.
     </audio>
   )}
   ```

4. **Add Recording Settings**
   - User can enable/disable recording
   - Show recording indicator during calls
   - Add "Recording..." badge on UI

**Testing**:
- Calls are recorded when enabled
- Recordings appear in call history
- Audio playback works correctly
- S3 storage costs are acceptable

---

## 🔄 Phase 2: Advanced Features (Q2 2026)

### Feature 2.1: Voicemail System

**Priority**: 🟡 Medium
**Effort**: 8 days
**Complexity**: 4/5
**Dependencies**: Call Recording, After-hours routing

**Implementation Plan**:

1. **Database Schema**
   ```prisma
   model Voicemail {
     id           String   @id @default(cuid())
     userId       String
     fromNumber   String
     fromName     String?
     duration     Int
     recordingUrl String
     transcription String?  // Optional speech-to-text
     listened     Boolean  @default(false)
     createdAt    DateTime @default(now())

     user User @relation(fields: [userId], references: [id])
   }
   ```

2. **Routing Logic**: Forward to voicemail if user unavailable
   ```typescript
   if (!isUserAvailable) {
     const twiml = `
       <Response>
         <Say>Please leave a message after the beep.</Say>
         <Record maxLength="120" recordingStatusCallback="/api/v1/voicemail/callback" />
       </Response>
     `
   }
   ```

3. **Frontend**: Voicemail inbox
   - List all voicemails
   - Play voicemail audio
   - Mark as read/unread
   - Delete voicemail
   - Download voicemail file

4. **Notifications**
   - Email notification on new voicemail
   - Badge count on UI
   - Push notification (future)

**Features**:
- Visual voicemail inbox
- Speech-to-text transcription (Google Cloud Speech API)
- Voicemail-to-email forwarding
- Custom voicemail greetings per user

---

### Feature 2.2: Call Queues

**Priority**: 🟡 Medium
**Effort**: 10 days
**Complexity**: 5/5
**Dependencies**: Multiple agents, Agent availability tracking

**Implementation Plan**:

1. **Database Schema**
   ```prisma
   model CallQueue {
     id              String   @id @default(cuid())
     name            String
     maxWaitTime     Int      // seconds
     maxQueueSize    Int
     holdMusic       String?  // URL to hold music
     strategy        QueueStrategy  // round-robin, longest-idle, skills-based
     announcementInterval Int  // seconds between position announcements

     agents CallQueueAgent[]
   }

   model CallQueueAgent {
     queueId  String
     userId   String
     priority Int

     queue CallQueue @relation(fields: [queueId], references: [id])
     user  User      @relation(fields: [userId], references: [id])
   }
   ```

2. **Twilio Queue Implementation**
   ```typescript
   const twiml = `
     <Response>
       <Enqueue waitUrl="/api/v1/queues/${queueId}/wait">
         ${queueName}
       </Enqueue>
     </Response>
   `
   ```

3. **Wait Music/Announcements**
   ```typescript
   // POST /api/v1/queues/:id/wait
   const waitTwiml = `
     <Response>
       <Say>You are caller number ${position} in the queue.</Say>
       <Say>Estimated wait time is ${estimatedWait} minutes.</Say>
       <Play>${holdMusicUrl}</Play>
     </Response>
   `
   ```

4. **Agent Distribution**
   - Round-robin: Next available agent
   - Longest idle: Agent idle longest gets call
   - Skills-based: Match caller needs to agent skills

---

### Feature 2.3: SMS Integration

**Priority**: 🟡 Medium
**Effort**: 6 days
**Complexity**: 3/5
**Dependencies**: None

**Implementation Plan**:

1. **Receive SMS**: Webhook for incoming SMS
   ```typescript
   // POST /api/v1/twilio/sms/incoming
   handleIncomingSMS = asyncHandler(async (req, res) => {
     const { From, To, Body, MessageSid } = req.body

     // Store message in database
     await prisma.smsMessage.create({
       data: {
         sid: MessageSid,
         from: From,
         to: To,
         body: Body,
         direction: 'inbound',
       }
     })

     // Notify user via Socket.io
     io.to(userSocketId).emit('sms:incoming', { from: From, body: Body })
   })
   ```

2. **Send SMS**: API endpoint
   ```typescript
   // POST /api/v1/sms/send
   sendSMS = asyncHandler(async (req, res) => {
     const { from, to, body } = req.body

     const message = await twilio.messages.create({
       from,
       to,
       body,
     })

     // Store in database
     await prisma.smsMessage.create({
       data: { sid: message.sid, from, to, body, direction: 'outbound' }
     })
   })
   ```

3. **Frontend**: SMS Inbox
   - List conversations by contact
   - Send new messages
   - Real-time incoming messages via Socket.io
   - Search messages

---

## 🎨 Phase 3: Enhanced UX (Q3 2026)

### Feature 3.1: Conference Calls

**Effort**: 12 days
**Complexity**: 5/5

**Implementation**:
- Use Twilio `<Conference>` TwiML
- Multi-party audio mixing
- Host controls (mute participants, kick, etc.)
- Conference dial-in numbers
- Conference recording

---

### Feature 3.2: Call Transfer

**Effort**: 5 days
**Complexity**: 3/5

**Types**:
- **Warm Transfer**: Announce caller before transferring
- **Blind Transfer**: Forward immediately
- **Transfer to Voicemail**: Send to recipient's voicemail

**Implementation**:
```typescript
// Warm transfer TwiML
const twiml = `
  <Response>
    <Dial>
      <Number url="/api/v1/transfer/announce">${transferToNumber}</Number>
    </Dial>
  </Response>
`
```

---

### Feature 3.3: IVR Flow Builder

**Effort**: 15 days
**Complexity**: 5/5

**Features**:
- Drag-and-drop flow designer
- Multi-level menus
- DTMF input capture
- Text-to-speech for prompts
- Route to queues/users/voicemail
- Business hours routing

**Tech Stack**:
- React Flow for visual builder
- Backend stores IVR config as JSON
- Runtime executes IVR flow from JSON

---

### Feature 3.4: Call Analytics Dashboard

**Effort**: 8 days
**Complexity**: 3/5

**Metrics**:
- Total call volume (inbound/outbound)
- Average call duration
- Answer rate / Abandonment rate
- Busiest hours chart
- Calls by department/user
- Cost tracking and trends

**Tech Stack**:
- Recharts or Chart.js for visualizations
- Backend aggregation queries
- Real-time metrics via WebSocket

---

## 🔒 Phase 4: Enterprise Features (Q4 2026)

### Feature 4.1: Multi-Tenant Support

**Effort**: 10 days
**Complexity**: 4/5

- Tenant-specific phone numbers
- Isolated call routing
- Per-tenant billing
- Custom branding per tenant

---

### Feature 4.2: Advanced Security

**Effort**: 7 days
**Complexity**: 4/5

- Webhook signature verification
- Rate limiting (Redis-based)
- IP whitelisting
- Audit logs for compliance
- GDPR compliance (data export/deletion)

---

### Feature 4.3: Mobile Apps

**Effort**: 30 days
**Complexity**: 5/5

**iOS/Android Native Apps**:
- Push notifications for calls
- Background call handling
- CallKit integration (iOS)
- ConnectionService integration (Android)
- Contact sync
- SMS from mobile app

**Tech Stack**: React Native or Flutter

---

## 🛠️ Technical Debt & Infrastructure

### Production Deployment

**Effort**: 5 days

- Deploy to AWS/GCP/Azure
- Use production webhook URLs (not ngrok)
- Set up CI/CD pipeline
- Database migrations strategy
- Environment-specific configs

---

### Monitoring & Observability

**Effort**: 4 days

- **Error Tracking**: Sentry or Rollbar
- **APM**: New Relic or Datadog
- **Log Aggregation**: CloudWatch or Elasticsearch
- **Metrics**: Prometheus + Grafana
- **Alerts**: PagerDuty for critical failures

---

### Performance Optimization

**Effort**: 6 days

- **Redis for Call State**: Replace in-memory with Redis
- **Database Indexing**: Optimize slow queries
- **CDN**: Serve static assets via CloudFront
- **Lazy Loading**: Code-split frontend routes
- **Connection Pooling**: PgBouncer for PostgreSQL

---

## 📊 Estimated Timeline

| Phase | Features | Duration | Completion |
|-------|----------|----------|------------|
| Phase 1 | Outbound calls, Token refresh, Call recording | 3 weeks | Q1 2026 |
| Phase 2 | Voicemail, Call queues, SMS | 6 weeks | Q2 2026 |
| Phase 3 | Conference, Transfer, IVR, Analytics | 8 weeks | Q3 2026 |
| Phase 4 | Multi-tenant, Security, Mobile apps | 10 weeks | Q4 2026 |

**Total**: ~27 weeks (~6-7 months)

---

## 💰 Cost Considerations

### Twilio Pricing (US, approximate)

- **Phone Number**: $1/month
- **Inbound Calls**: $0.0085/minute
- **Outbound Calls**: $0.013/minute
- **SMS Inbound**: $0.0075/message
- **SMS Outbound**: $0.0079/message
- **Call Recording**: $0.0025/minute
- **Transcriptions**: $0.05/minute

### Infrastructure Costs

- **AWS EC2** (backend): ~$50/month (t3.medium)
- **AWS RDS** (PostgreSQL): ~$30/month (db.t3.micro)
- **AWS S3** (recordings): ~$0.023/GB/month
- **Redis** (ElastiCache): ~$15/month (cache.t3.micro)
- **CDN**: ~$0.085/GB transfer

**Estimated monthly cost for 100 users with 500 minutes of calls**: ~$200-300

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

- **Call Success Rate**: > 98%
- **Average Call Setup Time**: < 3 seconds
- **User Satisfaction**: > 4.5/5
- **System Uptime**: > 99.9%
- **Support Tickets**: < 5/month

### Business Metrics

- **Active Users**: Track growth
- **Call Volume**: Calls per day/month
- **Feature Adoption**: % users using each feature
- **Churn Rate**: < 5% monthly
- **Net Promoter Score**: > 50

---

## 📝 Notes

- All estimates are for 1 full-time developer
- Complexity ratings are subjective and may change
- Dependencies must be resolved before starting a feature
- User testing should occur after each phase
- Features can be re-prioritized based on user feedback

---

**Maintained by**: Development Team
**Review Cadence**: Monthly
**Last Reviewed**: 2026-01-07
