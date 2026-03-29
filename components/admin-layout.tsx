import React from "react"
import { Sidebar } from './sidebar';
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role = 'USER';
  let userName = 'User NanoArtif';
  let userImage = '';

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    if (dbUser) {
      role = dbUser.role;
      userName = dbUser.name || user.email?.split('@')[0] || 'User NanoArtif';
      userImage = dbUser.image || '';
    }
  }

  const isPro = role === 'PRO_USER' || role === 'ADMIN';

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-background font-jakarta">
      <Sidebar isPro={isPro} userName={userName} role={role} userEmail={user?.email} userImage={userImage} />
      <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full overflow-hidden break-words">
          {children}
        </div>
      </main>
    </div>
  );
}
