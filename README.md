# Agile Project Manager — Client

This project is a browser-based project management tool built for software teams that follow agile practices. The main goal is to provide a lightweight, self-hostable alternative to more complex tools like Jira, while still supporting essential workflows such as Kanban boards and sprint planning. 
A key motivation behind the project is to make collaboration easier for international teams. To support this, the application includes multilingual task management with automatic content translation, helping teams work seamlessly across language barriers.

---

## Technologies Used

| Technology | Purpose                                   |
|---|-------------------------------------------|
| [Next.js 15](https://nextjs.org/) (App Router) | Full-stack React framework with file-based routing |
| [React 19](https://react.dev/) | Component-based UI development            |
| [TypeScript 5](https://www.typescriptlang.org/) | Static typing                             |
| [Ant Design 6](https://ant.design/) | UI component library                      |
| [Deno](https://deno.com/) / [Node.js 22](https://nodejs.org/) | JavaScript runtimes                       |
| [Vercel](https://vercel.com/) | Production deployment                     |
| [Docker](https://www.docker.com/) | Containerisation                          |
| [SonarCloud](https://sonarcloud.io/) | Code quality analysis                     |

---

## High-Level Components

### 1. Authentication - [`app/login/page.tsx`](app/login/page.tsx) & [`app/register/page.tsx`](app/register/page.tsx)

Handles user login and registration. After a successful login, the server returns a JSON Web Token and user ID, which are stored in `localStorage` using the [`useLocalStorage.tsx`](app/hooks/useLocalStorage.tsx) hook and attached as an `Authorization` header on every subsequent request. Access to protected routes is managed by the Route Guard at [`components/RouteGuard.tsx`](components/RouteGuard.tsx), which redirects unauthenticated users to the login page.

### 2. Dashboard - [`app/dashboard/page.tsx`](app/dashboard/page.tsx)

The main entry point after authentication. The dashboard provides an overview of all projects, including sprints and task statistics (all tasks, to-do, in progress, done). It also allows users to create new projects and manage sprints through modal interfaces.

### 3. Kanban Board - [`app/projects/[id]/page.tsx`](app/projects/[id]/page.tsx)

The central workspace of the application. Each project has a three-column Kanban Board (TODO → IN PROGRESS → DONE). Tasks are displayed as cards in the Kanban board [`app/projects/KanbanColumn.tsx`](app/projects/KanbanColumn.tsx) & [`app/projects/TaskCard.tsx`](app/projects/TaskCard.tsx), and can be created or edited through a modal [`app/projects/TaskModal.tsx`](app/projects/TaskModal.tsx).

---

## Launch & Deployment

### Prerequisites

- **macOS / Linux / WSL2** — the toolchain is Linux-based.  
  Windows users: install WSL2 first by running the bundled [`windows.ps1`](windows.ps1) script in an admin PowerShell terminal.
- **Git** — `git --version` should return a version string.

### Local setup (first time)

```bash
# 1. Clone the repository
git clone https://github.com/sopra-fs26-group-37/sopra-fs26-group-37-client
cd sopra-fs26-group-37-client

# 2. Run the one-liner setup script (installs Nix, direnv, Node.js 22, Deno)
source setup.sh
# This takes a few minutes — do not abort.
```

### Running the app locally

The backend must be running on `http://localhost:8080` before starting the frontend (see the server README).

```bash
# Start the hot-reload development server on http://localhost:3000
deno task dev

# Alternative with npm
npm run dev
```

### Other useful commands

```bash
deno task build    # Production build
deno task start    # Serve the production build
deno task lint     # Check for lint errors
deno task fmt      # Auto-format code
```

### Tests

There is currently no automated test suite in the client. Code quality is enforced via ESLint (`deno task lint`) and SonarCloud analysis on every push to `main`.

### Environment variables

Create a `.env.local` file in the repository root for local overrides:

```
NEXT_PUBLIC_PROD_API_URL=https://your-backend-url
```

In development this variable is ignored — `http://localhost:8080` is always used.

### Releases & deployment

Every push to `main` triggers three GitHub Actions workflows automatically:

| Workflow | File | What it does |
|---|---|---|
| Vercel deployment | [`.github/workflows/verceldeployment.yml`](.github/workflows/verceldeployment.yml) | Deploys to Vercel production |
| Docker build & push | [`.github/workflows/dockerize.yml`](.github/workflows/dockerize.yml) | Pushes a new image to DockerHub |
| SonarCloud scan | [`.github/workflows/sonarcloud.yml`](.github/workflows/sonarcloud.yml) | Reports code quality metrics |

To deploy manually via Docker:

```bash
docker build -t agile-client .
docker run -p 3000:3000 agile-client
```

---

## Roadmap

1. **Drag-and-drop task reordering within columns:** Tasks can currently be moved between Kanban columns by editing their status, but there is no drag-and-drop to reorder tasks within a single column.

2. **Notifications System:** Add in-app and/or email notifications for task updates, mentions, and sprint deadlines.

3. **File Attachments:** Enable uploading and attaching files (e.g., images, documents) to tasks to provide more context and resources.

---

## Authors and Acknowledgements
Marko Milojevic, Joanne Azariah, Sejla Husakovic, Leonardo D'Antonio

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE.txt) file for full details.
