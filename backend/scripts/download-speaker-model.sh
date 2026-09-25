#!/usr/bin/env bash
# Downloads the pre-trained speaker-embedding model used by Voice Check
# (backend/src/voice/speakerVerification.ts). Not committed to git — same
# reasoning as not committing node_modules — so this needs to run once per
# machine (already run in this environment; new dev/deploy environments
# need it too).
#
# NVIDIA NeMo TitaNet-Large (CC-BY-4.0, free incl. commercial use, requires
# attribution — see https://huggingface.co/nvidia/speakerverification_en_titanet_large).
# Replaced the earlier WeSpeaker CAM++ model (2026-09-25): CAM++ barely
# separated two different real speakers with similar vocal pitch (measured
# 0.752 vs a genuine same-speaker score of 0.755 — essentially unusable);
# TitaNet-Large measured meaningfully better on the same real audio (0.730
# vs 0.873). Still not a perfect fix — see MATCH_THRESHOLD's own comment.
set -euo pipefail

DEST_DIR="$(dirname "$0")/../models"
DEST_FILE="$DEST_DIR/speaker-embedding.onnx"
URL="https://github.com/k2-fsa/sherpa-onnx/releases/download/speaker-recongition-models/nemo_en_titanet_large.onnx"
EXPECTED_SHA256="d51abcf31717ef28162f26acb9d44dd4127c3d44c9b8624f699f3425daca8e77"

if [ -f "$DEST_FILE" ]; then
  echo "Model already present at $DEST_FILE — skipping download."
  exit 0
fi

mkdir -p "$DEST_DIR"
echo "Downloading speaker-embedding model (~97MB) to $DEST_FILE ..."
curl -sL -o "$DEST_FILE" "$URL"

ACTUAL_SHA256="$(sha256sum "$DEST_FILE" | cut -d' ' -f1)"
if [ "$ACTUAL_SHA256" != "$EXPECTED_SHA256" ]; then
  echo "ERROR: checksum mismatch for $DEST_FILE" >&2
  echo "  expected: $EXPECTED_SHA256" >&2
  echo "  actual:   $ACTUAL_SHA256" >&2
  rm -f "$DEST_FILE"
  exit 1
fi
echo "Done (checksum verified)."
