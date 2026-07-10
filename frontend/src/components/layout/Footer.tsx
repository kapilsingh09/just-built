import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faGlobe, faPlay, faTv } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faXTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

// 1. Icon mapping object matching your required syntax format
const byPrefixAndName = {
  fas: {
    play: faPlay,
    tv: faTv,
    globe: faGlobe,
    ellipsis: faEllipsis,
  },
  fab: {
    instagram: faInstagram,
    twitter: faXTwitter,
    linkedin: faLinkedin,
    github: faGithub,
  },
} as const;

// 2. Define data structures for cleaner readability
const SOCIAL_LINKS = [
  { prefix: 'fab', name: 'instagram', label: 'Instagram', href: 'https://instagram.com/yourprofile' },
  { prefix: 'fab', name: 'twitter', label: 'X', href: 'https://x.com/yourprofile' },
  { prefix: 'fab', name: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/yourprofile' },
  { prefix: 'fab', name: 'github', label: 'GitHub', href: 'https://github.com/yourprofile' },
  { prefix: 'fas', name: 'globe', label: 'Web', href: 'https://yourwebsite.com' },
] as const;

const FOOTER_SECTIONS = [
  {
    title: 'Navigation',
    links: [
      { text: 'Trending Now', href: '/trending', prefix: 'fas', name: 'play', badge: 'Hot' },
      { text: 'Top Anime', href: '/top' },
      { text: 'Simulcasts', href: '/simulcasts' },
      { text: 'Schedule', href: '/schedule' },
      { text: 'Random', href: '/random' },
    ],
  },
  {
    title: 'Community',
    links: [
      { text: 'Forums', href: '/forums', prefix: 'fas', name: 'tv' },
      { text: 'Discord', href: '/discord', badge: 'Join', badgeType: 'outline' },
      { text: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { text: 'Contact Us', href: '/contact' },
      { text: 'Terms of Service', href: '/terms' },
      { text: 'Privacy Policy', href: '/privacy' },
      { text: 'DMCA', href: '/dmca' },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="w-full px-4 py-8 md:px-8 bg-zinc-900">
      {/* Changed h-[70vh] to min-h-[70vh] so the layout doesn't break/overflow on smaller mobile screens */}
      <div className="bg-zinc-800 min-h-[70vh] rounded-[2rem] p-8 md:p-12 lg:p-16 flex flex-col justify-between mx-auto">
        
        {/* Top Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Left Column: Brand Vision & Socials */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Discover new worlds.
              </h2>
              <button 
                aria-label="More options"
                className="bg-zinc-900/50 flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-700 transition-colors border border-zinc-700/50"
              >
                <FontAwesomeIcon icon={byPrefixAndName.fas['ellipsis']} className="text-zinc-400 w-4 h-4" />
              </button>
            </div>
            
            <p className="text-zinc-400 text-[15px] leading-relaxed max-w-[400px]">
              Dive into the ultimate anime experience. Explore thousands of episodes, track your favorites, and join a vibrant community of anime fans worldwide.
            </p>
            
            {/* Social Links Mapping */}
            <div className="flex items-center gap-3 mt-4">
              {SOCIAL_LINKS.map((social) => (
                <SocialButton 
                  key={social.label}
                  href={social.href}
                  icon={<FontAwesomeIcon icon={byPrefixAndName[social.prefix][social.name]} className="w-5 h-5" />} 
                  label={social.label} 
                />
              ))}
            </div>
          </div>

          {/* Right Columns: Dynamic Navigation Links Mapping */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 lg:ml-auto w-full max-w-3xl">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title} className="flex flex-col gap-5">
                <h3 className="text-white font-semibold text-base">{section.title}</h3>
                <ul className="flex flex-col gap-3.5">
                  {section.links.map((link) => (
                    <FooterLink 
                      key={link.text}
                      text={link.text}
                      href={link.href}
                      badge={link.badge}
                      badgeType={link.badgeType}
                      icon={link.prefix && link.name ? (
                        <FontAwesomeIcon icon={byPrefixAndName[link.prefix][link.name]} className="w-4 h-4" />
                      ) : undefined}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Bar: Copyright & Credit */}
        <div className="pt-8 border-t border-zinc-700 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-400 text-sm">
          <p>&copy; {new Date().getFullYear()} AnimeStream. All rights reserved.</p>
          <p>Made with ♥ for anime fans</p>
        </div>

      </div>
    </footer>
  );
}

// --- Subcomponents ---

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function SocialButton({ icon, label, href }: SocialButtonProps) {
  return (
    <Link 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors text-white"
    >
      {icon}
    </Link>
  );
}

interface FooterLinkProps {
  text: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeType?: 'text' | 'outline';
}

function FooterLink({ 
  text, 
  href,
  icon, 
  badge, 
  badgeType = 'text' 
}: FooterLinkProps) {
  return (
    <li>
      <Link href={href} className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[15px]">
        {icon && (
          <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors flex items-center justify-center">
            {icon}
          </span>
        )}
        <span>{text}</span>
        
        {badge && badgeType === 'text' && (
          <span className="text-[#F47521] text-xs font-semibold ml-1">{badge}</span>
        )}
        
        {badge && badgeType === 'outline' && (
          <span className="text-[#F47521] text-[10px] font-medium border border-[#F47521] rounded-full px-2 py-0.5 ml-1">
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}