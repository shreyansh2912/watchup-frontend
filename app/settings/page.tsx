"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { User, Bell, Shield, CreditCard, Monitor } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <div className="container mx-auto p-8 max-w-5xl">
                <h1 className="text-3xl font-bold mb-8">Settings</h1>
                
                <Tabs defaultValue="account" className="flex flex-col md:flex-row gap-8">
                    <TabsList className="flex-col h-auto w-full md:w-64 items-start justify-start gap-2 bg-transparent p-0">
                        <TabsTrigger value="account" className="w-full justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-none border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800">
                            <User className="w-4 h-4 mr-3" /> Account
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="w-full justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-none border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800">
                            <Bell className="w-4 h-4 mr-3" /> Notifications
                        </TabsTrigger>
                        <TabsTrigger value="playback" className="w-full justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-none border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800">
                            <Monitor className="w-4 h-4 mr-3" /> Playback
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="w-full justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-none border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800">
                            <Shield className="w-4 h-4 mr-3" /> Privacy
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="w-full justify-start px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-none border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800">
                            <CreditCard className="w-4 h-4 mr-3" /> Billing
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1">
                        <TabsContent value="account" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Information</CardTitle>
                                    <CardDescription>Manage your account details and preferences.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded border">
                                            {user?.email || 'user@example.com'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Channel Name</Label>
                                        <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded border">
                                            {(user as any)?.name || 'Stremers User'}
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            Delete Account
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notifications" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>Choose how you want to be notified.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive emails about your account activity.</p>
                                        </div>
                                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Push Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive push notifications on your device.</p>
                                        </div>
                                        <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="playback" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Playback Settings</CardTitle>
                                    <CardDescription>Control your video playback experience.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Playback settings coming soon.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="privacy" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Privacy</CardTitle>
                                    <CardDescription>Manage your privacy settings.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Privacy settings coming soon.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="billing" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Billing & Payments</CardTitle>
                                    <CardDescription>Manage your billing information and history.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Billing settings coming soon.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
