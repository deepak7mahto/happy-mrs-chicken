---
version: 1.0.0
name: Joyful Cartoon Playroom
description: Tactile, warm, and high-contrast design system tailored for toddlers and young children playing Adventures of Trishu & Peppa Pig arcade games.
colors:
  primary: "#FF4081"
  primary-dark: "#C2185B"
  secondary: "#FFB74D"
  secondary-dark: "#E65100"
  accent-green: "#4CAF50"
  accent-blue: "#29B6F6"
  accent-purple: "#AB47BC"
  bg-overlay: "rgba(0, 0, 0, 0.65)"
  card-bg: "#FFFFFF"
  card-border: "#FFD54F"
  card-border-selected: "#4CAF50"
  text-primary: "#263238"
  text-secondary: "#546E7A"
  peppa-pink: "#FFB6C1"
  peppa-red: "#E53935"
  george-blue: "#1E88E5"
  trishu-purple: "#B388FF"
  chick-yellow: "#FFEE58"
typography:
  heading-xl:
    fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive, sans-serif'
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
  heading-md:
    fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive, sans-serif'
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.25
  label-btn:
    fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive, sans-serif'
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.2
  caption:
    fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive, sans-serif'
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: 10px
  md: 18px
  lg: 24px
  pill: 9999px
spacing:
  xs: 6px
  sm: 10px
  md: 16px
  lg: 24px
  xl: 32px
components:
  avatar-card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.lg}"
    padding: 12px
    border: "3.5px solid {colors.card-border}"
  pill-button:
    rounded: "{rounded.pill}"
    padding: "8px 18px"
---

# Joyful Cartoon Playroom — Design System

## Overview
**Joyful Cartoon Playroom** is a child-first, tactile design language engineered for early childhood gameplay (ages 2–6) in the *Adventures of Trishu* and *Peppa Pig* arcade suites. It emphasizes generous touch boundaries, instant visual and auditory feedback, expressive cartoon vector art, and zero sensory fatigue.

## Colors
- **Warm Canvas**: Friendly sky blues, grassy greens, sunny yellows, and cheerful pastel backdrops.
- **Character Identities**:
  - **Peppa Pig**: Iconic Strawberry Red (`#E53935`) and Piglet Pink (`#FFB6C1`).
  - **George Pig**: Sky Blue (`#1E88E5`) and Dinosaur Green (`#4CAF50`).
  - **Trishu**: Playful Lavender (`#B388FF`) and Coral Ribbon (`#FF6B6B`).
  - **Mrs. Clucky & Chicks**: Sunny Butter Yellow (`#FFEE58`) and Hen Comb Crimson (`#E53935`).
- **High-Contrast Touch Targets**: Bold 3px to 4px outlines with dark, tactile 3D drop-shadows ensure touch boundaries are immediately perceptible for young fingers.

## Typography
- **Friendly Rounded Curves**: Utilizes `"Comic Sans MS"`, `"Chalkboard SE"`, and modern rounded fallbacks for immediate legibility and friendly toddler appeal.
- **Microcopy**: Short, positive, emoji-rich labels (*"Let's Play! 🌟"*, *"Tap to choose 🐷"*).

## Elevation & Depth
- **Tactile 3D Buttons**: Buttons use solid bottom borders (`box-shadow: 0 4px 0 ...`) simulating physical squishy arcade buttons that sink on press (`transform: translateY(3px)`).

## Components
- **Avatar Selection Modal**: A non-intrusive full-screen overlay with quick category filter pills, responsive card grid, live interactive procedural canvas previews, and joyful sound triggers.
- **HUD Navigation**: Floating circular tactile badges at the screen perimeter, with safety insets for mobile status bars and notches.
