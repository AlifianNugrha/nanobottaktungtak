'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, TrendingUp, Activity, Zap, Loader2 } from 'lucide-react';

const dashboardData = [
  { month: 'Jan', users: 2400, revenue: 2210, engagement: 2290 },
  { month: 'Feb', users: 3398, revenue: 2210, engagement: 2000 },
  { month: 'Mar', users: 2800, revenue: 9800, engagement: 2290 },
  { month: 'Apr', users: 3908, revenue: 3908, engagement: 2000 },
  { month: 'May', users: 4800, revenue: 4800, engagement: 2181 },
  { month: 'Jun', users: 3800, revenue: 3800, engagement: 2500 },
];

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Komponen statis untuk statistik
  const stats = [
    {
      title: 'Total Users',
      value: '12,543',
      change: '+12.5%',
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      title: 'Active Sessions',
      value: '2,843',
      change: '+23.1%',
      icon: Activity,
      color: 'text-primary',
    },
    {
      title: 'Performance',
      value: '94.5%',
      change: '+5.3%',
      icon: Zap,
      color: 'text-primary',
    },
  ];

  // JANGAN TAMPILKAN DASHBOARD JIKA BELUM LOGIN
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground tracking-tight">Verifying Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here's your analytics overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="p-6 bg-white border-border hover:border-primary/30 transition-all duration-300 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground tracking-tight">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                      {stat.change}
                    </span>
                    <span className="text-[10px] text-muted-foreground lowercase">vs last month</span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-primary/5 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section - TIDAK DIHAPUS, TETAP LENGKAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* User Growth Line Chart */}
        <Card className="p-6 bg-white border-border shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">User Growth</h3>
            <p className="text-xs text-muted-foreground">Monthly active user acquisition</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="users"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Bar Chart */}
        <Card className="p-6 bg-white border-border shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Revenue & Engagement</h3>
            <p className="text-xs text-muted-foreground">Comparing profit and user interactions</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="engagement" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}