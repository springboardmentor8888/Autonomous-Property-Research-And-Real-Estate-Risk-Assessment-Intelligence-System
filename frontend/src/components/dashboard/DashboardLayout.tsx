import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background glow behind dashboards */}
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Top Navbar */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Workspace Scroll Panel Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

    </div>
  );
};
