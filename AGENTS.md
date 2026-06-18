# AGENTS.md

## Project Overview

This project is a real estate market analytics platform built with:

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Supabase

The application is **not a real estate listing portal**.

The primary goal is to provide:

* Real estate market analytics
* Market trends
* Historical price analysis
* City and district comparisons
* Market reports
* Data exploration

Individual listings are secondary and should not dominate the user experience.

---

# Design Principles

The visual design should closely follow the design language of:

* Supabase Dashboard
* Supabase Docs
* Supabase Studio

The application should feel like a professional SaaS analytics platform.

Avoid looking like:

* Sreality
* Zillow
* Realtor portals
* Traditional property listing websites

The product should communicate:

* Data
* Analytics
* Trust
* Simplicity
* Professionalism

---

# Visual Style

## General Feel

Use a modern SaaS aesthetic.

Characteristics:

* Clean
* Spacious
* Minimalistic
* Data-focused
* Professional

The UI should feel closer to:

* Supabase
* Linear
* Vercel
* Stripe Dashboard

than to consumer real estate websites.

---

## Colors

Use the Supabase-inspired palette.

Primary accent:

```text
#3ECF8E
```

or the closest available shadcn/ui theme equivalent.

Guidelines:

* Green is used only for actions, highlights, and positive trends.
* Avoid excessive color usage.
* Most of the UI should rely on neutral tones.

Use:

* subtle borders
* muted backgrounds
* soft hover states

Avoid:

* saturated colors
* gradients everywhere
* flashy cards
* marketing-site aesthetics

---

## Layout

Prefer:

* max-width containers
* clear content hierarchy
* generous whitespace

Typical page structure:

```text
Header

Page title
Page description

Filters

KPI cards

Charts

Data tables

Additional insights
```

Avoid:

* cramped layouts
* dense dashboards
* excessive nesting

---

# Typography

Use default modern sans-serif typography.

Hierarchy:

* Large page title
* Small muted description
* Section headings
* Data visualizations
* Tables

Avoid:

* oversized marketing headlines
* decorative fonts

Typography should feel analytical.

---

# Components

Use shadcn/ui whenever possible.

Preferred components:

* Card
* Table
* Data Table
* Badge
* Tabs
* Select
* Input
* Button
* Sheet
* Dialog
* Tooltip
* Skeleton

Avoid custom components when a shadcn component already exists.

---

# Cards

Cards should be simple.

Good:

* thin border
* subtle background
* modest padding

Bad:

* heavy shadows
* colorful backgrounds
* glassmorphism

Follow the Supabase dashboard style.

---

# Charts

Charts are a core part of the product.

Preferred chart types:

* Line charts
* Area charts
* Bar charts

Avoid:

* Pie charts
* 3D charts
* Decorative charts

Charts should prioritize readability.

Use muted colors.

The primary green accent should be used sparingly.

---

# Tables

Tables are a first-class feature.

The application contains large analytical tables.

Requirements:

* sortable columns
* filtering support
* pagination
* responsive behavior

Tables should resemble:

* Supabase table editor
* Linear issue tables

rather than spreadsheet software.

---

# KPI Cards

Use KPI cards extensively.

Examples:

* Average price
* Median price
* Price per m²
* Active listings
* New listings
* Discounted listings

Each KPI card should contain:

* Label
* Value
* Optional trend indicator

Keep them compact.

---

# Icons

Use Lucide icons.

Avoid mixing icon libraries.

Icons should be subtle and secondary.

---

# SEO Pages

SEO landing pages must not look like blog articles.

Structure:

1. Title
2. Description
3. KPI cards
4. Charts
5. Data table
6. Automatically generated market summary
7. FAQ

The page should feel like a market report.

---

# Market Reports

Reports should resemble:

* financial market reports
* economic dashboards

not editorial articles.

Focus on:

* statistics
* trends
* comparisons

---

# Listing Pages

Listing pages are secondary.

Do not design the product around individual listings.

The primary focus is market-level analytics.

---

# Development Guidelines

Before creating new UI:

Ask:

> "Would Supabase Studio display this feature in a similar way?"

If the answer is yes, follow that approach.

If unsure:

Prefer simplicity over creativity.

Avoid custom styling unless absolutely necessary.

Use existing shadcn/ui primitives whenever possible.

The design system should remain visually consistent across the entire application.

When implementing a page, always prefer:
Tables > Cards > Charts > Custom Visualizations

Do not invent complex visualizations unless explicitly requested.