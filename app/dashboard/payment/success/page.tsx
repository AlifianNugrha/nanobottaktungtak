'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-slate-900 to-slate-900 flex items-center justify-center p-6">
            <Card className="max-w-md w-full bg-slate-800/50 border-green-500 backdrop-blur-sm p-8 text-center space-y-6">
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
                <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
                <p className="text-slate-300">
                    Welcome to Pro! Your account has been upgraded and you now have access to all premium features.
                </p>
                <div className="space-y-3">
                    <Link href="/dashboard">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                            Go to Dashboard
                        </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                        <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                            View Subscription
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
