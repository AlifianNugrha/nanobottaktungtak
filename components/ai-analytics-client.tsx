'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  BrainCircuit,
  MessageSquare,
  Smile,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Lightbulb,
  PieChart
} from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export function AIAnalyticsClient({ data }: { data: any }) {
  const { t } = useLanguage();
  const { metrics, funnel, topIntents, aiInsight } = data;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 px-4 pb-20 animate-in fade-in duration-500 font-jakarta">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            {t('AI Analytics')} <div className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-md tracking-widest uppercase">Pro</div>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('Insight cerdas dari percakapan dan perilaku pelanggan Anda.')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button variant="outline" className="w-full sm:w-auto rounded-xl h-10 text-xs font-bold border-border">
            <Filter className="w-3.5 h-3.5 mr-2" /> {t('Filter')}
          </Button>
          <Button className="w-full sm:w-auto bg-primary text-white rounded-xl h-10 px-5 text-xs font-bold shadow-lg shadow-primary/20">
            {t('Generate Report')}
          </Button>
        </div>
      </div>

      {/* TOP METRICS: AI PERFORMANCE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Chat Resolution', value: metrics.resolutionRate, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Avg. Sentiment', value: metrics.avgSentiment, icon: Smile, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Conversion Rate', value: metrics.conversionRate, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'AI Messages', value: metrics.totalMessages, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 border-border shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{t(stat.label)}</p>
              <p className="text-xl font-black">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: CONVERSION FUNNEL */}
        <Card className="lg:col-span-2 p-8 border-border shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" /> {t('Conversion Funnel')}
            </h3>
            <select className="text-[10px] font-bold border-none bg-gray-50 rounded-lg p-1 outline-none">
              <option>{t('This Week')}</option>
              <option>{t('This Month')}</option>
            </select>
          </div>

          {/* Funnel Visualization */}
          <div className="space-y-4 py-4">
            {funnel.map((step: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>{t(step.label)}</span>
                  <span className="text-primary">{step.value}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${step.width} ${step.color} rounded-full transition-all duration-1000`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT: AI SMART INSIGHTS */}
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-none rounded-[2rem] relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="font-bold text-lg leading-tight italic">"{t(aiInsight.title)}"</h3>
              <div className="pt-2">
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  <span className="text-primary font-bold">{t('Rekomendasi AI')}:</span> {t(aiInsight.recommendation)}
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <BrainCircuit className="w-20 h-20" />
            </div>
          </Card>

          <Card className="p-6 border-border shadow-sm">
            <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4">{t('Top Customer Intents')}</h4>
            <div className="space-y-4">
              {topIntents.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="text-xs font-bold">{t(item.intent)}</p>
                    <p className="text-[10px] text-muted-foreground">{item.count} {t('messages')}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">
                    {item.pct}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* BOTTOM SECTION: SENTIMENT ANALYSIS CHART AREA */}
      <Card className="p-8 border-border bg-white shadow-sm flex flex-col items-center justify-center min-h-[300px] border-dashed border-2">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <h4 className="font-bold text-lg text-foreground">{t('Detailed Chat Sentiment History')}</h4>
        <p className="text-muted-foreground text-sm max-w-sm text-center mt-1">
          {t('Visualisasi tren kepuasan pelanggan secara harian akan muncul di sini menggunakan')} <strong>Recharts</strong>.
        </p>
        <Button variant="outline" className="mt-6 rounded-xl text-xs font-bold border-border">
          {t('Connect Analytics Database')}
        </Button>
      </Card>

    </div>
  );
}
