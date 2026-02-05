
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName = 'User NanoArtif';
  let userEmail = user?.email || '';
  let companyName = '';
  let role = 'USER';

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (dbUser) {
      role = dbUser.role;
      userName = dbUser.name || user.email?.split('@')[0] || 'User NanoArtif';
      companyName = dbUser.companyName || '';
    }
  }

  return <DashboardClient isPro={role === 'PRO_USER' || role === 'ADMIN'} userName={userName} userEmail={userEmail} companyName={companyName} />;
}