import React from "react"
import { SidebarPlatform } from './sidebar-platform';

export function PlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-background">
            <SidebarPlatform />
            <main className="flex-1 w-full min-w-0 overflow-x-hidden p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
