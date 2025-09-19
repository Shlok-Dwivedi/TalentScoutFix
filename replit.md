# Overview

TalentScout is a full-stack video management application designed for talent scouting and audition management. The application provides a comprehensive dashboard for uploading, managing, and analyzing video content with integrated database management and storage analytics. It's built as a modern web application with a React frontend and Express.js backend, featuring real-time video processing capabilities and robust file management systems.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component development
- **Routing**: Wouter for lightweight client-side routing with a single-page application approach
- **State Management**: TanStack React Query for server state management, caching, and synchronization
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Build Tool**: Vite for fast development and optimized production builds with hot module replacement

## Backend Architecture  
- **Framework**: Express.js with TypeScript running on Node.js for RESTful API services
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations and schema management
- **File Upload**: Multer middleware for handling video file uploads with size and type validation
- **Session Management**: Express sessions with PostgreSQL session storage for user authentication
- **Development Setup**: Custom Vite integration for seamless full-stack development experience

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting for scalable data persistence
- **Schema Management**: Drizzle Kit for database migrations and schema versioning
- **File Storage**: Local file system storage with configurable upload directory and size limits
- **Session Storage**: PostgreSQL-backed session management using connect-pg-simple

## Authentication and Authorization
- **User Management**: Database-driven user accounts with username/password authentication
- **Session Handling**: Server-side session management with secure cookie-based authentication
- **Default Access**: Pre-configured admin user for initial system access and testing

## External Dependencies
- **Database**: Neon PostgreSQL serverless database for production-ready data storage
- **UI Components**: Radix UI ecosystem for accessible, unstyled component primitives
- **Styling**: Tailwind CSS with custom design tokens and responsive design system
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Development Tools**: Replit-specific plugins for enhanced development experience and error handling