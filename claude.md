# Voxera UCaaS Platform - Project Documentation

## Project Overview

Voxera is a Unified Communications as a Service (UCaaS) platform built as a TypeScript monorepo. The platform provides comprehensive management of users, licenses, phone numbers, PBX systems, and IVR flows for telecommunications services.

## Technology Stack

### Monorepo Structure
- **Package Manager**: pnpm with workspaces
- **Build System**: TypeScript project references for incremental compilation
- **Workspace Structure**:
  ```
  /apps
    /frontend  - React + Vite + Tailwind CSS
    /ucaas-client  - React + Vite + Tailwind CSS
    /backend   - Node.js + Express
  /packages
    /shared    - Shared TypeScript types and utilities
  ```

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5.4.21
- **Styling**: Tailwind CSS (utility-first)
- **Routing**: React Router v7.11.0
- **TypeScript**: Strict mode with `verbatimModuleSyntax`
- **Module System**: ESNext

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **TypeScript**: NodeNext module system
- **Port**: 5000

### Shared Package
- **Purpose**: Common TypeScript types, utilities, constants
- **Module System**: ESNext
- **Exports**: User, License, Bundle, PhoneNumber types, and more

## Key TypeScript Configuration

### Critical Setting
- **`verbatimModuleSyntax: true`** - Requires strict separation of type and value imports
- **Pattern**:
  ```typescript
  import { useState } from 'react'  // value import
  import type { User } from '@ucaas/shared'  // type-only import
  ```

### Build Commands
```bash
pnpm build              # Build all packages
pnpm dev               # Start all dev servers in parallel
pnpm --filter @ucaas/shared build  # Build shared package only
```

## Data Model

### Core Entities

#### User
```typescript
type UserRole = 'customer_admin' | 'manager' | 'user'
type UserStatus = 'active' | 'suspended' | 'invited' | 'inactive'

interface User {
  id: string
  customerId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  status: UserStatus
  preferences: NotificationPreferences
  employeeId?: string
  department?: string
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
}
```

#### License
```typescript
type LicenseStatus = 'active' | 'suspended' | 'unassigned' | 'expired'

interface License {
  id: string
  customerId: string
  bundleId: string
  tierId: string
  userId?: string
  status: LicenseStatus
  bundleName?: string
  tierName?: string
  activatedAt?: Date
  expiresAt?: Date
}
```

#### Bundle & Tiers
- **Bundles**: Mobile Professional, PBX Basic, etc.
- **Tiers**: Free, Pro, Premium, Basic, Advanced
- **Capabilities**: Feature flags, quotas, settings
- **Pricing**: Monthly fee, setup fee, currency

#### Phone Number
```typescript
type PhoneNumberType = 'mobile' | 'geographic' | 'toll-free' | 'national' | 'premium'
type PhoneNumberStatus = 'active' | 'reserved' | 'pending' | 'porting' | 'cancelled'
type AssignmentType = 'user' | 'pbx' | 'ivr' | 'unassigned'

interface PhoneNumber {
  id: string
  customerId: string
  number: string
  type: PhoneNumberType
  status: PhoneNumberStatus
  country: string
  region?: string
  assignmentType: AssignmentType
  assignedToId?: string
  assignedToName?: string
  monthlyFee: number
  currency: string
  purchasedAt?: Date
  activatedAt?: Date
  portingRequestId?: string
}
```

#### Porting Request
```typescript
type PortingStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

interface PortingRequest {
  id: string
  customerId: string
  phoneNumber: string
  currentProvider: string
  accountNumber: string
  pin?: string
  status: PortingStatus
  requestedDate: Date
  scheduledDate?: Date
  completedDate?: Date
  rejectionReason?: string
  documents?: string[]
}
```

## Component Library

### Location
`/apps/frontend/src/components/ui/`

### Components
1. **Button** - Primary, secondary, danger, ghost variants; sm, md, lg sizes
2. **Input** - Text inputs with label, error states, forwardRef support
3. **Select** - Dropdown with label and options array
4. **Card** - Container with optional className
5. **Badge** - Success, warning, danger, info, gray variants; sm, md sizes
6. **Modal** - Overlay modal with size variants (sm, md, lg, xl)
7. **Table** - Generic table with Column<T> interface and custom render functions
8. **Pagination** - Page navigation component
9. **Dropdown** - Action menu dropdown

### Pattern: All form components use forwardRef
```typescript
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  // implementation
})
```

### Pattern: Type-only imports required
```typescript
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
```

## Implemented Pages

### 1. Dashboard (Landing Page)
**Route**: `/`
**File**: `apps/frontend/src/pages/Dashboard.tsx`

**Features**:
- Overview stat cards (Users, Licenses, Phone Numbers, System Health)
- Clickable cards that navigate to respective pages
- Recent activity feed with color-coded icons
- License distribution breakdown with progress bars
- Phone numbers by type visualization
- Mock data for all statistics

### 2. Users Page
**Route**: `/users`
**File**: `apps/frontend/src/pages/Users.tsx`

**Features**:
- Full CRUD functionality
- Search by name/email
- Filter by status (active, suspended, invited, inactive)
- Filter by role (customer_admin, manager, user)
- Sortable columns (name, email, role, status, last login)
- Pagination
- Dropdown actions menu (Edit, Reset Password, Delete)
- User modal for create/edit operations
- Mock data: 3 users

**Modal**: `apps/frontend/src/components/users/UserModal.tsx`
- Form validation (email, phone)
- Role selector with descriptions
- Notification preferences checkboxes

### 3. Licenses Page
**Route**: `/licenses`
**File**: `apps/frontend/src/pages/Licenses.tsx`

**Features**:
- Stats cards (Total, Active, Unassigned, Remaining)
- Grouped inventory view by bundle/tier
- Search by bundle or tier name
- Filter by status (all, active, unassigned, suspended, expired)
- Assign/Unassign functionality
- Purchase licenses workflow
- Mock data: 5 licenses

**Modals**:
- `PurchaseLicensesModal.tsx` - 3-step wizard:
  1. Select bundle (Mobile Professional, PBX Basic)
  2. Select tier with comparison table
  3. Confirm with quantity selector and pricing
- `AssignLicenseModal.tsx` - Assign license to user with search

### 4. Numbers Page
**Route**: `/numbers`
**File**: `apps/frontend/src/pages/Numbers.tsx`

**Features**:
- Stats cards (Total, Active, Reserved, Porting)
- Grouped inventory by number type (mobile, geographic, toll-free, etc.)
- Search by number/assignee/region
- Filter by status (active, reserved, pending, porting, cancelled)
- Filter by assignment type (user, pbx, ivr, unassigned)
- Assign/Reassign/Unassign functionality
- Purchase and Port-in workflows
- Mock data: 5 numbers

**Modals**:
- `PurchaseNumberModal.tsx` - 3-step wizard:
  1. Search criteria (country, type, region, pattern)
  2. Select from available numbers
  3. Confirm with pricing breakdown
- `PortInNumberModal.tsx` - 4-step wizard with progress indicator:
  1. Number details (phone number, country)
  2. Provider info (current provider, account number, PIN)
  3. Documents upload (simulated)
  4. Review and submit
- `AssignNumberModal.tsx` - Assign to User/PBX/IVR with visual type selector

### 5. PBX Page
**Route**: `/pbx`
**Status**: Coming Soon placeholder

### 6. IVR Page
**Route**: `/ivr`
**Status**: Coming Soon placeholder

## Navigation Structure

### App.tsx Layout
- **BrowserRouter** with nested Routes
- **Custom NavLink** component using `useLocation` for active state
- **Layout** component wrapping all routes
- Navigation bar with logo, links, notifications, user avatar

### Routes
```
/ → Dashboard
/users → Users
/licenses → Licenses
/numbers → Numbers
/pbx → Coming Soon
/ivr → Coming Soon
```

## Design Patterns

### State Management
- Local `useState` for component state
- No global state library (Redux, Zustand) yet
- Mock data defined as constants at top of each page

### Modal Pattern
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  // ... other props
}
```
- Controlled by parent component state
- Reset state in `useEffect` when closed
- Multi-step wizards track step state internally

### Table Pattern
```typescript
interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
  sortable?: boolean
}
```

### API Pattern (Not Implemented)
- Currently using mock data
- Defined API response types in shared package:
  - `ApiResponse<T>`
  - `ListResponse<T>`
  - `ErrorResponse`

## Styling Conventions

### Tailwind Classes
- **Colors**: blue (primary), green (success), yellow (warning), red (danger), gray (neutral)
- **Spacing**: p-6 for page padding, space-x-4 for horizontal spacing
- **Cards**: bg-white rounded-lg shadow-sm
- **Buttons**: rounded-lg with hover states
- **Responsive**: md: prefix for tablet, lg: for desktop

### Color Coding
- **Users**: Blue
- **Licenses**: Green
- **Numbers**: Purple
- **System/Health**: Blue gradient

## Common Issues & Solutions

### Issue 1: Module Export Errors
**Error**: "does not provide an export named 'X'"
**Solution**:
```bash
pnpm --filter @ucaas/shared build
rm -rf apps/frontend/node_modules/.vite
# Restart dev server
```

### Issue 2: Type Import Errors
**Error**: "'X' is a type and must be imported using a type-only import"
**Solution**: Use `import type { X }` for all type imports

### Issue 3: Build Failures
**Common causes**:
- Unused imports (remove them)
- Missing type-only imports
- Type/value import mixing

**Fix**: Check TypeScript errors and ensure proper import separation

## Mock Data Locations

All pages use mock data defined as constants:
- `mockUsers` in `Users.tsx`
- `mockLicenses` in `Licenses.tsx`
- `mockNumbers` in `Numbers.tsx`
- `mockBundles` in `PurchaseLicensesModal.tsx`
- `mockAvailableNumbers` in `PurchaseNumberModal.tsx`

## Build Process

### Development
```bash
pnpm dev  # Starts all services in parallel
```
- Frontend: http://localhost:3001
- Backend: http://localhost:5000

### Production Build
```bash
pnpm build  # Builds all packages recursively
```
- Shared package builds first (dependency)
- Backend and frontend build in parallel
- Output: `apps/frontend/dist/`

## Next Steps / TODO

### High Priority
1. Connect to real backend API (replace mock data)
2. Implement authentication & authorization
3. Build PBX page with extension management
4. Build IVR page with visual flow builder
5. Add form validation library (e.g., React Hook Form + Zod)

### Medium Priority
6. Add state management (consider Zustand or React Query)
7. Implement real-time updates (WebSockets/SSE)
8. Add error boundaries
9. Implement loading states
10. Add toast notifications

### Low Priority
11. Add unit tests (Vitest)
12. Add E2E tests (Playwright)
13. Implement dark mode
14. Add accessibility improvements (ARIA labels)
15. Optimize bundle size

## File Structure Reference

```
/Users/privat/repos/ucaas/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/           # Component library
│   │   │   │   ├── users/        # User-specific components
│   │   │   │   ├── licenses/     # License-specific components
│   │   │   │   └── numbers/      # Number-specific components
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── Licenses.tsx
│   │   │   │   └── Numbers.tsx
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── backend/
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   │   └── index.ts      # All shared types
│       │   ├── utils/
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── docs/
│   ├── DATA_MODEL.md             # Complete entity definitions
│   ├── USE_CASES.md              # User workflows and stories
│   └── WIREFRAMES.md             # Screen layouts and UI patterns
├── package.json                   # Root package.json
├── pnpm-workspace.yaml
├── tsconfig.json                  # Root TypeScript config with references
└── claude.md                      # This file
```

## Important Commands Reference

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                          # Start all dev servers
cd apps/frontend && pnpm dev      # Frontend only
cd apps/backend && pnpm dev       # Backend only

# Build
pnpm build                        # Build all packages
pnpm --filter @ucaas/shared build # Build shared only
pnpm --filter @ucaas/frontend build # Build frontend only

# Type checking
pnpm typecheck                    # Check all packages

# Linting & Formatting
pnpm lint                         # Lint all packages
pnpm format                       # Format all packages

# Add dependencies
cd apps/frontend && pnpm add package-name
cd apps/backend && pnpm add package-name
cd packages/shared && pnpm add package-name
```

## Git Workflow (Not Initialized Yet)

The repository is not currently a git repository. To initialize:

```bash
git init
git add .
git commit -m "Initial commit: Voxera UCaaS platform"
```

## Environment Variables (Not Configured Yet)

Future environment variables to configure:
- `VITE_API_URL` - Backend API URL for frontend
- `PORT` - Backend server port
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Authentication secret
- `NODE_ENV` - development/production

## Known Limitations

1. **No Authentication** - All pages are publicly accessible
2. **Mock Data Only** - No database or API integration
3. **No Validation** - Form validation is basic (email format only)
4. **No Error Handling** - No try/catch blocks or error boundaries
5. **No Loading States** - Instant updates (no spinners/skeletons)
6. **No Optimistic Updates** - Could improve UX
7. **No Persistence** - Data resets on page reload
8. **No Real-time Updates** - Manual refresh required

## Performance Considerations

- Bundle size: ~263 KB gzipped (good for current scope)
- No code splitting yet (could add lazy loading for routes)
- No image optimization
- No CDN setup
- Vite provides fast HMR in development

## Accessibility Notes

- Basic semantic HTML used
- No ARIA labels yet
- Keyboard navigation not fully tested
- No screen reader optimization
- Color contrast should be verified

## Browser Support

Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features used
- No IE11 support needed
- CSS Grid and Flexbox used extensively

---

**Last Updated**: 2026-01-03
**Version**: 1.0.0
**Status**: Active Development
