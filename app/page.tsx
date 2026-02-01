// apps/admindashboard/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Ini akan memaksa URL menjadi localhost:3000/login
  redirect('/login');
}