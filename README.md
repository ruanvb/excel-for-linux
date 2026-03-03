# Excel for Linux

![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)
![Platform](https://img.shields.io/badge/platform-Linux-orange)
![Electron](https://img.shields.io/badge/built%20with-Electron-47848f)

**Unofficial Microsoft Excel Online desktop client for Linux** — a native desktop app that wraps the [Microsoft Excel web app](https://www.office.com/launch/excel) with enhanced Linux desktop integration.

✅ **Native desktop window** for Microsoft Excel Online  
✅ **System tray integration**  
✅ **System notifications**  
✅ **Custom CSS support**  
✅ **Screen sharing support**  
✅ **Multiple account profiles** via partitions  
✅ **Offline page** with automatic retry  
✅ **Spell checker** integration  

> [!NOTE]
> This is an **independent open-source project**, not affiliated with or endorsed by Microsoft.
> All Microsoft Excel functionality is provided by the official Excel web app.

---

## Installation

### Option 1 — Build from Source (Recommended for developers)

**Prerequisites:** [Node.js](https://nodejs.org/) v18+ and npm

```bash
# Clone the repository
git clone https://github.com/your-username/excel-for-linux.git
cd excel-for-linux

# Install dependencies
npm install

# Run the app
npm start
```

### Option 2 — Build a Linux Package

After cloning and running `npm install`, build distributable packages:

```bash
# Build all Linux formats (AppImage, deb, rpm, tar.gz)
npm run dist:linux

# Or build a specific format:
npm run dist:linux:deb       # Debian/Ubuntu .deb package
npm run dist:linux:rpm       # Fedora/RHEL .rpm package
npm run dist:linux:appimage  # Portable AppImage
npm run dist:linux:targz     # Generic tar.gz archive
```

Built packages are placed in the `dist/` folder.

### Option 3 — Download a Release

Download a pre-built package from the [GitHub Releases](https://github.com/your-username/excel-for-linux/releases) page.

> [!TIP]
> For AppImage files, consider using [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) for better desktop integration.

---

## Usage

### Launch the App

```bash
# If installed via package manager:
excel-for-linux

# If running from source:
npm start

# If using AppImage:
./Excel-for-Linux-*.AppImage
```

### First Run

1. The app opens Microsoft Excel Online (`office.com/launch/excel`).
2. Sign in with your **Microsoft account** or **work/school account**.
3. Excel Online loads as a full-featured desktop application.

---

## Configuration

Create a configuration file at `~/.config/excel-for-linux/config.json` to customise the app behaviour.

### Example Configuration

```json
{
  "url": "https://www.office.com/launch/excel",
  "appTitle": "Microsoft Excel",
  "minimized": false,
  "closeAppOnCross": false,
  "notificationMethod": "web",
  "disableNotifications": false,
  "followSystemTheme": false,
  "customCSSLocation": "",
  "disableGpu": true
}
```

### System-Wide Configuration (Enterprise)

Administrators can deploy a system-wide config at `/etc/excel-for-linux/config.json`. User config always takes precedence over the system config.

### Key Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `url` | `https://www.office.com/launch/excel` | URL to load on startup |
| `appTitle` | `Microsoft Excel` | Window title suffix |
| `minimized` | `false` | Start minimized to tray |
| `closeAppOnCross` | `false` | Quit on close (vs. minimize to tray) |
| `notificationMethod` | `web` | Notification method (`web`/`electron`/`custom`) |
| `disableGpu` | `true` | Disable GPU acceleration |
| `followSystemTheme` | `false` | Follow system dark/light theme |
| `customCSSLocation` | `""` | Path to a custom CSS file |
| `spellCheckerLanguages` | `[]` | Languages for spell checker (e.g. `["en-US", "pt-BR"]`) |
| `chromeUserAgent` | Chrome default | Override the User-Agent string |

For the full list of options, run the app with `--help` or inspect `app/config/index.js`.

---

## Multiple Accounts

Run multiple instances with separate profiles using `--partition`:

```bash
excel-for-linux --partition work
excel-for-linux --partition personal
```

Each partition stores cookies and session data independently.

---

## Custom CSS

Apply custom styles to the Excel web interface by setting `customCSSLocation` in your config:

```json
{
  "customCSSLocation": "/home/your-user/.config/excel-for-linux/custom.css"
}
```

---

## Security & Sandboxing

For additional process isolation, consider:

- **AppArmor / SELinux** — available on most Linux distributions by default
- **Firejail** — manual sandboxing on Linux
- **Flatpak / Snap** (if published) — built-in application confinement

---

## Development

```bash
# Run in development mode (with trace warnings)
npm start

# Lint code (required before commits)
npm run lint

# Run end-to-end tests
npm run test:e2e

# Build packages
npm run dist:linux
```

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code standards, and pull request guidelines.

---

## License

**GPL-3.0-or-later** — See [LICENSE.md](LICENSE.md)

---

> Microsoft, Microsoft Excel, and Office 365 are trademarks of Microsoft Corporation.
> This project is not affiliated with, sponsored by, or endorsed by Microsoft.
