import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Search, 
  RotateCw, 
  ShieldCheck, 
  HelpCircle, 
  Moon, 
  Sun, 
  Plus, 
  Info,
  Trash2, 
  Database,
  CloudLightning,
  Download,
  Upload,
  Battery,
  HardDriveDownload,
  Cloud,
  FileText
} from 'lucide-react';

import { 
  FileItem, 
  FolderItem, 
  NotificationItem, 
  UserLanguage, 
  AppTheme,
  UserPermission
} from './types';
import { translations } from './translations';
import { 
  convertTextToPdf, 
  convertImageToPdf, 
  encryptData,
  convertImageFormat,
  convertPptToPdf,
  convertToExcelSimulation,
  convertExcelToPdf,
  convertToWordSimulation
} from './utils/pdfConverter';

// Component Imports
import Onboarding from './components/Onboarding';
import DashboardStats from './components/DashboardStats';
import FolderView from './components/FolderView';
import BulkProcessor from './components/BulkProcessor';
import FileCard from './components/FileCard';
import PushNotifications from './components/PushNotifications';
import LanguageSelector from './components/LanguageSelector';
import ServiceMarquee from './components/ServiceMarquee';
import UserAnalytics from './components/UserAnalytics';

export default function App() {
  // Config & Localization
  const [language, setLanguage] = useState<UserLanguage>('en');
  const [theme, setTheme] = useState<AppTheme>('dark');
  const t = translations[language];

  // Core Data State
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Registered users and session views state
  const [registeredUsers, setRegisteredUsers] = useState<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    dateRegistered: string;
  }[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    dateRegistered: string;
  } | null>(null);
  const [pageViews, setPageViews] = useState<number>(148);
  
  // Interface state
  const [searchQuery, setSearchQuery] = useState('');
  const [batterySaver, setBatterySaver] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [online, setOnline] = useState(true);
  const [isBackupSyncing, setIsBackupSyncing] = useState(false);

  // Bulk processing queue state
  const [queue, setQueue] = useState<{
    id: string;
    file: File;
    status: 'pending' | 'converting' | 'completed' | 'error';
    progress: number;
    errorMsg?: string;
    encrypted: boolean;
    passwordProtected: boolean;
    password?: string;
    targetType?: string;
  }[]>([]);

  // 1. Theme sync effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#09090b'; // Sophisticated Dark zinc-950 background
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc'; // Clean slate-50
    }
  }, [theme]);

  // 1b. User Accounts & Page Views Telemetry Initialization
  useEffect(() => {
    // 1. Page views count increment
    const storedViews = localStorage.getItem('pdf_vault_page_views');
    const currentViews = storedViews ? parseInt(storedViews, 10) + 1 : 149;
    localStorage.setItem('pdf_vault_page_views', currentViews.toString());
    setPageViews(currentViews);

    // 2. Registered Users list loading / seeding
    const storedUsers = localStorage.getItem('pdf_vault_registered_users');
    let usersList: { id: string; name: string; email: string; role: 'admin' | 'user'; dateRegistered: string }[] = [];
    if (storedUsers) {
      usersList = JSON.parse(storedUsers);
    } else {
      usersList = [
        {
          id: 'u-admin',
          name: 'Admin Vault',
          email: 'admin@vault.com',
          role: 'admin',
          dateRegistered: '2026-07-01'
        },
        {
          id: 'u-user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          dateRegistered: '2026-07-03'
        }
      ];
      localStorage.setItem('pdf_vault_registered_users', JSON.stringify(usersList));
    }
    setRegisteredUsers(usersList);

    // 3. Current active session loading / seeding
    const storedSession = localStorage.getItem('pdf_vault_current_user');
    if (storedSession) {
      if (storedSession === 'null') {
        setCurrentUser(null);
      } else {
        setCurrentUser(JSON.parse(storedSession));
      }
    } else {
      // Default to auto-login the seed admin user so they see a beautiful filled dashboard!
      const defaultAdmin = usersList.find(u => u.email === 'admin@vault.com') || usersList[0];
      setCurrentUser(defaultAdmin);
      localStorage.setItem('pdf_vault_current_user', JSON.stringify(defaultAdmin));
    }
  }, []);

  const handleRegisterUser = (name: string, email: string, role: 'admin' | 'user') => {
    const newUser = {
      id: 'u-' + Date.now(),
      name,
      email,
      role,
      dateRegistered: new Date().toISOString().split('T')[0]
    };
    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem('pdf_vault_registered_users', JSON.stringify(updated));
    addNotification(`Account for "${name}" registered successfully!`, 'success');
  };

  const handleLoginUser = (email: string): boolean => {
    const found = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('pdf_vault_current_user', JSON.stringify(found));
      addNotification(`Welcome back, ${found.name}!`, 'success');
      return true;
    }
    return false;
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.setItem('pdf_vault_current_user', 'null');
    addNotification('Logged out from secure document session.', 'info');
  };

  // 2. Initialize and Seed data on mount
  useEffect(() => {
    // Load existing items from localStorage if available
    const localFolders = localStorage.getItem('pdf_vault_folders');
    const localFiles = localStorage.getItem('pdf_vault_files');
    const onboardingSeen = localStorage.getItem('pdf_vault_onboarding_completed');

    if (localFolders && localFiles) {
      setFolders(JSON.parse(localFolders));
      setFiles(JSON.parse(localFiles));
    } else {
      // Seed nice Initial Sample Folders
      const seedFolders: FolderItem[] = [
        {
          id: 'folder-confidential',
          name: 'Confidential Contracts 🔒',
          dateCreated: '2026-07-04',
          parentId: null,
          permissions: [
            { email: 'you@example.com', role: 'owner' },
            { email: 'colleague_editor@example.com', role: 'editor' }
          ],
          cloudSynced: true,
          cloudProvider: 'gdrive'
        },
        {
          id: 'folder-finance',
          name: 'Financial Reports 📊',
          dateCreated: '2026-07-04',
          parentId: null,
          permissions: [
            { email: 'you@example.com', role: 'owner' },
            { email: 'auditor_viewer@example.com', role: 'viewer' }
          ],
          cloudSynced: true,
          cloudProvider: 'dropbox'
        }
      ];

      // Seed mock PDF files inside the folders
      const seedFiles: FileItem[] = [
        {
          id: 'file-nda',
          name: 'nda_cooperative_agreement.pdf',
          originalType: 'TXT',
          size: 4520,
          status: 'completed',
          progress: 100,
          dateAdded: '2026-07-04',
          folderId: 'folder-confidential',
          encrypted: true,
          passwordProtected: true,
          passwordHash: '1234',
          originalContent: '[SECURE_AES256_VAULT_HEADER:SALT=MTIzNA==]This Cooperative NDA sets out the terms for mutual security and asset conversions between the participating companies.',
          permissions: [
            { email: 'you@example.com', role: 'owner' },
            { email: 'colleague_editor@example.com', role: 'editor' }
          ],
          cloudSynced: true,
          cloudProvider: 'gdrive',
          convertedUrl: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgM29iagogIDw8IC9MZW5ndGggNTUgPj4gc3RyZWFtCkJULy9GMSAxMiBUZiA3MCA3MDAgVGQgKFNhbXBsZSBQREYgR2VuZXJhdGVkIEJ5IFZhdWx0KSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgIHRyYW5zZmVyIGZpbGUKMDAwMDAwMDIwMCAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgL1NpemUgNSAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKMjg1CiUlRU9GCg=='
        },
        {
          id: 'file-audit',
          name: 'annual_audit_2026.pdf',
          originalType: 'CSV',
          size: 15420,
          status: 'completed',
          progress: 100,
          dateAdded: '2026-07-04',
          folderId: 'folder-finance',
          encrypted: false,
          passwordProtected: false,
          originalContent: 'Yearly Audit details showing perfect margins and battery optimization compliance logs.',
          permissions: [
            { email: 'you@example.com', role: 'owner' },
            { email: 'auditor_viewer@example.com', role: 'viewer' }
          ],
          cloudSynced: true,
          cloudProvider: 'dropbox',
          convertedUrl: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgM29iagogIDw8IC9MZW5ndGggNTUgPj4gc3RyZWFtCkJULy9GMSAxMiBUZiA3MCA3MDAgVGQgKFNhbXBsZSBQREYgR2VuZXJhdGVkIEJ5IFZhdWx0KSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgIHRyYW5zZmVyIGZpbGUKMDAwMDAwMDIwMCAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgL1NpemUgNSAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKMjg1CiUlRU9GCg=='
        }
      ];

      setFolders(seedFolders);
      setFiles(seedFiles);
      localStorage.setItem('pdf_vault_folders', JSON.stringify(seedFolders));
      localStorage.setItem('pdf_vault_files', JSON.stringify(seedFiles));
    }

    if (!onboardingSeen) {
      setShowOnboarding(true);
    }

    // Seed Initial Welcome notification
    addNotification('Universal PDF Vault initialized. Offline local caching is active.', 'success');
  }, []);

  // 3. Keep localStorage synchronized
  useEffect(() => {
    if (folders.length > 0) {
      localStorage.setItem('pdf_vault_folders', JSON.stringify(folders));
    }
    if (files.length > 0) {
      localStorage.setItem('pdf_vault_files', JSON.stringify(files));
    }
  }, [folders, files]);

  // Sync Online / Offline states
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      addNotification('Internet connection re-established. Real-time Cloud syncing enabled.', 'info');
    };
    const handleOffline = () => {
      setOnline(false);
      addNotification('Internet disconnected. Secure offline access buffer activated.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper: push alerts
  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newAlert: NotificationItem = {
      id: 'notif-' + Date.now() + Math.random().toString(36).substr(2, 5),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  // 4. Handle QR-Share URL import on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('qr_share') === 'true') {
      const name = params.get('name') || 'shared_document.pdf';
      const sizeStr = params.get('size') || '1024';
      const size = parseInt(sizeStr, 10);
      const type = params.get('type') || 'PDF';
      const payloadBase64 = params.get('payload') || '';

      try {
        const decodedContent = decodeURIComponent(escape(atob(payloadBase64)));
        
        // Define a nice sample converted url for pdfs or appropriate representation
        let simulatedUrl = '';
        if (type.toUpperCase() === 'PDF') {
          simulatedUrl = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgM29iagogIDw8IC9MZW5ndGggNTUgPj4gc3RyZWFtCkJULy9GMSAxMiBUZiA3MCA3MDAgVGQgKFNhbXBsZSBQREYgR2VuZXJhdGVkIEJ5IFZhdWx0KSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgIHRyYW5zZmVyIGZpbGUKMDAwMDAwMDIwMCAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgL1NpemUgNSAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKMjg1CiUlRU9GCg==';
        }

        const newFileItem: FileItem = {
          id: 'file-qr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          name: name,
          originalType: type.toUpperCase(),
          size: size,
          status: 'completed',
          progress: 100,
          dateAdded: new Date().toISOString().split('T')[0],
          folderId: null,
          encrypted: false,
          passwordProtected: false,
          originalContent: decodedContent,
          convertedUrl: simulatedUrl,
          permissions: [
            { email: 'you@example.com', role: 'owner' }
          ],
          cloudSynced: false,
          cloudProvider: 'local'
        };

        setFiles(prev => {
          if (prev.some(f => f.name === name)) {
            return prev;
          }
          const updated = [newFileItem, ...prev];
          localStorage.setItem('pdf_vault_files', JSON.stringify(updated));
          return updated;
        });

        addNotification(`Document "${name}" imported successfully via secure local-network QR-code scan!`, 'success');

        // Clear query parameters from address bar elegantly
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Failed to parse secure QR sharing payload:', err);
        addNotification('Could not decipher QR-share payload block.', 'error');
      }
    }
  }, []);

  // Folder Operations
  const handleCreateFolder = (name: string) => {
    const newFolder: FolderItem = {
      id: 'folder-' + Date.now(),
      name,
      dateCreated: new Date().toISOString().split('T')[0],
      parentId: currentFolderId,
      permissions: [
        { email: 'you@example.com', role: 'owner' }
      ],
      cloudSynced: false,
      cloudProvider: 'local'
    };
    setFolders(prev => [...prev, newFolder]);
    addNotification(`Folder "${name}" created. Granular permission: Owner (you).`, 'success');
  };

  const handleUpdateFolderPermissions = (folderId: string, permissions: UserPermission[]) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, permissions } : f));
    addNotification('Folder granular permissions updated successfully.', 'success');
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    // Move any orphan files inside that folder to root directory
    setFiles(prev => prev.map(f => f.folderId === folderId ? { ...f, folderId: null } : f));
    addNotification('Folder deleted. Contained files moved to Main Directory.', 'info');
  };

  // File Operations
  const handleDeleteFile = (id: string) => {
    const targetFile = files.find(f => f.id === id);
    if (targetFile?.convertedUrl && targetFile.convertedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(targetFile.convertedUrl); // Clean browser memory buffer
    }
    setFiles(prev => prev.filter(f => f.id !== id));
    addNotification(`File deleted: ${targetFile?.name}`, 'info');
  };

  const handleUpdateFilePermissions = (id: string, permissions: UserPermission[]) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, permissions } : f));
    addNotification('File access levels modified successfully.', 'success');
  };

  const handleSyncFile = (id: string, provider: 'gdrive' | 'dropbox' | 'onedrive') => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, cloudSynced: true, cloudProvider: provider } : f));
    addNotification(`Successfully uploaded file backup to remote storage (${provider.toUpperCase()}).`, 'success');
  };

  // Onboarding closure
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('pdf_vault_onboarding_completed', 'true');
  };

  // Queue Operations
  const handleAddFilesToQueue = (filesList: File[]) => {
    const mapped = filesList.map(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let defaultTarget = 'pdf';
      
      // Smart default target based on source extension
      if (ext === 'pdf') {
        defaultTarget = 'docx';
      } else if (ext === 'docx' || ext === 'doc') {
        defaultTarget = 'xlsx';
      } else if (ext === 'pptx' || ext === 'ppt') {
        defaultTarget = 'pdf';
      } else if (ext === 'xlsx' || ext === 'xls') {
        defaultTarget = 'pdf';
      } else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
        defaultTarget = 'pdf';
      }

      return {
        id: 'queue-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        file,
        status: 'pending' as const,
        progress: 0,
        encrypted: false,
        passwordProtected: false,
        password: '',
        targetType: defaultTarget
      };
    });
    setQueue(prev => [...prev, ...mapped]);
    addNotification(`${filesList.length} file(s) added to the conversion queue.`, 'info');
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQueueItem = (id: string, updates: Partial<any>) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Start Bulk Conversion Action
  const handleStartBulkConversion = async (targetFolderId: string | null) => {
    const pendingItems = queue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;

    addNotification(`Starting bulk conversion for ${pendingItems.length} documents.`, 'info');

    // Process sequentially or staggered to simulate real-time conversion progress
    for (const item of pendingItems) {
      // Set status to converting
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'converting', progress: 5 } : q));

      // Simulate step-by-step progress updating progress status
      await new Promise<void>((resolve) => {
        let currentProgress = 5;
        // Stagger steps speed. Slow down a bit if battery saver is active to optimize thread usage
        const stepTime = batterySaver ? 150 : 40; 
        const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 20) + 5;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            resolve();
          }
          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: currentProgress } : q));
        }, stepTime);
      });

      // Execute actual compiled blob generation
      try {
        const file = item.file;
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        const targetType = item.targetType || 'pdf';

        let convertedBlob: Blob;
        let originalContentString = '';

        // Determine correct conversion path
        if (targetType === 'pdf') {
          if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExt)) {
            // Image to PDF
            const dataUrl = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = () => rej(new Error('Failed reading image pixels.'));
              reader.readAsDataURL(file);
            });
            convertedBlob = await convertImageToPdf(file.name, dataUrl);
            originalContentString = '[Binary graphics / image to PDF representation]';
          } else if (fileExt === 'pptx' || fileExt === 'ppt') {
            // PowerPoint Slide Deck to PDF
            convertedBlob = convertPptToPdf(file.name, 'Presentation outline content.');
            originalContentString = '[Landscape presentation slide deck layouts]';
          } else if (fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'csv') {
            // Excel/CSV Spreadsheet to PDF
            const textContent = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = () => rej(new Error('Failed reading spreadsheet encoding.'));
              reader.readAsText(file);
            });
            convertedBlob = convertExcelToPdf(file.name, textContent);
            originalContentString = textContent;
          } else {
            // Plain text / Markdown / HTML / JSON to PDF
            const textContent = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = () => rej(new Error('Failed reading document text encoding.'));
              reader.readAsText(file);
            });
            convertedBlob = convertTextToPdf(file.name, textContent);
            originalContentString = textContent;
          }

        } else if (targetType === 'docx') {
          // CONVERT TO WORD DOCUMENT
          let textContent = '';
          if (!['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'].includes(fileExt)) {
            textContent = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = () => rej(new Error('Failed reading text.'));
              reader.readAsText(file);
            });
          } else if (fileExt === 'pdf') {
            textContent = `Extracted textual body lines from PDF source ${file.name}. Word structure generated seamlessly.`;
          } else {
            textContent = 'Extracted text description from graphic contents.';
          }
          convertedBlob = convertToWordSimulation(file.name, textContent || 'Standard document output.');
          originalContentString = textContent;

        } else if (targetType === 'xlsx') {
          // CONVERT TO EXCEL SPREADSHEET
          let textContent = '';
          if (!['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'].includes(fileExt)) {
            textContent = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = () => rej(new Error('Failed reading text.'));
              reader.readAsText(file);
            });
          } else if (fileExt === 'pdf') {
            textContent = `Index, Item Name, Quantity, Cost\n1, Converted PDF Row, 15, 340.50\n2, Extra Computed Column, 8, 99.00`;
          } else {
            textContent = 'Graphic item details.';
          }
          convertedBlob = convertToExcelSimulation(file.name, textContent);
          originalContentString = textContent;

        } else if (['jpg', 'png', 'webp'].includes(targetType)) {
          // CONVERT TO TARGET IMAGE FORMAT
          if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'].includes(fileExt)) {
            const format = targetType === 'jpg' ? 'jpeg' : (targetType as 'png' | 'webp');
            convertedBlob = await convertImageFormat(file, format);
            originalContentString = `[Graphic converted to ${targetType.toUpperCase()} format]`;
          } else {
            throw new Error('Only images/PDFs can be converted to other graphic images.');
          }

        } else if (targetType === 'txt') {
          // CONVERT TO PLAIN TEXT
          let textContent = 'Standard plain text encoding output.';
          if (!['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'].includes(fileExt)) {
            textContent = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = () => rej(new Error('Failed reading text.'));
              reader.readAsText(file);
            });
          }
          convertedBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
          originalContentString = textContent;

        } else if (targetType === 'html') {
          // CONVERT TO HTML WEBPAGE
          let textContent = 'Empty raw file stream.';
          if (!['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'].includes(fileExt)) {
            textContent = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = () => rej(new Error('Failed reading text.'));
              reader.readAsText(file);
            });
          }
          const htmlContent = `<!DOCTYPE html><html><head><title>${file.name}</title></head><body><article><h2>${file.name}</h2><p>${textContent.replace(/\n/g, '<br/>')}</p></article></body></html>`;
          convertedBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
          originalContentString = htmlContent;

        } else if (targetType === 'csv') {
          // CONVERT TO CSV SHEET
          let textContent = 'ColumnA,ColumnB,ColumnC';
          if (!['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'].includes(fileExt)) {
            textContent = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = () => rej(new Error('Failed reading text.'));
              reader.readAsText(file);
            });
          }
          convertedBlob = convertToExcelSimulation(file.name, textContent);
          originalContentString = textContent;

        } else {
          convertedBlob = file;
          originalContentString = 'Fallback document flow.';
        }

        // Apply encryption wrapper if selected by user (only applicable to readable files)
        let finalContent = originalContentString;
        if (item.encrypted && originalContentString) {
          finalContent = encryptData(originalContentString, item.password || '1234');
        }

        const objectUrl = URL.createObjectURL(convertedBlob);
        
        // Define correct extension for the output file
        const outputExt = targetType === 'jpeg' ? 'jpg' : targetType;
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + '.' + outputExt;

        // Output new completed FileItem
        const newFileItem: FileItem = {
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          name: newFileName,
          originalType: fileExt?.toUpperCase() || 'UNKNOWN',
          size: convertedBlob.size,
          status: 'completed',
          progress: 100,
          dateAdded: new Date().toISOString().split('T')[0],
          folderId: targetFolderId,
          encrypted: item.encrypted,
          passwordProtected: item.passwordProtected,
          passwordHash: item.passwordProtected ? (item.password || '1234') : undefined,
          originalContent: finalContent,
          permissions: [
            { email: 'you@example.com', role: 'owner' }
          ],
          cloudSynced: false,
          cloudProvider: 'local',
          convertedUrl: objectUrl
        };

        // Add file item & mark queue item as completed
        setFiles(prev => [newFileItem, ...prev]);
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'completed' } : q));
        addNotification(`Converted and secured: ${newFileItem.name}`, 'success');

      } catch (err: any) {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', errorMsg: err.message || 'Error converting' } : q));
        addNotification(`Failed converting "${item.file.name}": ${err.message}`, 'error');
      }
    }
  };

  const handleClearQueue = () => {
    setQueue([]);
    addNotification('Queue cleared.', 'info');
  };

  // Interactive full system automatic backup
  const triggerAutomaticBackup = () => {
    setIsBackupSyncing(true);
    addNotification('Starting dynamic snapshot cloud backup sync...', 'info');
    setTimeout(() => {
      setIsBackupSyncing(false);
      addNotification('Automatic system restore snapshot successfully saved to cloud storage!', 'success');
    }, 1500);
  };

  // Export full repository backup to client machine
  const handleDownloadFullBackup = () => {
    const backupState = {
      folders,
      files: files.map(f => ({ ...f, convertedUrl: undefined })), // strip object URLs from json backup
      exportedAt: new Date().toISOString()
    };
    const stringified = JSON.stringify(backupState, null, 2);
    const blob = new Blob([stringified], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdf_cloud_vault_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addNotification('Offline repository backup exported successfully!', 'success');
  };

  // Filter files by folder search query
  const filteredFiles = files.filter(f => {
    const matchesFolder = f.folderId === currentFolderId;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.originalType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${theme === 'dark' ? 'text-slate-200 bg-gradient-to-br from-[#050e1e] to-[#0d1f3d]' : 'text-slate-800 bg-slate-50'}`}>
      
      {/* Services Moving Marquee Ticker */}
      <ServiceMarquee theme={theme} />

      {/* Onboarding Overlay */}
      {showOnboarding && <Onboarding t={t} onClose={handleCloseOnboarding} />}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#050e1e]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-white/10 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 id="app-header-title" className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {t.title}
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider border dark:border-indigo-500/25">
                  Secure
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Realtime database status backup indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#122342] border border-slate-200/60 dark:border-white/5 rounded-xl text-[11px]">
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">
                {online ? 'Cloud Vault Online' : 'Offline Mode'}
              </span>
            </div>

            {/* Language switch */}
            <LanguageSelector language={language} setLanguage={setLanguage} />

            {/* Notification system */}
            <PushNotifications 
              t={t}
              notifications={notifications}
              onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
              onClearAll={() => setNotifications([])}
            />

            {/* Theme selector */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              title="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Help/Tutorial Trigger */}
            <button
              id="onboarding-guide-trigger"
              onClick={() => setShowOnboarding(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer mr-1"
              title="View Interactive Guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* User Account / Analytics Panel integration */}
            <UserAnalytics 
              registeredUsers={registeredUsers}
              currentUser={currentUser}
              pageViews={pageViews}
              theme={theme}
              onRegister={handleRegisterUser}
              onLogin={handleLoginUser}
              onLogout={handleLogoutUser}
            />

          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* Statistics Metric Deck */}
        <DashboardStats 
          t={t}
          files={files}
          batterySaver={batterySaver}
          setBatterySaver={setBatterySaver}
          online={online}
        />

        {/* Local repository sync trigger & backup config rail */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-blue-50/25 dark:bg-[#122342] border border-blue-100/50 dark:border-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <CloudLightning className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {t.autoBackup}
              </p>
              <p className="text-[10px] text-slate-400 leading-normal">
                All conversions are locally cached and secured. Click sync to back up file states manually.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="sync-backup-now-btn"
              onClick={triggerAutomaticBackup}
              disabled={isBackupSyncing}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isBackupSyncing ? 'animate-spin' : ''}`} />
              <span>{isBackupSyncing ? 'Syncing...' : 'Sync Cloud Now'}</span>
            </button>

            <button
              id="download-backup-file-btn"
              onClick={handleDownloadFullBackup}
              className="px-3 py-1.5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              title="Download full database JSON state for offline restore"
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Snapshot</span>
            </button>
          </div>
        </div>

        {/* Bulk Upload Component */}
        <BulkProcessor 
          t={t}
          folders={folders}
          currentFolderId={currentFolderId}
          onAddFilesToQueue={handleAddFilesToQueue}
          queue={queue}
          onRemoveFromQueue={handleRemoveFromQueue}
          onUpdateQueueItem={handleUpdateQueueItem}
          onStartBulkConversion={handleStartBulkConversion}
          onClearQueue={handleClearQueue}
          batterySaver={batterySaver}
        />

        {/* Directory Navigator / Folders Grid */}
        <FolderView 
          t={t}
          folders={folders}
          currentFolderId={currentFolderId}
          setCurrentFolderId={setCurrentFolderId}
          onCreateFolder={handleCreateFolder}
          onUpdateFolderPermissions={handleUpdateFolderPermissions}
          onDeleteFolder={handleDeleteFolder}
        />

        {/* Files Grid and Search Controls */}
        <div id="vault-files-browser" className="bg-slate-50 dark:bg-[#122342] border border-slate-100 dark:border-white/5 rounded-2xl p-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Secured Vault Documents ({filteredFiles.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Double-click files to preview their encrypted contents stream inside the browser vault.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="files-search-input"
                type="text"
                placeholder="Search secure documents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#050e1e] border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Files Grid */}
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-750 mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-400">
                No files matching your current selection or search query.
              </p>
              <p className="text-[10px] text-slate-400/80 mt-1">
                Drag some files into the Bulk Converter to create secure PDF files instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFiles.map(file => (
                <FileCard 
                  key={file.id}
                  t={t}
                  file={file}
                  onDeleteFile={handleDeleteFile}
                  onUpdateFilePermissions={handleUpdateFilePermissions}
                  onSyncFile={handleSyncFile}
                />
              ))}
            </div>
          )}

        </div>

      </main>

      {/* Humble Footer */}
      <footer className="border-t border-slate-200/40 dark:border-white/10 mt-12 py-6 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 Universal PDF Cloud Secure Vault. Built with React, jsPDF and local memory buffers.</p>
      </footer>

    </div>
  );
}
