import React, { useRef, useState, useEffect } from 'react';
import { AppData, UserRole } from '../types';
import { Download, Upload, Trash2, AlertTriangle, FileJson, Database, Save, CheckCircle, ExternalLink, XCircle, Loader2, Copy } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, testSupabaseConnection } from '../lib/supabaseClient';

interface SettingsProps {
  data: AppData;
  onImportData: (data: AppData) => void;
  onClearData: () => void;
  userRole: UserRole;
  refreshData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onImportData, onClearData, userRole, refreshData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = userRole === UserRole.ADMIN;
  
  // Supabase State
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      const config = getSupabaseConfig();
      // Initialize state from storage even if both aren't present yet, so user can edit
      if (config.url) setSbUrl(config.url);
      if (config.key) setSbKey(config.key);

      if (config.url && config.key) {
        setConnectionStatus('verifying');
        try {
          await testSupabaseConnection(config.url, config.key);
          setConnectionStatus('success');
        } catch (e) {
          setConnectionStatus('error');
          // Don't show alert on initial load, just set status
        }
      }
    };
    checkConnection();
  }, []);

  const handleSaveConfig = async () => {
    if (!sbUrl || !sbKey) {
        alert("Please enter both Project URL and Anon Public Key.");
        return;
    }

    setConnectionStatus('verifying');
    setErrorMessage('');

    try {
      await testSupabaseConnection(sbUrl, sbKey);
      
      // If successful
      saveSupabaseConfig(sbUrl, sbKey);
      setConnectionStatus('success');
      alert('Supabase connected successfully! The app is now synced with the cloud.');
      refreshData();
    } catch (err: any) {
      console.error(err);
      setConnectionStatus('error');
      let msg = err.message || "Unknown error";
      
      // Helpful error messages
      if (err.code === '42P01') {
         msg = "Connected to Supabase, but the 'clients' table was not found. Please run the SQL script in the Supabase SQL Editor.";
      } else if (msg.includes('fetch')) {
         msg = "Network error. Please check the URL.";
      } else if (msg.includes('apikey')) {
         msg = "Invalid API Key.";
      }
      
      setErrorMessage(msg);
      alert(`Connection failed: ${msg}`);
    }
  };

  const handleDisconnect = () => {
    if (window.confirm("Disconnect from Supabase? The app will revert to using local storage.")) {
        clearSupabaseConfig();
        setSbUrl('');
        setSbKey('');
        setConnectionStatus('idle');
        setErrorMessage('');
        alert('Supabase disconnected. Using local storage.');
        refreshData();
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
      } catch (err) {
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your application data and connections</p>
      </header>

      {/* Cloud Connection */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Cloud Database (Supabase)
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Connect to Supabase to persist your data in the cloud.
            </p>
          </div>
          
          {connectionStatus === 'success' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium animate-in fade-in">
              <CheckCircle className="w-4 h-4" />
              Connected
            </div>
          )}
          {connectionStatus === 'error' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium animate-in fade-in">
              <XCircle className="w-4 h-4" />
              Connection Failed
            </div>
          )}
           {connectionStatus === 'verifying' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium animate-in fade-in">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <div className="flex items-start gap-2">
               <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
               <div>
                 <span className="font-bold block mb-1">Important: Enable Database Access</span>
                 By default, Supabase blocks all data writing. You MUST disable Row Level Security (RLS) for this app to work:
                 <ol className="list-decimal ml-4 mt-2 space-y-1">
                   <li>Go to your <strong>Supabase Dashboard</strong> &gt; <strong>Authentication</strong> &gt; <strong>Policies</strong>.</li>
                   <li>For the <code>clients</code>, <code>expenses</code>, and <code>payments</code> tables, click <strong>"Disable RLS"</strong>.</li>
                 </ol>
               </div>
            </div>
          </div>
          
           {/* SQL Helper */}
           <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm">
             <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">Database Setup (Run in Supabase SQL Editor)</span>
             </div>
             <p className="text-slate-500 mb-2">If you see errors about "isActive", run this command:</p>
             <code className="block bg-slate-900 text-green-400 p-2 rounded text-xs overflow-x-auto">
               alter table clients add column "isActive" boolean default true;
             </code>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project URL</label>
            <input 
              type="text" 
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm ${connectionStatus === 'error' ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
              placeholder="https://xyz.supabase.co"
              value={sbUrl}
              onChange={e => setSbUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
              Anon Public Key
              <span className="text-xs font-normal text-slate-400">
                (Found under "Project API keys" - use the 'anon' key)
              </span>
            </label>
            <input 
              type="password" 
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm ${connectionStatus === 'error' ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
              placeholder="eyJh..."
              value={sbKey}
              onChange={e => setSbKey(e.target.value)}
            />
          </div>
          
          {connectionStatus !== 'success' && (
            <div className="p-4 bg-indigo-50 text-indigo-800 text-xs rounded-lg flex gap-2">
               <ExternalLink className="w-4 h-4 flex-shrink-0" />
               <div>
                 <p className="font-semibold mb-1">How to verify connection:</p>
                 <p>
                   1. Enter credentials and click "Connect".<br/>
                   2. If it says "Connected", try adding a client in the app.<br/>
                   3. Check your Supabase Dashboard &gt; Table Editor to see if the data appears.
                 </p>
                 <p className="mt-2 text-indigo-600">
                   <strong>Tip:</strong> Ensure you ran the SQL script to create tables.
                 </p>
               </div>
            </div>
          )}

          {errorMessage && (
             <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                <strong>Error:</strong> {errorMessage}
             </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {connectionStatus === 'success' && (
              <button 
                onClick={handleDisconnect}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors"
              >
                Disconnect
              </button>
            )}
            <button 
              onClick={handleSaveConfig}
              disabled={connectionStatus === 'verifying'}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-70"
            >
              {connectionStatus === 'verifying' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
              ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {connectionStatus === 'success' ? 'Update Connection' : 'Connect'}
                  </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Local Data Management */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileJson className="w-5 h-5 text-blue-600" />
            Backup & Restore
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Export your data to JSON or import from a previous backup.
          </p>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2">
          {/* Export */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">Export Data</h3>
            </div>
            <button 
              onClick={handleExport}
              className="w-full py-2 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Download JSON
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">Import Data</h3>
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
              disabled={!isAdmin}
              className="w-full py-2 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              Upload JSON
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="p-6 bg-red-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Permanently remove all data from {connectionStatus === 'success' ? 'Supabase' : 'Local Storage'}.
              </p>
            </div>
            <button 
              onClick={handleClearData}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};