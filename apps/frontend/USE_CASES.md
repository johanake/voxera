# Frontend Use Cases & Requirements

## Project Goals
Our Company is called Voxera and we are building a self service portal where IT-Admins can handle their telephony. This means that the IT-Admin is able to purchase phone numbers, set up their IVRs and PBXs and manage their users licences. 

The model is based on a licence model, where the IT-Admin can purchase a licence and allocate it to a user in their platform. 

All traditional BSS functionalities such as invoicing, rating of CDRs, handling dunning etc is managed in a separate software. 

## Target Users
This product will target smaller companies in Sweden with less than 250 employees. However, the product should be able to be white labeled so that partners and other MNOs are able to sell this product as their own

## Core Use Cases

### Tenants, Customers and Users

#### UC-TENANT-001: Creating a Tenant
**Actor**: Platform Super Admin

**Description**: Create a new top-level tenant (MNO/Partner) with white-label branding and configuration.

**Preconditions**:
- User has Super Admin access
- Valid business information available

**Main Flow**:
1. Super Admin navigates to "Tenants" section in admin panel
2. Clicks "Create New Tenant" button
3. Fills in tenant creation form:
   - Basic info: Name, slug (URL identifier)
   - Business details: Organization number, legal name, address, contact info
   - Branding: Logo upload, primary/secondary colors, custom domain (optional)
   - Features: Toggle available features (PBX, IVR, Mobile, Fixed, Number Portability)
   - Settings: Default language, currency
4. Reviews configuration summary
5. Clicks "Create Tenant"
6. System validates data and creates tenant
7. Success message shown with link to tenant dashboard

**Alternative Flows**:
- **3a**: Invalid organization number format → Show error, allow correction
- **3b**: Slug already exists → Suggest alternative slug
- **6a**: Validation fails → Highlight errors, allow correction

**Postconditions**:
- New tenant created and visible in tenants list
- Tenant portal accessible via custom domain or subdomain
- Tenant admin can log in and create customers

**UI Requirements**:
- Multi-step wizard form (Basic → Business → Branding → Features → Review)
- Live preview of branding (logo + colors)
- Color picker for brand colors
- Drag-and-drop logo upload
- Feature toggles with descriptions

**Acceptance Criteria**:
- [ ] Can create tenant with all required fields
- [ ] Logo upload works (max 2MB, PNG/SVG/JPG)
- [ ] Custom domain validation works
- [ ] Cannot create duplicate slug
- [ ] Created tenant appears in tenant list immediately
- [ ] Branding colors apply to tenant portal

---

#### UC-TENANT-002: Creating a Customer
**Actor**: Tenant Admin

**Description**: Tenant creates a new customer account that can purchase and manage telecom services.

**Preconditions**:
- User is logged in as Tenant Admin
- Tenant is active

**Main Flow**:
1. Tenant Admin navigates to "Customers" section
2. Clicks "Add Customer" button
3. Fills in customer creation form:
   - Company name, organization number, VAT number
   - Billing contact: Name, email, phone, role
   - Technical contact: Name, email, phone, role
   - Company address
   - Account type: Prepaid or Postpaid
   - Limits: Max users (default 250), max phone numbers, max PBX instances
   - Tags for categorization (optional)
4. Reviews customer details
5. Clicks "Create Customer"
6. System creates customer and sends welcome email to billing contact
7. Success notification with link to customer details

**Alternative Flows**:
- **3a**: Organization number already exists → Show error with existing customer details
- **3b**: Invalid email format → Show validation error
- **5a**: Email sending fails → Customer created but email queued for retry
- **Bulk Import**: Upload CSV with multiple customers

**Postconditions**:
- Customer created and visible in customer list
- Welcome email sent to billing contact with login instructions
- Customer admin can log in and start configuring

**UI Requirements**:
- Modal or full-page form
- Form validation with inline error messages
- Separate billing/technical contact sections
- Account type radio selection with explanations
- Limit configuration with suggested defaults
- Tag input with autocomplete from existing tags

**Acceptance Criteria**:
- [ ] Can create customer with minimal required fields
- [ ] Cannot create duplicate organization numbers within tenant
- [ ] Email validation works for contact emails
- [ ] Welcome email sent successfully
- [ ] Customer appears in filterable/searchable list
- [ ] Can set custom limits per customer
- [ ] Can add multiple tags

---

#### UC-TENANT-003: Creating a User
**Actor**: Customer Admin

**Description**: Customer Admin creates user accounts within their organization and optionally assigns licenses.

**Preconditions**:
- User is logged in as Customer Admin
- Customer account is active
- Has not exceeded max user limit

**Main Flow**:
1. Customer Admin navigates to "Users" section
2. Clicks "Add User" button
3. Fills in user creation form:
   - First name, last name, email (required)
   - Phone number (optional)
   - Role: User, Manager, or Customer Admin
   - Department, Employee ID (optional)
   - Language preference (default: tenant default)
   - Notification preferences
4. Optionally assigns licenses:
   - Selects from available unassigned licenses
   - Can assign multiple licenses if available
5. Reviews user details
6. Clicks "Create User"
7. System creates user and sends invitation email
8. Success message shown

**Alternative Flows**:
- **3a**: Email already exists for another user → Show error
- **3b**: Max user limit reached → Show error with upgrade options
- **4a**: No licenses available to assign → Skip license assignment, can assign later
- **7a**: User already has account (different customer) → Show conflict resolution
- **Bulk Import**: Upload CSV to create multiple users at once

**Postconditions**:
- User account created with "invited" status
- Invitation email sent with temporary password/magic link
- Assigned licenses show as allocated to the user
- User count incremented

**UI Requirements**:
- Modal or slide-over form
- Email validation
- Role selector with permission descriptions
- License assignment section showing available licenses by bundle
- Notification preferences checkboxes
- Bulk upload option (CSV template download)

**Acceptance Criteria**:
- [ ] Can create user with required fields only
- [ ] Cannot create user with duplicate email within customer
- [ ] Role selector shows clear permission differences
- [ ] Can assign 0 or more licenses during creation
- [ ] Invitation email sent successfully
- [ ] Can bulk upload users via CSV
- [ ] Enforces max user limit
- [ ] User appears in user list immediately with "invited" status 

---

### Pricing & Packaging
The Pricing and Packaging model consists of "Bundles". The concept of Bundles is that you are able to define a "Bundle" such as "Mobile" that offers different tiers of a mobile offering, such as free, pro and premium. Each licence will in turn contain a range of capabilities such as 5G, VoLTE etc. It is important that the TENANTS are able to create and manage these bundles themselves.

#### UC-PACK-001: Creating a Bundle with Tiers
**Actor**: Tenant Admin

**Description**: Tenant creates a new product bundle with multiple tiers (e.g., Free, Pro, Premium) and defines capabilities for each tier.

**Preconditions**:
- User is logged in as Tenant Admin
- Tenant is active

**Main Flow**:
1. Tenant Admin navigates to "Bundles" section
2. Clicks "Create Bundle" button
3. Fills in bundle basic information:
   - Bundle name (e.g., "Mobile Professional")
   - Description
   - Category (Mobile, Fixed, PBX, IVR, Hybrid)
   - Visibility: Public (all customers) or Custom (specific customers)
4. Adds tiers to the bundle:
   - Clicks "Add Tier"
   - For each tier, configures:
     - Tier name (Free, Pro, Premium, Enterprise)
     - Description
     - Monthly fee and setup fee
     - Capabilities (5G: Yes/No, VoLTE: Yes/No, Call Recording: Yes/No)
     - Usage limits (max concurrent calls, included minutes, included SMS, storage GB)
   - Can reorder tiers by drag-and-drop
5. Reviews bundle configuration
6. Clicks "Create Bundle" (saves as draft) or "Publish Bundle" (makes active)
7. Success notification shown

**Alternative Flows**:
- **3a**: Bundle name already exists → Show error, suggest alternative
- **4a**: No tiers added → Show validation error, require at least one tier
- **6a**: Save as draft → Bundle created but not visible to customers
- **Edit Mode**: Can edit existing bundles and republish

**Postconditions**:
- Bundle created and visible in bundle list
- If published, bundle available for customers to purchase licenses
- Bundle tiers can be assigned to licenses

**UI Requirements**:
- Multi-step form or single page with sections
- Category dropdown with icons
- Tier builder with add/remove/reorder functionality
- Capability configurator (checkboxes for features, inputs for quotas)
- Price input fields with currency display (SEK)
- Live preview of bundle structure
- Draft/Publish toggle

**Acceptance Criteria**:
- [ ] Can create bundle with multiple tiers
- [ ] Can add/remove/reorder tiers
- [ ] Each tier can have unique capabilities and limits
- [ ] Can save as draft or publish immediately
- [ ] Published bundles appear in customer license purchase flow
- [ ] Can configure visibility (public vs. custom)
- [ ] Validation prevents creating bundle without tiers

---

#### UC-PACK-002: Purchasing Licenses
**Actor**: Customer Admin

**Description**: Customer purchases licenses from available bundles to allocate to users.

**Preconditions**:
- User is logged in as Customer Admin
- Active bundles available for purchase
- Customer account in good standing (for postpaid)

**Main Flow**:
1. Customer Admin navigates to "Licenses" section
2. Sees current license inventory (purchased, assigned, available)
3. Clicks "Purchase Licenses" button
4. Browses available bundles by category
5. Selects a bundle (e.g., "Mobile Professional")
6. Chooses tier (Free, Pro, Premium)
7. Specifies quantity of licenses to purchase
8. Reviews pricing summary:
   - Per-license monthly fee × quantity
   - Setup fee (if applicable)
   - Total monthly recurring cost
9. Confirms purchase
10. System creates unassigned licenses
11. Success message with option to assign licenses immediately

**Alternative Flows**:
- **3a**: No available bundles → Show message to contact tenant admin
- **7a**: Exceeds license limit → Show error with current limit
- **9a**: Insufficient balance (prepaid) → Redirect to add funds
- **11a**: Assign immediately → Opens license assignment modal

**Postconditions**:
- Licenses created with "unassigned" status
- License count increased
- Billing record created (if postpaid)
- Licenses available for assignment to users

**UI Requirements**:
- Bundle catalog/grid view with filtering
- Tier comparison table
- Quantity selector
- Pricing calculator showing monthly cost
- Shopping cart-like experience for multiple bundle purchases
- Clear indication of license limits

**Acceptance Criteria**:
- [ ] Can browse and filter available bundles
- [ ] Can select tier and quantity
- [ ] Pricing calculation accurate
- [ ] Cannot exceed license limits
- [ ] Purchased licenses appear in inventory immediately
- [ ] Can purchase multiple bundle types in one transaction
- [ ] Clear confirmation and success messaging

---

#### UC-PACK-003: Assigning Licenses to Users
**Actor**: Customer Admin

**Description**: Allocate purchased licenses to specific users in the organization.

**Main Flow**:
1. Customer Admin navigates to "Licenses" section
2. Views list of unassigned licenses grouped by bundle/tier
3. Selects one or more unassigned licenses
4. Clicks "Assign to User"
5. Searches for or selects user from list
6. Reviews assignment:
   - User details
   - License details (bundle, tier, capabilities)
   - Effective date
7. Confirms assignment
8. System updates license status to "active"
9. User receives notification of license assignment
10. Success message shown

**Alternative Flows**:
- **4a**: Assign from user profile → Navigate to user, click "Assign License", select from available
- **5a**: User already has license of same type → Show warning, allow replacement
- **9a**: Bulk assignment → Select multiple users, assign same license type to all

**Postconditions**:
- License status changed to "active"
- License linked to user
- User gains capabilities from license
- Available license count decremented

**UI Requirements**:
- Filterable license inventory (by bundle, tier, status)
- User search/select with autocomplete
- Bulk action support (select multiple licenses)
- License-user assignment matrix view
- Clear status indicators (unassigned, active, suspended)

**Acceptance Criteria**:
- [ ] Can assign single license to user
- [ ] Can bulk assign licenses
- [ ] Cannot assign same license to multiple users
- [ ] User notification sent on assignment
- [ ] License shows as "active" immediately
- [ ] Can reassign license from one user to another
- [ ] Validation prevents assigning suspended licenses

---

### Numbers and Number Portability

#### UC-NBRS-001: Purchasing Phone Numbers
**Actor**: Customer Admin

**Description**: Search for and purchase available phone numbers from inventory.

**Preconditions**:
- User is logged in as Customer Admin
- Has not exceeded max phone number limit
- Number inventory available from tenant

**Main Flow**:
1. Customer Admin navigates to "Phone Numbers" section
2. Clicks "Purchase Number" button
3. Configures search filters:
   - Number type: Mobile, Fixed, Toll-free
   - Area code or city (for geographic numbers)
   - Pattern matching (e.g., numbers containing "1234")
4. Clicks "Search"
5. System displays available numbers matching criteria
6. Selects one or more numbers
7. Reviews pricing for each number (monthly fee, setup fee)
8. Clicks "Purchase"
9. System reserves and assigns numbers to customer
10. Success message with assigned numbers

**Alternative Flows**:
- **5a**: No numbers available → Show message, offer to request custom numbers
- **6a**: Number limit reached → Show error with current limit
- **8a**: Insufficient balance (prepaid) → Redirect to add funds

**Postconditions**:
- Numbers purchased and assigned to customer
- Numbers appear in customer's number inventory
- Numbers available for assignment to users/PBX/IVR
- Billing record created

**UI Requirements**:
- Search form with type/area/pattern filters
- Results table showing number, type, location, pricing
- Multi-select for bulk purchase
- Shopping cart-like experience
- Clear indication of number limits
- Number formatting (E.164 display)

**Acceptance Criteria**:
- [ ] Can search by multiple criteria
- [ ] Results display correctly formatted numbers
- [ ] Can select and purchase multiple numbers
- [ ] Cannot exceed number limit
- [ ] Pricing displayed clearly per number
- [ ] Numbers appear in inventory immediately
- [ ] Number status set to "active"

---

#### UC-NBRS-002: Porting Numbers In
**Actor**: Customer Admin

**Description**: Initiate number porting request to transfer existing numbers from another provider.

**Preconditions**:
- User is logged in as Customer Admin
- Has authorization from previous provider (LOA)
- Number is portable

**Main Flow**:
1. Customer Admin navigates to "Phone Numbers" section
2. Clicks "Port In Number" button
3. Fills in porting request form:
   - Number(s) to port (supports multiple)
   - Current provider name
   - Account number with current provider
   - Authorized contact at current provider
   - Desired port date
   - Upload LOA (Letter of Authorization) document
4. Reviews porting request summary
5. Submits request
6. System creates porting request with status "requested"
7. Confirmation email sent to customer
8. Number added to inventory with status "porting_in"

**Alternative Flows**:
- **3a**: Invalid number format → Show validation error
- **3b**: Number already in system → Show error
- **3c**: Missing LOA → Require document upload
- **8a**: Porting process updates:
   - Status changes: requested → in_progress → completed/failed
   - Customer receives email notifications at each stage

**Postconditions**:
- Porting request created and tracked
- Number visible in inventory with "porting_in" status
- Customer and tenant admins can view porting progress
- On completion, number becomes active and usable

**UI Requirements**:
- Multi-step form (Number Details → Provider Info → Documentation → Review)
- Number validation with formatting help
- File upload for LOA (PDF)
- Date picker for desired port date
- Status tracking timeline/progress bar
- Email/SMS notification preferences

**Acceptance Criteria**:
- [ ] Can submit port request for single or multiple numbers
- [ ] LOA upload required and validated
- [ ] Request appears in porting requests list
- [ ] Status updates tracked and visible
- [ ] Email notifications sent at each stage
- [ ] On completion, number usable like purchased numbers
- [ ] Can cancel porting request before completion

---

#### UC-NBRS-003: Assigning Numbers to Users/PBX/IVR
**Actor**: Customer Admin

**Description**: Assign purchased or ported numbers to users, PBX instances, or IVR flows.

**Main Flow**:
1. Customer Admin navigates to "Phone Numbers" section
2. Selects an unassigned number
3. Clicks "Assign Number"
4. Chooses assignment type: User, PBX, or IVR
5. Selects target:
   - If User: Search/select user
   - If PBX: Select PBX instance and extension
   - If IVR: Select IVR flow
6. Configures number capabilities (if applicable):
   - Voice enabled
   - SMS enabled
   - MMS enabled (if supported)
7. Reviews assignment
8. Confirms
9. System updates number assignment
10. Target entity (user/PBX/IVR) updated with number

**Alternative Flows**:
- **4a**: Assign from user profile → Select user, click "Assign Number", choose from available
- **5a**: No PBX/IVR available → Option to create new first
- **9a**: Number already assigned → Show warning, allow reassignment

**Postconditions**:
- Number assigned to target
- Number status remains "active"
- Target can use number for calls/SMS
- Assignment visible in both number and target views

**UI Requirements**:
- Number list with status indicators
- Assignment modal with type selector
- Entity search/select (users, PBX, IVR)
- Capability toggles
- Visual confirmation of assignment
- Bulk assignment support

**Acceptance Criteria**:
- [ ] Can assign to user, PBX, or IVR
- [ ] Number appears on user/PBX/IVR profile
- [ ] Can reassign from one entity to another
- [ ] Cannot assign same number to multiple entities
- [ ] Capability settings saved correctly
- [ ] Unassigning releases number back to pool

---

### Cloud PBX and IVRs

#### UC-PBX-001: Creating a PBX Instance
**Actor**: Customer Admin

**Description**: Set up a new Cloud PBX instance for managing extensions and call routing.

**Preconditions**:
- User is logged in as Customer Admin
- PBX feature enabled for tenant
- Has not exceeded max PBX instance limit

**Main Flow**:
1. Customer Admin navigates to "PBX" section
2. Clicks "Create PBX" button
3. Fills in PBX configuration:
   - Name (e.g., "Main Office PBX", "Stockholm Branch")
   - Description
   - Timezone
   - Default language
   - Max extensions limit
4. Configures features to enable:
   - Call queues
   - Hunt groups
   - Voicemail
   - Conferencing
   - Call recording
5. Reviews configuration
6. Clicks "Create PBX"
7. System creates PBX instance
8. Success message with link to PBX dashboard

**Alternative Flows**:
- **3a**: Max PBX limit reached → Show error with upgrade options
- **4a**: Some features unavailable based on license → Disable toggles with explanation

**Postconditions**:
- PBX instance created with "active" status
- PBX dashboard accessible
- Ready for extension and routing configuration
- Can assign phone numbers as DIDs

**UI Requirements**:
- Form with clear sections
- Feature toggles with descriptions and pricing (if applicable)
- Timezone selector
- Template selection (if providing common PBX templates)
- Live preview of initial structure

**Acceptance Criteria**:
- [ ] Can create PBX with required fields
- [ ] Feature toggles work correctly
- [ ] Cannot exceed PBX instance limit
- [ ] PBX appears in PBX list immediately
- [ ] Dashboard accessible after creation
- [ ] Default extensions can be created

---

#### UC-PBX-002: Configuring Extensions
**Actor**: Customer Admin

**Description**: Create and configure extensions within a PBX instance.

**Main Flow**:
1. Customer Admin opens PBX instance
2. Navigates to "Extensions" tab
3. Clicks "Add Extension"
4. Fills in extension details:
   - Extension number (e.g., "101", "102")
   - Extension name/label (e.g., "Reception", "Sales", "John Doe")
   - Extension type: User, Queue, Hunt Group, IVR
5. If type "User":
   - Assigns to specific user
   - Configures voicemail enabled/disabled
   - Sets call forwarding rules
6. If type "Queue" or "Hunt Group":
   - Configures members
   - Sets ring strategy (simultaneous, sequential, round-robin)
7. Reviews extension configuration
8. Clicks "Save Extension"
9. Extension created and active

**Alternative Flows**:
- **4a**: Extension number already exists → Show error
- **5a**: User already has extension → Show warning, allow multiple extensions per user
- **Bulk Create**: Import CSV with multiple extensions

**Postconditions**:
- Extension created and callable
- If assigned to user, user can receive calls
- Extension appears in PBX extension list
- Can be used in routing rules

**UI Requirements**:
- Extension list/table view
- Modal or slide-over for extension creation
- Type selector with clear descriptions
- User search/select for user extensions
- Visual dial plan editor (optional advanced feature)
- Extension number validation

**Acceptance Criteria**:
- [ ] Can create extensions with unique numbers
- [ ] Can assign extensions to users
- [ ] Voicemail configuration works
- [ ] Queue and hunt group types supported
- [ ] Extensions immediately callable
- [ ] Can edit and delete extensions
- [ ] Extension status visible (online, busy, offline)

---

#### UC-PBX-003: Setting Up Call Routing Rules
**Actor**: Customer Admin

**Description**: Configure automated call routing based on conditions (time, caller ID, dialed number).

**Main Flow**:
1. Customer Admin opens PBX instance
2. Navigates to "Call Routing" tab
3. Clicks "Add Routing Rule"
4. Configures rule details:
   - Rule name
   - Priority (lower number = higher priority)
   - Enable/disable toggle
5. Defines conditions (AND logic):
   - Time of day (e.g., 9:00-17:00)
   - Day of week (e.g., Monday-Friday)
   - Caller ID (matches, contains, starts with)
   - Dialed number (which DID was called)
6. Defines action when conditions match:
   - Forward to extension
   - Send to call queue
   - Play message then route
   - Send to voicemail
   - Send to IVR
   - Hang up
7. Can add multiple conditions
8. Reviews rule logic
9. Clicks "Save Rule"
10. Rule activated based on priority

**Alternative Flows**:
- **5a**: No conditions added → Default "always match" rule
- **6a**: Complex routing → Can chain rules with different priorities
- **Templates**: Can select from common routing templates (business hours, after hours, holiday)

**Postconditions**:
- Routing rule created and active
- Incoming calls evaluated against rules in priority order
- First matching rule action executed
- Rule visible in routing rules list

**UI Requirements**:
- Rule builder with drag-and-drop (optional)
- Condition configurator (time picker, dropdown selectors)
- Action selector with target pickers
- Priority drag-to-reorder
- Enable/disable toggle per rule
- Visual testing ("What happens if caller X calls at Y time?")
- Template gallery

**Acceptance Criteria**:
- [ ] Can create rules with multiple conditions
- [ ] Rules execute in priority order
- [ ] Time-based routing works correctly
- [ ] Caller ID matching works
- [ ] Can enable/disable rules without deleting
- [ ] Can reorder rules by priority
- [ ] Templates available for common scenarios

---

#### UC-IVR-001: Creating an IVR Flow
**Actor**: Customer Admin

**Description**: Design an Interactive Voice Response menu flow with a visual editor.

**Preconditions**:
- User is logged in as Customer Admin
- IVR feature enabled for tenant
- At least one phone number available for IVR entry point

**Main Flow**:
1. Customer Admin navigates to "IVR" section
2. Clicks "Create IVR Flow"
3. Names the IVR flow (e.g., "Main Menu", "Support IVR")
4. Opens visual flow builder (node-based editor)
5. Adds nodes to canvas:
   - **Menu node**: "Press 1 for Sales, 2 for Support, 0 for Operator"
   - **Message node**: "Thank you for calling Voxera"
   - **Transfer node**: Transfer to extension or external number
   - **Voicemail node**: Leave a message
   - **Queue node**: Join call queue
   - **Condition node**: Branch based on time/caller ID
   - **Hangup node**: End call
6. Connects nodes by dragging connections
7. Configures each node:
   - Menu: Records/uploads audio prompt or enters TTS text
   - Menu: Defines key mappings (1→Sales, 2→Support)
   - Transfer: Specifies extension or phone number
   - Message: Audio/TTS with optional repeat
8. Sets entry point (first node)
9. Configures IVR settings:
   - Default language
   - Timeout duration
   - Max retries
   - Invalid input message
10. Tests flow with simulator
11. Saves and publishes IVR
12. Assigns phone number to IVR

**Alternative Flows**:
- **6a**: Invalid flow (dead ends, loops) → Show validation warnings
- **10a**: Test reveals issues → Fix and retest
- **Save as draft**: Save without publishing

**Postconditions**:
- IVR flow created and published
- Assigned phone number routes to IVR
- Callers experience IVR menu
- Flow can be edited and updated

**UI Requirements**:
- Visual node-based editor (like flowchart)
- Node palette with drag-and-drop
- Canvas with zoom and pan
- Node configuration modal/panel
- Audio upload or TTS input
- Flow validation with error highlighting
- Simulator for testing
- Version history (optional)

**Acceptance Criteria**:
- [ ] Can create IVR with multiple nodes
- [ ] Visual editor intuitive and responsive
- [ ] Can upload audio or use TTS
- [ ] Node connections work correctly
- [ ] Flow validation prevents invalid configurations
- [ ] Simulator accurately represents flow
- [ ] Can assign number to IVR
- [ ] Changes published and effective immediately
- [ ] Can duplicate flows for templates


## Out of Scope 
- Login and authentication
- Authorization and roles 
- Data persistance 