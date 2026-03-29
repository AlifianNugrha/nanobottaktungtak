import React from "react"
import { SidebarPlatform } from './sidebar-platform';

export function PlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-background font-jakarta">
            <SidebarPlatform />
            <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-8">
                <div className="max-w-7xl mx-auto w-full overflow-hidden break-words">
                    {children}
                </div>
            </main>
        </div>
    );
}
