"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code2,
  Globe,
  Image as ImageIcon,
  Lock,
  Server,
  ShieldCheck,
  Trash2,
  Video,
  Zap
} from "lucide-react";
import { motion } from "motion/react";

export function LandingSections() {
  return (
    <div className="flex flex-col gap-24 py-16 sm:py-24">
      {/* ─── HOW IT WORKS ─── */}
      <section className="space-y-10">
        <div className="text-center space-y-4">
          <Badge className="badge-brand">How It Works</Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Strip metadata in 3 simple steps
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our tool operates entirely in your browser, ensuring maximum privacy and blazing-fast processing without the need for uploads.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Select Files", desc: "Drag and drop images, videos, or audio files directly into the browser.", icon: ImageIcon },
            { step: "02", title: "Configure Rules", desc: "Choose strict Privacy Clean or inject your own custom branding tags.", icon: Zap },
            { step: "03", title: "Download Clean", desc: "Download individual files or grab the entire batch in a neat ZIP archive.", icon: ShieldCheck },
          ].map((item, i) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="surface-hover h-full">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative">
                    <item.icon className="w-6 h-6 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Built for creators and privacy advocates
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {[
            { title: "Universal Media Support", desc: "Process JPG, PNG, WebP, MP4, WebM, and MP3 seamlessly.", icon: Video },
            { title: "Intelligent File Engine", desc: "Automated filename sanitization and conflict resolution.", icon: Server },
            { title: "Zero Quality Loss", desc: "Remove EXIF without destroying your media dimensions or quality.", icon: ImageIcon },
            { title: "Batch Processing", desc: "Handle 50+ files simultaneously with intelligent queue management.", icon: Zap },
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-4 p-4 surface-hover"
            >
              <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── PRIVACY ─── */}
      <section className="space-y-10">
        <div className="text-center space-y-4">
          <Badge className="badge-success">Privacy First</Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Your data never leaves your device
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <Card className="surface-hover">
            <CardContent className="p-6 space-y-3">
              <Lock className="w-6 h-6 status-success" />
              <h3 className="font-medium">Client-Side Architecture</h3>
              <p className="text-sm text-muted-foreground">In Privacy Clean mode, all processing is performed locally in your browser using Canvas and WebAssembly. No files are uploaded.</p>
            </CardContent>
          </Card>
          <Card className="surface-hover">
            <CardContent className="p-6 space-y-3">
              <Server className="w-6 h-6 status-success" />
              <h3 className="font-medium">Stateless Edge Processing</h3>
              <p className="text-sm text-muted-foreground">When injecting custom branding, files are temporarily handled by stateless edge servers. Absolutely zero logs are kept.</p>
            </CardContent>
          </Card>
          <Card className="surface-hover">
            <CardContent className="p-6 space-y-3">
              <Trash2 className="w-6 h-6 status-success" />
              <h3 className="font-medium">Instant Deletion</h3>
              <p className="text-sm text-muted-foreground">Any buffers utilized during processing are immediately wiped from memory. We do not retain, store, or analyze your media.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="space-y-10 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="w-full flex flex-col gap-3">
          {[
            {
              q: "Why should I remove EXIF data?",
              a: "Photos and videos capture hidden metadata including exact GPS coordinates, camera serial numbers, and device models. Removing this data protects your identity and exact physical location when sharing online."
            },
            {
              q: "Does ZeroMeta compress my images?",
              a: "No. By default, ZeroMeta completely preserves your original dimensions and visual quality. You optionally select \"Optimize file size\" if you wish to apply compression."
            },
            {
              q: "Is it really free?",
              a: "Yes. ZeroMeta is 100% free with no hidden limits. Our \"Privacy Clean\" mode runs entirely in your browser, costing us nothing in server fees, allowing us to keep it free."
            },
            {
              q: "How does Clean + Branding work?",
              a: "Clean + Branding acts as a double-pass system. First, it strictly strips all original EXIF data (GPS, camera info). Then, it safely injects \"Muhammad Rashed\" as the Author/Creator tag in the IFD0 block, allowing you to protect your identity while claiming creative ownership."
            }
          ].map((faq, i) => (
            <details key={i} className="group border rounded-xl overflow-hidden bg-card/50">
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-sm text-foreground hover:bg-muted/50 transition-colors">
                {faq.q}
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-muted-foreground text-sm border-t border-border/50 bg-muted/10">
                <div className="pt-3 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── ABOUT & DEVELOPER LINKS ─── */}
      <section className="space-y-10 max-w-4xl mx-auto w-full text-center pb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <Code2 className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Muhammad Rashed
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-4">
            Full Stack Developer building modern web applications, developer tools, and privacy-focused utilities from Bangladesh.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto mb-6">
            ZeroMeta is built to give power back to the user. In an era where AI companies scrape the internet for training data and social networks track every EXIF coordinate, we provide a mathematically secure way to strip your files of hidden trackers.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <a href="https://github.com/mrashed21" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full border bg-card hover:bg-muted transition-colors text-sm font-medium">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            GitHub
          </a>
          <a href="https://linkedin.com/in/mrashed21" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full border bg-card hover:bg-muted transition-colors text-sm font-medium">
            <Globe className="w-4 h-4" />
            LinkedIn
          </a>
          <a href="https://facebook.com/mrashed21" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full border bg-card hover:bg-muted transition-colors text-sm font-medium">
            <Globe className="w-4 h-4" />
            Facebook
          </a>
        </div>
      </section>
    </div>
  );
}
