import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Lock, 
  FileCheck, 
  Loader2, 
  AlertTriangle, 
  FileUp,
  FolderOpen,
  Unlock,
  Eye,
  Settings
} from 'lucide-react';
import { AppTranslation, FileItem, FolderItem } from '../types';

export function getSupportedConversions(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'pdf':
      return [
        { label: 'Word (.docx)', value: 'docx' },
        { label: 'Excel (.xlsx)', value: 'xlsx' },
        { label: 'PowerPoint (.pptx)', value: 'pptx' },
        { label: 'PNG Image (.png)', value: 'png' },
        { label: 'Text (.txt)', value: 'txt' },
      ];
    case 'docx':
    case 'doc':
      return [
        { label: 'Excel (.xlsx)', value: 'xlsx' },
        { label: 'PDF (.pdf)', value: 'pdf' },
        { label: 'Text (.txt)', value: 'txt' },
        { label: 'HTML (.html)', value: 'html' },
      ];
    case 'pptx':
    case 'ppt':
      return [
        { label: 'PDF (.pdf)', value: 'pdf' },
        { label: 'PNG Image (.png)', value: 'png' },
        { label: 'Word (.docx)', value: 'docx' },
      ];
    case 'xlsx':
    case 'xls':
      return [
        { label: 'PDF (.pdf)', value: 'pdf' },
        { label: 'CSV (.csv)', value: 'csv' },
        { label: 'HTML (.html)', value: 'html' },
      ];
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'gif':
      return [
        { label: 'PDF (.pdf)', value: 'pdf' },
        { label: 'JPG Image (.jpg)', value: 'jpg' },
        { label: 'PNG Image (.png)', value: 'png' },
        { label: 'WebP Image (.webp)', value: 'webp' },
      ];
    case 'txt':
    case 'md':
    case 'html':
    case 'json':
    case 'js':
    case 'ts':
    case 'csv':
      return [
        { label: 'PDF (.pdf)', value: 'pdf' },
        { label: 'Word (.docx)', value: 'docx' },
        { label: 'HTML (.html)', value: 'html' },
      ];
    default:
      return [
        { label: 'PDF (.pdf)', value: 'pdf' },
        { label: 'Text (.txt)', value: 'txt' },
      ];
  }
}

interface BulkProcessorProps {
  t: AppTranslation;
  folders: FolderItem[];
  currentFolderId: string | null;
  onAddFilesToQueue: (filesList: File[]) => void;
  queue: {
    id: string;
    file: File;
    status: 'pending' | 'converting' | 'completed' | 'error';
    progress: number;
    errorMsg?: string;
    encrypted: boolean;
    passwordProtected: boolean;
    password?: string;
    targetType?: string;
  }[];
  onRemoveFromQueue: (id: string) => void;
  onUpdateQueueItem: (id: string, updates: Partial<any>) => void;
  onStartBulkConversion: (targetFolderId: string | null) => void;
  onClearQueue: () => void;
  batterySaver: boolean;
}

export default function BulkProcessor({
  t,
  folders,
  currentFolderId,
  onAddFilesToQueue,
  queue,
  onRemoveFromQueue,
  onUpdateQueueItem,
  onStartBulkConversion,
  onClearQueue,
  batterySaver
}: BulkProcessorProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(currentFolderId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync folder selection with current navigation folder
  React.useEffect(() => {
    setSelectedFolder(currentFolderId);
  }, [currentFolderId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      onAddFilesToQueue(filesArray);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files) as File[];
      onAddFilesToQueue(filesArray);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const togglePasswordProtect = (id: string, active: boolean) => {
    onUpdateQueueItem(id, { 
      passwordProtected: active,
      password: active ? '1234' : undefined // Default simple pass
    });
  };

  const toggleEncrypt = (id: string, active: boolean) => {
    onUpdateQueueItem(id, { encrypted: active });
  };

  const handlePasswordChange = (id: string, pass: string) => {
    onUpdateQueueItem(id, { password: pass });
  };

  return (
    <div id="bulk-processor-section" className="bg-white dark:bg-[#122342] border border-slate-100 dark:border-white/5 rounded-2xl p-6 shadow-sm mb-8">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="bulk-processor-title" className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileUp className="w-5 h-5 text-indigo-500" />
            {t.bulkConverter}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simultaneously process image, text, document, and layout files to highly optimized secure PDFs.
          </p>
        </div>

        {/* Directory output select & bulk actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300">
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="bulk-output-folder-select"
              value={selectedFolder || ''}
              onChange={e => setSelectedFolder(e.target.value ? e.target.value : null)}
              className="bg-transparent border-none outline-none font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="">{t.rootFolder}</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {queue.length > 0 && (
            <>
              <button
                id="clear-queue-btn"
                onClick={onClearQueue}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {t.clearQueue}
              </button>
              
              <button
                id="start-bulk-btn"
                onClick={() => onStartBulkConversion(selectedFolder)}
                className="px-4 py-1.5 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-500 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
              >
                {t.startBulk} ({queue.filter(q => q.status === 'pending').length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        id="file-dropzone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive 
            ? 'border-indigo-500 bg-blue-50/50 dark:bg-indigo-500/5' 
            : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-slate-50/30 dark:bg-white/[0.01]'
        }`}
      >
        <input
          id="bulk-file-hidden-input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
        <UploadCloud className="w-12 h-12 text-slate-400 dark:text-indigo-400/80 mx-auto mb-3 animate-bounce" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {t.dragDrop}
        </p>
        <p className="text-xs text-slate-400">
          Supported: PNG, JPG, JPEG, TXT, MD, CSV, JSON, CODE, DOCX, XLSX, HTML
        </p>
      </div>

      {/* Queue items display */}
      {queue.length > 0 && (
        <div id="queue-items-container" className="mt-6 border-t border-slate-100 dark:border-white/10 pt-5 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
            Conversion Queue ({queue.length} files)
          </span>

          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3">
            {queue.map(item => {
              const fileExt = item.file.name.split('.').pop()?.toUpperCase() || 'FILE';
              const isConverting = item.status === 'converting';
              const isCompleted = item.status === 'completed';
              const isError = item.status === 'error';

              return (
                <div
                  key={item.id}
                  id={`queue-row-${item.id}`}
                  className="bg-slate-50 dark:bg-[#050e1e]/40 border border-slate-100 dark:border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* File Metadata */}
                  <div className="flex items-center gap-3 min-w-0 md:w-1/3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.file.name}>
                        {item.file.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        <p className="text-[9px] text-slate-400 font-mono">
                          {fileExt} • {(item.file.size / 1024).toFixed(1)} KB
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-indigo-500 font-bold uppercase">To:</span>
                          <select
                            id={`queue-target-select-${item.id}`}
                            value={item.targetType || 'pdf'}
                            onChange={e => onUpdateQueueItem(item.id, { targetType: e.target.value })}
                            className="bg-white dark:bg-[#050e1e] border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            {getSupportedConversions(item.file.name).map(opt => (
                              <option key={opt.value} value={opt.value} className="dark:bg-[#122342] text-slate-800 dark:text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security protection controls */}
                  <div className="flex flex-wrap items-center gap-3 md:w-1/3">
                    {/* Password Protection */}
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`queue-lock-btn-${item.id}`}
                        onClick={() => togglePasswordProtect(item.id, !item.passwordProtected)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          item.passwordProtected
                            ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
                            : 'bg-white border-slate-200 dark:bg-[#050e1e] dark:border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Require password to download or view"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>

                      {item.passwordProtected && (
                        <input
                          id={`queue-password-input-${item.id}`}
                          type="text"
                          value={item.password || ''}
                          onChange={e => handlePasswordChange(item.id, e.target.value)}
                          placeholder="Password"
                          className="w-20 px-1.5 py-1 bg-white dark:bg-[#050e1e] border border-slate-200 dark:border-white/10 rounded text-[10px] outline-none font-mono text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-amber-500"
                        />
                      )}
                    </div>

                    {/* AES encryption */}
                    <button
                      id={`queue-encrypt-btn-${item.id}`}
                      onClick={() => toggleEncrypt(item.id, !item.encrypted)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer ${
                        item.encrypted
                          ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                          : 'bg-white border-slate-200 dark:bg-[#050e1e] dark:border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Encrypt file stream mathematically"
                    >
                      <Settings className="w-3 h-3" />
                      <span>{t.encrypt}</span>
                    </button>
                  </div>

                  {/* Dynamic progress / Real-time Status */}
                  <div className="flex items-center justify-between md:justify-end gap-3 md:w-1/3">
                    {isConverting && (
                      <div className="flex items-center gap-2 w-full max-w-[120px]">
                        <div className="w-full bg-slate-200 dark:bg-[#050e1e] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 dark:bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                          {item.progress}%
                        </span>
                      </div>
                    )}

                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg flex items-center gap-1 animate-fade-in">
                        <FileCheck className="w-3 h-3" />
                        <span>{t.completed}</span>
                      </span>
                    )}

                    {isError && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg flex items-center gap-1" title={item.errorMsg}>
                        <AlertTriangle className="w-3 h-3" />
                        <span>{t.error}</span>
                      </span>
                    )}

                    {item.status === 'pending' && (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg border dark:border-white/5">
                        Ready
                      </span>
                    )}

                    <button
                      id={`queue-remove-btn-${item.id}`}
                      onClick={() => onRemoveFromQueue(item.id)}
                      disabled={isConverting}
                      className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
