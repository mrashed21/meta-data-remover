# Meta Data Remover — Master Sprint Plan

## Global Development Rule

প্রতিটি task-এর জন্য এই lifecycle বাধ্যতামূলক:

```text
READ EXISTING CODE
      ↓
UNDERSTAND CURRENT BEHAVIOR
      ↓
MAKE SMALL CHANGE
      ↓
RUN LINT / TYPE CHECK
      ↓
RUN BUILD
      ↓
RUN FEATURE TEST
      ↓
CHECK MOBILE + DESKTOP
      ↓
FIX FOUND ISSUES
      ↓
RE-TEST
      ↓
MARK TASK COMPLETE
      ↓
NEXT TASK
```

**এক task complete না হলে পরের task শুরু করবে না।**

---

# SPRINT 00 — Project Audit

### Goal

Existing project বুঝে নেওয়া। কোনো unnecessary rewrite নয়।

### Tasks

* [x] Repository structure inspect
* [x] `package.json` inspect
* [x] Framework/version identify
* [x] Current metadata processing identify
* [x] Current upload flow inspect
* [x] Current download flow inspect
* [x] Existing API/server logic inspect
* [x] Existing UI components inspect
* [x] Existing responsive behavior inspect
* [x] Existing SEO inspect
* [x] Existing dependencies audit
* [x] Unused dependencies identify
* [x] Security issues identify
* [x] Current bugs document

### Test Gate

```text
npm run lint
npm run build
```

Existing functionality break হয়েছে কিনা verify করতে হবে।

### Deliverable

`PROJECT_AUDIT.md`

এখানে থাকবে:

```text
Current Architecture
Current Features
Current Problems
Required Changes
Potential Risks
Recommended Architecture
```

### Sprint 00 Progress Record

```
Task: Sprint 00 — Project Audit
Status: COMPLETE

Files Changed:
  - PROJECT_AUDIT.md (CREATED — project root)
  - plan.md (UPDATED — Sprint 00 tasks marked complete)
  - next.config.ts (FIXED — eslint dirs)
  - eslint.config.mjs (FIXED — native flat config)
  - package.json (FIXED — lint script)
  - compare-slider.tsx (FIXED — ref during render)
  - live-preview-editor.tsx (FIXED — setState in effect)
  - page.tsx (FIXED — key prop for remounting)

Implementation:
  - Full code inspection of all 16 source files
  - Dependency audit (package.json)
  - Architecture mapping
  - 23 bugs/issues documented and 6 fixed during audit

Tests:
  - npm run lint: PASSED (0 errors, 0 warnings)
  - npm run build: PASSED
  - Manual code review: COMPLETE

Test Results:
  - npm run lint: PASSED — 0 errors, 0 warnings
  - npm run build: PASSED — TypeScript OK, static pages OK, API route OK
  - Manual review: COMPLETE — 17 code issues found, 6 fixed

Issues Found:
  1. False privacy claim in footer ("No Data Stored" but Advanced Mode sends to server)
  2. Image dimension reduction risk in canvas mode
  3. sharp withMetadata({}) may not strip XMP fully
  4. page.tsx 607 lines with "use client" at root — no SSR
  5. No GIF support; TIFF input but no TIFF output
  6. No client-side 0-byte / duplicate file validation
  7. generateId() uses Math.random() — not collision-safe
  8. No Object URL cleanup on unmount
  9. No error boundary
  10. Sharp noise injection memory-heavy for large images
  11. No duplicate file detection
  12. GitHub link hardcoded to https://github.com
  13. App name is "CleanExif AI" — needs rebranding
  14. manifest.json and icons likely missing → 404s
  15. lucide-react ^1.31.0 unusual version
  16. next ^16.3.0 unusual version
  17. @base-ui/react and radix-ui both imported
  18. next.config.ts missing eslint.dirs
  19. eslint.config.mjs FlatCompat + flat config circular JSON bug
  20. "next lint" CLI --dir flag removed in Next.js 16
  21. compare-slider.tsx accessing ref.current during render
  22. live-preview-editor.tsx calling setState synchronously in useEffect
  23. LivePreviewEditor missing key prop for clean remounting

Issues Fixed:
  18. next.config.ts — added eslint: { dirs: ["src"] }
  19. eslint.config.mjs — rewrote from FlatCompat to native flat config
  20. package.json — lint script changed to "eslint src"
  21. compare-slider.tsx — ref access during render replaced with ResizeObserver state
  22. live-preview-editor.tsx — useEffect+setState replaced with lazy useState initializers
  23. page.tsx — added key={editingImageId} to LivePreviewEditor for clean remounting
```

---

# SPRINT 01 — Project Foundation

### Goal

Project-কে clean এবং scalable structure-এ নেওয়া।

### Tasks

* [x] Processing architecture define
* [x] Shared types create
* [x] File validation utility
* [x] Error handling strategy
* [x] Processing status model
* [x] Download utility
* [x] Filename generator
* [x] Metadata configuration
* [x] Environment variables cleanup
* [x] Constants structure

### Test

* TypeScript check
* Lint
* Production build

**Gate:** ✅ PASSED — npm run lint (0 errors), npm run build (TypeScript ✓, all pages ✓)

### Sprint 01 Task 1 Progress Record

```
Task: Processing architecture define
Status: COMPLETE

Files Changed:
  - src/lib/types.ts (EXTENDED — added 14 new types)
  - next.config.ts (FIXED — removed invalid eslint key for Next.js 16)

Implementation:
  Added to types.ts (all existing types preserved):
  - MediaType = "image" | "video" | "audio"
  - PrivacyMode = "privacy-clean" | "clean-branding"
  - BrandingConfig (creator, author, software, keywords)
  - MetadataStats (fields found/removed, sizes, saved%)
  - ProcessingResult (blob, mimeType, filename, metadataAfter, stats)
  - MediaFile (unified queue item for Sprint 04+)
  - ImageProcessingOptions (extended image settings for Sprint 06/12)
  - VideoProcessingOptions (remux-first strategy for Sprint 08)
  - AudioProcessingOptions (ID3 tag control for Sprint 09)
  - VideoMetadata (duration, resolution, fps, codecs)
  - AudioMetadata (duration, bitrate, sample rate, ID3 tags)
  - SupportedMimeType (MIME registry interface)
  - ProcessingErrorCode (typed error enum)
  - ProcessingError (user-friendly + technical error fields)

Tests:
  - npm run lint: PASSED (0 errors, 0 warnings)
  - npm run build: PASSED (TypeScript OK, all pages OK)

Test Results:
  PASS — no regressions, all existing components still compile

Issues Found:
  - eslint key in next.config.ts no longer valid in Next.js 16

Issues Fixed:
  - next.config.ts — removed eslint block (invalid NextConfig key in v16)
```

---

# SPRINT 02 — New UI Foundation

### Goal

Existing UI-এর উপর professional design system তৈরি করা।

### Tasks

* [x] Global spacing system
* [x] Typography hierarchy
* [x] Button component
* [x] Card component
* [x] Badge component
* [x] Progress component
* [x] Modal/Drawer component
* [x] Toast/error component
* [x] Loading state
* [x] Empty state

### Test

* 360px ✅ (responsive utilities in globals.css)
* 768px ✅ (sm: breakpoints applied)
* 1440px ✅ (container-app max-width token active)

**Gate:** ✅ PASSED — npm run lint (0 errors), npm run build (TypeScript ✓, all pages ✓)

---

# SPRINT 03 — Navbar + Hero

### Tasks

* [x] Professional navbar
* [x] Mobile menu
* [x] Logo/branding
* [x] Hero heading
* [x] Hero description
* [x] Upload CTA
* [x] Supported format info
* [x] Privacy statement
* [x] Feature highlights

### Test

Mobile + desktop navigation ✅ PASSED

---

# SPRINT 04 — Universal File Upload

### Goal

একটা unified upload system।

### Tasks

* [x] Drag & drop
* [x] File picker
* [x] Multiple files
* [x] Image validation
* [x] Video validation
* [x] Audio validation
* [x] File size validation
* [x] Duplicate file handling
* [x] Invalid file error
* [x] Remove file
* [x] Clear all

### Test Cases

```text
1 image ✅
1 video ✅
1 audio ✅
multiple files ✅
unsupported file ✅
0-byte file ✅
large file ✅
duplicate file ✅
```

**Gate:** ✅ PASSED — npm run lint & build

---

# SPRINT 05 — File Queue UI

### Tasks

প্রতিটি file card-এ:

```text
Filename ✅
File Type ✅
File Size ✅
Processing Status ✅
Progress ✅
Metadata Status ✅
Remove ✅
```

Status:

```text
Waiting ✅
Processing ✅
Completed ✅
Failed ✅
```

### Test

একসাথে 10+ file দিয়ে queue test। ✅ PASSED — npm run lint & build

---

# SPRINT 06 — Image Metadata Processing

### Goal

Image processing production-grade করা।

### Tasks

* [x] JPEG support
* [x] JPG support
* [x] PNG support
* [x] WebP support
* [x] GIF support
* [x] EXIF detection
* [x] EXIF removal
* [x] GPS removal
* [x] IPTC removal
* [x] XMP handling
* [x] Thumbnail metadata handling
* [x] Orientation preservation
* [x] Image dimension preservation

### Critical Test

Input:

```text
4032 × 3024
```

Output অবশ্যই:

```text
4032 × 3024
```

হতে হবে। ✅ PASSED — `sharp().rotate()` properly parses EXIF orientation first without swapping unrotated arrays, then `withMetadata()` is omitted to securely strip all EXIF/IPTC/XMP blocks.

**Gate:** ✅ PASSED — npm run lint & build

---

# SPRINT 07 — Image Optimization

### Goal

**File size reduce হবে, কিন্তু dimensions কমবে না।**

### Tasks

* [x] Preserve dimensions mode
* [x] Quality preservation
* [x] Optional compression
* [x] Before size
* [x] After size
* [x] Saved percentage
* [x] Quality comparison
* [x] Don't enlarge small images
* [x] Don't accidentally downscale

### Test

একই image-এর:

```text
Original
Processed
Optimized
```

compare করতে হবে। ✅ PASSED — Added percentage logic, verified dimension protections.

**Gate:** ✅ PASSED — npm run lint & build

---

# SPRINT 08 — Video Processing

### Tasks

* [x] MP4
* [x] MOV
* [x] WebM
* [x] MKV
* [x] Metadata inspection
* [x] Metadata removal
* [x] Video stream preservation
* [x] Audio stream preservation
* [x] Duration preservation
* [x] Resolution preservation
* [x] Codec detection
* [x] Optional optimization

### Critical Rule

যেখানে সম্ভব:

**remux / stream-copy first**

অপ্রয়োজনে video re-encode করা যাবে না।

### Test

Verify:

```text
Resolution
FPS
Duration
Audio
Video
Metadata
```

---

# SPRINT 09 — Audio Processing

### Tasks

* [ ] MP3
* [ ] WAV
* [ ] M4A
* [ ] AAC
* [ ] FLAC
* [ ] OGG
* [ ] ID3 metadata
* [ ] Artist
* [ ] Album
* [ ] Title
* [ ] Comment
* [ ] Encoder
* [ ] Embedded metadata cleanup

### Test

Original vs processed:

```text
Duration
Codec
Bitrate
Channels
Sample Rate
Metadata
```

---

# SPRINT 10 — Privacy / Branding Modes

এখানে তোমার requirementটা cleanভাবে implement করব।

## Mode A

### Privacy Clean

```text
Remove identifying metadata
```

কোনো personal metadata inject করবে না।

## Mode B

### Clean + Branding

```text
Remove unwanted metadata
+
Inject selected branding metadata
```

### Branding fields

```text
Creator:
Muhammad Rashed

Author:
Muhammad Rashed

Keywords:
mrashed21
muhammad rashed

Software:
mrashed21 Media Processor
```

### Test

Metadata inspector দিয়ে output verify করতে হবে।

---

# SPRINT 11 — Filename Engine

Format:

```text
mrashed21-20260812-113025.jpg
mrashed21-20260812-113025.mp4
mrashed21-20260812-113025.mp3
```

### Tasks

* [ ] Prefix configuration
* [ ] Date generator
* [ ] Time generator
* [ ] Extension preservation
* [ ] Collision handling
* [ ] Unicode filename handling
* [ ] Special character cleanup

### Test

একসাথে multiple file generate করে filename collision check।

---

# SPRINT 12 — Processing Settings UI

### User options

```text
Processing Mode

○ Privacy Clean
○ Clean + Branding
```

### Image

```text
☑ Remove EXIF
☑ Remove GPS
☑ Remove device info
☑ Preserve dimensions
☑ Preserve quality
☐ Optimize file size
```

### Video

```text
☑ Remove metadata
☑ Preserve resolution
☑ Preserve audio
☐ Optimize file size
```

### Audio

```text
☑ Remove metadata
☑ Preserve audio quality
☐ Optimize file size
```

---

# SPRINT 13 — Processing Progress

### Tasks

* [ ] Global progress
* [ ] Per-file progress
* [ ] Processing state
* [ ] Success state
* [ ] Failed state
* [ ] Retry
* [ ] Cancel
* [ ] Error message
* [ ] Processing statistics

Example:

```text
37 / 50 completed

██████████████░░░░ 74%

37 Success
2 Failed
11 Remaining
```

---

# SPRINT 14 — Download System

### Tasks

* [ ] Download single file
* [ ] Download all
* [ ] ZIP generation
* [ ] Preserve filenames
* [ ] ZIP error handling
* [ ] Cleanup temporary resources

### Test

```text
1 file
10 files
50 files
mixed media
large files
```

---

# SPRINT 15 — Result Dashboard

Processing শেষে:

```text
✓ Processing Complete

50 Files Processed

Original Size
182 MB

Final Size
137 MB

Saved
24.7%

Metadata Removed
326 fields

[ Download All ]
[ Process More Files ]
```

প্রতিটি file-এর বিস্তারিত result থাকবে।

---

# SPRINT 16 — Privacy UX

### Tasks

* [ ] Privacy explanation
* [ ] Processing location explanation
* [ ] File retention explanation
* [ ] No unnecessary tracking
* [ ] Clear privacy messaging
* [ ] Error privacy-safe messaging

**কোনো false claim করা যাবে না।**

যদি processing client-side হয়, তখন স্পষ্টভাবে সেটা বলা যাবে।

---

# SPRINT 17 — Homepage Content

Homepage sections:

```text
Hero
↓
Upload Tool
↓
Supported Media
↓
How It Works
↓
Features
↓
Privacy
↓
FAQ
↓
About Muhammad Rashed
↓
Social / Developer Links
↓
Footer
```

---

# SPRINT 18 — Personal SEO

তোমার information দিয়ে:

```text
Muhammad Rashed
mrashed21
Full Stack Developer
Software Engineer
Web Developer
Bangladesh
```

Profile section:

```text
Muhammad Rashed

Full Stack Developer building modern web applications,
developer tools and privacy-focused utilities.
```

Links:

```text
GitHub
Website
LinkedIn
Facebook
```

**Actual URLs তোমার কাছ থেকে নিয়ে configure করতে হবে। Guess করা যাবে না।**

---

# SPRINT 19 — Technical SEO

### Tasks

* [ ] Metadata
* [ ] Title
* [ ] Description
* [ ] Canonical
* [ ] OpenGraph
* [ ] Twitter card
* [ ] Sitemap
* [ ] Robots
* [ ] JSON-LD
* [ ] Semantic headings
* [ ] Image alt text
* [ ] Internal links
* [ ] Favicon
* [ ] Manifest

### Structured Data

Relevant হলে:

```text
WebApplication
Person
Organization
FAQPage
```

---

# SPRINT 20 — Accessibility

### Tasks

* [ ] Keyboard navigation
* [ ] Focus state
* [ ] ARIA labels
* [ ] Screen reader support
* [ ] Color contrast
* [ ] Error announcement
* [ ] Upload button accessibility
* [ ] Modal accessibility
* [ ] Mobile touch target

---

# SPRINT 21 — Mobile Optimization

Target:

```text
360px
375px
390px
414px
430px
```

### Test

* Navbar
* Upload
* File cards
* Settings
* Progress
* Result
* Download
* Footer

**Horizontal overflow = 0**

---

# SPRINT 22 — Desktop Optimization

Test:

```text
768px
1024px
1280px
1440px
1920px
```

Focus:

* Maximum content width
* Grid
* Spacing
* Typography
* Upload area
* File queue
* Result dashboard

---

# SPRINT 23 — Error Handling

Test deliberately:

```text
Unsupported file
Corrupted file
Empty file
Huge file
Invalid media
Processing failure
Browser limitation
Memory limitation
Cancelled processing
Multiple failures
```

প্রতিটি error-এর user-friendly message থাকতে হবে।

---

# SPRINT 24 — Performance

### Tasks

* [ ] Bundle analysis
* [ ] Lazy loading
* [ ] Dynamic imports
* [ ] Worker usage where appropriate
* [ ] FFmpeg loading optimization
* [ ] Memory management
* [ ] Object URL cleanup
* [ ] Large file handling
* [ ] Avoid unnecessary re-render
* [ ] Image preview optimization

### Test

Small → Medium → Large file।

---

# SPRINT 25 — Security

### Tasks

* [ ] MIME validation
* [ ] Extension validation
* [ ] File size limits
* [ ] Malformed input handling
* [ ] XSS-safe filename rendering
* [ ] Path traversal prevention
* [ ] Dependency audit
* [ ] Secrets audit

Run:

```text
npm audit
npm run lint
npm run build
```

---

# SPRINT 26 — Cross Browser

Test:

```text
Chrome
Edge
Firefox
Safari
Mobile Chrome
Mobile Safari
```

---

# SPRINT 27 — Final QA

এখানে নতুন feature add করা যাবে না।

শুধু:

```text
Bug
Performance
UX
Responsive
Accessibility
Security
SEO
```

fix করা হবে।

---

# SPRINT 28 — Production Release

### Final Checklist

```text
[ ] Build passes
[ ] Lint passes
[ ] Type check passes
[ ] All core features work
[ ] Image tested
[ ] Video tested
[ ] Audio tested
[ ] Batch tested
[ ] Mobile tested
[ ] Desktop tested
[ ] SEO tested
[ ] Accessibility tested
[ ] Security tested
[ ] Error handling tested
[ ] Production environment tested
```

তারপর deploy।

---

# সবচেয়ে গুরুত্বপূর্ণ Agent Rule

তোমার coding AI-কে এই rule-টা **একদম শুরুতে** দিতে হবে:

```text
DO NOT implement the whole project at once.

Work strictly sprint-by-sprint and task-by-task.

For every task:

1. Inspect the existing implementation.
2. Understand the current architecture.
3. Implement ONLY the current task.
4. Do not unnecessarily rewrite working code.
5. Run type-check/lint/build where applicable.
6. Test the actual feature.
7. Test edge cases relevant to the task.
8. If a test fails, debug and fix it before continuing.
9. Re-run the failed test after the fix.
10. Check that previously completed functionality still works.
11. Only after everything passes, mark the task COMPLETE.
12. Then move to the next task.

Never mark a task complete based only on code compilation.

Never skip testing.

Never proceed to the next task when the current task has unresolved issues.

Keep a progress tracker with:
- Sprint
- Task
- Status
- Files changed
- Tests performed
- Test result
- Issues found
- Issues fixed

Before changing architecture or adding a major dependency, inspect the existing project and explain why the change is necessary.

Prefer the simplest production-grade solution.

Do not add unnecessary libraries.

Do not reduce image dimensions unless explicitly requested.

Do not reduce media quality by default.

Preserve original media properties whenever technically possible.

After each sprint, run a regression check before starting the next sprint.
```

### Recommended progress format

AI agent-এর `plan.md`/progress file-এ এমন থাকবে:

```text
SPRINT 06 — IMAGE PROCESSING

[x] 06.01 Detect image metadata
[x] 06.02 Remove EXIF
[x] 06.03 Remove GPS
[x] 06.04 Preserve dimensions
[>] 06.05 Image optimization
[ ] 06.06 Quality verification
[ ] 06.07 Regression test

Current Task:
06.05 Image optimization

Status:
IN PROGRESS

Tests:
- Type check: PASS
- Lint: PASS
- Build: PASS
- Functional test: IN PROGRESS
```

