import React from 'react';
import { 
  Database, 
  FileCheck, 
  ShieldCheck, 
  CloudLightning, 
  Battery, 
  BatteryCharging,
  TrendingDown
} from 'lucide-react';
import { AppTranslation, FileItem } from '../types';

interface DashboardStatsProps {
  t: AppTranslation;
  files: FileItem[];
  batterySaver: boolean;
  setBatterySaver: (active: boolean) => void;
  online: boolean;
}

export default function DashboardStats({ t, files, batterySaver, setBatterySaver, online }: DashboardStatsProps) {
  const totalFiles = files.length;
  const completedConversions = files.filter(f => f.status === 'completed').length;
  const encryptedCount = files.filter(f => f.encrypted || f.passwordProtected).length;
  
  // Storage usage calculation: aggregate size of files
  const totalBytesUsed = files.reduce((acc, curr) => acc + curr.size, 0);
  const maxStorageBytes = 100 * 1024 * 1024; // 100 MB simulated limit
  const percentageUsed = Math.min((totalBytesUsed / maxStorageBytes) * 100, 100);

  // Helper to format bytes nicely
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id="dashboard-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Storage Gauge Card */}
      <div id="stat-card-storage" className="bg-white dark:bg-[#122342] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            {t.storageUsed}
          </span>
          <Database className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {formatBytes(totalBytesUsed)}
          </span>
          <span className="text-xs text-slate-400">
            / {formatBytes(maxStorageBytes)}
          </span>
        </div>
        
        {/* Progress Bar Gauge */}
        <div className="w-full bg-slate-100 dark:bg-[#050e1e] rounded-full h-2 mb-1.5 overflow-hidden">
          <div 
            className="bg-indigo-600 dark:bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>{percentageUsed.toFixed(1)}% {t.completed}</span>
          <span>{totalFiles} files</span>
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div id="stat-card-conversions" className="bg-white dark:bg-[#122342] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Conversions Completed
          </span>
          <FileCheck className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-3xl font-bold text-slate-800 dark:text-white">
            {completedConversions}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            of {totalFiles} total
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {totalFiles > 0 
            ? `${Math.round((completedConversions / totalFiles) * 100)}% conversion success rate`
            : 'Ready to convert file formats'}
        </p>
      </div>

      {/* Encryption Level Card */}
      <div id="stat-card-security" className="bg-white dark:bg-[#122342] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Security & Encryption
          </span>
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-3xl font-bold text-slate-800 dark:text-white">
            {encryptedCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            files locked
          </span>
        </div>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
          <span>AES-256 Vault:</span>
          <span className="font-mono text-[10px] bg-indigo-500/10 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20 text-indigo-500 dark:text-indigo-400">
            {encryptedCount > 0 ? 'SECURE' : 'INACTIVE'}
          </span>
        </p>
      </div>

      {/* Battery & Power Saver Card */}
      <div id="stat-card-battery" className="bg-white dark:bg-[#122342] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            {t.batteryOptimized}
          </span>
          <div className="flex items-center gap-1">
            {batterySaver ? (
              <Battery className="w-5 h-5 text-amber-500 animate-pulse" />
            ) : (
              <BatteryCharging className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        {/* Action Toggle Button */}
        <div className="flex flex-col gap-1.5">
          <button
            id="toggle-battery-saver-btn"
            onClick={() => setBatterySaver(!batterySaver)}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              batterySaver 
                ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400'
                : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
          >
            {batterySaver ? 'Battery Saver: ON' : 'Optimize Battery'}
          </button>
          
          <p className="text-[10px] text-slate-400 font-mono leading-tight">
            {batterySaver 
              ? '✓ Slow animations active. Disables background tasks to decrease device battery usage.' 
              : '• Animation rendering active. Click to enable ultra low-drain mode.'}
          </p>
        </div>
      </div>
    </div>
  );
}
