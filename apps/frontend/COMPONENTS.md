# Component Library Documentation

## Overview
This document describes the reusable UI component library built with React and Tailwind CSS for the Voxera UCaaS platform.

## Component Library Structure

```
src/components/
├── ui/                 # Base UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Pagination.tsx
│   ├── Dropdown.tsx
│   └── index.ts
└── users/              # Feature-specific components
    └── UserModal.tsx
```

## Base UI Components

### Button
A versatile button component with multiple variants and states.

**Props**:
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean - Shows loading spinner
- All standard button HTML attributes

**Usage**:
```tsx
import { Button } from '../components/ui'

<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

<Button variant="danger" size="sm" isLoading>
  Deleting...
</Button>
```

---

### Input
Text input with label, error messages, and helper text.

**Props**:
- `label`: string - Input label
- `error`: string - Error message to display
- `helperText`: string - Helper text below input
- All standard input HTML attributes

**Usage**:
```tsx
import { Input } from '../components/ui'

<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="We'll never share your email"
  required
/>
```

---

### Select
Dropdown select with label and error handling.

**Props**:
- `label`: string - Select label
- `error`: string - Error message
- `helperText`: string - Helper text
- `options`: SelectOption[] - Array of { value, label }
- `placeholder`: string - Placeholder option
- All standard select HTML attributes

**Usage**:
```tsx
import { Select } from '../components/ui'

<Select
  label="Role"
  value={role}
  onChange={(e) => setRole(e.target.value)}
  options={[
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ]}
  required
/>
```

---

### Card
Container component with header, body, and footer sections.

**Components**:
- `Card` - Main container
- `CardHeader` - Header section
- `CardBody` - Body section
- `CardFooter` - Footer section

**Usage**:
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui'

<Card>
  <CardHeader>
    <h2>User Profile</h2>
  </CardHeader>
  <CardBody>
    <p>Content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

---

### Badge
Status indicator badge with color variants.

**Props**:
- `variant`: 'success' | 'warning' | 'danger' | 'info' | 'gray' (default: 'gray')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')

**Usage**:
```tsx
import { Badge } from '../components/ui'

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
```

---

### Modal
Dialog/modal overlay with customizable size.

**Props**:
- `isOpen`: boolean - Controls visibility
- `onClose`: () => void - Close handler
- `title`: string - Modal title
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
- `children`: ReactNode - Modal content

**Features**:
- Closes on Escape key
- Closes on backdrop click
- Prevents body scroll when open
- Focus trap

**Usage**:
```tsx
import { Modal } from '../components/ui'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit User"
  size="lg"
>
  <form>
    {/* Form content */}
  </form>
</Modal>
```

---

### Table
Data table with sorting, loading, and empty states.

**Props**:
- `columns`: Column<T>[] - Column definitions
  - `key`: string - Data key
  - `header`: string - Column header
  - `sortable`: boolean - Enable sorting
  - `render`: (item) => ReactNode - Custom renderer
- `data`: T[] - Array of data items
- `onSort`: (key: string) => void - Sort handler
- `sortKey`: string - Current sort key
- `sortDirection`: 'asc' | 'desc' - Sort direction
- `isLoading`: boolean - Show loading state
- `emptyMessage`: string - Message when no data

**Usage**:
```tsx
import { Table } from '../components/ui'
import type { Column } from '../components/ui'

const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: (user) => `${user.firstName} ${user.lastName}`,
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
  },
]

<Table
  columns={columns}
  data={users}
  onSort={handleSort}
  sortKey="name"
  sortDirection="asc"
/>
```

---

### Pagination
Page navigation with responsive mobile/desktop layouts.

**Props**:
- `currentPage`: number - Current page (1-indexed)
- `totalPages`: number - Total number of pages
- `onPageChange`: (page: number) => void - Page change handler
- `totalItems`: number - Total items count (optional)
- `pageSize`: number - Items per page (optional)

**Features**:
- Smart page number display (shows ellipsis for large page counts)
- Always shows first and last page
- Shows pages around current page
- Responsive (different UI for mobile/desktop)

**Usage**:
```tsx
import { Pagination } from '../components/ui'

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
  totalItems={200}
  pageSize={20}
/>
```

---

### Dropdown
Dropdown menu with actions.

**Props**:
- `trigger`: ReactNode - Element that triggers dropdown
- `items`: DropdownItem[] - Menu items
  - `label`: string - Item label
  - `onClick`: () => void - Click handler
  - `icon`: ReactNode - Optional icon
  - `danger`: boolean - Danger styling
- `align`: 'left' | 'right' (default: 'right')

**Features**:
- Closes on outside click
- Closes on Escape key
- Accessible menu role

**Usage**:
```tsx
import { Dropdown } from '../components/ui'

<Dropdown
  trigger={<button>⋮</button>}
  items={[
    {
      label: 'Edit',
      onClick: handleEdit,
      icon: <EditIcon />,
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      danger: true,
      icon: <DeleteIcon />,
    },
  ]}
/>
```

---

## Feature Components

### UserModal
Modal for creating and editing users.

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `onSave`: (user: User) => void
- `user`: User | null - User to edit (null for create)

**Features**:
- Form validation
- Role descriptions
- Notification preferences
- Invitation email notice

**Usage**:
```tsx
import UserModal from '../components/users/UserModal'

<UserModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={handleSaveUser}
  user={editingUser}
/>
```

---

## Design System

### Colors
Based on Tailwind's color palette:
- **Primary**: Blue (blue-600)
- **Success**: Green (green-600)
- **Warning**: Yellow (yellow-500/orange-500)
- **Danger**: Red (red-600)
- **Gray**: Gray scale for UI elements

### Spacing
Using Tailwind's spacing scale (0.25rem increments)

### Typography
- Font family: System font stack (default Tailwind)
- Sizes: text-xs to text-3xl
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Shadows
- sm: Small shadow for cards
- md: Medium shadow for modals
- lg: Large shadow for dialogs
- xl: Extra large shadow for overlays

---

## Accessibility

All components follow accessibility best practices:
- Keyboard navigation support
- ARIA labels and roles
- Focus indicators
- Screen reader friendly
- Color contrast compliance (WCAG AA)

---

## Usage Patterns

### List View Pattern
Common pattern for listing data with filters and actions:

```tsx
<Card>
  <CardHeader>
    <h1>Items ({count})</h1>
    <Button onClick={handleAdd}>Add Item</Button>
  </CardHeader>

  <div className="filters">
    <Input placeholder="Search..." />
    <Select options={filterOptions} />
  </div>

  <Table columns={columns} data={data} />
  <Pagination {...paginationProps} />
</Card>
```

### Form Pattern
Standard form layout with validation:

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Create Item">
  <form onSubmit={handleSubmit}>
    <Input
      label="Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      error={errors.name}
      required
    />

    <Select
      label="Type"
      value={type}
      onChange={(e) => setType(e.target.value)}
      options={typeOptions}
    />

    <div className="flex justify-end space-x-3">
      <Button type="button" variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit">
        Save
      </Button>
    </div>
  </form>
</Modal>
```

---

## Extending Components

All components accept className prop for customization:

```tsx
<Button className="w-full">
  Full Width Button
</Button>

<Input className="max-w-xs" />
```

---

## Future Enhancements

Planned additions to the component library:
- Toast/notification system
- Tabs component
- Breadcrumb navigation
- Loading skeletons
- Empty state component
- Search with autocomplete
- Date picker
- File upload with progress
- Checkbox and radio components
- Switch/toggle component
- Tooltip component
- Progress bar
- Stepper/wizard component
