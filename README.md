# alma-lead-management

A modern lead management system built with Next.js, Tailwind CSS, Redux Toolkit, and Supabase. This application supports lead intake, role-based dashboards, and real-time state management.

## 🌐 Live Demo
https://alma-lead-management-zgnb.vercel.app/

## 🚀 Tech Stack
- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS 3
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form + Zod
- **Backend-as-a-Service**: Supabase
- **Authentication**: NextAuth.js
- **Testing**: Jest + React Testing Library

## 📂 Project Structure
```
├── app/                 # Next.js app router components
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utility libraries
│   ├── services/        # External service connections
│   ├── store/           # Redux slices and store
│   ├── utils/           # Utility functions
├── public/              # Static files
├── .env.local           # Environment configuration
```

## 🔧 Setup Instructions
```bash
# 1. Clone the repository
$ git clone https://github.com/your-username/alma-lead-management.git

# 2. Navigate to the project folder
$ cd alma-lead-management

# 3. Install dependencies
$ npm install

# 4. Set up your environment variables
$ cp .env.example .env.local
# Fill in SUPABASE_URL and SUPABASE_ANON_KEY

# 5. Run the development server
$ npm run dev
```

## ✅ Features
- Lead intake form with validation
- Real-time lead submission and tracking
- Admin dashboard with role-based visibility
- Redux-powered state updates
- Tailwind-styled responsive UI
- File upload support
- Visa type selection and tracking

## 📦 Deployment
This app is optimized for Vercel deployment. Ensure environment variables are added in the Vercel dashboard.

## 🔐 Environment Variables
Create a `.env.local` file:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## 🧪 Testing
```bash
# Run all tests
npm run test

# Generate test coverage report
npm run test:coverage
```
Unit tests are written using **Jest** and **React Testing Library**.

## 🧑‍💻 Contributing
Pull requests are welcome. Please open an issue first for major changes.

## 📄 License
[MIT](LICENSE)

## 🙌 Acknowledgments
- Supabase team
- React Hook Form
- Tailwind Labs
- Next.js contributors 
