import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, BatteryMedium, Signal, User } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isPhoneFrameActive: boolean;
  googleUserEmail?: string;
  isGoogleSignedIn?: boolean;
  onTogglePhoneFrame: () => void;
  onOpenSetupGuide: () => void;
  onOpenGoogleLogin: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isPhoneFrameActive,
  googleUserEmail,
  isGoogleSignedIn = false,
  onTogglePhoneFrame,
  onOpenSetupGuide,
  onOpenGoogleLogin
}) => {
  const [currentTime, setCurrentTime] = useState('10:28');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      {/* Top Device & Viewport Switcher Toolbar (Visible on Desktop/Tablets) */}
      <div className="w-full max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between border-b border-slate-900 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Ztopus</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Android App</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Google Login Status Button */}
          <button
            onClick={onOpenGoogleLogin}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              isGoogleSignedIn
                ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                : 'bg-white hover:bg-slate-100 text-slate-900 border-transparent font-semibold shadow-xs'
            }`}
            title="Google Account & Calendar Sync"
          >
            {isGoogleSignedIn ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="truncate max-w-[130px] font-mono">{googleUserEmail || 'Google'}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                <span>Google Sign In</span>
              </>
            )}
          </button>

          {/* Viewport switch: Phone vs Expanded */}
          <div className="hidden sm:flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={onTogglePhoneFrame}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                isPhoneFrameActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show in Android Phone Mockup"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Shell</span>
            </button>
            <button
              onClick={onTogglePhoneFrame}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                !isPhoneFrameActive
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show in Fullscreen Responsive View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full View</span>
            </button>
          </div>

          <button
            onClick={onOpenSetupGuide}
            className="px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/50 transition-colors flex items-center gap-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Setup</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full flex-1 flex justify-center py-0 sm:py-6 px-0 sm:px-4">
        {isPhoneFrameActive ? (
          /* Android Physical Device Frame */
          <div className="w-full sm:max-w-[412px] h-screen sm:h-[860px] bg-slate-950 sm:border-[8px] sm:border-slate-800 sm:rounded-[44px] shadow-2xl relative flex flex-col overflow-hidden sm:ring-1 sm:ring-slate-700/50">
            {/* Android Camera Punch Hole & Status Bar */}
            <div className="h-10 px-6 pt-2 flex items-center justify-between text-[11px] font-medium text-slate-300 bg-slate-950 shrink-0 z-30 select-none">
              <span className="font-mono tabular-nums">{currentTime}</span>

              {/* Camera Notch */}
              <div className="w-4 h-4 rounded-full bg-black border border-slate-800/80 mx-auto" />

              <div className="flex items-center gap-1.5 text-slate-400">
                <Signal className="w-3.5 h-3.5 text-slate-300" />
                <Wifi className="w-3.5 h-3.5 text-slate-300" />
                <BatteryMedium className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Android App Screen Viewport */}
            <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 relative">
              {children}
            </div>

            {/* Android Bottom Navigation Pill */}
            <div className="h-4 bg-slate-950 shrink-0 flex items-center justify-center z-30 select-none">
              <div className="w-28 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        ) : (
          /* Full Responsive Viewport */
          <div className="w-full max-w-5xl flex-1 flex flex-col bg-slate-950">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
