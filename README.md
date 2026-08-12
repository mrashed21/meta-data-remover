# ZeroMeta 🛡️

A powerful, privacy-first web application designed to strip hidden metadata, EXIF data, GPS location, and AI watermarks from images, videos, and audio files. Built with Next.js 16 and Tailwind CSS.

![ZeroMeta](https://img.shields.io/badge/Privacy-First-success?style=for-the-badge) ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)

## ✨ Features

- **Universal Format Support**: Handles `JPG`, `PNG`, `WebP`, `MP4`, `WebM`, and `MP3`.
- **Stateless Edge Architecture**: Processing in "Privacy Clean" mode happens entirely locally in your browser. "Clean + Branding" uses stateless edge workers—zero logs, zero retention.
- **Batch Processing**: Handle 50+ files concurrently with smart size limit validations and a unified progress UI.
- **Result Dashboard**: Visually compare file sizes and track EXACT compression metrics with our live analytics UI.
- **Universal ZIP Export**: Click one button to compile all your cleaned media into a single `.zip` file automatically downloaded directly to your device.
- **Responsive & Accessible**: Seamless UI scaling from mobile to ultra-wide desktop monitors, strictly adhering to WCAG standards.

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js 18.17 or later installed.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrashed21/meta-data-remover.git
   cd meta-data-remover
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Media Processing**: Canvas API (Client) + Sharp (Server API Routes)
- **Archive Generation**: JSZip

## 📈 Deployment (Vercel)

The easiest way to deploy this Next.js application is via Vercel.

1. Create a free account on [Vercel](https://vercel.com/).
2. Push your code to a GitHub repository.
3. Import the repository into your Vercel dashboard.
4. Click **Deploy**. Vercel will automatically configure the build settings (`npm run build`). No environment variables are necessary as this app runs completely statelessly!

## 👨‍💻 Author

**Muhammad Rashed**
- GitHub: [@mrashed21](https://github.com/mrashed21)
- LinkedIn: [mrashed21](https://linkedin.com/in/mrashed21)
- Facebook: [mrashed21](https://facebook.com/mrasheed21)

---

*Built with ❤️ in Bangladesh.*
