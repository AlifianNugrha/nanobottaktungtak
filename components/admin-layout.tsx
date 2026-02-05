import React from "react"
import { Sidebar } from './sidebar';
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role = 'USER';
  let userName = 'User NanoArtif';

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    if (dbUser) {
      role = dbUser.role;
      userName = dbUser.name || user.email?.split('@')[0] || 'User NanoArtif';
    }
  }

  const isPro = role === 'PRO_USER' || role === 'ADMIN';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background font-jakarta">
      <Sidebar isPro={isPro} userName={userName} role={role} userEmail={user?.email} />
      <main className="flex-1 w-full min-w-0 overflow-x-hidden p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
