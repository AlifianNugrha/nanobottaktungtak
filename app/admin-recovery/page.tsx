'use client';

import { useState } from 'react';
import { setAdminByEmail } from '@/app/actions/secure-admin-set';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function RecoverAdmin() {
    // Hardcoded to only allow the owner's email for this recovery tool
    const ALLOWED_EMAIL = 'fmencraft@gmail.com';
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleGrant = async () => {
        setLoading(true);
        setStatus('Processing...');

        try {
            const res = await setAdminByEmail(ALLOWED_EMAIL);
            if (res.success) {
                setStatus('✅ SUCCESS! You are now an Admin. Please go to /platform');
            } else {
                setStatus(`❌ Error: ${res.error}`);
            }
        } catch (e) {
            setStatus('❌ Network Error');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold">Admin Recovery</h1>
                <p className="text-sm text-gray-500">
                    Grant ADMIN access to: <br /> <strong>{ALLOWED_EMAIL}</strong>
                </p>

                <Button onClick={handleGrant} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirm Grant
                </Button>

                {status && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${status.includes('SUCCESS') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
