"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, FileImage, Lock, Home, Info } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <>
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "nav-surface border-b"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ─── Logo / Branding ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-[rgba(0,200,255,0.2)] transition-transform duration-300 group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {/* Pulsing indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-background animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight font-sans">
              ZeroMeta
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground leading-none hidden sm:block uppercase tracking-widest mt-0.5">
              Secure Media Processing
            </p>
          </div>
        </div>

        {/* ─── Desktop Navigation ─────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#privacy" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Privacy first
            </a>
          </nav>
          
          <div className="w-px h-6 bg-border" />

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 badge-brand">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">100% Client-Side</span>
            </div>
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <a
                href="https://github.com/mrashed21/meta-data-remover"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>

        {/* ─── Desktop Only: No Mobile Hamburger here ─── */}
      </div>
    </motion.header>
    
    {/* ─── Mobile Bottom Navigation ─── */}
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 mobile-bottom-nav">
      <nav className="flex items-center justify-around p-2">
        <a href="#features" className="mobile-bottom-nav-item">
          <Sparkles className="w-5 h-5" />
          <span>Features</span>
        </a>
        <a href="#how-it-works" className="mobile-bottom-nav-item">
          <Info className="w-5 h-5" />
          <span>Guide</span>
        </a>
        <a href="#privacy" className="mobile-bottom-nav-item">
          <Lock className="w-5 h-5" />
          <span>Privacy</span>
        </a>
        <a href="https://github.com/mrashed21/meta-data-remover" target="_blank" rel="noopener noreferrer" className="mobile-bottom-nav-item">
          <GithubIcon className="w-5 h-5" />
          <span>GitHub</span>
        </a>
      </nav>
    </div>
    </>
  );
}
