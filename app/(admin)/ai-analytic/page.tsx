import { getAIAnalytics } from '@/app/actions/ai-analytics-actions';
import { redirect } from 'next/navigation';
import { AIAnalyticsClient } from '@/components/ai-analytics-client';

export default async function AIAnalyticsPage() {
  // Fetch real analytics data
  const result = await getAIAnalytics();

  if (!result.success) {
    redirect('/login');
  }

  return <AIAnalyticsClient data={result.data} />;
}