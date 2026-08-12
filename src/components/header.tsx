"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Menu, FileImage, Lock, Settings } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
} from "@/components/ui/drawer";

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
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container-app h-16 flex items-center justify-between">
        {/* ─── Logo / Branding ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.27_293)] to-[oklch(0.42_0.27_293)] flex items-center justify-center shadow-lg shadow-[oklch(0.55_0.27_293/0.3)] transition-transform duration-300 group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {/* Pulsing indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-background animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight">
              mrashed21
              <span className="text-[oklch(0.65_0.22_293)] ml-1 font-semibold">Privacy</span>
            </h1>
            <p className="text-[10.5px] font-medium text-muted-foreground leading-none hidden sm:block uppercase tracking-widest mt-0.5">
              Media Metadata Remover
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
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[oklch(0.55_0.27_293/0.1)] border border-[oklch(0.55_0.27_293/0.2)] text-[oklch(0.75_0.18_293)]">
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

        {/* ─── Mobile Menu (Drawer) ───────────────────────────────────────── */}
        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent side="right">
              <DrawerHeader>
                <DrawerTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand" />
                  Menu
                </DrawerTitle>
              </DrawerHeader>
              <DrawerBody className="flex flex-col gap-4 py-4">
                <nav className="flex flex-col gap-2">
                  <a href="#features" className="p-3 rounded-lg hover:bg-muted font-medium text-foreground transition-colors">Features</a>
                  <a href="#how-it-works" className="p-3 rounded-lg hover:bg-muted font-medium text-foreground transition-colors">How it works</a>
                  <a href="#privacy" className="p-3 rounded-lg hover:bg-muted font-medium text-foreground transition-colors flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" /> Privacy first
                  </a>
                </nav>
                <div className="mt-auto pt-6 border-t border-border flex flex-col gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[oklch(0.55_0.27_293/0.1)] border border-[oklch(0.55_0.27_293/0.2)] text-[oklch(0.75_0.18_293)]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">100% Client-Side Processing</span>
                  </div>
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a
                      href="https://github.com/mrashed21/meta-data-remover"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GithubIcon className="w-4 h-4" />
                      View on GitHub
                    </a>
                  </Button>
                </div>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </motion.header>
  );
}
