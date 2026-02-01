'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, Filter } from 'lucide-react';

const timeSeriesData = [
  { date: '2024-01-01', pageViews: 2400, users: 1240, bounceRate: 24 },
  { date: '2024-01-08', pageViews: 1398, users: 1221, bounceRate: 22 },
  { date: '2024-01-15', pageViews: 9800, users: 2290, bounceRate: 29 },
  { date: '2024-01-22', pageViews: 3908, users: 2000, bounceRate: 20 },
  { date: '2024-01-29', pageViews: 4800, users: 2181, bounceRate: 25 },
  { date: '2024-02-05', pageViews: 3800, users: 2500, bounceRate: 18 },
  { date: '2024-02-12', pageViews: 4300, users: 2100, bounceRate: 21 },
];

const trafficSourcesData = [
  { name: 'Organic', value: 45, fill: '#3b82f6' },
  { name: 'Direct', value: 25, fill: '#60a5fa' },
  { name: 'Referral', value: 20, fill: '#93c5fd' },
  { name: 'Social', value: 10, fill: '#dbeafe' },
];

const deviceData = [
  { device: 'Desktop', sessions: 12500, bounceRate: 22 },
  { device: 'Mobile', sessions: 8300, bounceRate: 35 },
  { device: 'Tablet', sessions: 3200, bounceRate: 28 },
];

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Detailed insights and performance metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary gap-2 bg-transparent"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Page Views and Users */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Page Views & Users (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={timeSeriesData}>
            <defs>
              <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.2}
            />
            <XAxis stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="pageViews"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorPageViews)"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Traffic Sources and Bounce Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Traffic Sources
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={trafficSourcesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {trafficSourcesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2 p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Device Performance
          </h3>
          <div className="space-y-4">
            {deviceData.map((device) => (
              <div key={device.device} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">
                    {device.device}
                  </span>
                  <span className="text-muted-foreground">
                    {device.sessions.toLocaleString()} sessions
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{
                        width: `${Math.min((device.sessions / 12500) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {device.bounceRate}% bounce
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bounce Rate Trends */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Bounce Rate Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.2}
            />
            <XAxis stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="bounceRate"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
