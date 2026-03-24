
import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, ChevronLeft, Home, Package, User as UserIcon, Zap } from 'lucide-react';

const COLORS = {
  primary: '#FBD23F',
  secondary: '#000000'
};

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, title, onBack }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="fixed inset-0 bg-[#F8FAFC] pointer-events-none -z-10"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-2xl border-b border-slate-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="flex items-center font-black text-xl tracking-tighter">
              <span>Tailor</span>
              <span style={{ color: COLORS.primary }}>Bee</span>
              <span style={{ color: COLORS.primary }}>.</span>
            </div>
          )}
          {title && <span className="font-black text-slate-400 text-xs uppercase tracking-widest ml-2">{title}</span>}
        </div>
        
        {user && (
          <div className="flex items-center gap-3">
            <button 
              onClick={onLogout}
              className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 relative z-10">
        {children}
      </main>

      {/* Modern Floating Bottom Nav for Customer */}
      {user?.role === UserRole.CUSTOMER && !onBack && (
        <div className="fixed bottom-0 max-w-md w-full px-6 pb-6 pt-2 z-50">
          <nav className="bg-slate-900 rounded-[32px] flex justify-around items-center py-4 px-4 shadow-2xl shadow-slate-900/40">
            <button className="flex flex-col items-center gap-1 group">
              <div className="p-2 rounded-xl group-hover:bg-white/10 transition-colors" style={{ color: COLORS.primary }}>
                <Home className="w-6 h-6" fill={COLORS.primary} />
              </div>
            </button>
            <button className="flex flex-col items-center gap-1 group text-white/30">
              <div className="p-2 rounded-xl group-hover:bg-white/10 transition-colors">
                <Package className="w-6 h-6" />
              </div>
            </button>
            <button className="flex flex-col items-center gap-1 group text-white/30">
              <div className="p-2 rounded-xl group-hover:bg-white/10 transition-colors">
                <Zap className="w-6 h-6" />
              </div>
            </button>
            <button className="flex flex-col items-center gap-1 group text-white/30">
              <div className="p-2 rounded-xl group-hover:bg-white/10 transition-colors">
                <UserIcon className="w-6 h-6" />
              </div>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};
