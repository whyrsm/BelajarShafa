'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Building2,
    Sparkles,
    Library,
    Users
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
        roles: ['MENTEE', 'MENTOR', 'MANAGER', 'ADMIN'],
    },
    {
        label: 'Explore Modul',
        href: '/dashboard/courses/explore',
        icon: BookOpen,
        roles: ['MENTEE', 'MENTOR', 'MANAGER', 'ADMIN'],
    },
    {
        label: 'Modul Saya',
        href: '/dashboard/my-courses',
        icon: Library,
        roles: ['MENTEE', 'MENTOR', 'MANAGER', 'ADMIN'],
    },
    {
        label: 'Modul',
        href: '/dashboard/courses',
        icon: BookOpen,
        roles: ['MANAGER', 'ADMIN'],
    },
    {
        label: 'Organisasi',
        href: '/dashboard/organization',
        icon: Building2,
        roles: ['MANAGER', 'ADMIN'],
    },
    {
        label: 'Pengguna',
        href: '/dashboard/users',
        icon: Users,
        roles: ['MANAGER', 'ADMIN'],
    },
];

interface SidebarProps {
    userRole?: string | string[];
}

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true;
        // Support both single role (legacy) and roles array
        if (Array.isArray(userRole)) {
            return item.roles.some(role => userRole.includes(role));
        }
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
                        {(() => {
                            const roles = Array.isArray(userRole) ? userRole : (userRole ? [userRole] : []);
                            if (roles.includes('ADMIN')) return 'Admin';
                            if (roles.includes('MANAGER')) return 'Manager';
                            if (roles.includes('MENTOR')) return 'Mentor';
                            if (roles.includes('MENTEE')) return 'Mentee';
                            return '';
                        })()}
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
