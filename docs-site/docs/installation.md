# Installation Guide

Multiple installation methods are available for Excel for Linux across different Linux distributions.

:::info About Excel for Linux
**Unofficial Microsoft Excel Online client for Linux** — a native desktop app that wraps the Teams web version with enhanced Linux integration including system notifications, tray integration, custom backgrounds, screen sharing, and multiple account profiles.
:::

## Quick Installation

### Package Repositories (Recommended)

We maintain dedicated deb and rpm repositories hosted with ❤️ by [Nils Büchner](https://github.com/nbuechner).

#### Debian/Ubuntu

```bash
sudo mkdir -p /etc/apt/keyrings
sudo wget -qO /etc/apt/keyrings/excel-for-linux.asc https://github.com/ruanvb/excel-for-linux/releases/excel-for-linux.asc
sh -c 'echo "Types: deb
URIs: https://github.com/ruanvb/excel-for-linux/releases/debian/
Suites: stable
Components: main
Signed-By: /etc/apt/keyrings/excel-for-linux.asc
Architectures: amd64" | sudo tee /etc/apt/sources.list.d/excel-for-linux-packages.sources'
sudo apt update && sudo apt install excel-for-linux
```

#### RHEL/Fedora/CentOS

```bash
curl -1sLf -o /tmp/excel-for-linux.asc https://github.com/ruanvb/excel-for-linux/releases/excel-for-linux.asc
sudo rpm --import /tmp/excel-for-linux.asc
sudo curl -1sLf -o /etc/yum.repos.d/excel-for-linux.repo https://github.com/ruanvb/excel-for-linux/releases/rpm/excel-for-linux.repo
sudo dnf install excel-for-linux
```

## Distribution-Specific Packages

### Arch Linux (AUR)

```bash
# Using yay
yay -S excel-for-linux

# Using paru
paru -S excel-for-linux

# Manual AUR build
git clone https://aur.archlinux.org/excel-for-linux.git
cd excel-for-linux
makepkg -si
```

[![AUR: excel-for-linux](https://img.shields.io/badge/AUR-teams--for--linux-blue.svg)](https://aur.archlinux.org/packages/excel-for-linux)

### Ubuntu (Pacstall)

```bash
# Install Pacstall first (if not already installed)
sudo bash -c "$(curl -fsSL https://pacstall.dev/q/install)"

# Install Excel for Linux
pacstall -I excel-for-linux-deb
```

[![Pacstall: excel-for-linux-deb](https://img.shields.io/badge/Pacstall-teams--for--linux--deb-00958C)](https://github.com/pacstall/pacstall-programs/tree/master/packages/excel-for-linux-deb)

### Snap Store

```bash
sudo snap install excel-for-linux
```

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://github.com/ruanvb/excel-for-linux/releases)

### Flathub

```bash
flatpak install flathub io.github.ruanvb.excel_for_linux
```

<a href='https://flathub.org/apps/details/io.github.ruanvb.excel_for_linux'><img width='170' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.png'/></a>

## Manual Installation

### Download from GitHub Releases

1. Go to [GitHub Releases](https://github.com/ruanvb/excel-for-linux/releases)
2. Download the appropriate package for your system:
   - **AppImage** - Universal Linux package
   - **deb** - Debian/Ubuntu package
   - **rpm** - Red Hat/Fedora package
   - **snap** - Universal snap package
   - **tar.gz** - Portable archive

### Package Installation

#### Debian/Ubuntu (.deb)

```bash
sudo dpkg -i excel-for-linux_*.deb
sudo apt-get install -f  # Fix dependencies if needed
```

#### Red Hat/Fedora (.rpm)

```bash
# Fedora
sudo dnf install excel-for-linux_*.rpm

# RHEL/CentOS
sudo rpm -i excel-for-linux_*.rpm
```

#### AppImage

```bash
# Make executable
chmod +x excel-for-linux_*.AppImage

# Run directly
./excel-for-linux_*.AppImage

# For better desktop integration, use AppImageLauncher
```

:::tip AppImage Integration
For AppImage files, install [`AppImageLauncher`](https://github.com/TheAssassin/AppImageLauncher) for better desktop integration, including automatic menu entries and file associations.
:::

#### Portable Installation (tar.gz)

```bash
# Extract
tar -xzf excel-for-linux_*.tar.gz

# Run
cd excel-for-linux/
./excel-for-linux
```

## First Launch

### Quick Start

1. **Launch** the application:
   ```bash
   excel-for-linux
   ```

2. **Sign in** with your Microsoft Teams account

3. **Configure** if needed by creating `~/.config/excel-for-linux/config.json`

### Initial Configuration

For basic usage, no configuration is required. Excel for Linux will work out of the box.

For advanced features, create a configuration file:

```bash
mkdir -p ~/.config/excel-for-linux/
```

Example basic configuration:
```json
{
  "minimizeToTray": true,
  "startInTray": false,
  "enableDesktopNotifications": true
}
```

See the [Configuration Guide](configuration.md) for all available options.

## Command Line Options

### Basic Usage

```bash
# Standard launch
excel-for-linux

# Use custom config directory
excel-for-linux --user-data-dir=/path/to/custom/profile
```

### Multiple Instances

```bash
# Work profile
excel-for-linux --user-data-dir=~/.config/teams-work --class=teams-work

# Personal profile  
excel-for-linux --user-data-dir=~/.config/teams-personal --class=teams-personal
```

See [Multiple Instances](multiple-instances.md) for detailed setup.

### Debug Mode

```bash
# Enable debug logging
excel-for-linux --logConfig='{"level":"debug"}'

# Show developer tools with Electron logging
ELECTRON_ENABLE_LOGGING=true excel-for-linux
```

## Troubleshooting Installation

### Common Issues

#### Package Dependencies

```bash
# Ubuntu/Debian - fix missing dependencies
sudo apt-get install -f

# Fedora - install missing packages
sudo dnf install missing-package-name
```

#### Audio Not Working

```bash
# Check PulseAudio status
pulseaudio --check

# Restart PulseAudio
pulseaudio --kill && pulseaudio --start
```

#### Permission Issues

```bash
# Add user to audio group
sudo usermod -a -G audio $USER

# Add user to video group (for webcam)
sudo usermod -a -G video $USER

# Log out and back in for changes to take effect
```

### Repository Issues

#### GPG Key Problems

```bash
# Re-import repository key
curl -1sLf -o /tmp/excel-for-linux.asc https://github.com/ruanvb/excel-for-linux/releases/excel-for-linux.asc
sudo rpm --import /tmp/excel-for-linux.asc  # For RPM systems
```

#### Network/Proxy Issues

```bash
# For corporate environments with proxies
export https_proxy=http://proxy.company.com:8080
```

## Next Steps

After installation:

1. **[Configuration](configuration.md)** - Customize Excel for Linux settings
2. **[Multiple Instances](multiple-instances.md)** - Set up work and personal profiles
3. **[Screen Sharing](screen-sharing.md)** - Configure screen capture
4. **[Troubleshooting](troubleshooting.md)** - Common issues and solutions
5. **[Uninstall Guide](uninstall.md)** - Remove Excel for Linux from your system

## Support

- **Documentation**: [Full documentation](index.md)
- **Issues**: [GitHub Issues](https://github.com/ruanvb/excel-for-linux/issues)
- **Community**: [GitHub Discussions](https://github.com/ruanvb/excel-for-linux/discussions)
- **Discussions**: [GitHub Discussions](https://github.com/ruanvb/excel-for-linux/discussions)

## Related Documentation

- [Configuration Options](configuration.md) - Complete configuration reference
- [Multiple Instances](multiple-instances.md) - Running multiple profiles
- [Troubleshooting](troubleshooting.md) - Common issues and solutions
