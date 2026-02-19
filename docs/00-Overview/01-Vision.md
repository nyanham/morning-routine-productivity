# Vision

## What Is This?

The **Morning Routine & Productivity Tracker** is a full-stack web application that helps people understand the link between their morning habits and daily productivity.

Users log daily routines  — wake time, sleep duration, exercise, meditation, mood  — alongside productivity metrics like focus hours, tasks completed, and stress levels. The app then visualizes correlations so users can discover which habits actually move the needle.

## Why Does It Exist?

Most productivity advice is generic. _"Wake up early. Exercise. Meditate."_ But what actually works varies from person to person.

This project exists to give individuals a data-driven way to answer one question:

> **Which of my morning habits have the biggest impact on how productive I feel?**

By collecting personal data over time and surfacing trends through interactive charts, users can stop guessing and start optimizing based on evidence.

## Who Is It For?

| Audience        | What they get                                                                |
| --------------- | ---------------------------------------------------------------------------- |
| **Individuals** | A personal dashboard to track habits and see what works for them             |
| **Researchers** | A structured dataset linking lifestyle factors to self-reported productivity |
| **Developers**  | A real-world full-stack reference project with modern tooling                |

## Core Capabilities

- **Track morning routines**  — log habits daily through a clean form or CSV import
- **Monitor productivity**  — record scores, tasks, focus time, and stress
- **Visualize correlations**  — interactive charts connecting habits to outcomes
- **Multi-user support**  — each user sees only their own data, secured by row-level policies
- **Responsive UI**  — works on desktop and tablet

## Design Philosophy

- **Simplicity over features**  — do a few things well rather than many things poorly
- **Data belongs to the user**  — per-user isolation at the database level
- **Serverless by default**  — minimize operational overhead with managed services
- **Clarity over cleverness**  — readable code, honest documentation, small composable units

## Tech Stack at a Glance

| Layer      | Technology                                               |
| ---------- | -------------------------------------------------------- |
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts |
| Backend    | FastAPI, Python 3.12, Pydantic 2                         |
| Database   | Supabase (PostgreSQL + Row-Level Security)               |
| Auth       | Supabase Auth (JWT)                                      |
| Deployment | Vercel (frontend), AWS Lambda + API Gateway (backend)    |
| IaC        | AWS SAM                                                  |

---

## Related Docs

| Topic               | Link                                                           |
| ------------------- | -------------------------------------------------------------- |
| System architecture | [System-Overview.md](../02-Architecture/01-System-Overview.md) |
| Quickstart          | [Quickstart.md](02-Quickstart.md)                              |
| Project map         | [Project-Map.md](03-Project-Map.md)                            |
