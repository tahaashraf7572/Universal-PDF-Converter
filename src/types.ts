export type FileStatus = 'pending' | 'converting' | 'completed' | 'error';

export interface UserPermission {
  email: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface FileItem {
  id: string;
  name: string;
  originalType: string;
  size: number;
  status: FileStatus;
  progress: number;
  errorMsg?: string;
  convertedUrl?: string; // Local ObjectURL or DataURL
  dateAdded: string;
  folderId: string | null;
  encrypted: boolean;
  passwordProtected: boolean;
  passwordHash?: string;
  originalContent?: string; // Text content or Base64 content for restoration
  permissions: UserPermission[];
  cloudSynced: boolean;
  cloudProvider: 'local' | 'gdrive' | 'dropbox' | 'onedrive';
}

export interface FolderItem {
  id: string;
  name: string;
  dateCreated: string;
  parentId: string | null;
  permissions: UserPermission[];
  cloudSynced: boolean;
  cloudProvider: 'local' | 'gdrive' | 'dropbox' | 'onedrive';
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export type UserLanguage = 'en' | 'ur' | 'es' | 'de';
export type AppTheme = 'light' | 'dark';

export interface AppTranslation {
  title: string;
  subtitle: string;
  dashboard: string;
  bulkConverter: string;
  cloudVault: string;
  onboarding: string;
  darkMode: string;
  lightMode: string;
  language: string;
  convert: string;
  converting: string;
  completed: string;
  error: string;
  dragDrop: string;
  selectFiles: string;
  unsupported: string;
  bulkActions: string;
  startBulk: string;
  clearQueue: string;
  passwordProtect: string;
  encrypt: string;
  permissions: string;
  owner: string;
  editor: string;
  viewer: string;
  storageUsed: string;
  offlineMode: string;
  syncSuccess: string;
  autoBackup: string;
  batteryOptimized: string;
  tutorialStep: string;
  tutorialNext: string;
  tutorialPrev: string;
  tutorialSkip: string;
  tutorialDone: string;
  addFolder: string;
  rootFolder: string;
  notifications: string;
}
