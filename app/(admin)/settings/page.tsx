
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { SettingsClient } from '@/components/settings-client';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName = 'User NanoArtif';
  let userEmail = user?.email || '';
  let companyName = 'Acme Corporation';
  let role = 'USER';
  let userImage = '';

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (dbUser) {
      role = dbUser.role;
      userName = dbUser.name || user.email?.split('@')[0] || 'User NanoArtif';
      companyName = dbUser.companyName || '';
      userImage = dbUser.image || '';
    }
  }

  const isPro = role === 'PRO_USER' || role === 'ADMIN';

  return <SettingsClient userName={userName} userEmail={userEmail} companyName={companyName} isPro={isPro} userImage={userImage} />;
}
