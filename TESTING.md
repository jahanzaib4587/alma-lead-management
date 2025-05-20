# Testing Strategy

This document outlines the testing approach for the Lead Management application.

## Testing Framework

The application uses the following testing tools:

- **Jest**: As the main test runner and assertion library
- **React Testing Library**: For testing React components
- **Jest Mock**: For mocking dependencies and services

## Test Structure

Tests are organized by feature and component type:

### 1. Redux Store Tests

Located in: `app/store/leadSlice.test.ts`

These tests verify the Redux store functionality, including:
- Initial state
- Reducers (action handlers)
- Async thunks
- Selector functions

### 2. Component Tests

Located in:
- `app/components/SchemaForm.test.tsx`: Tests for the form component
- `app/admin/page.test.tsx`: Tests for the admin dashboard component
- `app/page.test.tsx`: Tests for the main submission page component

Component tests verify:
- Rendering of UI elements
- Component interactions (clicks, form submissions)
- State updates in response to user actions
- Integration with Redux store

### 3. Service Tests

Located in: `app/services/api.test.ts`

These tests verify the API service functions:
- CRUD operations on leads
- Error handling
- Data transformation

## Testing Approach

Our testing approach follows these principles:

1. **Isolated Tests**: Each test focuses on a specific piece of functionality
2. **Mocking Dependencies**: External dependencies are mocked to isolate the test subject
3. **User-Centric Testing**: Tests simulate real user interactions
4. **Comprehensive Coverage**: We aim for high test coverage on critical application paths

## Running Tests

To run tests, use the following npm scripts:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

## Test Coverage

The test suite covers the following key areas:

- **Lead Submission**: Tests the entire lead submission flow from form to API
- **Admin Dashboard**: Tests filtering, sorting, and managing leads
- **State Management**: Tests Redux state updates and data flow
- **API Services**: Tests all CRUD operations on leads

## Continuous Integration

Tests are automatically run in the CI pipeline for:
- Pull requests to main branch
- Deployments to production

## Adding New Tests

When adding new features, please follow these guidelines:

1. Create test files alongside the components they test
2. Mock external dependencies to keep tests focused
3. Test from a user's perspective (clicking buttons, filling forms)
4. Verify that Redux state is updated correctly
5. Test error states and edge cases 