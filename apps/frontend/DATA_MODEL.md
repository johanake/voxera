# Data Model & Entity Relationships

## Overview
This document defines all data entities, their fields, relationships, and validation rules for the Voxera UCaaS platform.

## Entity Hierarchy

```
Platform (Super Admin Level)
  └── Tenant (Voxera, Partner MNOs)
      ├── Branding & Configuration
      ├── Bundles (Pricing & Packaging)
      └── Customers (Apple, Microsoft, etc.)
          ├── Users (End users)
          ├── Licenses (Purchased & Allocated)
          ├── Phone Numbers
          └── PBX/IVR Configurations
```

## Core Entities

### 1. Tenant
**Description**: Top-level entity representing an MNO or partner using the white-labeled platform.

**Fields**:
```typescript
interface Tenant {
  id: string                    // UUID
  name: string                  // "Voxera", "Partner Telco AB"
  slug: string                  // URL-safe identifier "voxera", "partner-telco"
  status: TenantStatus          // "active" | "suspended" | "inactive"

  // White-label branding
  branding: {
    logo: string                // URL to logo
    primaryColor: string        // Hex color
    secondaryColor: string      // Hex color
    customDomain?: string       // "portal.voxera.se"
    faviconUrl?: string
  }

  // Business information
  businessInfo: {
    organizationNumber: string  // Swedish org number
    vatNumber?: string
    legalName: string
    address: Address
    contactEmail: string
    contactPhone: string
  }

  // Settings
  settings: {
    defaultLanguage: string     // "sv", "en"
    defaultCurrency: string     // "SEK", "EUR"
    allowCustomerSelfRegistration: boolean
    features: TenantFeatures    // Feature toggles
  }

  createdAt: Date
  updatedAt: Date
  createdBy: string             // User ID
}

type TenantStatus = "active" | "suspended" | "inactive"

interface TenantFeatures {
  enablePBX: boolean
  enableIVR: boolean
  enableMobile: boolean
  enableFixed: boolean
  enableNumberPortability: boolean
  enableSMS: boolean
}
```

**Relationships**:
- One Tenant → Many Customers
- One Tenant → Many Bundles

**Validation Rules**:
- `name`: Required, 2-100 characters
- `slug`: Required, unique, lowercase alphanumeric with hyphens
- `organizationNumber`: Required, valid Swedish format (XXXXXX-XXXX)
- `contactEmail`: Required, valid email format

---

### 2. Customer
**Description**: A company/organization that subscribes to services under a Tenant.

**Fields**:
```typescript
interface Customer {
  id: string                    // UUID
  tenantId: string              // Foreign key to Tenant

  // Company information
  companyName: string
  organizationNumber: string    // Swedish org number
  vatNumber?: string

  // Contact information
  billingContact: ContactPerson
  technicalContact: ContactPerson
  address: Address

  // Account settings
  status: CustomerStatus        // "active" | "suspended" | "trial" | "inactive"
  accountType: AccountType      // "prepaid" | "postpaid"

  // Limits and quotas
  limits: {
    maxUsers: number
    maxPhoneNumbers: number
    maxPBXInstances: number
  }

  // Metadata
  tags?: string[]               // For categorization
  notes?: string                // Internal notes

  createdAt: Date
  updatedAt: Date
  createdBy: string             // User ID
}

type CustomerStatus = "active" | "suspended" | "trial" | "inactive"
type AccountType = "prepaid" | "postpaid"

interface ContactPerson {
  name: string
  email: string
  phone: string
  role?: string
}

interface Address {
  street: string
  city: string
  postalCode: string
  country: string               // ISO country code "SE"
}
```

**Relationships**:
- One Customer → One Tenant
- One Customer → Many Users
- One Customer → Many Licenses
- One Customer → Many Phone Numbers
- One Customer → Many PBX Instances

**Validation Rules**:
- `companyName`: Required, 2-200 characters
- `organizationNumber`: Required, unique within tenant
- `billingContact.email`: Required, valid email
- `maxUsers`: Positive integer, max 250 (based on target market)

---

### 3. User
**Description**: Individual end-user within a customer organization.

**Fields**:
```typescript
interface User {
  id: string                    // UUID
  customerId: string            // Foreign key to Customer

  // Personal information
  firstName: string
  lastName: string
  email: string                 // Unique within customer
  phone?: string

  // User profile
  role: UserRole                // "customer_admin" | "user" | "manager"
  status: UserStatus            // "active" | "suspended" | "invited" | "inactive"

  // Preferences
  preferences: {
    language: string            // "sv" | "en"
    timezone: string            // "Europe/Stockholm"
    notifications: NotificationPreferences
  }

  // Metadata
  employeeId?: string           // Customer's internal employee ID
  department?: string

  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string             // User ID
}

type UserRole = "customer_admin" | "manager" | "user"
type UserStatus = "active" | "suspended" | "invited" | "inactive"

interface NotificationPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  newLicenseAssigned: boolean
  numberPortingUpdates: boolean
}
```

**Relationships**:
- One User → One Customer
- One User → Many Licenses (assigned)

**Validation Rules**:
- `email`: Required, unique within customer, valid email format
- `firstName`, `lastName`: Required, 1-100 characters
- Users with role "customer_admin" can manage other users

---

### 4. Bundle
**Description**: A product offering template with tiers, created by Tenants.

**Fields**:
```typescript
interface Bundle {
  id: string                    // UUID
  tenantId: string              // Foreign key to Tenant

  // Bundle information
  name: string                  // "Mobile", "Fixed Line", "PBX Professional"
  description: string
  category: BundleCategory      // "mobile" | "fixed" | "pbx" | "ivr" | "hybrid"
  status: BundleStatus          // "active" | "draft" | "archived"

  // Tiers within this bundle
  tiers: BundleTier[]

  // Metadata
  isPublic: boolean             // Visible to all customers or custom
  tags?: string[]

  createdAt: Date
  updatedAt: Date
  createdBy: string             // User ID
}

type BundleCategory = "mobile" | "fixed" | "pbx" | "ivr" | "hybrid"
type BundleStatus = "active" | "draft" | "archived"

interface BundleTier {
  id: string                    // UUID
  name: string                  // "Free", "Pro", "Premium", "Enterprise"
  description: string

  // Pricing
  pricing: {
    monthlyFee: number          // In tenant's default currency
    setupFee: number
    currency: string            // "SEK"
  }

  // Capabilities/Features included
  capabilities: Capability[]

  // Usage limits
  limits: {
    maxConcurrentCalls?: number
    includedMinutes?: number
    includedSMS?: number
    storageGB?: number
  }

  // Ordering
  sortOrder: number             // For displaying tiers in order
}

interface Capability {
  id: string
  name: string                  // "5G", "VoLTE", "Call Recording", "IVR"
  type: CapabilityType          // "feature" | "quota" | "setting"
  value: boolean | number | string
  description?: string
}

type CapabilityType = "feature" | "quota" | "setting"
```

**Relationships**:
- One Bundle → One Tenant
- One Bundle → Many Licenses

**Validation Rules**:
- `name`: Required, unique within tenant
- `tiers`: At least one tier required
- `pricing.monthlyFee`: Non-negative number

---

### 5. License
**Description**: A purchased instance of a bundle tier, which can be allocated to a user.

**Fields**:
```typescript
interface License {
  id: string                    // UUID
  customerId: string            // Foreign key to Customer
  bundleId: string              // Foreign key to Bundle
  tierId: string                // Specific tier within the bundle

  // Assignment
  userId?: string               // Foreign key to User (null if unassigned)
  status: LicenseStatus         // "active" | "suspended" | "unassigned" | "expired"

  // License details
  activatedAt?: Date
  expiresAt?: Date              // For trial or fixed-term licenses

  // Snapshot of bundle tier at purchase time
  // (in case bundle changes later)
  tierSnapshot: BundleTier

  // Usage tracking (optional)
  usage?: {
    minutesUsed: number
    smsUsed: number
    dataUsedGB: number
  }

  createdAt: Date
  updatedAt: Date
  createdBy: string             // User ID
}

type LicenseStatus = "active" | "suspended" | "unassigned" | "expired"
```

**Relationships**:
- One License → One Customer
- One License → One Bundle (with specific tier)
- One License → Zero or One User

**Validation Rules**:
- License can only be assigned to a user within the same customer
- `status` automatically changes to "expired" when `expiresAt` is passed

---

### 6. PhoneNumber
**Description**: A phone number owned or rented by a customer.

**Fields**:
```typescript
interface PhoneNumber {
  id: string                    // UUID
  customerId: string            // Foreign key to Customer

  // Number details
  number: string                // E.164 format "+46701234567"
  country: string               // ISO country code "SE"
  type: NumberType              // "mobile" | "fixed" | "tollfree"

  // Assignment
  assignedTo?: {
    type: "user" | "pbx" | "ivr"
    id: string                  // User ID, PBX ID, or IVR ID
  }

  // Status and lifecycle
  status: NumberStatus          // "active" | "pending_activation" | "porting_in" | "porting_out" | "suspended"

  // Porting information (if applicable)
  portingDetails?: {
    portingType: "port_in" | "port_out"
    previousProvider?: string
    newProvider?: string
    requestDate: Date
    scheduledDate?: Date
    completedDate?: Date
    status: PortingStatus
  }

  // Capabilities
  capabilities: {
    smsEnabled: boolean
    voiceEnabled: boolean
    mmsEnabled: boolean
  }

  // Billing
  monthlyFee: number
  setupFee: number

  acquiredAt: Date
  expiresAt?: Date              // For temporary numbers
  createdAt: Date
  updatedAt: Date
}

type NumberType = "mobile" | "fixed" | "tollfree"
type NumberStatus = "active" | "pending_activation" | "porting_in" | "porting_out" | "suspended" | "released"
type PortingStatus = "requested" | "in_progress" | "completed" | "failed" | "cancelled"
```

**Relationships**:
- One PhoneNumber → One Customer
- One PhoneNumber → Zero or One User
- One PhoneNumber → Zero or One PBX
- One PhoneNumber → Zero or One IVR

**Validation Rules**:
- `number`: Required, unique across platform, valid E.164 format
- Number cannot be assigned to both user and PBX simultaneously
- Numbers in "porting_in" or "porting_out" status cannot be reassigned

---

### 7. PBXInstance
**Description**: A cloud PBX configuration for a customer.

**Fields**:
```typescript
interface PBXInstance {
  id: string                    // UUID
  customerId: string            // Foreign key to Customer

  // PBX details
  name: string                  // "Main Office PBX", "Stockholm Office"
  description?: string
  status: PBXStatus             // "active" | "inactive" | "configuring"

  // Configuration
  config: {
    timezone: string            // "Europe/Stockholm"
    defaultLanguage: string     // "sv"
    recordAllCalls: boolean
    maxExtensions: number

    // Features
    features: {
      callQueues: boolean
      huntGroups: boolean
      voicemail: boolean
      conferencing: boolean
      callRecording: boolean
    }
  }

  // Extensions
  extensions: Extension[]

  // Call routing rules
  routingRules: RoutingRule[]

  createdAt: Date
  updatedAt: Date
  createdBy: string             // User ID
}

type PBXStatus = "active" | "inactive" | "configuring"

interface Extension {
  id: string
  number: string                // Extension number "101", "102"
  name: string                  // "Reception", "Sales"
  userId?: string               // Assigned user
  type: "user" | "queue" | "huntgroup" | "ivr"
  voicemailEnabled: boolean
}

interface RoutingRule {
  id: string
  name: string
  priority: number              // Lower number = higher priority
  conditions: RoutingCondition[]
  action: RoutingAction
  enabled: boolean
}

interface RoutingCondition {
  type: "time" | "caller_id" | "dialed_number" | "day_of_week"
  operator: "equals" | "contains" | "matches" | "between"
  value: string | string[]
}

interface RoutingAction {
  type: "forward" | "queue" | "voicemail" | "ivr" | "hangup"
  target?: string               // Extension, Queue ID, IVR ID
  parameters?: Record<string, any>
}
```

**Relationships**:
- One PBXInstance → One Customer
- One PBXInstance → Many Extensions
- One PBXInstance → Many PhoneNumbers (DIDs)

**Validation Rules**:
- `name`: Required, unique within customer
- `maxExtensions`: Must not exceed customer limits
- Extension numbers must be unique within PBX

---

### 8. IVRFlow
**Description**: Interactive Voice Response flow configuration.

**Fields**:
```typescript
interface IVRFlow {
  id: string                    // UUID
  customerId: string            // Foreign key to Customer

  // IVR details
  name: string                  // "Main Menu", "Support IVR"
  description?: string
  status: IVRStatus             // "active" | "draft" | "inactive"

  // Flow configuration
  entryNode: string             // ID of the starting node
  nodes: IVRNode[]

  // Settings
  settings: {
    defaultLanguage: string     // "sv"
    timeoutSeconds: number      // How long to wait for input
    maxRetries: number          // Max retry attempts
    invalidInputMessage: string // Audio URL or TTS text
  }

  createdAt: Date
  updatedAt: Date
  createdBy: string             // User ID
}

type IVRStatus = "active" | "draft" | "inactive"

interface IVRNode {
  id: string
  type: IVRNodeType
  name: string
  position: { x: number; y: number }  // For visual editor

  config: IVRNodeConfig

  // Connections to other nodes
  transitions: {
    [key: string]: string       // e.g., "1": "node-id-2", "timeout": "node-id-3"
  }
}

type IVRNodeType =
  | "menu"           // Press 1 for sales, 2 for support
  | "message"        // Play message
  | "transfer"       // Transfer to extension/number
  | "voicemail"      // Take voicemail
  | "queue"          // Place in call queue
  | "condition"      // Branch based on condition
  | "hangup"         // End call

interface IVRNodeConfig {
  // Different config based on node type
  prompt?: {
    type: "tts" | "audio"
    content: string             // TTS text or audio URL
    voice?: string              // TTS voice selection
  }

  options?: {                   // For menu nodes
    [key: string]: {            // "1", "2", "0", "*", "#"
      label: string
      action: string
    }
  }

  transferTarget?: {            // For transfer nodes
    type: "extension" | "external" | "user"
    value: string
  }

  queueId?: string              // For queue nodes

  condition?: {                 // For condition nodes
    variable: string
    operator: string
    value: string
  }
}
```

**Relationships**:
- One IVRFlow → One Customer
- One IVRFlow → Many PhoneNumbers (entry points)

**Validation Rules**:
- `name`: Required, unique within customer
- `entryNode`: Must reference a valid node ID
- All node transitions must reference valid node IDs
- No circular references that could create infinite loops

---

## Relationships Summary

```
Tenant (1) ────── (M) Customer
  │                    │
  │                    ├── (M) User
  │                    ├── (M) License
  │                    ├── (M) PhoneNumber
  │                    ├── (M) PBXInstance
  │                    └── (M) IVRFlow
  │
  └── (M) Bundle
         └── (M) BundleTier

License (M) ────── (1) Bundle
License (1) ────── (0-1) User

PhoneNumber (0-1) ────── (1) User
PhoneNumber (0-1) ────── (1) PBXInstance
PhoneNumber (0-1) ────── (1) IVRFlow
```

## Indexes Needed (for Performance)

```sql
-- Tenants
CREATE INDEX idx_tenant_slug ON tenants(slug);

-- Customers
CREATE INDEX idx_customer_tenant ON customers(tenant_id);
CREATE INDEX idx_customer_org_number ON customers(organization_number);

-- Users
CREATE INDEX idx_user_customer ON users(customer_id);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_status ON users(status);

-- Licenses
CREATE INDEX idx_license_customer ON licenses(customer_id);
CREATE INDEX idx_license_user ON licenses(user_id);
CREATE INDEX idx_license_bundle ON licenses(bundle_id);
CREATE INDEX idx_license_status ON licenses(status);

-- Phone Numbers
CREATE INDEX idx_number_customer ON phone_numbers(customer_id);
CREATE INDEX idx_number_value ON phone_numbers(number);
CREATE INDEX idx_number_status ON phone_numbers(status);

-- Bundles
CREATE INDEX idx_bundle_tenant ON bundles(tenant_id);
CREATE INDEX idx_bundle_status ON bundles(status);
```

## Common Query Patterns

### Get all active licenses for a customer
```typescript
GET /api/customers/{customerId}/licenses?status=active
```

### Get all unassigned licenses for a customer
```typescript
GET /api/customers/{customerId}/licenses?status=unassigned
```

### Get all phone numbers assigned to a user
```typescript
GET /api/users/{userId}/phone-numbers
```

### Get all available bundles for a tenant
```typescript
GET /api/tenants/{tenantId}/bundles?status=active&isPublic=true
```

### Get customer's PBX with extensions
```typescript
GET /api/customers/{customerId}/pbx?include=extensions,numbers
```

## API Response Formats

### List Response
```typescript
interface ListResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
  filters?: Record<string, any>
}
```

### Single Item Response
```typescript
interface ItemResponse<T> {
  data: T
}
```

### Error Response
```typescript
interface ErrorResponse {
  error: {
    code: string              // "VALIDATION_ERROR", "NOT_FOUND", etc.
    message: string
    details?: Record<string, string[]>  // Field-specific errors
  }
}
```

## Notes for Frontend Development

1. **Optimistic Updates**: For better UX, update UI immediately and revert on API error
2. **Caching Strategy**: Cache tenant/customer data longer than frequently changing data (licenses, numbers)
3. **Real-time Updates**: Consider WebSocket for license assignments and number porting status
4. **Pagination**: All list endpoints should support pagination (default 20 items per page)
5. **Filtering & Sorting**: Support common filters (status, date ranges) and sorting on list views
6. **Search**: Implement client-side search for small datasets, server-side for large ones
