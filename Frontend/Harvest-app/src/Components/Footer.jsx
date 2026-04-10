import React from 'react';
// We only import icons that are GUARANTEED to exist in all Lucide versions
import { 
  Leaf, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Globe, 
  MessageCircle, 
  Share2 
} from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  // We use generic icons to represent social media to avoid the export error
  const socialLinks = [
    { label: 'FB', Icon: Globe, href: '#' },
    { label: 'TW', Icon: Share2, href: '#' },
    { label: 'IG', Icon: MessageCircle, href: '#' },
  ];

  return (
    <footer className="bg-white border-t border-emerald-100 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Sponsors Section */}
        <div className="mb-16 text-center">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-10">
            Our Trusted Partners
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="h-12 w-32 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 font-bold uppercase tracking-widest">
               AgriTech
            </div>
            <div className="h-12 w-32 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 font-bold uppercase tracking-widest">
               EcoSustain
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Leaf className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-emerald-900 tracking-tighter">
                Harvest<span className="text-amber-600">Hub</span>
              </span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed">
              Empowering growers with digital precision.
            </p>
            
            {/* Social Icons using safe, generic icons */}
            <div className="flex gap-4">
              {socialLinks.map(({ Icon, label }, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-emerald-50 flex flex-col items-center justify-center text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  <Icon size={16} />
                  <span className="text-[8px] font-bold">{label}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-emerald-900 font-bold uppercase tracking-wider text-xs mb-6">Platform</h4>
            <ul className="space-y-4 text-stone-600 text-sm font-medium">
              <li className="hover:text-emerald-600 cursor-pointer flex items-center gap-2">
                <ExternalLink size={14} /> Marketplace
              </li>
              <li className="hover:text-emerald-600 cursor-pointer flex items-center gap-2">
                <ExternalLink size={14} /> Crop Insights
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-emerald-900 font-bold uppercase tracking-wider text-xs mb-6">Contact</h4>
            <div className="space-y-4 text-stone-600 text-sm">
               <div className="flex items-center gap-3"><Mail size={16} className="text-emerald-500"/> support@harvesthub.com</div>
               <div className="flex items-center gap-3"><MapPin size={16} className="text-emerald-500"/> 123 Valley Road</div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-50 text-center text-xs font-bold text-stone-400 uppercase tracking-widest">
          <p>© {currentYear} HarvestHub.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;