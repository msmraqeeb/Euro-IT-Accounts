import React, { useRef, useState, useEffect } from 'react';
import { AppData, UserRole, User, AppUser } from '../types';
import { 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  FileJson, 
  Save, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  User as UserIcon, 
  Shield, 
  UserPlus, 
  Edit, 
  Eye, 
  EyeOff, 
  Search, 
  KeyRound, 
  Mail, 
  Lock
} from 'lucide-react';
import { DEFAULT_USERS } from '../services/dataService';

interface SettingsProps {
  data: AppData;
  currentUser: User;
  onUpdateCurrentUser: (user: User) => void;
  onSaveUser: (user: AppUser) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onImportData: (data: AppData) => void;
  onClearData: () => void;
  userRole: UserRole;
  refreshData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  data, 
  currentUser,
  onUpdateCurrentUser,
  onSaveUser,
  onDeleteUser,
  onImportData, 
  onClearData, 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'backup'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // User Management State
  const usersList: AppUser[] = (data.users && data.users.length > 0) ? data.users : DEFAULT_USERS;
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalRole, setModalRole] = useState<UserRole>(UserRole.ADMIN);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userActionError, setUserActionError] = useState('');

  // Load current user's actual password if found in usersList
  useEffect(() => {
    const matched = usersList.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (matched && matched.password) {
      setProfilePassword(matched.password);
    }
  }, [usersList, currentUser.email]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    if (!profileName.trim() || !profileEmail.trim() || !profilePassword.trim()) {
      setProfileErrorMsg('Please fill in all fields (Name, Email, Password).');
      return;
    }

    setIsSavingProfile(true);
    try {
      // Find or create user ID
      const matched = usersList.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
      const userId = matched ? matched.id : (currentUser.id || `user_${Date.now()}`);

      const updatedAppUser: AppUser = {
        id: userId,
        name: profileName.trim(),
        email: profileEmail.trim(),
        password: profilePassword.trim(),
        role: currentUser.role,
        createdAt: matched?.createdAt || Date.now()
      };

      await onSaveUser(updatedAppUser);
      onUpdateCurrentUser({
        id: updatedAppUser.id,
        name: updatedAppUser.name,
        email: updatedAppUser.email,
        role: updatedAppUser.role
      });

      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenAddUserModal = () => {
    setEditingUser(null);
    setModalName('');
    setModalEmail('');
    setModalPassword(generatePassword());
    setModalRole(UserRole.ADMIN);
    setUserActionError('');
    setShowModalPassword(true);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUserModal = (user: AppUser) => {
    // Disallow editing msmraqeeb@gmail.com from other users or user management list
    if (user.email.toLowerCase() === 'msmraqeeb@gmail.com' && currentUser.email.toLowerCase() !== 'msmraqeeb@gmail.com') {
      alert('The super admin account "msmraqeeb@gmail.com" cannot be edited from this account.');
      return;
    }

    setEditingUser(user);
    setModalName(user.name);
    setModalEmail(user.email);
    setModalPassword(user.password || '');
    setModalRole(user.role || UserRole.ADMIN);
    setUserActionError('');
    setShowModalPassword(false);
    setIsUserModalOpen(true);
  };

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleSaveUserModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError('');

    if (!modalName.trim() || !modalEmail.trim() || !modalPassword.trim()) {
      setUserActionError('Please fill in Name, Email and Password.');
      return;
    }

    // Check duplicate email
    const duplicate = usersList.find(u => 
      u.email.toLowerCase() === modalEmail.trim().toLowerCase() && 
      u.id !== editingUser?.id
    );

    if (duplicate) {
      setUserActionError('A user with this email already exists.');
      return;
    }

    setIsSavingUser(true);
    try {
      const userToSave: AppUser = {
        id: editingUser ? editingUser.id : `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: modalName.trim(),
        email: modalEmail.trim(),
        password: modalPassword.trim(),
        role: modalRole,
        createdAt: editingUser?.createdAt || Date.now()
      };

      await onSaveUser(userToSave);
      setIsUserModalOpen(false);
      alert(editingUser ? 'User updated successfully!' : 'New user created successfully!');
    } catch (err: any) {
      setUserActionError(err.message || 'Failed to save user.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUserClick = async (user: AppUser) => {
    // Protect msmraqeeb@gmail.com from deletion
    if (user.email.toLowerCase() === 'msmraqeeb@gmail.com') {
      alert('The super admin account "msmraqeeb@gmail.com" is permanently protected and cannot be deleted.');
      return;
    }

    if (user.email.toLowerCase() === currentUser.email.toLowerCase()) {
      alert('You cannot delete your own logged-in user account!');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${user.name}" (${user.email})? This action cannot be undone.`)) {
      try {
        await onDeleteUser(user.id);
        alert('User deleted successfully!');
      } catch (err: any) {
        alert(`Failed to delete user: ${err.message}`);
      }
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `euro_it_accounts_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.clients) && Array.isArray(json.payments) && Array.isArray(json.expenses)) {
          if (window.confirm('This will overwrite your current data with the imported file. Are you sure?')) {
            onImportData(json);
            alert('Data imported successfully!');
          }
        } else {
          alert('Invalid file format.');
        }
      } catch {
        alert('Error parsing file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearData = () => {
    if (window.confirm('ARE YOU SURE? This will permanently delete ALL data. This action cannot be undone.')) {
      onClearData();
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Settings & Administration</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your profile, system users, and backups</p>
        </div>

        {/* Super Admin Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-200/60 rounded-full text-xs font-semibold text-slate-800 self-start sm:self-auto">
          <Shield className="w-4 h-4 text-amber-600" />
          <span>Super Admin Access</span>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            My Profile
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            User Management ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FileJson className="w-4 h-4" />
            Backup & Reset
          </button>
        </div>
      </div>

      {/* TAB 1: MY PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-blue-500/20 mb-4 ring-4 ring-blue-50">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{currentUser.email}</p>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 font-semibold text-xs rounded-full">
                {currentUser.role}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-full">
                Active Session
              </span>
            </div>

            <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Account Type:</span>
                <span className="font-medium text-slate-800">Super Administrator</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Platform:</span>
                <span className="font-medium text-slate-800">Euro IT Accounts</span>
              </div>
            </div>
          </div>

          {/* Profile Edit Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Profile & Credentials
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Update your account name, login email address, or change your password.
            </p>

            {profileSuccessMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                {profileSuccessMsg}
              </div>
            )}

            {profileErrorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm font-medium animate-in fade-in">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                {profileErrorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all font-medium"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address (Login Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all font-medium"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showProfilePassword ? 'text' : 'password'}
                    required
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all font-medium font-mono"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfilePassword(!showProfilePassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Ensure your password is secure and memorable.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <button
              onClick={handleOpenAddUserModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
          </div>

          {/* Users Table / Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Registered System Users
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Only authorized super admins (<span className="font-mono text-xs font-semibold text-slate-700">admin@email.com</span> & <span className="font-mono text-xs font-semibold text-slate-700">msmraqeeb@gmail.com</span>) can view and modify users.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                {filteredUsers.length} Users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredUsers.map((user) => {
                    const isSelf = user.email.toLowerCase() === currentUser.email.toLowerCase();
                    const isProtectedSuperAdmin = user.email.toLowerCase() === 'msmraqeeb@gmail.com';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                {user.name}
                                {isSelf && (
                                  <span className="text-[10px] uppercase tracking-wide bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                                    You
                                  </span>
                                )}
                                {isProtectedSuperAdmin && (
                                  <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                                    Super Admin (Protected)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            user.role === UserRole.ADMIN 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            <Shield className="w-3 h-3" />
                            {user.role}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isProtectedSuperAdmin ? (
                              <span className="text-xs text-slate-400 italic px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                Protected Account
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleOpenEditUserModal(user)}
                                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUserClick(user)}
                                  disabled={isSelf}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={isSelf ? "Cannot delete self" : "Delete User"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-400 text-sm">
                        No users found matching "{userSearchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & DANGER ZONE */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Local Data Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileJson className="w-5 h-5 text-blue-600" />
                Backup & Restore JSON Data
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Export your full dataset (Clients, Payments, Expenses, and Users) or restore from an existing JSON backup.
              </p>
            </div>

            <div className="p-6 grid gap-6 md:grid-cols-2">
              {/* Export */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Export All Data</h3>
                    <p className="text-xs text-slate-500">Download complete application database to JSON</p>
                  </div>
                </div>
                <button 
                  onClick={handleExport}
                  className="w-full mt-2 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Download JSON Backup
                </button>
              </div>

              {/* Import */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Import Data</h3>
                    <p className="text-xs text-slate-500">Restore application database from a JSON file</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json" 
                  className="hidden" 
                />
                <button 
                  onClick={handleImportClick}
                  className="w-full mt-2 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Upload JSON File
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            <div className="p-6 bg-red-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Permanently clear local data caches and records. This action cannot be reverted.
                </p>
              </div>
              <button 
                onClick={handleClearData}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Clear Local Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {userActionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                {userActionError}
              </div>
            )}

            <form onSubmit={handleSaveUserModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Shakil Mahmud"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Login Username)
                </label>
                <input
                  type="email"
                  required
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="e.g. newuser@email.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalPassword(generatePassword())}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    required
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role
                </label>
                <select
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  <option value={UserRole.ADMIN}>ADMIN (Full system access)</option>
                  <option value={UserRole.VIEWER}>VIEWER (Read-only reports)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-blue-500/20 disabled:opacity-60"
                >
                  {isSavingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingUser ? 'Save User' : 'Create User'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};