# HYDRASPARK_HERCULES

## Project Overview

HYDRASPARK_HERCULES is a modern web application, initially built with Next.js and Convex, now undergoing a comprehensive migration to Supabase. This project aims to provide a robust and scalable platform, leveraging the power of PostgreSQL, Supabase Edge Functions, and Supabase Realtime for its backend, alongside a React-based frontend.

## Current Status: Supabase Migration in Progress

This repository reflects the project in an active state of migration from Convex to Supabase. A detailed audit report and migration plan have been generated to guide this transition. The key areas of migration include:

-   **Database Schema**: Translation from Convex's document-oriented database to a relational PostgreSQL schema within Supabase.
-   **Backend Logic**: Conversion of Convex mutations and actions into Supabase Edge Functions.
-   **Frontend Adaptation**: Updating data fetching, mutations, and real-time subscriptions to utilize the Supabase client library and custom hooks.
-   **Authentication**: Re-implementation of authentication using Supabase Auth.

## Key Features (Post-Migration)

-   **Scalable Backend**: Powered by Supabase PostgreSQL for robust data storage.
-   **Real-time Capabilities**: Leveraging Supabase Realtime for instant updates and interactive user experiences.
-   **Serverless Functions**: Efficient backend logic handled by Supabase Edge Functions.
-   **Modern Frontend**: Built with Next.js, React, and TailwindCSS for a responsive and dynamic user interface.
-   **Comprehensive Authentication**: Secure user management with Supabase Auth.
-   **Deployment Ready**: Includes CI/CD pipelines and environment variable management for streamlined deployment.

## Technologies Used

### Frontend

-   **Next.js**: React framework for production.
-   **React**: JavaScript library for building user interfaces.
-   **TypeScript**: Strongly typed JavaScript.
-   **TailwindCSS**: Utility-first CSS framework.
-   **Shadcn UI**: Reusable UI components.

### Backend & Database

-   **Supabase**: Open-source Firebase alternative providing:
    -   **PostgreSQL**: Relational database.
    -   **Supabase Edge Functions**: Serverless functions (Deno).
    -   **Supabase Realtime**: Real-time data synchronization.
    -   **Supabase Auth**: Authentication and user management.

### Development Tools

-   **npm/yarn**: Package managers.
-   **Git**: Version control.
-   **Supabase CLI**: Command-line interface for Supabase.
-   **Vitest**: Unit testing framework.
-   **Cypress**: End-to-end testing framework.

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

Ensure you have the following installed:

-   Node.js 20.x or higher
-   npm or yarn package manager
-   Docker (for local Supabase setup)
-   Git
-   Supabase CLI (`npm install -g supabase`)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/C-Jay69/HYDRASPARK_HERCULES.git
    cd HYDRASPARK_HERCULES
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or yarn install
    ```

3.  **Setup Supabase Locally:**

    Initialize Supabase in your project:

    ```bash
    supabase init
    ```

    Start the Supabase local development environment:

    ```bash
    supabase start
    ```

4.  **Create Environment Variables:**

    Copy the example environment file and update it with your local Supabase credentials. Refer to `.env.example` for required variables.

    ```bash
    cp .env.example .env.local
    ```

5.  **Run Database Migrations:**

    Apply the schema migrations to your local Supabase instance:

    ```bash
    supabase db push
    ```

6.  **Start the Development Server:**

    ```bash
    npm run dev
    # or yarn dev
    ```

    The application will be available at `http://localhost:3000`.

## Project Structure

```
HYDRASPARK_HERCULES/
├── .github/                       # GitHub Actions workflows
├── convex/                        # (Legacy) Convex backend files
├── prisma/                        # Prisma schema (for reference, not actively used post-migration)
├── public/                        # Static assets
├── src/                           # Frontend source code
│   ├── app/                       # Next.js app directory
│   ├── components/                # Reusable React components
│   │   └── providers/             # Supabase Auth Provider
│   ├── hooks/                     # Custom React hooks (e.g., useSupabaseQuery, usePresence)
│   ├── lib/                       # Utility functions (e.g., supabase client)
│   └── pages/                     # Next.js pages
├── supabase/                      # Supabase configuration, migrations, and Edge Functions
│   ├── config.toml                # Supabase local configuration
│   ├── migrations/                # SQL migration files
│   └── functions/                 # Supabase Edge Functions
├── .env.example                   # Example environment variables
├── HYDRASPARK_HERCULES_Audit_Report.md # Original audit report
├── migration_plan.md              # Detailed plan for Supabase migration
├── SUPABASE_MIGRATION.md          # Comprehensive guide to Supabase migration
├── DEPLOYMENT_GUIDE.md            # Deployment instructions
├── BACKEND_MIGRATION_GUIDE.md     # Guide for backend logic migration
├── FRONTEND_MIGRATION_GUIDE.md    # Guide for frontend adaptation
├── PACKAGE_JSON_UPDATES.md        # Instructions for updating package.json
├── TESTING_GUIDE.md               # Comprehensive testing strategies
├── SECURITY_AUDIT.md              # Security audit framework
├── MONITORING_LOGGING.md          # Monitoring and logging setup guide
└── README.md                      # This file
```

## Contributing

Contributions are welcome! Please refer to the `CONTRIBUTING.md` (if available) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact

For any questions or inquiries, please open an issue on GitHub.
