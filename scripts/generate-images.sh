#!/usr/bin/env bash
# generate-images.sh — batch AI illustration generator
# Uses codex CLI with gpt-image-2 to generate editorial illustrations
# Usage:
#   bash scripts/generate-images.sh           # all images
#   bash scripts/generate-images.sh hero      # only hero images (10 total)
#   bash scripts/generate-images.sh ch01      # only chapter 01 images

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
IMG_DIR="$PROJECT_DIR/assets/images"
CODEX_IMG_DIR="$HOME/.codex/generated_images"
mkdir -p "$IMG_DIR"

FILTER="${1:-all}"
SUFFIX=""
HERO_ONLY=""

STYLE_DARK="Editorial financial illustration, Bloomberg/Financial Times magazine cover quality. Deep warm charcoal background (#0E0E10), amber (#FFB000) and sage green (#8FB8A1) accent shapes, warm white (#ECEAE5) line work, occasional muted red (#FF3D5C) highlight. Geometric flat composition, minimal English labels only (absolutely no Chinese text in the image), sophisticated, restrained, slight grain texture, 16:9 aspect ratio."

STYLE_PAPER="Editorial financial illustration, Financial Times Weekend / The Economist Saturday spread quality. Warm cream newsprint background (#F4F0E6 with subtle paper grain), deep ink (#1A1A22) line work and primary forms, burnt amber (#B8741A) and forest sage (#5B8A6E) accent shapes, occasional muted brick red (#A4423C) highlight, soft warm shadows. Geometric flat composition, minimal English labels only (absolutely no Chinese text in the image), refined, restrained, vintage-magazine paper texture, 16:9 aspect ratio."

STYLE="$STYLE_DARK"

# Resolve filter into mode
case "$FILTER" in
  hero-paper)
    STYLE="$STYLE_PAPER"
    SUFFIX="-paper"
    HERO_ONLY=1
    ;;
  paper)
    STYLE="$STYLE_PAPER"
    SUFFIX="-paper"
    ;;
  hero)
    HERO_ONLY=1
    ;;
esac

MAX_RETRIES=2
SUCCESS=0
FAIL=0
TS_FILE="/tmp/codex_imggen_ts_$$"

run_image() {
  local id="$1"
  local subject="$2"
  local outfile="$IMG_DIR/${id}${SUFFIX}.png"

  # Filter
  if [[ -n "$HERO_ONLY" && "$id" != *"-hero" ]]; then return; fi
  if [[ "$FILTER" == ch* && "$id" != "${FILTER}"* ]]; then return; fi

  if [[ -f "$outfile" ]]; then
    echo "  [skip] $id already exists"
    return
  fi

  echo "  [gen]  $id — $subject"

  local attempt=0
  while [[ $attempt -le $MAX_RETRIES ]]; do
    # Timestamp reference: find files created AFTER this point
    touch "$TS_FILE"

    codex exec \
      --skip-git-repo-check \
      -c sandbox=danger-full-access \
      -c ask_for_approval=never \
      "Use the gpt-image-2 model to generate an editorial financial illustration.

STYLE: $STYLE
SUBJECT: $subject
Resolution: 1600x900 pixels
Important: Generate the image and save it to any writable location. Output the full saved file path when done." 2>/dev/null || true

    # Find the newest PNG generated since our timestamp
    local newest
    newest=$(find "$CODEX_IMG_DIR" -name "*.png" -newer "$TS_FILE" 2>/dev/null | sort | tail -1)

    if [[ -n "$newest" && -f "$newest" ]]; then
      cp "$newest" "$outfile"
      echo "  [ok]   $id → $(du -sh "$outfile" | cut -f1)"
      ((SUCCESS++)) || true
      return
    fi

    ((attempt++)) || true
    if [[ $attempt -le $MAX_RETRIES ]]; then
      echo "  [retry $attempt] $id"
      sleep 3
    fi
  done

  echo "  [fail] $id — check $CODEX_IMG_DIR manually"
  cat > "${outfile%.png}.placeholder" <<EOF
PLACEHOLDER: $id
Subject: $subject
Retry: bash scripts/generate-images.sh $id
EOF
  ((FAIL++)) || true
}

trap 'rm -f "$TS_FILE"' EXIT

echo "================================================"
echo "  US Stock Tutorial — AI Image Generator"
echo "  Filter: $FILTER"
echo "  Output: $IMG_DIR"
echo "================================================"
echo ""

# ── Chapter 01: Getting Started ──────────────────────────────────
run_image "ch01-hero"     "NYSE trading floor abstracted as monumental geometric architecture, floating ticker tape ribbons rendered as gold geometric strips against charcoal void, dramatic perspective"
run_image "ch01-inline-1" "A large company building being sliced like a pizza into equal ownership shares, each slice labeled with a dollar sign, geometric flat illustration"
run_image "ch01-inline-2" "An order book visualized as geometric staircase steps, bid prices ascending in green on the left, ask prices descending in red on the right, floating in dark space"

# ── Chapter 02: Market Structure ─────────────────────────────────
run_image "ch02-hero"     "Four geometric badge medallions representing SP500, Nasdaq, Dow Jones and Russell 2000 indices, arranged in elegant composition, each with distinct geometric symbol"
run_image "ch02-inline-1" "Abstract market maker mechanism: order flow represented as geometric streams converging through a central diamond node, bid and ask sides color-coded"
run_image "ch02-inline-2" "Three horizontal time bands representing pre-market dawn, regular trading hours noon, and after-hours dusk, with geometric clock motifs and activity levels"

# ── Chapter 03: Valuation ─────────────────────────────────────────
run_image "ch03-hero"     "An antique balance scale: left pan holds an abstract corporate building, right pan holds stacked gold coins, set against deep charcoal, dramatic editorial composition"
run_image "ch03-inline-1" "Price-to-Earnings ratio as geometric fraction: numerator block labeled P above a horizontal dividing line, denominator block labeled E below, surrounded by mathematical elegance"
run_image "ch03-inline-2" "Buffett Indicator visualization: a stock market balloon floating above GDP ground anchor, connected by a taut string, atmospheric and metaphorical"
run_image "ch03-inline-3" "CAPE Shiller PE ratio as a smooth rolling wave averaged over 10 years versus jagged annual earnings spikes, data visualization aesthetic"

# ── Chapter 04: Financials ────────────────────────────────────────
run_image "ch04-hero"     "Three stacked financial report documents in perspective, each with distinct geometric spine color: amber for income statement, green for balance sheet, blue for cash flow"
run_image "ch04-inline-1" "Income statement waterfall cascade: revenue block at top flowing down through cost deductions into smaller gross profit, operating profit, net income blocks"
run_image "ch04-inline-2" "Balance sheet T-account visualization: assets column on left in warm tones, liabilities and equity column on right in cool tones, perfectly balanced"
run_image "ch04-inline-3" "Cash flow arrows: operating cash flow (large arrow), investment cash flow (medium arrow pointing inward), financing cash flow (outward arrows), three distinct streams"

# ── Chapter 05: Technical Analysis ───────────────────────────────
run_image "ch05-hero"     "Dramatic close-up of a large bullish candlestick, warm amber body with wicks, intersected by two smooth moving average curves in sage green and muted white"
run_image "ch05-inline-1" "Three classic candlestick patterns side by side: Hammer with long lower wick, Shooting Star with long upper wick, Doji cross pattern, each labeled in English"
run_image "ch05-inline-2" "Moving average golden cross and death cross on price chart: two curves intersecting, upward cross glowing green, downward cross glowing red"
run_image "ch05-inline-3" "MACD indicator visualization: histogram bars above and below zero line, signal line crossing for abstract geometric data art"
run_image "ch05-inline-4" "Volume price confirmation: left panel shows price rising with tall volume bars (true breakout), right panel shows price rising with shrinking bars (false signal)"

# ── Chapter 06: Sector Rotation ──────────────────────────────────
run_image "ch06-hero"     "Sector rotation clock face with four quadrants labeled Expansion, Peak, Contraction, Recovery, eleven sector medallions arranged around the clock face"
run_image "ch06-inline-1" "Economic cycle as a smooth sine wave divided into four labeled phases with distinct color zones, clean data visualization"
run_image "ch06-inline-2" "VIX fear index as both a thermometer and EKG heartbeat monitor combined, calm flat line vs. jagged panic spikes, amber and red contrast"
run_image "ch06-inline-3" "Sahm Rule trigger: unemployment rate trend line crossing above a threshold dotted line, shaded recession zone, clean economic indicator chart"

# ── Chapter 07: Options Basics ───────────────────────────────────
run_image "ch07-hero"     "Two large ornate doors: the left door labeled CALL opens upward revealing ascending stairs, the right door labeled PUT opens downward, with a golden key floating between them"
run_image "ch07-inline-1" "Option value decomposed into two stacked geometric blocks: intrinsic value in solid amber, time value in translucent gradient fading toward expiration"
run_image "ch07-inline-2" "Four-point compass rose with Greek letter symbols: Delta pointing up, Gamma pointing right, Theta pointing down (hourglass shape), Vega pointing left (wave)"
run_image "ch07-inline-3" "Volatility smile curve: a U-shaped smile across strike prices, implied volatility on Y-axis, with a small smiling face incorporated naturally into the data curve"
run_image "ch07-inline-4" "Theta time decay: an hourglass with sand flowing, the option premium price bar melting/shrinking day by day as days-to-expiration countdown appears"

# ── Chapter 08: Options Strategies ───────────────────────────────
run_image "ch08-hero"     "Three geometric bird/strategy shapes: a butterfly in amber, an iron condor bird with four wings in multi-color, a straddle as symmetric V-shape, floating in dark space"
run_image "ch08-inline-1" "Covered call payoff diagram as clean geometric lines: stock position slope intersected by the call premium ceiling, breakeven and max profit labeled"
run_image "ch08-inline-2" "Bull call spread and bear put spread as mirrored geometric shapes, credit/debit zones highlighted, clean strategy diagram aesthetic"
run_image "ch08-inline-3" "Iron condor visualized as a four-winged geometric bird with bounded profit zone highlighted in center, loss zones at extremes"
run_image "ch08-inline-4" "Insurance policy metaphor: an insurance contract document with premium payment coins, representing the option seller as insurance company concept"

# ── Chapter 09: Risk & Psychology ────────────────────────────────
run_image "ch09-hero"     "A dramatic balance scale: left pan holds a geometric skull representing risk, right pan holds stacked gold coins representing reward, balanced in tension"
run_image "ch09-inline-1" "A wall of theatrical masks representing cognitive biases: loss aversion mask, confirmation bias mask, anchoring bias mask, each with distinct expression"

# ── Chapter 10: Case Studies ─────────────────────────────────────
run_image "ch10-hero"     "Triptych editorial composition: three framed scenes from 2020 NVDA bull run, 2022 META crash, 2023 SVB bank failure, each with distinct geometric mood"
run_image "ch10-inline-1" "NVIDIA bull run as ascending geometric staircase each step labeled with a year, final step dramatically elevated with GPU chip geometric icon"
run_image "ch10-inline-2" "META 2022 single-day -26% drop as a dramatic cliff edge, stock price line walking off into void, muted red fog below"
run_image "ch10-inline-3" "SVB bank failure: vault door falling open, stylized bank building crumbling in geometric fragments, newspaper headline aesthetic"

echo ""
echo "================================================"
echo "  Done. Success: $SUCCESS  Failed: $FAIL"
echo "================================================"
