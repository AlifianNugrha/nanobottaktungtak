'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { Check, Crown, Loader2, AlertTriangle } from 'lucide-react';

import { updateProfile } from '@/app/actions/user-actions';
import { updateUserPassword, deleteUserAccount } from '@/app/actions/auth-actions';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/components/language-provider';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function SettingsClient({ userName, userEmail, companyName, isPro }: { userName: string; userEmail: string; companyName: string; isPro: boolean }) {
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const [mounted, setMounted] = useState(false);

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [isPassOpen, setIsPassOpen] = useState(false);

    // Delete Account State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const [formData, setFormData] = useState({
        name: userName,
        email: userEmail,
        companyName: companyName,
        timezone: 'UTC',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateProfile({
            name: formData.name,
            companyName: formData.companyName
        });

        setIsSaving(false);

        if (res.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            router.refresh();
        } else {
            alert("Failed to save profile: " + res.error);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setIsChangingPass(true);
        const res = await updateUserPassword(newPassword);
        setIsChangingPass(false);

        if (res.success) {
            alert("Password updated successfully");
            setNewPassword('');
            setConfirmPassword('');
            setIsPassOpen(false);
        } else {
            alert("Failed to update password: " + res.error);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setIsDeleting(true);
        const res = await deleteUserAccount();

        if (res.success) {
            router.push('/login'); // Should happen automatically by redirect in action usually, or client nav
        } else {
            setIsDeleting(false);
            alert("Failed to delete account: " + res.error);
        }
    };

    if (!mounted) {
        return <div className="p-8">Loading settings...</div>;
    }

    return (
        <div className="space-y-8 max-w-3xl animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account and preferences.
                </p>
            </div>

            {/* Profile Settings */}
            <Card className="bg-card border-border">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-foreground">
                        Profile Information
                    </h2>
                    {isPro && (
                        <div className="bg-[#1E90FF] text-white text-[10px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1 shadow-lg shadow-[#1E90FF]/20">
                            <Crown className="w-3 h-3" /> User Pro
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-foreground">Full Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground">Email Address</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                disabled
                                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground opacity-70 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-muted-foreground">Email cannot be changed directly.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">Company Name</Label>
                        <Input
                            value={formData.companyName}
                            onChange={(e) =>
                                setFormData({ ...formData, companyName: e.target.value })
                            }
                            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#1E90FF] hover:bg-[#187bcd] text-white gap-2 font-bold rounded-xl shadow-lg shadow-[#1E90FF]/20"
                    >
                        {isSaving ? (
                            'Saving...'
                        ) : saved ? (
                            <>
                                <Check className="w-4 h-4" />
                                Saved Changes
                            </>
                        ) : (
                            'Save Profile'
                        )}
                    </Button>
                </div>
            </Card>

            {/* Security Settings */}
            <Card className="bg-card border-border">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Security & Password</h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="py-3">
                        <p className="text-foreground font-medium mb-2">Password</p>
                        <div className="flex items-center gap-4 mb-4">
                            <Input
                                type="password"
                                value="********"
                                readOnly
                                className="bg-secondary border-border text-foreground max-w-xs cursor-default focus-visible:ring-0"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            For security reasons, your current password is hidden. You can change it below.
                        </p>

                        <Dialog open={isPassOpen} onOpenChange={setIsPassOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-secondary bg-transparent rounded-xl font-bold"
                                >
                                    Change Password
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Change Password</DialogTitle>
                                    <DialogDescription>
                                        Enter your new password below.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-pass">New Password</Label>
                                        <Input
                                            id="new-pass"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-pass">Confirm Password</Label>
                                        <Input
                                            id="confirm-pass"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsPassOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={handleChangePassword} disabled={isChangingPass}>
                                        {isChangingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Separator className="bg-border" />

                    <div className="py-3">
                        <p className="text-foreground font-medium mb-2">
                            Two-Factor Authentication
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            Add an extra layer of security to your account.
                        </p>
                        <Button
                            variant="outline"
                            className="border-border text-foreground hover:bg-secondary bg-transparent rounded-xl font-bold"
                            disabled
                        >
                            Enable 2FA (Coming Soon)
                        </Button>
                    </div>
                </div>
            </Card>

            {/* General Settings */}
            <Card className="bg-card border-border">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">
                        Preferences
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">Timezone</Label>
                            <Select value={formData.timezone} onValueChange={(val) => setFormData({ ...formData, timezone: val })}>
                                <SelectTrigger className="bg-secondary border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-secondary border-border">
                                    <SelectItem value="UTC">UTC</SelectItem>
                                    <SelectItem value="EST">Eastern Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground">Language</Label>
                            <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                                <SelectTrigger className="bg-secondary border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-secondary border-border">
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="id">Indonesian</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">Theme</Label>
                        <Select value={theme} onValueChange={(val) => setTheme(val)}>
                            <SelectTrigger className="bg-secondary border-border text-foreground">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent className="bg-secondary border-border">
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-card border-border border-red-500/20">
                <div className="p-6 border-b border-red-500/20">
                    <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
                </div>

                <div className="p-6">
                    <div className="py-3">
                        <p className="text-foreground font-medium mb-2">Delete Account</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            Permanently delete your account and all associated data.
                        </p>

                        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent rounded-xl font-bold transition-all"
                                >
                                    Delete Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md border-red-500/50">
                                <DialogHeader>
                                    <DialogTitle className="text-red-500 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        Delete Account
                                    </DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-2">
                                    <Label className="text-xs">Type <span className="font-bold">DELETE</span> to confirm</Label>
                                    <Input
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="DELETE"
                                        className="border-red-200 focus-visible:ring-red-500"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsDeleteOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                                    >
                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </Card>
        </div>
    );
}
