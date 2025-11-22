# Design System & UI Guidelines

This document serves as the single source of truth for the visual design of **BelajarShafa**. All development should adhere to these guidelines to ensure consistency across the mobile (Mentee/Mentor) and desktop (Manager) experiences.

## 1. Color Palette

### 1.1 Primary (Brand Identity)
Used for primary actions, active states, and brand presence.
*   **Primary Blue:** `#0F766E` (Teal 700) - Main Brand Color
*   **Primary Light:** `#99F6E4` (Teal 200) - Backgrounds / Accents
*   **Primary Dark:** `#115E59` (Teal 800) - Hover States / Text

### 1.2 Secondary (Accent)
Used for high-emphasis actions (e.g., "Check-In Now") or notifications.
*   **Accent Orange:** `#F97316` (Orange 500)
*   **Accent Gold:** `#EAB308` (Yellow 500)

### 1.3 Neutrals
Used for text, backgrounds, and borders.
*   **Background (Page):** `#F8FAFC` (Slate 50)
*   **Surface (Card):** `#FFFFFF` (White)
*   **Text Main:** `#0F172A` (Slate 900)
*   **Text Secondary:** `#64748B` (Slate 500)
*   **Border:** `#E2E8F0` (Slate 200)

### 1.4 Semantic (Feedback)
*   **Success:** `#22C55E` (Green 500) - Attendance Success, Course Complete
*   **Error:** `#EF4444` (Red 500) - Validation Error, Missed Deadline
*   **Warning:** `#F59E0B` (Amber 500) - Pending Action
*   **Info:** `#3B82F6` (Blue 500) - System Notices

---

## 2. Typography

**Font Family:** `Inter` or `Plus Jakarta Sans` (Google Fonts).

### 2.1 Scale (Mobile-First)
| Style | Size (rem) | Size (px) | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Heading 1** | 1.75 | 28 | Bold (700) | 1.2 | Page Titles |
| **Heading 2** | 1.5 | 24 | SemiBold (600) | 1.3 | Section Headers |
| **Heading 3** | 1.25 | 20 | SemiBold (600) | 1.4 | Card Titles |
| **Body Large** | 1.125 | 18 | Regular (400) | 1.6 | Intro Text |
| **Body Base** | 1.0 | 16 | Regular (400) | 1.5 | Default Text |
| **Body Small** | 0.875 | 14 | Regular (400) | 1.5 | Metadata, Hints |
| **Caption** | 0.75 | 12 | Medium (500) | 1.4 | Labels, Badges |

---

## 3. Spacing & Layout

**Base Unit:** `4px` (0.25rem).

### 3.1 Spacing Scale
*   `xs` (4px): Tight grouping (icon + text).
*   `sm` (8px): Related elements (label + input).
*   `md` (16px): Standard padding, component separation.
*   `lg` (24px): Section separation.
*   `xl` (32px): Major layout blocks.
*   `2xl` (48px+): Page margins (Desktop).

### 3.2 Grid System
*   **Mobile:** 4 Columns, 16px Margin, 16px Gutter.
*   **Tablet:** 8 Columns, 24px Margin, 24px Gutter.
*   **Desktop:** 12 Columns, Max-width 1280px, 32px Gutter.

---

## 4. UI Components

### 4.1 Buttons
*   **Height:** 44px (Mobile Touch Target) / 40px (Desktop Compact).
*   **Radius:** `8px` or `Full` (Pill shape).
*   **Primary:** Solid Brand Color, White Text.
*   **Secondary:** Outline Brand Color, Brand Text.
*   **Ghost:** Transparent Background, Brand Text (Hover effect).

### 4.2 Cards (Container)
*   **Background:** White (`#FFFFFF`).
*   **Border Radius:** `16px` (Modern, friendly).
*   **Border:** 1px Solid `#E2E8F0` (Optional, for contrast).
*   **Shadow:** `shadow-sm` (Default), `shadow-md` (Hover).

### 4.3 Inputs
*   **Height:** 44px minimum.
*   **Border:** 1px Solid `#CBD5E1`.
*   **Focus:** 2px Ring Brand Color (`#0F766E`).
*   **Error:** Red Border + Error Message below.

### 4.4 Navigation
*   **Mobile:** Bottom Navigation Bar (Fixed). Icons + Labels.
*   **Desktop:** Sidebar Navigation (Left). Collapsible.

---

## 5. Iconography
*   **Library:** `Lucide React` or `Heroicons`.
*   **Style:** Outline (Stroke 1.5px or 2px).
*   **Size:** 24px (Standard), 20px (Small), 16px (Micro).

## 6. Effects & Animation
*   **Shadows:** Soft, diffuse shadows to create depth without clutter.
*   **Glassmorphism:** Optional usage on sticky headers or overlays (`backdrop-blur-md` + semi-transparent white).
*   **Transitions:** All interactive states (hover, active) should have `transition-all duration-200`.
