import React, { useState } from 'react';
import { X, Smartphone, Download, Terminal, CheckCircle2, Copy, Check, ExternalLink, Sparkles, BookOpen } from 'lucide-react';

interface AndroidSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallPwa?: () => void;
  isInstallable?: boolean;
}

export const AndroidSetupGuideModal: React.FC<AndroidSetupGuideModalProps> = ({
  isOpen,
  onClose,
  onInstallPwa,
  isInstallable
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'apk' | 'studio' | 'glossary'>('quick');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Android App Starter Guide</h2>
              <p className="text-xs text-slate-400">Everything a beginner needs to build, run, and export to Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'quick'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Instant Phone Install (0 Setup)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'apk'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Build Real APK (.apk)
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'studio'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Android Studio Setup
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'glossary'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Android Glossary
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The Fastest Way to Run on Your Android Phone</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You don’t need to install 15 GB of Android Studio just to have a working Android app today. 
                  This application is built with modern PWA standards, meaning it runs natively as an Android app right now!
                </p>
                {isInstallable && onInstallPwa && (
                  <button
                    onClick={onInstallPwa}
                    className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Ztopus App Now</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  How to install on any Android phone (Chrome / Brave / Edge):
                </h3>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal pl-5">
                  <li className="leading-relaxed">
                    Open this app's shared link in <strong className="text-white">Google Chrome</strong> on your Android phone.
                  </li>
                  <li className="leading-relaxed">
                    Tap the <strong>three dots (⋮) menu</strong> in the top-right corner of Chrome.
                  </li>
                  <li className="leading-relaxed">
                    Tap <strong className="text-emerald-400">"Add to Home screen"</strong> or <strong className="text-emerald-400">"Install App"</strong>.
                  </li>
                  <li className="leading-relaxed">
                    A native Android app icon for <strong className="text-white">Ztopus</strong> will be added to your phone's app drawer with standalone window and offline caching!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">
                  How to Turn This App into a Standalone Android APK (.apk)
                </h3>
                <p className="text-xs text-slate-400">
                  Industry-standard tools like <strong>Capacitor</strong> wrap our React/Vite app into a real native Android project in 3 simple terminal commands.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Step 1: Install Capacitor Android</span>
                    <button
                      onClick={() => copyToClipboard('npm install @capacitor/core @capacitor/cli @capacitor/android', 'c1')}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedId === 'c1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <code className="text-xs font-mono text-emerald-400 block bg-slate-900 p-2 rounded">
                    npm install @capacitor/core @capacitor/cli @capacitor/android
                  </code>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Step 2: Initialize & Build Android Project</span>
                    <button
                      onClick={() => copyToClipboard('npx cap init "Ztopus" "com.ztopus.app" --web-dir="dist" && npm run build && npx cap add android', 'c2')}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedId === 'c2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <code className="text-xs font-mono text-emerald-400 block bg-slate-900 p-2 rounded">
                    npx cap init "Ztopus" "com.ztopus.app" --web-dir="dist"<br />
                    npm run build<br />
                    npx cap add android
                  </code>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Step 3: Open in Android Studio & Hit "Run"</span>
                    <button
                      onClick={() => copyToClipboard('npx cap open android', 'c3')}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedId === 'c3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <code className="text-xs font-mono text-emerald-400 block bg-slate-900 p-2 rounded">
                    npx cap open android
                  </code>
                  <p className="text-[11px] text-slate-500">
                    Android Studio opens with your native Android project. Click the green Play ▶ button to build the APK!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">
                  Setting Up Android Studio on Your Computer
                </h3>
                <p className="text-xs text-slate-400">
                  If you want to build on your local machine, here are the exact steps:
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>1. Download Android Studio Iguana / Ladybug</span>
                    <a
                      href="https://developer.android.com/studio"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-slate-400">
                    Free from Google for Windows, macOS, and Linux. Choose the "Standard Installation" during setup wizard.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-white">2. Enable USB Debugging on your Physical Phone</div>
                  <p className="text-slate-400">
                    Instead of a heavy emulator that slows down your computer, plug your real phone via USB:
                  </p>
                  <ul className="list-disc pl-4 text-slate-400 space-y-0.5 mt-1">
                    <li>Go to Phone Settings &gt; About Phone</li>
                    <li>Tap <strong className="text-white">"Build Number"</strong> 7 times (until it says "You are a developer!")</li>
                    <li>Go to Settings &gt; System &gt; Developer Options &gt; Turn ON <strong className="text-emerald-400">USB Debugging</strong></li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-white">3. Hit Run ▶</div>
                  <p className="text-slate-400">
                    Plug in your phone, and Android Studio will show your device name in the top bar. Click Run to install directly to your phone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-100">
                Android Beginner Jargon Explained
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-emerald-400">APK (.apk)</div>
                  <div className="text-slate-300">
                    "Android Package Kit" — the executable installer file for Android (like a .exe on Windows). You can send an APK directly to friends to install on their phones!
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-emerald-400">AndroidManifest.xml</div>
                  <div className="text-slate-300">
                    The blueprint file of an Android app. Tells Android your app's name, icon, permissions (internet, camera), and main activity.
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-emerald-400">Gradle</div>
                  <div className="text-slate-300">
                    Android's build automation system. It compiles your Java/Kotlin/web code, downloads dependencies, and bundles it into an APK.
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-emerald-400">Progressive Web App (PWA)</div>
                  <div className="text-slate-300">
                    Modern standard supported natively by Android. Web apps get their own home screen icon, splash screen, and offline storage without needing the Google Play Store!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>You can test this app in Android phone preview right on this screen!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
