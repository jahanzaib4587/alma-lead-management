# Lead Management Application

This is a Next.js application for managing leads in an immigration case assessment process.

## Features

- Public-facing lead submission form with JSON Schema validation
- Admin dashboard for lead management
- Authentication for admin access
- Schema-driven UI using JsonForms
- Sorting, filtering, and pagination of leads
- CSV export functionality

## Schema-Driven UI Implementation

This application uses [JsonForms](https://jsonforms.io/) to create a dynamic, schema-driven UI for the lead submission form. This approach offers several benefits:

1. **Separation of UI and Data**: The form's structure is defined in a JSON schema, separate from the UI rendering logic.
2. **Declarative Form Definition**: Forms are defined using a simple JSON schema and UI schema.
3. **Automatic Validation**: JsonForms handles validation based on the schema rules.
4. **Dynamic UI Generation**: UI is generated based on the schema, making it easy to update form fields.

### Implementation Details

The schema-driven UI is implemented using:

- `@jsonforms/core`: Core JsonForms library
- `@jsonforms/react`: React bindings for JsonForms
- `@jsonforms/material-renderers`: Material UI renderers for JsonForms

### Key Components

- `leadSchema.ts`: Defines the JSON schema and UI schema for the lead form
- `SchemaForm.tsx`: A reusable component that renders forms based on JSON schemas
- `page.tsx`: Implements the form using the schema-driven approach

### Schema Definition

The form schema is defined in `app/schemas/leadSchema.ts`:

```typescript
export const leadSchema: JsonSchema = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      minLength: 1
    },
    // Additional properties...
  },
  required: ['firstName', 'lastName', 'email', 'visasOfInterest']
};
```

The UI schema that controls how the form is rendered:

```typescript
export const leadUiSchema: UISchemaElement = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/firstName'
        },
        // Additional controls...
      ]
    },
    // Additional layout elements...
  ]
};
```

## Redux State Management

This application implements a centralized state management system using Redux Toolkit. The Redux implementation includes:

### Store Structure

- **Lead Slice**: Manages lead data including fetching, creating, updating, and deleting leads
- **Async Thunks**: Handles API interactions with proper loading states 
- **Selectors**: Type-safe hooks for accessing store data

### Key Components

- `leadSlice.ts`: The core Redux slice for lead management
- `store/index.ts`: The Redux store configuration
- `store/hooks.ts`: Type-safe hooks for React components
- `store/Provider.tsx`: The Redux provider component

### Data Flow

1. Components dispatch actions using `useAppDispatch`
2. Actions trigger API calls via thunks
3. Reducers update the state based on API responses
4. Components access the updated state via `useAppSelector`

### Benefits

- **Centralized Data**: All lead data is managed in a single place
- **Real-time Updates**: Changes in one component immediately reflect in others
- **Type Safety**: TypeScript integration ensures type safety throughout the application
- **Consistent Loading States**: Standardized loading states for better user experience
- **Predictable State Updates**: Redux's unidirectional data flow makes state changes predictable

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the application

## Usage

### Public Form

Visit the homepage to access the lead submission form. Fill out the required fields and submit.

### Admin Dashboard

Access the admin dashboard at `/admin`. You'll need to log in with valid credentials.

- View all leads
- Sort by various fields
- Filter by status
- Export leads to CSV
- View detailed lead information

## Tech Stack

- **Frontend Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios

## Deployment

The application can be deployed on Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Deploy with default settings

## Design Choices

### Architecture

- **App Router**: Leverages Next.js 13+ App Router for better performance and server components
- **API Routes**: Uses Next.js API routes to mock backend functionality
- **Mock Database**: Simulates database operations with in-memory storage
- **Service Layer**: Abstracts API calls through a service layer for better code organization

### UI/UX

- **Responsive Design**: Adapts to different screen sizes
- **Form Validation**: Provides immediate feedback for invalid inputs
- **Status Indicators**: Visual indicators for lead status
- **Search & Filter**: Quick access to relevant leads
- **Pagination**: Efficient navigation through large datasets

### Security

- **Authentication**: Protects admin routes with NextAuth.js
- **Role-Based Access**: Only authenticated users can access the admin dashboard
- **Secure Form Submissions**: Validates all inputs before processing
- **File Upload Validation**: Restricts file types and sizes

## Future Enhancements

- **Email Notifications**: Send automatic emails to new leads
- **Data Export**: Allow exporting lead data in various formats
- **Advanced Filtering**: More sophisticated search and filter options
- **Lead Notes**: Add the ability to attach notes to leads
- **Calendar Integration**: Schedule follow-up appointments with leads

## Admin Login Credentials

For demo purposes, you can use the following credentials to access the admin dashboard:

- **Email**: admin@alma.com
- **Password**: password123
