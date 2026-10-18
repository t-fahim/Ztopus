import React, { useState } from 'react';
import { X, Check, ShieldCheck, LogOut, Sparkles, Calendar, Heart, Bookmark } from 'lucide-react';
import { UserProfile } from '../types/campus';

export interface GoogleAuthUser {
  isSignedIn: boolean;
  email: string;
  name: string;
  avatarUrl?: string;
  googleCalendarSynced: boolean;
}

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: GoogleAuthUser;
  userProfile: UserProfile;
  onSignInWithGoogle: (email: string, name: string) => void;
  onSignOut: () => void;
  onToggleCalendarSync: () => void;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  authUser,
  userProfile,
  onSignInWithGoogle,
  onSignOut,
  onToggleCalendarSync
}) => {
  const [selectedEmail, setSelectedEmail] = useState(authUser.email || 'fahim.bioinfo@gmail.com');
  const [customName, setCustomName] = useState(userProfile.name || 'Fahim');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSignInWithGoogle(selectedEmail, customName);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            {/* Google G Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.27 21.44 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.56 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
              />
            </svg>
            <div>
              <h2 className="text-sm font-semibold text-white">Google Account Login</h2>
              <p className="text-[11px] text-slate-400">Easy student single sign-on</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {authUser.isSignedIn ? (
            /* Signed In View */
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
                  {authUser.name.charAt(0)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white truncate">{authUser.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[9px] border border-emerald-500/30">
                      Verified
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate font-mono">
                    {authUser.email}
                  </div>
                </div>
              </div>

              {/* Google Calendar Sync Card */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-slate-200">Google Calendar Sync</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={authUser.googleCalendarSynced}
                    onChange={onToggleCalendarSync}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Automatically sync your bookmarked hackdays and scholarships into your Google Calendar account.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Sign In Prompt View */
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in with your Google account to save deadlines, sync directly to your Google Calendar, and personalize student radar alerts.
              </p>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Google Email Address</label>
                <input
                  type="email"
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  placeholder="your-name@gmail.com or @university.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Student Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Fahim"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleGoogleAuth}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2.5 shadow-md disabled:opacity-50 mt-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.27 21.44 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.56 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span>{isProcessing ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
