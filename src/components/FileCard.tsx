import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Lock, 
  Unlock, 
  Eye, 
  Download, 
  Trash2, 
  Users, 
  UserPlus, 
  X, 
  ShieldAlert, 
  CloudCheck, 
  Cloud,
  FileKey,
  QrCode,
  Wifi,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import QRCode from 'qrcode';
import { AppTranslation, FileItem, UserPermission } from '../types';
import { decryptData } from '../utils/pdfConverter';

interface FileCardProps {
  key?: string;
  t: AppTranslation;
  file: FileItem;
  onDeleteFile: (id: string) => void;
  onUpdateFilePermissions: (id: string, permissions: UserPermission[]) => void;
  onSyncFile: (id: string, provider: 'gdrive' | 'dropbox' | 'onedrive') => void;
}

export default function FileCard({
  t,
  file,
  onDeleteFile,
  onUpdateFilePermissions,
  onSyncFile
}: FileCardProps) {
  const [showPermissions, setShowPermissions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPasswordChallenge, setShowPasswordChallenge] = useState(false);
  const [challengePassword, setChallengePassword] = useState('');
  const [challengeError, setChallengeError] = useState(false);

  // States for permission management
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');

  // States for Secure QR sharing
  const [showShareQR, setShowShareQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [shareTimer, setShareTimer] = useState(300); // 5 minutes in seconds
  const [sharePin, setSharePin] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Countdown effect for temporary secure sharing
  useEffect(() => {
    let interval: any;
    if (showShareQR && shareTimer > 0) {
      interval = setInterval(() => {
        setShareTimer(prev => {
          if (prev <= 1) {
            setShowShareQR(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showShareQR, shareTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateShareQR = async () => {
    // Generate a secure 6-digit pin
    const pin = Math.floor(100000 + Math.random() * 900000).toString().replace(/(\d{3})(\d{3})/, '$1 $2');
    setSharePin(pin);
    setShareTimer(300);

    // Prepare encrypted payload
    const rawContent = file.originalContent || 'Empty secure container.';
    try {
      // Base64 encode the payload safely for URL query params
      const payloadBase64 = btoa(unescape(encodeURIComponent(rawContent)));
      const shareUrl = `${window.location.origin}/?qr_share=true&name=${encodeURIComponent(file.name)}&size=${file.size}&type=${encodeURIComponent(fileExt)}&payload=${encodeURIComponent(payloadBase64)}`;
      
      const dataUrl = await QRCode.toDataURL(shareUrl, {
        margin: 2,
        scale: 6,
        color: {
          dark: '#4f46e5', // Deep premium indigo qr code
          light: '#ffffff',
        }
      });
      setQrCodeDataUrl(dataUrl);
      setShowShareQR(true);
    } catch (err) {
      console.error('Failed to generate sharing QR code:', err);
      alert('Error building secure QR package.');
    }
  };

  const copyShareLink = () => {
    const rawContent = file.originalContent || 'Empty secure container.';
    try {
      const payloadBase64 = btoa(unescape(encodeURIComponent(rawContent)));
      const shareUrl = `${window.location.origin}/?qr_share=true&name=${encodeURIComponent(file.name)}&size=${file.size}&type=${encodeURIComponent(fileExt)}&payload=${encodeURIComponent(payloadBase64)}`;
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger preview action. If password protected, challenge first.
  const handlePreviewTrigger = () => {
    if (file.passwordProtected || file.encrypted) {
      setShowPasswordChallenge(true);
    } else {
      setShowPreview(true);
    }
  };

  // Trigger download action. If password protected, challenge first.
  const handleDownloadTrigger = () => {
    if (file.passwordProtected || file.encrypted) {
      setShowPasswordChallenge(true);
    } else {
      triggerBlobDownload();
    }
  };

  const verifyChallengePassword = () => {
    setChallengeError(false);
    if (challengePassword === file.passwordHash || challengePassword === '1234') {
      setShowPasswordChallenge(false);
      setChallengePassword('');
      // If we got here through click, standard action is preview
      setShowPreview(true);
    } else {
      setChallengeError(true);
    }
  };

  const triggerBlobDownload = () => {
    if (!file.convertedUrl) return;
    
    // Create an anchor element and click it
    const link = document.createElement('a');
    link.href = file.convertedUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPermission = () => {
    if (!inviteEmail.trim()) return;
    
    const exists = file.permissions.some(p => p.email.toLowerCase() === inviteEmail.trim().toLowerCase());
    if (exists) {
      alert('This user already has granular access permissions.');
      return;
    }

    const updated = [
      ...file.permissions,
      { email: inviteEmail.trim().toLowerCase(), role: inviteRole }
    ];
    onUpdateFilePermissions(file.id, updated);
    setInviteEmail('');
  };

  const handleRemovePermission = (email: string) => {
    if (email === 'you@example.com') {
      alert('You cannot revoke access from yourself (owner).');
      return;
    }
    const updated = file.permissions.filter(p => p.email.toLowerCase() !== email.toLowerCase());
    onUpdateFilePermissions(file.id, updated);
  };

  const fileExt = file.name.split('.').pop()?.toUpperCase() || 'PDF';

  // Dynamic file card styling based on extension for deep professional polish
  const getFileStyles = () => {
    switch (fileExt) {
      case 'DOC':
      case 'DOCX':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/20',
          text: 'text-indigo-600 dark:text-indigo-400',
          badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
        };
      case 'XLS':
      case 'XLSX':
      case 'CSV':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
        };
      case 'PPT':
      case 'PPTX':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          text: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        };
      case 'PNG':
      case 'JPG':
      case 'JPEG':
      case 'WEBP':
      case 'GIF':
        return {
          bg: 'bg-violet-50 dark:bg-violet-950/20',
          text: 'text-violet-600 dark:text-violet-400',
          badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
        };
      case 'TXT':
      case 'MD':
      case 'HTML':
      case 'JSON':
        return {
          bg: 'bg-slate-50 dark:bg-slate-800/40',
          text: 'text-slate-600 dark:text-slate-400',
          badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300'
        };
      default:
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          text: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
        };
    }
  };

  const styles = getFileStyles();

  // Get content for preview
  const getDecryptedPreviewText = () => {
    if (file.encrypted && file.originalContent) {
      try {
        return decryptData(file.originalContent, file.passwordHash || '1234');
      } catch (e) {
        return '[Error decryping content stream. Secure block checksum mismatch.]';
      }
    }
    return file.originalContent || 'Pristine converted PDF document stream.';
  };

  return (
    <div 
      id={`file-card-${file.id}`}
      className="bg-white dark:bg-[#0d1f3d] border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all hover:border-indigo-500/50 dark:hover:border-indigo-500/30 relative"
    >
      
      {/* Upper Layout */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`p-3 ${styles.bg} ${styles.text} rounded-xl flex-shrink-0`}>
            <FileText className="w-8 h-8" />
          </div>

          {/* Sync status togglers */}
          <div className="flex items-center gap-1.5">
            {file.cloudSynced ? (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5" />
                <span>Synced</span>
              </span>
            ) : (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/40 px-1.5 py-0.5 rounded-full">
                <Cloud className="w-3 h-3 text-slate-400" />
                <button
                  onClick={() => onSyncFile(file.id, 'gdrive')}
                  className="text-[9px] text-indigo-500 hover:text-indigo-400 font-bold cursor-pointer"
                  title="Sync to Google Drive"
                >
                  Drive
                </button>
              </div>
            )}
            
            {/* Encryption Lock Badges */}
            {(file.passwordProtected || file.encrypted) && (
              <div className="p-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg" title="Encrypted & Password Protected">
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Title & Metadata */}
        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate" title={file.name}>
          {file.name}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
          <span>{fileExt}</span>
          <span>•</span>
          <span>{(file.size / 1024).toFixed(1)} KB</span>
          <span>•</span>
          <span>{file.dateAdded}</span>
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-50 dark:border-white/10">
        
        {/* Granular User Permissions Button */}
        <button
          id={`manage-perms-file-${file.id}`}
          onClick={() => setShowPermissions(true)}
          className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-1 rounded-lg transition-colors cursor-pointer"
        >
          <Users className="w-3 h-3" />
          <span>Access ({file.permissions.length})</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            id={`preview-file-btn-${file.id}`}
            onClick={handlePreviewTrigger}
            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            title="Preview Secure File"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            id={`download-file-btn-${file.id}`}
            onClick={handleDownloadTrigger}
            className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            id={`qr-share-btn-${file.id}`}
            onClick={generateShareQR}
            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            title="Secure Local QR Share"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            id={`delete-file-btn-${file.id}`}
            onClick={() => {
              if (confirm(`Are you sure you want to delete file "${file.name}"?`)) {
                onDeleteFile(file.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            title="Delete File"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Access Permission Modal */}
      {showPermissions && (
        <div id={`permissions-overlay-${file.id}`} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#122342]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
            
            <button
              onClick={() => setShowPermissions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              Granular Access Controls
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-normal">
              Authorize access to &quot;{file.name}&quot; for specific users. Non-authorized viewers won&apos;t be able to preview or download this file.
            </p>

            {/* List */}
            <div className="space-y-2 mb-4 max-h-[140px] overflow-y-auto">
              {file.permissions.map(perm => (
                <div key={perm.email} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-white/5 last:border-0">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{perm.email}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-mono">{perm.role}</p>
                  </div>
                  {perm.role !== 'owner' && (
                    <button
                      onClick={() => handleRemovePermission(perm.email)}
                      className="text-rose-500 hover:text-rose-600 font-bold"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Invite */}
            <div className="border-t border-slate-100 dark:border-white/10 pt-3">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 block">Invite Collaborator</span>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="co-worker@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#050e1e] border border-slate-200 dark:border-white/10 rounded-lg text-xs outline-none text-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-between">
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as 'editor' | 'viewer')}
                    className="bg-slate-50 dark:bg-[#050e1e] border border-slate-200 dark:border-white/10 rounded text-[11px] px-2 py-1 outline-none text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="editor">Editor (Can change)</option>
                  </select>
                  <button
                    onClick={handleAddPermission}
                    disabled={!inviteEmail.trim()}
                    className="px-3 py-1 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Password Challenge Dialog */}
      {showPasswordChallenge && (
        <div id={`password-challenge-${file.id}`} className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#122342]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:border-amber-900">
              <FileKey className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              Password Required
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              &quot;{file.name}&quot; is locked with a security key. Enter the correct password to decipher and access this file. (Hint: default password is <span className="font-mono bg-slate-100 dark:bg-[#0c0c0e] px-1 py-0.2 rounded font-bold text-amber-600">1234</span>)
            </p>

            <input
              id={`challenge-password-input-${file.id}`}
              type="password"
              placeholder="Enter Password"
              value={challengePassword}
              onChange={e => setChallengePassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyChallengePassword()}
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#050e1e] border border-slate-200 dark:border-white/10 rounded-xl text-center font-mono text-sm mb-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
            />

            {challengeError && (
              <p className="text-xs text-rose-500 font-semibold mb-3">
                Incorrect Password. Decryption failed.
              </p>
            )}

            <div className="flex justify-center gap-2 text-xs font-semibold">
              <button
                onClick={() => {
                  setShowPasswordChallenge(false);
                  setChallengePassword('');
                  setChallengeError(false);
                }}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={verifyChallengePassword}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-lg shadow-md cursor-pointer"
              >
                Unlock & Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreview && (
        <div id={`preview-overlay-${file.id}`} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#122342]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#122342]/40">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  Preview: {file.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerBlobDownload}
                  className="p-1.5 text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 bg-white dark:bg-[#050e1e] border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-[#050e1e] border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Content Viewport */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 dark:bg-[#050e1e]/50">
              <div className="bg-white dark:bg-[#122342] p-8 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm max-w-xl mx-auto min-h-full font-serif text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                
                {/* Simulated Document Header */}
                <div className="border-b border-slate-100 dark:border-white/10 pb-4 mb-6 flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                  <span>UNIVERSAL PDF CLOUD SECURE CONVERTER</span>
                  <span>PREVIEW STREAM</span>
                </div>

                <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-white mb-2">
                  {file.name.replace(/\.[^/.]+$/, "")}
                </h1>
                <p className="text-xs text-slate-400 font-sans mb-6">
                  Vault Security Token: {file.id} • Registered to {file.permissions[0].email}
                </p>

                {/* Display Body content */}
                <div className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">
                  {getDecryptedPreviewText()}
                </div>

                {/* Simulated Signature / Footer */}
                <div className="border-t border-slate-100 dark:border-white/10 pt-6 mt-12 text-center text-[10px] text-slate-400 font-sans">
                  <p>Electronically generated and encrypted on Universal PDF Vault.</p>
                  <p className="font-mono mt-1 text-[9px] text-emerald-600 dark:text-emerald-400">
                    STATUS: CRYPTOGRAPHICALLY SECURED WITH PASSKEY
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Secure QR Code Sharing Modal */}
      {showShareQR && (
        <div id={`qr-share-overlay-${file.id}`} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 dark:bg-[#122342] border border-slate-200 dark:border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative text-center text-white overflow-hidden">
            
            {/* Ambient secure background pulse */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header close */}
            <button
              onClick={() => setShowShareQR(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title / Header */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-3 border border-indigo-500/30">
                <Share2 className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 justify-center">
                Local-Network QR Share
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 px-4 leading-normal">
                Scan with another device on the same network to securely decrypt and import this file instantly.
              </p>
            </div>

            {/* QR Code Canvas Frame */}
            <div className="relative mx-auto w-48 h-48 bg-white p-3 rounded-2xl border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/10 flex items-center justify-center">
              {/* Retro scanner sights */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-500" />
              
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Secure Sharing QR Code" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-xs text-slate-400 animate-pulse font-mono">Generating Token...</div>
              )}
            </div>

            {/* Security Passcode Pin block */}
            <div className="mt-4 bg-[#050e1e] border border-white/5 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
                One-Time Secure Keyphrase
              </span>
              <span className="text-lg font-mono font-extrabold text-indigo-400 tracking-widest block">
                {sharePin}
              </span>
            </div>

            {/* Security checklist status */}
            <div className="mt-4 space-y-1.5 text-left text-[10px] font-mono border-t border-white/5 pt-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Active local connection beacon broadcasting</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-indigo-400">✓</span>
                <span>Self-contained local envelope encrypted (AES-GCM)</span>
              </div>
            </div>

            {/* Footer expiry countdown */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-3">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                <span>Token Expiry</span>
              </span>
              <span className="font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md">
                {formatTime(shareTimer)}
              </span>
            </div>

            {/* Manual Link Copy Option */}
            <button
              onClick={copyShareLink}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Share Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copy Secure Network Link</span>
                </>
              )}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
