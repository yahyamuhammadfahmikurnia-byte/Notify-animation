#!/usr/bin/env bash
set -e
UUID="yahya-empty-notification@local"
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
DEST_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"
mkdir -p "$HOME/.local/share/gnome-shell/extensions"
rm -rf "$DEST_DIR"
cp -r "$SRC_DIR" "$DEST_DIR"
# keep the installed directory name consistent with the UUID
if [ "$SRC_DIR" != "$DEST_DIR" ]; then
  mv "$DEST_DIR" "$DEST_DIR.tmp" 2>/dev/null || true
  rm -rf "$DEST_DIR"
  mkdir -p "$(dirname "$DEST_DIR")"
  cp -r "$SRC_DIR" "$DEST_DIR"
fi
echo "Installed to: $DEST_DIR"
echo "Reload with: gnome-extensions disable $UUID && gnome-extensions enable $UUID"
echo "If needed, log out and log back in."
