# Lead Management System - Architecture & Component Interactions

## System Architecture Overview

The Lead Management System is a modern web application built with Next.js, featuring a responsive UI optimized for all device sizes. It implements a client-server architecture with a clear separation of concerns and resilient integration with Supabase.

### Core Technologies

- **Frontend**: Next.js 13.4 with App Router
- **UI**: React 18 with Material UI components and Tailwind CSS
- **State Management**: Redux Toolkit
- **Form Handling**: JSON Forms
- **Authentication**: NextAuth.js
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
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
│   ├── AdminPage
│   │   ├── AuthCheck
│   │   ├── LeadTable
│   │   │   └── LeadTableRow
│   │   ├── FilterControls
│   │   └── Pagination
│   │
│   └── API Routes
       ├── Assessment
       ├── Leads
       └── Authentication
```

## Key Components

### 1. Provider Layer

The application uses providers to manage authentication and state:

- **SessionProvider**: Client component that wraps the application with NextAuth's authentication context
- **ReduxProvider**: Provides global state management via Redux store

```typescript
// SessionProvider implementation
export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// ReduxProvider implementation
export function ReduxProvider({ children }: ReduxProviderProps): React.ReactElement {
  return <Provider store={store}>{children}</Provider>;
}
```

### 2. Authentication System

- **AuthCheck**: Guards routes requiring authentication
- **SessionProvider**: Manages user session state
- **NextAuth Integration**: Handles login, session management, and user data
- **JWT Extensions**: Custom fields for role-based access

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
- **Optimistic Updates**: Immediate UI responses with backend confirmation

```typescript
// Lead slice handles async operations with FormData
export const submitLead = createAsyncThunk(
  'leads/submitLead',
  async (leadData: FormData) => {
    return await leadService.submitLead(leadData);
  }
);
```

### 5. Database Integration

- **Supabase Client**: Configured with resilience patterns
- **Null Safety**: Graceful handling of missing client during build
- **Connection Pooling**: Efficient database connection management
- **Error Handling**: Comprehensive error states with fallbacks

```typescript
// Resilient Supabase client initialization
let supabase: ReturnType<typeof createClient> | null = null;

// Only create the client when environment variables are available
if (typeof window !== 'undefined' || (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
  
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
}
```

## Data Flow

1. **Form Submission**:
   - User enters data in SchemaForm
   - Form validates input against JSON Schema
   - On submit, data flows to Redux via dispatch action
   - Redux thunk creates FormData and calls API service
   - API uploads files to Supabase Storage and stores metadata in database
   - Response updates Redux state with new lead information

2. **Authentication Flow**:
   - NextAuth handles credential verification
   - JWT tokens include custom claims (role, id)
   - Session state stored with appropriate security
   - Protected routes check session and role via AuthCheck
   - Unauthenticated users redirected to login

3. **Admin Data Flow**:
   - Fetch leads from Supabase on admin dashboard load
   - Redux manages sorting, filtering, and pagination locally
   - Status updates sent to Supabase with optimistic UI updates
   - Real-time feedback on all operations

4. **Resilience Patterns**:
   - API routes check Supabase client availability
   - Graceful degradation when services unavailable
   - Comprehensive error handling at all levels
   - Build-time safety for environment variables

## Type System

The application uses TypeScript throughout with strong typing patterns:

- **Domain Models**: Interfaces define data structures (Lead, VisaType)
- **Branded Types**: For type-safe identifiers
- **Union Types**: For enumerated values like LeadStatus
- **Type Guards**: Ensure type safety in conditional logic
- **Extended Type Declarations**: For NextAuth session and JWT

```typescript
// Type definitions for domain entities
export enum LeadStatus {
  PENDING = 'PENDING',
  REACHED_OUT = 'REACHED_OUT'
}

export type VisaType = typeof visaTypes[number];

export interface Lead {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  // Additional fields...
  status: LeadStatus;
}
```

## API Integration

- **Service Layer**: Abstracts Supabase operations
- **API Routes**: Next.js route handlers with proper validation
- **Redux Thunks**: Handle asynchronous operations with proper types
- **Error Handling**: Centralized error management with status codes
- **Null Safety**: Guards against missing Supabase client

## File Storage Architecture

- **Supabase Storage**: Secure file storage solution
- **File Upload**: Multi-part form data handling
- **File Validation**: Type, size, and content restrictions
- **File Naming**: Consistent naming with UUID-based paths
- **Public URLs**: Secure URL generation for stored files

## Deployment Architecture

- **Vercel Platform**: Primary deployment target
- **Environment Variables**: Runtime injection of secrets
- **Build Resilience**: No failures during build when variables missing
- **Edge Functions**: API routes deployed as edge functions
- **Static Optimization**: Pre-rendered pages where possible

## Security Considerations

- **Authentication**: NextAuth.js with secure JWT handling
- **Database Security**: Row-level security in Supabase
- **Form Validation**: Schema-based validation prevents invalid data
- **Type Safety**: TypeScript prevents many common vulnerabilities
- **Session Management**: Secure handling of user sessions
- **File Validation**: Strict checks on uploaded files
- **Error Handling**: Non-revealing error messages 