# CLAUDE.md

This file provides guidance to AI coding assistants (Claude Code, GitHub Copilot, etc.) when working with code in this repository.

## Essential Commands

**Development:**
- `npm start` - Run application in development mode with trace warnings
- `npm run lint` - Run ESLint validation (mandatory before commits)
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:unit` - Run unit tests

**Building:**
- `npm run pack` - Development build without packaging
- `npm run dist:linux` - Build Linux packages (AppImage, deb, rpm, snap)

## Project Architecture

Excel for Linux is an Electron-based desktop application that wraps the Microsoft Excel web app (office.com). The architecture follows a modular pattern with the main process coordinating various specialized modules.

**Key file locations:**
- **Entry Point:** `app/index.js` - Main Electron process
- **Startup:** `app/startup/` - Command line switches and initialization
- **Configuration:** `app/appConfiguration/` - Centralized configuration management
- **Main Window:** `app/mainAppWindow/` - Primary BrowserWindow and Excel web wrapper
- **Browser Tools:** `app/browser/tools/` - Client-side scripts injected into the app

## Development Patterns

### Code Style Requirements
- **NO `var`** - Use `const` by default, `let` for reassignment
- **async/await** - Use instead of promise chains
- **Private fields** - Use JavaScript `#property` syntax for class private members
- **Arrow functions** - For concise callbacks

### Configuration Management
- All configuration handled through `AppConfiguration` class
- Treat config as immutable after startup
- Changes via AppConfiguration methods only

### IPC Communication
- Use `ipcMain.handle` for request-response patterns
- Use `ipcMain.on` for fire-and-forget notifications
- Add descriptive comments above each IPC channel registration
- All IPC channels must be added to the allowlist in `app/security/ipcValidator.js`

### Error Handling
- Robust error handling with try-catch in async functions
- Graceful degradation with clear user feedback
- Use `electron-log` for structured logging

### Logging Guidelines

**CRITICAL: PII Protection**

Never log Personally Identifiable Information (PII) in production code:

```javascript
// WRONG - logs PII
console.info(`Loading URL: ${url}`);
console.debug(`User email: ${email}`);

// CORRECT - no PII
console.info('[APP] Loading Excel Online');
console.debug('[AUTH] Processing authentication');
```

**Logging levels:**
- `console.error` - Errors requiring attention
- `console.warn` - Warnings about potential issues
- `console.info` - Key state changes (startup, connection established)
- `console.debug` - Development debugging only (use sparingly)

## Testing and Quality

The project uses Playwright for end-to-end testing:
- **Test Location**: `tests/e2e/`
- **Run Tests**: `npm run test:e2e`
- **Clean State**: Tests use temporary userData directories for isolation

### Quality Checks
- Run `npm run lint` before commits (ESLint)
- Run `npm run test:e2e` to verify E2E tests pass

## Important Notes

- New functionality should be placed in separate modules rather than `app/index.js`
- Browser scripts must be defensive as the Excel web app DOM can change without notice
- Follow single responsibility principle for new modules
- Update module-specific README.md files when making changes
- Cross-platform compatibility is important (Linux primary, Windows/macOS supported)
