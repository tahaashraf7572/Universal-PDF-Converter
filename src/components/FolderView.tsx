import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  ChevronRight, 
  Users, 
  UserPlus, 
  Trash2, 
  X, 
  Home,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { AppTranslation, FolderItem, UserPermission } from '../types';

interface FolderViewProps {
  t: AppTranslation;
  folders: FolderItem[];
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  onCreateFolder: (name: string) => void;
  onUpdateFolderPermissions: (folderId: string, permissions: UserPermission[]) => void;
  onDeleteFolder: (folderId: string) => void;
}

export default function FolderView({
  t,
  folders,
  currentFolderId,
  setCurrentFolderId,
  onCreateFolder,
  onUpdateFolderPermissions,
  onDeleteFolder
}: FolderViewProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermsModal, setShowPermsModal] = useState<FolderItem | null>(null);
  
  // States for permission editor
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'editor' | 'viewer'>('viewer');

  const currentFolder = folders.find(f => f.id === currentFolderId);
  
  // Filter folders inside the current folder
  const visibleFolders = folders.filter(f => f.parentId === currentFolderId);

  // Build breadcrumbs path
  const getBreadcrumbs = () => {
    const path: { id: string | null; name: string }[] = [{ id: null, name: t.rootFolder }];
    if (!currentFolderId) return path;

    const traverse = (folderId: string) => {
      const f = folders.find(item => item.id === folderId);
      if (f) {
        if (f.parentId) {
          traverse(f.parentId);
        }
        path.push({ id: f.id, name: f.name });
      }
    };

    traverse(currentFolderId);
    return path;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowAddModal(false);
    }
  };

  const handleAddPermission = () => {
    if (!showPermsModal || !newEmail.trim()) return;
    
    // Check if email already exists
    const exists = showPermsModal.permissions.some(p => p.email.toLowerCase() === newEmail.trim().toLowerCase());
    if (exists) {
      alert('This user already has access permissions for this folder.');
      return;
    }

    const updatedPermissions: UserPermission[] = [
      ...showPermsModal.permissions,
      { email: newEmail.trim().toLowerCase(), role: newRole }
    ];

    onUpdateFolderPermissions(showPermsModal.id, updatedPermissions);
    
    // Update local modal state to reflect changes instantly
    setShowPermsModal({
      ...showPermsModal,
      permissions: updatedPermissions
    });
    setNewEmail('');
  };

  const handleRemovePermission = (emailToRemove: string) => {
    if (!showPermsModal) return;
    if (emailToRemove === 'you@example.com') {
      alert('You cannot remove yourself (the owner) from the folder permissions.');
      return;
    }

    const updatedPermissions = showPermsModal.permissions.filter(
      p => p.email.toLowerCase() !== emailToRemove.toLowerCase()
    );

    onUpdateFolderPermissions(showPermsModal.id, updatedPermissions);
    
    setShowPermsModal({
      ...showPermsModal,
      permissions: updatedPermissions
    });
  };

  return (
    <div id="folder-view-container" className="bg-slate-50 dark:bg-[#122342] border border-slate-100 dark:border-white/5 rounded-2xl p-5 mb-8">
      
      {/* Directory Path Breadcrumbs */}
      <div id="breadcrumbs-navigation" className="flex flex-wrap items-center gap-2 mb-5 text-sm">
        {getBreadcrumbs().map((crumb, idx) => (
          <React.Fragment key={crumb.id || 'root'}>
            {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
            <button
              id={`breadcrumb-node-${crumb.id || 'root'}`}
              onClick={() => setCurrentFolderId(crumb.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-medium ${
                crumb.id === currentFolderId
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border dark:border-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {crumb.id === null ? <Home className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
              {crumb.name}
            </button>
          </React.Fragment>
        ))}

        {/* Create Folder Trigger */}
        <button
          id="create-folder-trigger-btn"
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          {t.addFolder}
        </button>
      </div>

      {/* Folders Display List */}
      <div id="folders-grid-list">
        {visibleFolders.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">
            No folders in this directory. Create one to organize your secure PDFs.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {visibleFolders.map(folder => (
              <div
                key={folder.id}
                id={`folder-card-${folder.id}`}
                className="bg-white dark:bg-[#0d1f3d] border border-slate-100 dark:border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/50 dark:hover:border-indigo-500/30 transition-all group"
              >
                <div 
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  <Folder className="w-9 h-9 text-amber-500 fill-amber-100 dark:fill-amber-950/20 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {folder.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {folder.dateCreated}
                    </span>
                  </div>
                </div>

                {/* Manage Access Controls Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-white/10">
                  <button
                    id={`manage-perms-folder-${folder.id}`}
                    onClick={() => setShowPermsModal(folder)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    title="Manage user permissions"
                  >
                    <Users className="w-3 h-3" />
                    <span>Access ({folder.permissions.length})</span>
                  </button>

                  <button
                    id={`delete-folder-btn-${folder.id}`}
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete folder "${folder.name}"? It will move all child items to the main root folder.`)) {
                        onDeleteFolder(folder.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Folder Modal */}
      {showAddModal && (
        <div id="add-folder-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#122342]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Create New Directory</h3>
            <form onSubmit={handleCreateSubmit}>
              <input
                id="new-folder-name-input"
                type="text"
                placeholder="Folder Name"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#050e1e] border border-slate-200 dark:border-white/10 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions / Access Control Modal */}
      {showPermsModal && (
        <div id="perms-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#16161a]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative">
            
            <button
              id="close-perms-modal-btn"
              onClick={() => setShowPermsModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Folder Permissions: {showPermsModal.name}
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Configure granular access levels. Users with matching emails can view or modify folder contents based on their assigned role.
            </p>

            {/* Current Access list */}
            <div className="mb-5 max-h-[160px] overflow-y-auto border border-slate-100 dark:border-white/10 rounded-xl p-3 bg-slate-50/50 dark:bg-[#09090b]/50">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 block">
                Active Users & Roles
              </span>
              {showPermsModal.permissions.map(perm => (
                <div key={perm.email} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-900 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {perm.email} {perm.email === 'you@example.com' && <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-1 py-0.2 rounded font-mono">You</span>}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {perm.role === 'owner' ? t.owner : perm.role === 'editor' ? t.editor : t.viewer}
                    </p>
                  </div>

                  {perm.role !== 'owner' && (
                    <button
                      onClick={() => handleRemovePermission(perm.email)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Permission Form */}
            <div className="border-t border-slate-100 dark:border-white/10 pt-4">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3 block">
                Grant Access
              </span>
              <div className="flex flex-col gap-3">
                <input
                  id="add-perm-email-input"
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
                
                <div className="flex items-center justify-between gap-2">
                  <select
                    id="add-perm-role-select"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as 'editor' | 'viewer')}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-lg text-xs outline-none text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="viewer">Viewer (Read-only)</option>
                    <option value="editor">Editor (Can convert & write)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddPermission}
                    disabled={!newEmail.trim()}
                    className="px-4 py-1.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Grant
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
