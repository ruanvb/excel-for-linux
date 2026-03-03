#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="excel-for-linux"
DESKTOP_DEST="$HOME/.local/share/applications/$APP_NAME.desktop"
BIN_DEST="$HOME/.local/bin/$APP_NAME"

echo "==> Instalando Excel for Linux..."

# 1. Instalar dependências se necessário
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo "==> Instalando dependências npm..."
  cd "$PROJECT_DIR" && npm install
fi

# 2. Instalar ícones (múltiplos tamanhos para melhor suporte a HiDPI e dock)
echo "==> Instalando ícones..."
for SIZE in 16 24 32 48 64 128 256 512; do
  SRC="$PROJECT_DIR/build/icons/${SIZE}x${SIZE}.png"
  if [ -f "$SRC" ]; then
    DEST_DIR="$HOME/.local/share/icons/hicolor/${SIZE}x${SIZE}/apps"
    mkdir -p "$DEST_DIR"
    cp "$SRC" "$DEST_DIR/$APP_NAME.png"
  fi
done

# Forçar atualização do cache de ícones
gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true

# Notificar o ambiente gráfico sobre a mudança
if command -v xdg-icon-resource &>/dev/null; then
  xdg-icon-resource forceupdate 2>/dev/null || true
fi

# 3. Criar launcher script (chama electron diretamente, evitando npm ci no prestart)
echo "==> Criando launcher..."
mkdir -p "$HOME/.local/bin"
cat > "$BIN_DEST" << EOF
#!/bin/bash
PROJECT_DIR="$PROJECT_DIR"

# Instala dependências na primeira vez
if [ ! -d "\$PROJECT_DIR/node_modules" ]; then
  cd "\$PROJECT_DIR"
  npm install
fi

exec "\$PROJECT_DIR/node_modules/.bin/electron" "\$PROJECT_DIR/app" \
  --no-sandbox \
  "\$@"
EOF
chmod +x "$BIN_DEST"

# 4. Criar .desktop file
echo "==> Criando entrada no menu..."
cat > "$DESKTOP_DEST" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Excel for Linux
Comment=Unofficial Microsoft Excel Online client for Linux
Exec=$BIN_DEST %U
Icon=$APP_NAME
Terminal=false
Categories=Office;Spreadsheet;
Keywords=excel;microsoft;office;spreadsheet;
StartupWMClass=excel-for-linux
StartupNotify=false
EOF

# 5. Atualizar banco de dados de .desktop
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true

echo ""
echo "✓ Instalação concluída!"
echo "  Launcher: $BIN_DEST"
echo "  Menu:     $DESKTOP_DEST"
echo ""
echo "  Abra pelo menu de apps ou execute: excel-for-linux"
echo "  (Se o ícone não atualizar na dock, faça logout/login)"
