### 🏙️ TTA-Urban (Transparency, Traceability & Accountability Complaint System)

A digital platform ensuring transparency, traceability, and accountability in resolving urban civic issues.

### 📌 Overview

Urban Local Bodies (ULBs) often struggle with ineffective grievance redressal due to limited accessibility, lack of tracking mechanisms, and poor transparency. Citizens have no visibility into the status of their complaints, and officials lack tools for efficient monitoring and accountability.

This project introduces a technology-driven grievance redressal system that empowers citizens to report civic issues easily and enables municipal authorities to resolve problems efficiently with a complete traceable workflow.

The system uses modern web technologies to ensure:
✔ Transparency – real-time status updates and public dashboards
✔ Traceability – complete complaint lifecycle with timestamps & audit trails
✔ Accountability – role-based access, officer assignment, and SLA-based escalations

### 🎯 Project Objective

To build a smart, accessible, and accountable grievance redressal system that enhances urban governance by integrating digital tools, automation, and data-driven decision-making.

### 🚀 Key Features
## 👤 Citizen Interface

Submit grievances with photos, description, and location

Track complaint status in real-time

Receive notifications on updates and resolutions

Provide feedback and rate service quality

### 🏢 Officer & Department Dashboard

View and filter assigned complaints

Update complaint statuses across lifecycle stages

Upload resolution proofs

Manage escalations and workload

### 🛠️ Admin Panel

Role & user management

Assign departments and officers

Configure SLAs and escalation policies

View performance analytics and reports

### 📊 Public Dashboard

City-wide issue map

Complaint statistics by category/area

Resolution rate and SLA compliance

Transparency reporting

### 🔄 Complaint Lifecycle

Citizen submits → Verification → Assignment → In Progress → Resolved → Citizen Feedback → Closed

### 🧪 Features to be Developed (Issues)

Key tasks planned for development:

Complaint submission form

Complaint API (POST, GET, PATCH)

Officer dashboard

Assignment & workflow engine

Audit trail logging

Public transparency dashboard

Notifications (email/push)

Authentication + RBAC

Data analytics & reports

### 🔐 Security Considerations

Input validation for all user data

Secure JWT token handling

Rate limiting to prevent abuse

File upload sanitization

Privacy compliance (GDPR/local laws)

### 📈 Future Enhancements

AI for categorization & duplicate complaint detection

Chatbot for grievance submission

GIS-based infrastructure analytics

Multi-language support

Mobile app (React Native / Flutter)


🔀 Branch Naming Conventions
feature/<feature-name>
fix/<bug-name>
docs/<update-name>
chore/<task-name>

Examples:
- feature/complaint-form
- fix/map-error
- docs/readme-update
- chore/setup-config

📝 Pull Request Template (Add this file to repo)

Create:
.github/pull_request_template.md

Content:

## Summary
Briefly explain the purpose of this PR.

## Changes Made
- List important updates or fixes.

## Screenshots / Evidence
(Add UI images or logs if relevant)

## Checklist
- [ ] Code builds successfully
- [ ] Lint & tests pass
- [ ] No console errors or warnings
- [ ] Reviewed by a teammate
- [ ] Linked to corresponding issue

🔍 Code Review Checklist

Add this section in README:

### Code Review Checklist
- Code follows naming conventions
- Functionality tested locally
- No console errors or warnings
- ESLint + Prettier pass
- Comments and docs are clear
- No sensitive data in code
- Folder structure followed

🔐 Branch Protection Rules

Add this:

### Branch Protection Rules (GitHub)
- Require pull request before merging
- Require at least 1 reviewer
- Require all checks to pass (lint/test)
- Block direct pushes to main
- Require PRs to be up-to-date before merging

### 🔧 Tech Stack
## Frontend – Next.js

Next.js 14+ (App Router)

React 18

TailwindCSS for styling

Axios / Fetch API for API calls

NextAuth / JWT for Authentication

React Query / SWR for data fetching & caching

Leaflet / Mapbox for location & map integration

PWA Support (optional)

## Backend


Node.js + Express (or Next.js API Routes)

MongoDB / PostgreSQL

Mongoose / Prisma ORM

JWT Authentication

Cron Jobs for auto-escalation

Cloud Storage (Cloudinary / AWS S3) for images


### 🏙️ TTA‑Urban – Transparency, Traceability & Accountability Complaint System
A web-based grievance redressal platform that enables citizens to report civic issues and allows Urban Local Bodies (ULBs) to track, verify, and resolve them efficiently.
This project focuses on providing transparency, traceability, and accountability in urban governance.

### 📁 Folder Structure
your-project-name/
├── src/
│   ├── app/                # App Router pages & routes (Home, Login, Dashboard...)
│   ├── components/         # Reusable UI components (Navbar, Buttons, Cards)
│   ├── lib/                # Helpers, configs, utilities
│
├── public/                 # Static assets (images, icons)
├── .gitignore              # Node, build & env files ignored here
├── package.json            # Project dependencies & scripts
├── README.md               # Documentation


### ✔ What Each Folder Does
Folder	Purpose
src/app	Contains all page routes using the Next.js App Router architecture.
src/components	Holds reusable UI components for cleaner and modular code.
src/lib	Common utilities (API helpers, constants, configs).
public	Stores images, logos, and static files.


### ⚙️ Setup Instructions
🔧 1. Installation
Make sure Node.js is installed.

npx create-next-app@latest tta-urban --js
▶️ 2. Run Locally
npm install
npm run dev
Your app will run at:
👉 http://localhost:3000

### 📝 Reflection
This folder structure is chosen to:

🔹 Keep the project scalable
Separating components, routes, and utilities prevents clutter as features grow.

🔹 Make teamwork easier
Clear separation means multiple developers can work without conflicts.

🔹 Improve maintainability
A predictable layout makes debugging and updating faster.

🔹 Support future sprints
Upcoming features like dashboards, RBAC, SLAs, and public maps will integrate smoothly because the structure is modular.

![TTA-Urban](./ttaurban/public/assests/nextjs.png)

### 🧹 Code Quality Toolkit

- **Strict TypeScript:** `ttaurban/tsconfig.json` enables `strict`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames`, and `skipLibCheck`. These guard rails surface undefined access, dead code, and casing mistakes at compile time—reducing the odds of runtime regressions.
- **ESLint + Prettier:** `ttaurban/eslint.config.mjs` layers `next/core-web-vitals` with `eslint-plugin-prettier/recommended`. Custom rules (`no-console`, double quotes, required semicolons) keep logs out of production builds and prevent noisy diffs. `.prettierrc` mirrors the same formatting choices (double quotes, semicolons, trailing commas, platform-aware line endings) so contributors auto-format consistently.
- **Pre-commit Hooks:** Husky’s `.husky/pre-commit` runs `npm run lint-staged --prefix ttaurban`. `lint-staged` targets only staged JS/TS files, autopplies ESLint fixes, then runs Prettier. Commits are blocked until staged files pass, keeping the repository clean without manual policing.

#### Verifying Locally

```bash
cd ttaurban
npm run lint          # full ESLint run with strict rules
npm run lint-staged   # simulate the pre-commit pipeline
```

#### Lint Evidence

Recent terminal output after the configuration landed:

```bash
$ npm run lint

> ttaurban@0.1.0 lint
> eslint . --ext js,jsx,ts,tsx
```

![TTA-Urban](./ttaurban/public/assests/lint.png);

## 🐳 Docker Setup

This project uses Docker and Docker Compose to containerize the entire application stack—Next.js app, PostgreSQL database, and Redis cache—making it easy to run a consistent development environment across all machines.

### Services

#### 1. Next.js App (`app`)
- **Build context:** `./ttaurban`
- **Port:** `3000`
- **Environment variables:**
  - `DATABASE_URL`: PostgreSQL connection string
  - `REDIS_URL`: Redis connection string
- **Dependencies:** Waits for `db` and `redis` to be ready before starting

#### 2. PostgreSQL Database (`db`)
- **Image:** `postgres:15-alpine`
- **Port:** `5432`
- **Credentials:**
  - Username: `postgres`
  - Password: `password`
  - Database: `mydb`
- **Volume:** `db_data` persists database data across container restarts

#### 3. Redis Cache (`redis`)
- **Image:** `redis:7-alpine`
- **Port:** `6379`
- **Purpose:** Used for caching and session management

### Network & Volumes

- **Network:** `localnet` (bridge) connects all three services so they can communicate by service name
- **Volume:** `db_data` stores PostgreSQL data persistently

### Running the Stack

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode (background)
docker-compose up --build -d

# View running containers
docker ps

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Accessing Services

- **Next.js app:** http://localhost:3000
- **PostgreSQL:** `localhost:5432` (use any DB client with credentials above)
- **Redis:** `localhost:6379` (use Redis CLI or GUI tools)

### Dockerfile Breakdown

```dockerfile
FROM node:20-alpine          # Lightweight Node.js base image
WORKDIR /app                 # Set working directory inside container
COPY package*.json ./        # Copy dependency manifests
RUN npm install              # Install dependencies
COPY . .                     # Copy all project files
RUN npm run build            # Build Next.js production bundle
EXPOSE 3000                  # Document the app port
CMD ["npm", "run", "start"]  # Start the production server
```

### `.dockerignore`

Excludes unnecessary files from the Docker build context:
- `node_modules`, `.next`, `.git`
- Environment files (`.env*`)
- IDE configs, logs, test coverage

This speeds up builds and reduces image size.

### Troubleshooting

**Issue:** Build fails with "The default export is not a React Component"
- **Fix:** Ensure all page files in `app/` export a valid React component

**Issue:** Port conflicts (e.g., port 3000 already in use)
- **Fix:** Stop conflicting services or change the port mapping in `docker-compose.yml`

**Issue:** Database connection errors
- **Fix:** Verify `DATABASE_URL` matches the service name `db` and credentials in `docker-compose.yml`

**Issue:** Slow builds
- **Fix:** Use `.dockerignore` to exclude large folders; leverage Docker layer caching

### Docker Setup Evidence

Terminal output after successful build and startup:

```bash
$ docker-compose up --build -d
[+] Building 74.8s (13/13) FINISHED
[+] Running 6/6
 ✔ Network s86-1225-stratos-full-stack-with-nextjsand-aws-azure-tta-urban_localnet  Created
 ✔ Volume "s86-1225-stratos-full-stack-with-nextjsand-aws-azure-tta-urban_db_data"  Created
 ✔ Container redis_cache   Started
 ✔ Container postgres_db   Started
 ✔ Container nextjs_app    Started

$ docker ps
CONTAINER ID   IMAGE                                                 COMMAND                  CREATED         STATUS         PORTS                    NAMES
524578d4addf   s86-1225-...-tta-urban-app                           "docker-entrypoint.s…"   9 seconds ago   Up 7 seconds   0.0.0.0:3000->3000/tcp   nextjs_app
2db5b3bfdcf8   postgres:15-alpine                                    "docker-entrypoint.s…"   9 seconds ago   Up 8 seconds   0.0.0.0:5432->5432/tcp   postgres_db
dedd919d0b89   redis:7-alpine                                        "docker-entrypoint.s…"   9 seconds ago   Up 8 seconds   0.0.0.0:6379->6379/tcp   redis_cache
```

All three containers are running successfully with proper port mappings and network connectivity.

## Team Branching Strategy & PR Workflow

This section documents our recommended branching and pull request (PR) workflow to keep the repository consistent, reviewable, and safe for production.

1) Branching strategy
- **`main`**: Protected. Always green; only merge via PR when all checks pass.
- **`develop`** (optional): Integration branch for completed features before release.
- **Feature branches**: `feature/complaint-submission` � for new features and improvements.
- **Fix branches**: `fix/map-location-bug` � for bug fixes that should be applied quickly.
- **Chore branches**: `chore/project-setup` � for maintenance tasks and infra changes.
- **Docs branches**: `docs/workflow-docs` � documentation-only changes.

2) Pull request workflow
- Open a PR from your feature branch into `main` (or `develop` if used).
- Use a concise PR title and add a short description of changes and motivation.
- Attach screenshots, logs, or design references when relevant.
- Fill the PR checklist (see the template earlier in this README).

3) Review & checks
- Require at least one reviewer (two for larger changes).
- All continuous integration checks (lint, tests) must pass before merging.
- Ensure PR is up to date with the target branch (resolve merge conflicts locally if any).

4) Merging
- Use GitHubs Merge button (Squash merge preferred for feature branches to keep history tidy).
- Avoid direct pushes to `main` � always use PRs.

5) Hotfixes
- Create a `fix/` branch from `main`, test locally, and open a PR into `main`. Tag the release if required.

6) Helpful commands
```powershell
# create a feature branch
git checkout -b feature/my-feature

# update from remote before creating a PR
git fetch origin
git rebase origin/main

# push branch
git push -u origin feature/my-feature
```

7) Notes & etiquette
- Keep commits small and focused. Write meaningful commit messages.
- Link PRs to issues when applicable.
- Avoid mixing unrelated changes in the same PR.

If you want, I can open a PR template file under `.github/pull_request_template.md` and optionally create GitHub branch protection rules � tell me if you'd like me to do that next.
