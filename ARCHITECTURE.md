# Lead Management System - Architecture & Component Interactions

## System Architecture Overview

The Lead Management System is a modern web application built with Next.js, featuring a responsive UI optimized for all device sizes. It follows a client-server architecture with a clear separation of concerns.

### Core Technologies

- **Frontend**: Next.js 13.4 with App Router
- **UI**: React with Material UI components and Tailwind CSS
- **State Management**: Redux Toolkit
- **Form Handling**: JSON Forms
- **Authentication**: NextAuth.js
- **Typing**: TypeScript

## Component Hierarchy

```
├── App (RootLayout)
│   ├── Providers (Authentication & State)
│   │   ├── SessionProvider
│   │   └── ReduxProvider
│   │
│   ├── SubmissionPage
│   │   ├── Header
│   │   ├── SchemaForm
│   │   │   └── JsonForms
│   │   └── Footer
│   │
│   └── AuthCheck
│       └── Protected Routes
```

## Key Components

### 1. Provider Layer

The application uses a nested provider pattern to manage authentication and state:

- **SessionProvider**: Client component that wraps the application with NextAuth's authentication context
- **ReduxProvider**: Provides global state management via Redux store

```typescript
// Provider component combining authentication and state
export function Providers({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session | null | undefined;
}): React.ReactElement {
  return (
    <SessionProvider session={session}>
      <ReduxProvider>
        {children}
      </ReduxProvider>
    </SessionProvider>
  );
}
```

### 2. Authentication System

- **AuthCheck**: Guards routes requiring authentication
- **SessionProvider**: Manages user session state
- **NextAuth Integration**: Handles login, session management, and user data

### 3. Form System

- **SchemaForm**: Core component for rendering dynamic forms
- **JSON Schema**: Defines form structure, validation rules, and data types
- **UI Schema**: Controls layout and presentation of form elements
- **Responsive Design**: Automatically adapts to different screen sizes

```typescript
// SchemaForm adapts to screen size dynamically
useEffect(() => {
  if (isMobile) {
    // Convert horizontal layouts to vertical on mobile
    const adaptMobileLayout = (schema: UISchemaElement): UISchemaElement => {
      // Layout adaptation logic
    };
    
    setAdaptedUiSchema(adaptMobileLayout(uiSchema));
  } else {
    setAdaptedUiSchema(uiSchema);
  }
}, [isMobile, uiSchema]);
```

### 4. State Management

- **Redux Toolkit**: Manages global application state
- **Slices**: Modular state divided by domain (leads, auth, etc.)
- **Thunks**: Handle asynchronous operations with API

```typescript
// Lead slice handles async operations
export const submitLead = createAsyncThunk(
  'leads/submitLead',
  async (leadData: Record<string, unknown>) => {
    return await leadService.submitLead(leadData);
  }
);
```

## Data Flow

1. **Form Submission**:
   - User enters data in SchemaForm
   - Form validates input against JSON Schema
   - On submit, data flows to Redux via dispatch action
   - Redux thunk calls API service
   - API returns result which updates Redux state

2. **Authentication Flow**:
   - NextAuth handles authentication
   - Session state stored in SessionProvider
   - Protected routes check session via AuthCheck
   - Unauthenticated users redirected to login

3. **Responsive Adaptation**:
   - Media queries detect device size
   - Layout components adjust based on viewport
   - Form layouts transform for optimal UX on each device

## Type System

The application uses TypeScript throughout with strong typing patterns:

- **Domain Models**: Interfaces define data structures (LeadData, VisaType)
- **Generic Types**: Used for reusable components
- **Union Types**: For enumerated values
- **Type Guards**: Ensure type safety in conditional logic

```typescript
// Type definitions for domain entities
export type VisaType = 'H-1B' | 'L-1' | 'O-1' | 'EB-1' | 'EB-2 NIW' | 'EB-2 PERM' | 'EB-3';

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  // Other fields...
}
```

## API Integration

- **Service Layer**: Abstracts API calls from components
- **Redux Thunks**: Handle asynchronous operations
- **Error Handling**: Centralized error management
- **Type Safety**: Ensure API contract adherence

## Responsiveness Strategy

- **Mobile-First Approach**: Base styles for mobile, enhanced for larger screens
- **Adaptive Layouts**: Forms adjust column count based on screen width
- **Touch Optimization**: Larger hit targets on mobile devices
- **Viewport Settings**: Proper configuration for all devices
- **Media Queries**: Tailwind breakpoints for consistent responsive design

## Security Considerations

- **Authentication**: NextAuth.js for secure authentication
- **Form Validation**: Schema-based validation prevents invalid data
- **Type Safety**: TypeScript prevents many common vulnerabilities
- **Session Management**: Secure handling of user sessions 