#!/bin/bash
set -e

APP_NAME="excel-for-linux"
DESKTOP_DEST="$HOME/.local/share/applications/$APP_NAME.desktop"
BIN_DEST="$HOME/.local/bin/$APP_NAME"

echo "==> Desinstalando Excel for Linux..."

# 1. Remover launcher
if [ -f "$BIN_DEST" ]; then
  rm -f "$BIN_DEST"
  echo "✓ Launcher removido: $BIN_DEST"
fi

# 2. Remover entrada no menu
if [ -f "$DESKTOP_DEST" ]; then
  rm -f "$DESKTOP_DEST"
  update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
  echo "✓ Entrada do menu removida: $DESKTOP_DEST"
fi

# 3. Remover ícones
ICON_REMOVED=false
for SIZE in 16 24 32 48 64 128 256 512; do
  ICON="$HOME/.local/share/icons/hicolor/${SIZE}x${SIZE}/apps/$APP_NAME.png"
  if [ -f "$ICON" ]; then
    rm -f "$ICON"
    ICON_REMOVED=true
  fi
done
if [ "$ICON_REMOVED" = true ]; then
  gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
  echo "✓ Ícones removidos"
fi

echo ""
echo "✓ Desinstalação concluída!"
echo ""
echo "  Os dados do usuário foram mantidos em: ~/.config/excel-for-linux/"
echo "  Para removê-los também, execute:"
echo "    rm -rf ~/.config/excel-for-linux/"
