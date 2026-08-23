# Project Task Management System

A collaborative platform for managing projects and tasks, enabling efficient workflow between administrators, project managers, and team members.

Generated using **CoreCraft**.

## Technology Stack

- MongoDB
- Express.js
- React
- Node.js
- Mongoose
- JWT Authentication

## Application Roles

- administrator
- project manager
- team member

## Business Entities

- Project
  - title (String)
  - description (String)
  - manager (ObjectId)
  - createdAt (Date)
  - dueDate (Date)
- Task
  - title (String)
  - priority (String)
  - status (String)
  - project (ObjectId)
  - assignedTo (ObjectId)

## Generated Pages

- Dashboard - /dashboard
- Projects - /projects
- Tasks - /tasks
- Users - /users
- Login - /login

## API Modules

- Project API: create, read, update, delete
- Task API: create, read, update, delete
- User API: create, read, update, delete

## Generated Features

- userManagement
- projectManagement
- taskManagement
- roleBasedAccess
- dashboard
- modernUI

## Project Structure

```text
Client/
  src/
    Components/
    Context/
    Layouts/
    Pages/
    Routes/
    Services/
    Utils/

Server/
  Src/
    Config/
    Controllers/
    Middleware/
    Models/
    Routes/
    Utils/

README.md
```

## Authentication

The application includes JWT-based authentication and protected routes.

Role-based access rules are generated from the CoreCraft application specification.

## Backend Setup

```bash
cd Server
npm install
```

The generated `.env` file contains local development defaults, so you can run the backend immediately:

```bash
npm run dev
```

Default backend address:

```text
http://localhost:5001
```

## Frontend Setup

Open another terminal:

```bash
cd Client
npm install
npm run dev
```

Default frontend address:

```text
http://localhost:5173
```

## Generated Capabilities

CoreCraft may generate:

- database models
- REST API controllers
- API routes
- authentication
- role-based authorization
- CRUD interfaces
- relationship lookups
- dashboards
- navigation
- dynamic UI styling
- AI-designed authentication interfaces
- educational source-code comments

## Development Note

This project is generated as a development-ready MERN starter application.

Before production use, review security, environment configuration, validation, deployment settings, and application-specific requirements.

The included `.env` values are intended for local development only.

Change `JWT_SECRET` and database configuration before deployment.


---

Generated with CoreCraft.
