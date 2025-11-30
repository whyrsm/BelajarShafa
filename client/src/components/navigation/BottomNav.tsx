'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    Calendar,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[];
}

// Mobile-optimized navigation items
const mobileNavItems: NavItem[] = [
    {
        label: 'Beranda',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Kelas',
        href: '/dashboard/classes',
        icon: Users,
    },
    {
        label: 'Course',
        href: '/dashboard/courses',
        icon: BookOpen,
    },
    {
        label: 'Sesi',
        href: '/dashboard/sessions',
        icon: Calendar,
        roles: ['MENTOR', 'MANAGER'],
    },
    {
        label: 'Presensi',
        href: '/dashboard/attendance',
        icon: GraduationCap,
        roles: ['MENTEE'],
    },
    {
        label: 'Profil',
        href: '/dashboard/profile',
        icon: User,
    },
];

interface BottomNavProps {
    userRole?: string;
}

export function BottomNav({ userRole }: BottomNavProps) {
    const pathname = usePathname();

    const filteredNavItems = mobileNavItems.filter(item => {
        if (!item.roles) return true;
        return userRole && item.roles.includes(userRole);
    }).slice(0, 5); // Limit to 5 items for mobile

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
            <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
                {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[60px] transition-all",
                                "active:scale-95",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            <Icon className={cn(
                                "w-5 h-5 transition-all",
                                isActive && "scale-110"
                            )} />
                            <span className={cn(
                                "text-xs font-medium",
                                isActive && "font-semibold"
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
