import Link from 'next/link';
import {
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaGlobe,
  FaGithub,
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full px-6 pb-8">
      <div className="mx-auto max-w-[1800px] rounded-[36px] border border-white/10 bg-[#171717] px-8 py-16 md:px-20 md:py-20">

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr] gap-12 lg:gap-20">

          {/* Left - Branding */}
          <div>
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 w-fit mb-8">
              <div className="h-12 w-12 rounded-xl bg-[#F47521] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/30">
                A
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Ani<span className="text-[#F47521]">Verse</span>
              </h1>
            </Link>

            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
              Your anime,
              <br />
              our universe.
            </h2>

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-zinc-400">
              Discover, track, and organize your favorite anime. The ultimate destination for fans to explore new worlds and timeless stories.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <a href="#" aria-label="Instagram" className="flex items-center justify-center h-14 w-14 rounded-full border border-white/10 bg-black/30 hover:border-[#F47521] hover:text-[#F47521] text-white transition-all cursor-pointer">
                <FaInstagram className="w-6 h-6" />
              </a>

              <a href="#" aria-label="Twitter" className="flex items-center justify-center h-14 w-14 rounded-full border border-white/10 bg-black/30 hover:border-[#F47521] hover:text-[#F47521] text-white transition-all cursor-pointer">
                <FaTwitter className="w-6 h-6" />
              </a>

              <a href="#" aria-label="LinkedIn" className="flex items-center justify-center h-14 w-14 rounded-full border border-white/10 bg-black/30 hover:border-[#F47521] hover:text-[#F47521] text-white transition-all cursor-pointer">
                <FaLinkedin className="w-6 h-6" />
              </a>

              <a href="#" aria-label="Website" className="flex items-center justify-center h-14 w-14 rounded-full border border-white/10 bg-black/30 hover:border-[#F47521] hover:text-[#F47521] text-white transition-all cursor-pointer">
                <FaGlobe className="w-6 h-6" />
              </a>

              <a href="#" aria-label="GitHub" className="flex items-center justify-center h-14 w-14 rounded-full border border-white/10 bg-black/30 hover:border-[#F47521] hover:text-[#F47521] text-white transition-all cursor-pointer">
                <FaGithub className="w-6 h-6" />
              </a>
            </div>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-8 text-2xl font-semibold text-white">
              Quick Links
            </h3>

            <div className="space-y-6">
              <Link href="#" className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors">
                Trending
                <span className="text-[#F47521] text-sm font-medium">Hot</span>
              </Link>

              <Link href="#" className="text-zinc-300 block hover:text-white transition-colors">
                Popular
              </Link>

              <Link href="#" className="text-zinc-300 block hover:text-white transition-colors">
                Top Rated
              </Link>

              <Link href="#" className="text-zinc-300 block hover:text-white transition-colors">
                New Releases
              </Link>

              <Link href="#" className="text-zinc-300 block hover:text-white transition-colors">
                My Playlist
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-8 text-2xl font-semibold text-white">
              Categories
            </h3>

            <div className="space-y-6">
              <Link href="#" className="text-zinc-300 block hover:text-white transition-colors">
                Action
              </Link>

              <div className="flex items-center gap-3">
                <Link href="#" className="text-zinc-300 hover:text-white transition-colors">
                  Comedy
                </Link>
                <span className="rounded-full border border-[#F47521] px-3 py-1 text-xs font-medium text-[#F47521]">
                  New
                </span>
              </div>

              <Link href="#" className="text-zinc-300 block hover:text-white transition-colors">
                Romance
              </Link>
              
              <Link href="#" className="text-zinc-300 block hover:text-white transition-colors">
                Sci-Fi
              </Link>
              
              <Link href="#" className="text-zinc-300 block hover:text-white transition-colors">
                Slice of Life
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-8 text-2xl font-semibold text-white">
              Legal
            </h3>

            <div className="space-y-6">
              <Link href="#" className="block text-zinc-300 hover:text-white transition-colors">
                Contact Us
              </Link>

              <div className="flex items-center gap-3">
                <Link href="#" className="text-zinc-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-[#F47521] text-sm font-medium">New</span>
              </div>
              
              <Link href="#" className="block text-zinc-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-20 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500">
            © {new Date().getFullYear()} AniVerse. All rights reserved.
          </p>

          <p className="text-zinc-500">
            Made with ♥ for anime fans
          </p>
        </div>

      </div>
    </footer>
  );
}