'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    BarChart3,
    Settings,
    Building2,
    Sparkles,
    Library
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Jelajahi Modul',
        href: '/dashboard/courses/explore',
        icon: BookOpen,
    },
    {
        label: 'Modul Saya',
        href: '/dashboard/my-courses',
        icon: Library,
    },
    {
        label: 'Kelola Modul',
        href: '/dashboard/courses',
        icon: BookOpen,
        roles: ['MANAGER', 'ADMIN'],
    },
    {
        label: 'Presensi',
        href: '/dashboard/attendance',
        icon: GraduationCap,
    },
    {
        label: 'Organisasi',
        href: '/dashboard/organization',
        icon: Building2,
        roles: ['MANAGER'],
    },
    {
        label: 'Statistik',
        href: '/dashboard/analytics',
        icon: BarChart3,
        roles: ['MANAGER', 'MENTOR'],
    },
    {
        label: 'Pengaturan',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

interface SidebarProps {
    userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true;
        return userRole && item.roles.includes(userRole);
    });

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-lg font-bold">BelajarShafa</h1>
                    <p className="text-xs text-muted-foreground">
                        {userRole === 'MANAGER' && 'Manager'}
                        {userRole === 'MENTOR' && 'Mentor'}
                        {userRole === 'MENTEE' && 'Mentee'}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    // More specific active state checking
                    let isActive = false;
                    if (item.href === '/dashboard/courses') {
                        // Only active for exact match or courses management pages (create, edit, [id] detail), but not explore/learn
                        isActive = pathname === item.href || 
                                  (pathname.startsWith('/dashboard/courses/') && 
                                   !pathname.includes('/explore') &&
                                   !pathname.includes('/learn') &&
                                   !pathname.includes('/my-courses'));
                    } else if (item.href === '/dashboard/courses/explore') {
                        // Active for explore and learn pages
                        isActive = pathname === item.href || 
                                  (pathname.startsWith('/dashboard/courses/') && 
                                   (pathname.includes('/explore') || pathname.includes('/learn')));
                    } else if (item.href === '/dashboard/my-courses') {
                        // Active for my-courses page
                        isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    } else {
                        // Default behavior for other routes
                        isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                "hover:bg-accent hover:text-accent-foreground",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                    © 2025 BelajarShafa
                </p>
            </div>
        </aside>
    );
}
