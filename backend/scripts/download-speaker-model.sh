#!/usr/bin/env bash
# Downloads the pre-trained speaker-embedding model used by Voice Check
# (backend/src/voice/speakerVerification.ts). Not committed to git — same
# reasoning as not committing node_modules — so this needs to run once per
# machine (already run in this environment; new dev/deploy environments
# need it too).
set -euo pipefail

DEST_DIR="$(dirname "$0")/../models"
DEST_FILE="$DEST_DIR/speaker-embedding.onnx"
URL="https://github.com/k2-fsa/sherpa-onnx/releases/download/speaker-recongition-models/wespeaker_en_voxceleb_CAM%2B%2B.onnx"

if [ -f "$DEST_FILE" ]; then
  echo "Model already present at $DEST_FILE — skipping download."
  exit 0
fi

mkdir -p "$DEST_DIR"
echo "Downloading speaker-embedding model (~28MB) to $DEST_FILE ..."
curl -sL -o "$DEST_FILE" "$URL"
echo "Done."
