'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopHeader } from './TopHeader';
import { getProfile, UserProfile } from '@/lib/api/auth';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        loadUserData();
    }, [router]);

    const loadUserData = async () => {
        try {
            const userData = await getProfile();
            setUser(userData);
        } catch (err) {
            console.error('Failed to load user data:', err);
            if (err instanceof Error && err.message.includes('401')) {
                localStorage.removeItem('access_token');
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Memuat...</p>
                </div>
            </div>
        );
    }

    // Support both single role (legacy) and roles array
    const userRoles = user?.roles && user.roles.length > 0 ? user.roles : (user?.role ? [user.role] : []);
    const primaryRole = user?.roles?.[0] || user?.role || '';

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <Sidebar userRole={userRoles.length > 0 ? userRoles : primaryRole} />

            {/* Main Content Area */}
            <div className="lg:pl-64">
                {/* Top Header */}
                <TopHeader
                    userName={user?.name}
                    userEmail={user?.email}
                    userRole={userRoles.length > 0 ? userRoles : primaryRole}
                    notificationCount={0}
                />

                {/* Page Content */}
                <main className="pb-20 lg:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav userRole={userRoles.length > 0 ? userRoles : primaryRole} />
        </div>
    );
}
