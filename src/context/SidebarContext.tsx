"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = 'financeflow_sidebar_collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Initialize with undefined to avoid SSR mismatch - will be set on mount
  const [isCollapsed, setIsCollapsed] = useState<boolean | undefined>(undefined);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isFirstRender = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsCollapsed(stored === 'true');
    isFirstRender.current = false;
  }, []);

  // Save to localStorage when state changes (skip first render to avoid overwriting on mount)
  useEffect(() => {
    if (isCollapsed !== undefined && !isFirstRender.current) {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => prev === undefined ? false : !prev);
  };

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed: isCollapsed ?? false,
        toggleCollapsed,
        setCollapsed,
        isMobileOpen,
        setIsMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
