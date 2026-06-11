This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker Deployment

Run the entire stack (app + PostgreSQL database) with Docker Compose.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Quick Start

```bash
# Build and start all services
docker compose up --build

# Or start in detached mode
docker compose up -d --build
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Services

Docker Compose runs three services:

| Service | Description |
|---------|-------------|
| `db` | PostgreSQL 16 database |
| `migrate` | Runs Prisma migrations on startup |
| `app` | Next.js application |

The `migrate` service runs automatically before the app starts. If you need to run migrations manually:

```bash
# Build and run migrations only
docker compose build migrate
docker compose run migrate
```

### Managing the Stack

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose up --build
```

### Environment

On first startup, the database migrations run automatically. The following environment variables are configured:

| Variable | Value |
|----------|-------|
| DATABASE_URL | `postgresql://postgres:postgres@db:5432/cvvas` |
| NODE_ENV | `production` |

To customize, edit `docker-compose.yml` or mount your own `.env` file.

### Resource Limits

The Docker Compose configuration is optimized for systems with 1 CPU and 2GB RAM:

- **App**: 1 CPU, 1.5GB RAM max
- **Database**: 0.5 CPU, 512MB RAM max

### Troubleshooting

If the database tables don't exist on first run:

```bash
# Stop services and remove database volume
docker compose down -v

# Rebuild and start fresh
docker compose up --build
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.