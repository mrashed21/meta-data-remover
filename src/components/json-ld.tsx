
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "ZeroMeta",
        "url": "https://mrashed21.me",
        "description": "Fast and private EXIF metadata, GPS location, and watermark remover running entirely in your browser.",
        "applicationCategory": "BrowserApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "author": {
          "@id": "https://mrashed21.me/#person"
        }
      },
      {
        "@type": "Person",
        "@id": "https://mrashed21.me/#person",
        "name": "Muhammad Rashed",
        "url": "https://mrashed21.me",
        "sameAs": [
          "https://github.com/mrashed21",
          "https://linkedin.com/in/mrashed21",
          "https://facebook.com/mrashed21"
        ],
        "jobTitle": "Full Stack Developer",
        "worksFor": {
          "@type": "Organization",
          "name": "Self-employed"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Why should I remove EXIF data?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Photos and videos capture hidden metadata including exact GPS coordinates, camera serial numbers, and device models. Removing this data protects your identity and exact physical location when sharing online."
            }
          },
          {
            "@type": "Question",
            "name": "Does it reduce my image quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. By default, ZeroMeta completely preserves your original dimensions and visual quality. You optionally select 'Optimize file size' if you wish to apply compression."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a file size limit?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, the current batch processing engine safely supports files up to 50MB per file to prevent browser memory crashes during massive parallel tasks."
            }
          },
          {
            "@type": "Question",
            "name": "How does Clean + Branding work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Clean + Branding acts as a double-pass system. First, it strictly strips all original EXIF data (GPS, camera info). Then, it safely injects 'Muhammad Rashed' as the Author/Creator tag in the IFD0 block, allowing you to protect your identity while claiming creative ownership."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
