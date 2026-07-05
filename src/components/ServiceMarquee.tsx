import React from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Image, 
  QrCode, 
  ShieldCheck, 
  RefreshCw, 
  FolderLock, 
  Sparkles,
  Layers,
  ArrowRightLeft,
  Cpu
} from 'lucide-react';

interface ServiceMarqueeProps {
  theme: 'light' | 'dark';
}

export default function ServiceMarquee({ theme }: ServiceMarqueeProps) {
  const services = [
    { label: 'PDF to Word Converter', icon: FileText, color: 'text-indigo-400' },
    { label: 'Word to Excel Spreadsheet', icon: FileSpreadsheet, color: 'text-emerald-400' },
    { label: 'PowerPoint Slide to PDF', icon: Presentation, color: 'text-amber-400' },
    { label: 'Image-to-PDF compiler', icon: Image, color: 'text-violet-400' },
    { label: 'PNG / JPG / WebP Format Converter', icon: ArrowRightLeft, color: 'text-rose-400' },
    { label: 'Raw text to HTML Webpage', icon: Layers, color: 'text-cyan-400' },
    { label: 'Secure local-network QR sharing', icon: QrCode, color: 'text-purple-400' },
    { label: 'Military AES-256 Vault Encryption', icon: ShieldCheck, color: 'text-green-400' },
    { label: 'Dynamic Backup & System Restore', icon: RefreshCw, color: 'text-teal-400' },
    { label: 'Zero-knowledge Folder Workspaces', icon: FolderLock, color: 'text-blue-400' },
    { label: 'Battery Saver Optimization Mode', icon: Cpu, color: 'text-orange-400' },
    { label: 'Instant Multi-Format Converters', icon: Sparkles, color: 'text-pink-400' },
  ];

  // Repeat twice to enable continuous seamless looping marquee
  const doubleServices = [...services, ...services];

  return (
    <div 
      id="top-services-marquee-container"
      className="w-full overflow-hidden bg-[#0a1424] border-b border-indigo-500/20 py-2.5 relative flex items-center select-none"
    >
      {/* Decorative premium accent ambient glow */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a1424] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a1424] to-transparent z-10 pointer-events-none" />
      
      {/* Real-time active connection indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold text-indigo-400 tracking-wide uppercase shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live Services</span>
      </div>

      <div className="flex w-full overflow-hidden pl-24">
        <div className="animate-marquee flex gap-12 whitespace-nowrap">
          {doubleServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={`${service.label}-${index}`}
                className="flex items-center gap-2.5 group cursor-default"
              >
                <div className={`p-1 rounded bg-white/5 group-hover:bg-indigo-500/20 transition-all duration-300`}>
                  <IconComponent className={`w-3.5 h-3.5 ${service.color}`} />
                </div>
                <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-all tracking-wide uppercase font-mono">
                  {service.label}
                </span>
                <span className="text-indigo-500/40 text-xs font-mono">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
