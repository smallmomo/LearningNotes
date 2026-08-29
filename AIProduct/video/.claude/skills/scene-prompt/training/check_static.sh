#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL="$SKILL_DIR/SKILL.md"
MODE1_REF="$SKILL_DIR/references/mode1-aesthetic-enhancement.md"
DESERT_REF="$SKILL_DIR/references/desert-aerial-scenes.md"
AESTHETIC_CATALOG="$SKILL_DIR/references/aesthetic-library.toml"
CINEMATIC_REF="$SKILL_DIR/references/cinematic-pressure-and-anti-ai.md"
EXAMPLE_MATRIX="$SKILL_DIR/references/cinematic-example-matrix.md"
FILM_STOCK_REF="$SKILL_DIR/references/film-stock-selection.md"

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

require() {
  grep -Fq "$1" "$2" || fail "$3"
}

for file in "$SKILL" "$MODE1_REF" "$DESERT_REF" "$AESTHETIC_CATALOG" "$CINEMATIC_REF" "$EXAMPLE_MATRIX" "$FILM_STOCK_REF"; do
  [ -f "$file" ] || fail "missing required file: $file"
done

require "## Interaction Start" "$SKILL" "missing interaction gate"
require "mode 1 / 2 / 3" "$SKILL" "missing mode-selection invariant"
require "## Mode 1 Aesthetic Enhancement" "$SKILL" "missing Mode 1 workflow"
require "Ask one short question at a time" "$SKILL" "missing Mode 2 one-question rule"
require "风格锚定" "$SKILL" "missing style-anchor question"
require "## Style Anchor Rule" "$SKILL" "missing style-anchor rule"
require "### Prompt hygiene gate" "$SKILL" "missing prompt-hygiene gate"
require "private fact ledger" "$SKILL" "missing fact-ledger rule"
require "If removing a sentence leaves the intended image unchanged, omit it." "$SKILL" "missing deletion test"
require 'A detail is not `NECESSARY` merely because it is plausible' "$SKILL" "NECESSARY inference remains too permissive"
require "do not enumerate sexual or fetish vocabulary" "$SKILL" "missing sensitive-subject hygiene rule"
require "250-450 English words" "$SKILL" "missing Mode 1 concise target"
require "3-6 likely failure modes" "$SKILL" "missing targeted Avoid rule"
require 'include `black-and-white or monochrome image` in `Avoid:`' "$SKILL" "missing default monochrome-output exclusion"
require "Never append fixed positive or negative boilerplate" "$SKILL" "missing fixed-boilerplate prohibition"
require "Never select a default film" "$SKILL" "missing automatic-source prohibition"
require "Name the camera body exactly once" "$SKILL" "missing single camera-name rule"
require "controls with visible consequences" "$SKILL" "missing technical relevance rule"
require "### Narrative pressure and visual traffic" "$SKILL" "missing relationship/space/traffic decision chain"
require "### Architectural and interior plausibility gate" "$SKILL" "missing architecture/interior plausibility gate"
require "Classify the reality regime" "$SKILL" "missing reality-regime classification"
require "### Color thesis" "$SKILL" "missing color-thesis decision"
require "## Multi-shot and triptych adaptation" "$SKILL" "missing multi-shot adaptation"
require "### Silent 100-point scoring gate" "$SKILL" "missing runtime quality scoring gate"
require "below 82" "$SKILL" "missing 82-point rewrite threshold"
require "### Film-stock selection" "$SKILL" "missing film-stock selection workflow"
require "one capture stock plus one optional print-film emulation" "$SKILL" "missing single-stock constraint"
require "digital camera as physically captured on a film negative" "$SKILL" "missing digital/physical film distinction"

for header in "PROMPT:" "Foreground:" "Middle ground:" "Background:" "Lighting:" "Value map:" "Color palette:" "Cinematic color tone:" "Photography / grading parameters:" "PHOTOGRAPHIC TONE:" "Avoid:"; do
  require "$header" "$SKILL" "missing final output header: $header"
done

if grep -Eq '^Positive supplement:|^Negative supplement:' "$SKILL" "$MODE1_REF" "$DESERT_REF"; then
  fail "fixed supplement sections returned"
fi

if grep -Fq 'clean high-definition cinematic image, physically plausible materials, crisp clean edges' "$SKILL" "$MODE1_REF" "$DESERT_REF"; then
  fail "old positive boilerplate returned"
fi

if grep -Fq 'grainy texture, digital noise, stains, dirty textures' "$SKILL" "$MODE1_REF" "$DESERT_REF"; then
  fail "old negative boilerplate returned"
fi

require "prompt-hygiene quality gate" "$MODE1_REF" "Mode 1 lacks prompt-hygiene QA"
require "user supplied or approved one" "$MODE1_REF" "Mode 1 may still inject a cinematic source"
require "untraceable invented content" "$MODE1_REF" "Mode 1 lacks contamination failure rule"
require "Do not append fixed quality supplements" "$DESERT_REF" "desert reference may still append supplements"
require "3-6 user-specified or likely scene-specific failures" "$DESERT_REF" "desert reference lacks targeted Avoid rule"
require "Captured-frame discipline" "$CINEMATIC_REF" "cinematic reference lacks anti-AI discipline"
require "Multi-frame rhythm" "$CINEMATIC_REF" "cinematic reference lacks sequence rhythm"
require "This is not a prompt library" "$EXAMPLE_MATRIX" "example matrix may be treated as content library"
require "Three-frame stress test" "$EXAMPLE_MATRIX" "example matrix lacks triptych validation"
require "Physical film versus digital emulation" "$FILM_STOCK_REF" "film reference lacks pipeline distinction"
require "Kodak Vision3 250D" "$FILM_STOCK_REF" "film reference lacks core daylight stock"
require "Kodak 2383-style print-film emulation" "$FILM_STOCK_REF" "film reference lacks print-film rule"
require "Do not include Portra or Cinestill" "$FILM_STOCK_REF" "film reference lacks still-stock boundary"

require 'status = "active"' "$AESTHETIC_CATALOG" "aesthetic library is not active"
require 'reference_count = 6' "$AESTHETIC_CATALOG" "aesthetic-library count is stale"
[ "$(grep -c '^\[\[references\]\]' "$AESTHETIC_CATALOG")" -eq 6 ] || fail "aesthetic library must contain six references"

require "Case V10 - Prompt hygiene" "$SKILL_DIR/training/validation_cases.md" "missing prompt-hygiene validation case"
require "Case V11 - Relationship pressure" "$SKILL_DIR/training/validation_cases.md" "missing relationship-pressure validation case"
require "Case V12 - Color thesis" "$SKILL_DIR/training/validation_cases.md" "missing color-thesis validation case"
require "Case V13 - Anti-AI" "$SKILL_DIR/training/validation_cases.md" "missing anti-AI validation case"
require "Case V14 - Three-frame" "$SKILL_DIR/training/validation_cases.md" "missing multi-frame validation case"
require "Case V15 - Physical daylight film" "$SKILL_DIR/training/validation_cases.md" "missing physical-film validation case"
require "Case V16 - Digital capture" "$SKILL_DIR/training/validation_cases.md" "missing digital film-emulation validation case"
require "Case V17 - No automatic film" "$SKILL_DIR/training/validation_cases.md" "missing no-film contamination validation case"
require "Case V18 - Monochrome exclusion" "$SKILL_DIR/training/validation_cases.md" "missing monochrome exclusion validation case"
require "Case V19 - Architectural and interior plausibility" "$SKILL_DIR/training/validation_cases.md" "missing architecture/interior validation case"
require "Case T11 - Prompt contamination" "$SKILL_DIR/training/train_cases.md" "missing prompt-contamination training case"

echo "scene-prompt static training checks passed"
