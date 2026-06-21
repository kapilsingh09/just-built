import Link from "next/link";
import { Heart } from "lucide-react";

// ─── Footer ───────────────────────────────────────────────────────────────────
// Clean 4-column footer with links, branding, and social icons.
// ──────────────────────────────────────────────────────────────────────────────

const footerLinks = {
  about: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
  ],
  quickLinks: [
    { label: "Trending", href: "#" },
    { label: "Popular", href: "#" },
    { label: "Top Rated", href: "#" },
    { label: "New Releases", href: "#" },
  ],
  categories: [
    { label: "Action", href: "#" },
    { label: "Romance", href: "#" },
    { label: "Comedy", href: "#" },
    { label: "Sci-Fi", href: "#" },
  ],
  connect: [
    { label: "Twitter", href: "#" },
    { label: "Discord", href: "#" },
    { label: "Reddit", href: "#" },
    { label: "GitHub", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      {/* ── Main Footer ────────────────────────────────────────────────── */}
      <div className="container-main section-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-extrabold text-primary tracking-tight">
                Ani<span className="gradient-text-accent">Verse</span>
              </span>
            </Link>
            <p className="text-secondary text-sm leading-relaxed max-w-xs">
              Discover, track, and organize your favorite anime.
              Your personal anime universe awaits.
            </p>
          </div>

          {/* Link Columns */}
          <FooterColumn title="About" links={footerLinks.about} />
          <FooterColumn title="Quick Links" links={footerLinks.quickLinks} />
          <FooterColumn title="Categories" links={footerLinks.categories} />
          <FooterColumn title="Connect" links={footerLinks.connect} />
        </div>
      </div>

      {/* ── Copyright Bar ──────────────────────────────────────────────── */}
      <div className="border-t border-border">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-secondary">
            © {new Date().getFullYear()} AniVerse. All rights reserved.
          </p>
          <p className="text-xs text-secondary flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-danger" fill="currentColor" /> for anime fans
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Footer Column ─────────────────────────────────────────────────────────────

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-primary mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-secondary hover:text-accent transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
