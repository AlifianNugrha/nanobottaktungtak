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
import { useState } from 'react';
import { Check } from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'Acme Corporation',
    email: 'admin@acme.com',
    timezone: 'UTC',
    theme: 'dark',
    language: 'en',
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    securityAlerts: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and application preferences.
        </p>
      </div>

      {/* General Settings */}
      <Card className="bg-card border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            General Settings
          </h2>
        </div>

        <div className="p-6 space-y-6">
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

          <div className="space-y-2">
            <Label className="text-foreground">Email Address</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Timezone</Label>
              <Select value={formData.timezone}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="CST">Central Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Language</Label>
              <Select value={formData.language}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Theme</Label>
            <Select value={formData.theme}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border">
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-card border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Notifications
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-foreground font-medium">
                Email Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Receive email updates about important activities
              </p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, emailNotifications: checked })
              }
            />
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-foreground font-medium">
                Push Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Get instant alerts on your device
              </p>
            </div>
            <Switch
              checked={formData.pushNotifications}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, pushNotifications: checked })
              }
            />
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-foreground font-medium">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">
                Get a summary of your analytics every week
              </p>
            </div>
            <Switch
              checked={formData.weeklyReports}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, weeklyReports: checked })
              }
            />
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-foreground font-medium">Security Alerts</p>
              <p className="text-sm text-muted-foreground">
                Notifications for security-related events
              </p>
            </div>
            <Switch
              checked={formData.securityAlerts}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, securityAlerts: checked })
              }
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border">
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="bg-card border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Security</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="py-3">
            <p className="text-foreground font-medium mb-2">Change Password</p>
            <p className="text-sm text-muted-foreground mb-4">
              Update your password to keep your account secure
            </p>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              Change Password
            </Button>
          </div>

          <Separator className="bg-border" />

          <div className="py-3">
            <p className="text-foreground font-medium mb-2">
              Two-Factor Authentication
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Add an extra layer of security to your account
            </p>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              Enable 2FA
            </Button>
          </div>

          <Separator className="bg-border" />

          <div className="py-3">
            <p className="text-foreground font-medium mb-2">Active Sessions</p>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your login sessions across devices
            </p>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              View Sessions
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border-border border-red-500/20">
        <div className="p-6 border-b border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
        </div>

        <div className="p-6">
          <div className="py-3">
            <p className="text-foreground font-medium mb-2">Delete Account</p>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data
            </p>
            <Button
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
