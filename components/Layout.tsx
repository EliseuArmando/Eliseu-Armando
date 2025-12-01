import React from 'react';
import { Crown, PenTool, Video, Mic, Image as ImageIcon, Menu } from 'lucide-react';
import { AppTab } from '../types';

interface LayoutProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: React.ReactNode;
}

const NavItem = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
      active 
        ? 'bg-red-900/40 text-yellow-500 border border-yellow-600/50' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={18} />
    <span className="font-serif tracking-wider text-sm">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentTab, onTabChange, children }) => {
  return (
    <div className="min-h-screen bg-black text-gray-200 mach-gradient selection:bg-red-900 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Crown className="text-yellow-600" size={28} />
              <h1 className="text-2xl font-bold font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-700">
                THE PRINCE'S STUDIO
              </h1>
            </div>
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-2">
              <NavItem 
                active={currentTab === AppTab.STRATEGIST} 
                onClick={() => onTabChange(AppTab.STRATEGIST)} 
                icon={PenTool} 
                label="STRATEGIST" 
              />
              <NavItem 
                active={currentTab === AppTab.EDITOR} 
                onClick={() => onTabChange(AppTab.EDITOR)} 
                icon={ImageIcon} 
                label="EDITOR" 
              />
              <NavItem 
                active={currentTab === AppTab.PROPAGANDA} 
                onClick={() => onTabChange(AppTab.PROPAGANDA)} 
                icon={Video} 
                label="PROPAGANDA" 
              />
              <NavItem 
                active={currentTab === AppTab.FORGE} 
                onClick={() => onTabChange(AppTab.FORGE)} 
                icon={ImageIcon} 
                label="THE FORGE" 
              />
              <NavItem 
                active={currentTab === AppTab.COUNCIL} 
                onClick={() => onTabChange(AppTab.COUNCIL)} 
                icon={Mic} 
                label="COUNCIL" 
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
        <div className="flex-grow">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-6 mt-12">
        <div className="text-center text-gray-600 text-xs font-serif">
          "The end justifies the means." — Niccolò Machiavelli
        </div>
      </footer>
    </div>
  );
};