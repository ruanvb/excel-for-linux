# Contributing to Excel for Linux

Thank you for considering contributing! This guide will help you get started.

> [!TIP]
> New to Electron? This project is a great way to learn!

## Quick Start

1. **Fork** the repository on GitHub
2. **Clone** your fork: `git clone https://github.com/your-username/excel-for-linux.git`
3. **Create** a feature branch: `git checkout -b feature/my-improvement`
4. **Make changes** (main entry point: `app/index.js`)
5. **Test** your changes with `npm start`
6. **Lint** your code: `npm run lint`
7. **Submit** a pull request to the `main` branch

Each `app/` subfolder contains a `README.md` explaining its purpose.

## Development Setup

**Prerequisites:** [Node.js](https://nodejs.org/) v18+ and npm

```bash
# Clone and setup
git clone https://github.com/your-username/excel-for-linux.git
cd excel-for-linux
npm install

# Run from source
npm start

# Lint code (required before commits)
npm run lint

# Run E2E tests
npm run test:e2e
```

## Testing Pull Requests

You can test PR changes without building from source by downloading pre-built artifacts from GitHub Actions:

1. **Navigate to the PR** on GitHub
2. **Click the "Checks" tab** at the top of the PR
3. **Select a completed workflow run** (green checkmark)
4. **Scroll down to "Artifacts"** and download the artifact for your platform

> [!NOTE]
> You need to be logged into GitHub to download artifacts. Artifacts are retained for 30 days.

## Code Standards

- ❌ **No `var`** — use `const` by default, `let` for reassignment
- ✅ **`async/await`** instead of promise chains
- ✅ **Private fields** — use `#property` syntax for class private members
- ✅ **Arrow functions** for concise callbacks
- ✅ **Run `npm run lint`** before all commits (mandatory)

## Building

```bash
# Development build (no packaging)
npm run pack

# Build all Linux packages
npm run dist:linux

# Specific formats
npm run dist:linux:deb
npm run dist:linux:rpm
npm run dist:linux:appimage
npm run dist:linux:targz
```

## Testing

```bash
# Run end-to-end tests (Playwright)
npm run test:e2e

# Run unit tests
npm run test:unit
```

## Documentation

When making code changes, update relevant documentation in the same PR:
- `app/<module>/README.md` — when changing module functionality
- `docs-site/docs/configuration.md` — when adding new configuration options

## Pull Request Guidelines

- Keep PRs focused on a single concern
- Include a clear description of what the change does and why
- Ensure `npm run lint` passes
- Ensure `npm run test:e2e` passes

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Playwright Documentation](https://playwright.dev/)
