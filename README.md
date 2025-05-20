# Lead Management Application

A modern, responsive application built with Next.js for immigration case assessment and lead management. The system allows potential clients to submit their information, which administrators can then review, manage, and track.

## 🚀 Key Features

- **Public Assessment Form**: User-friendly form for lead submission with file upload capability
- **Admin Dashboard**: Comprehensive lead management interface
- **Authentication**: Secure login with role-based access
- **Schema-Driven UI**: Dynamic forms powered by JsonForms
- **Advanced Lead Management**:
  - Sorting (by name, date, status, country)
  - Filtering by status
  - Full-text search
  - Pagination
- **Data Export**: CSV export functionality
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Instant feedback on actions
- **Database Integration**: Supabase for data persistence

## 🏗️ Technical Architecture

### Frontend

- **Framework**: Next.js 13+ with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Forms**: 
  - Schema-driven forms using JsonForms
  - React Hook Form with Zod validation
- **State Management**: Redux Toolkit with RTK Query

### Backend

- **API Routes**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Type Safety**: TypeScript throughout

## 📚 Schema-Driven UI Implementation

This application leverages [JsonForms](https://jsonforms.io/) to create dynamic, schema-driven forms:

- **Separation of Concerns**: UI structure and data model are defined separately
- **Declarative Form Definition**: Forms defined through JSON Schema
- **Automatic Validation**: Built-in validation based on schema
- **Responsive Layouts**: Automatically adapts to screen sizes

### Schema Components

- `app/schemas/leadSchema.ts`: Schema and UI schema definitions
- `app/components/SchemaForm.tsx`: Reusable schema-based form component

## 🔄 State Management with Redux

The application implements a comprehensive Redux state management system:

- **Store Structure**: State organized by domain (leads, auth, etc.)
- **Async Operations**: API interactions handled via thunks
- **Type Safety**: Fully typed state and actions
- **Optimistic Updates**: Immediate UI updates with backend confirmation

## 🔐 Authentication & Security

- **Protected Routes**: Admin routes secured with authentication
- **Role-Based Access**: Different permissions for different user roles
- **JWT-Based Auth**: Secure token management
- **Form Validation**: Extensive input validation
- **File Validation**: Type and size restrictions for uploaded files

## 📊 Database Integration with Supabase

The application utilizes Supabase for data storage and management:

- **PostgreSQL Database**: For structured data storage
- **Supabase Storage**: For file uploads
- **Real-time Capabilities**: For immediate updates
- **Row-Level Security**: For data protection

### Resilient Implementation

- **Graceful Degradation**: Handles cases when Supabase is unavailable
- **Null Safety**: Checks for null clients during build process
- **Error Handling**: Comprehensive error states for all operations

## 🚀 Deployment

### Environment Variables

The following environment variables need to be set in your deployment environment:

```
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=your_deployment_url

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in Vercel's dashboard
3. Deploy the application

**Important**: The application handles missing environment variables during the build process, ensuring successful builds even when environment variables will only be available at runtime.

## 💻 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with the required variables.

4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view the application

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🧩 Project Structure

```
app/
├── api/                   # API routes
│   ├── assessment/        # Lead submission endpoint
│   ├── auth/              # Authentication endpoints
│   └── leads/             # Lead management endpoints
├── components/            # Reusable components
├── lib/                   # Utilities and helper functions
├── schemas/               # JSON schemas for forms
├── services/              # Service layer for API interactions
│   └── supabaseClient.ts  # Supabase client configuration
├── store/                 # Redux store setup
└── types/                 # TypeScript type definitions
```

## 🔍 Features in Detail

### Lead Submission Form

The form collects essential information from potential clients:
- Personal details
- Contact information
- Visa preferences
- Work experience
- Educational background
- Resume upload

### Admin Dashboard

Administrators can:
- View a comprehensive list of leads
- Sort and filter leads
- Search for specific leads
- View detailed lead information
- Update lead status
- Export lead data to CSV
- Manage the complete lead lifecycle

### Authentication

The application uses NextAuth.js for authentication:
- Credential-based login
- Secure session management
- Role-based authorization

## 🔮 Future Enhancements

- **Email Notifications**: Automated emails for new leads and status changes
- **Advanced Analytics**: Dashboards with lead conversion metrics
- **Multi-language Support**: Internationalization for global reach
- **Calendar Integration**: Scheduling appointments with leads
- **Document Management**: Additional document types and management
- **Custom Workflows**: Configurable lead processing workflows

## 👨‍💻 Admin Access

For demonstration purposes, you can access the admin dashboard with:

- **Email**: admin@alma.com
- **Password**: password123

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
