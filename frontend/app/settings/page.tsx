"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Clock, Bell, Download, Upload, Trash2, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSettings, updateSettings, Settings as ApiSettings } from "@/lib/settings-utils"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import { updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";
import { getTimeEntries, deleteTimeEntry } from "@/lib/time-entry-utils";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      {/* Settings content starts here */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={settings.name ?? ""}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email ?? ""}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone ?? "UTC"} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracking
            </CardTitle>
            <CardDescription>Configure your time tracking preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-start timer</Label>
                <p className="text-sm text-muted-foreground">Automatically start timer when opening the app</p>
              </div>
              <Switch
                checked={!!settings.autoStart}
                onCheckedChange={(checked) => setSettings({ ...settings, autoStart: checked })}
              />
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="reminderInterval">Reminder Interval (minutes)</Label>
                <Input
                  id="reminderInterval"
                  type="number"
                  value={settings.reminderInterval ?? ""}
                  onChange={(e) => setSettings({ ...settings, reminderInterval: Number.parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="weeklyGoal">Weekly Goal (hours)</Label>
                <Input
                  id="weeklyGoal"
                  type="number"
                  value={settings.weeklyGoal ?? ""}
                  onChange={(e) => setSettings({ ...settings, weeklyGoal: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about your time tracking</p>
              </div>
              <Switch
                checked={!!settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reminder notifications</Label>
                <p className="text-sm text-muted-foreground">Get reminded to track your time</p>
              </div>
              <Switch
                checked={!!settings.reminderNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, reminderNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly time tracking summaries</p>
              </div>
              <Switch
                checked={!!settings.weeklyReports}
                onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Display
            </CardTitle>
            <CardDescription>Customize how information is displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select
                  value={settings.timeFormat ?? "12h"}
                  onValueChange={(value) => setSettings({ ...settings, timeFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 Hour</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={settings.dateFormat ?? "MM/DD/YYYY"}
                  onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.theme ?? "light"} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Export, import, or clear your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={exportData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>

              <Button variant="outline" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
                <Badge variant="secondary" className="ml-2">
                  Coming Soon
                </Badge>
              </Button>

              <Button onClick={clearAllData} variant="destructive" className="!text-black">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Export: Download all your time tracking data as JSON</p>
              <p>• Import: Upload previously exported data (coming soon)</p>
              <p>• Clear: Permanently delete all your data from this device</p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="!text-black">
            Save Settings
          </Button>
        </div>

        <h2 className="text-lg font-semibold mt-8 mb-2">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter new password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
            disabled={changing}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            disabled={changing || !newPassword}
          >
            {changing ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
