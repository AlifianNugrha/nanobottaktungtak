import React from "react"
import { SidebarPlatform } from './sidebar-platform';

export function PlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <SidebarPlatform />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
