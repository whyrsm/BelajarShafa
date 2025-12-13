'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface TopHeaderProps {
    userName?: string;
    userEmail?: string;
    userRole?: string | string[]; // Support both single role (legacy) and roles array
    onMenuClick?: () => void;
    notificationCount?: number;
}

export function TopHeader({
    userName,
    userEmail = '',
    userRole = '',
    onMenuClick,
    notificationCount = 0
}: TopHeaderProps) {
    const router = useRouter();
    const [showSearch, setShowSearch] = useState(false);

    // Use userName if provided, otherwise fallback to email or 'User'
    const displayName = userName || userEmail?.split('@')[0] || 'User';

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        router.push('/login');
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'MANAGER':
                return 'default';
            case 'MENTOR':
                return 'secondary';
            case 'MENTEE':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'MANAGER':
                return 'Manager';
            case 'MENTOR':
                return 'Mentor';
            case 'MENTEE':
                return 'Mentee';
            default:
                return role;
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-card border-b">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6">
                {/* Left Section - Mobile Menu */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>

                    {/* Search - Desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari kelas, course, atau mentee..."
                                className="pl-9 pr-4 py-2 w-64 lg:w-80 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Search - Mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setShowSearch(!showSearch)}
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-5 h-5" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2 px-2 lg:px-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium">{displayName}</p>
                                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col gap-1">
                                    <p className="font-medium">{displayName}</p>
                                    <p className="text-xs text-muted-foreground font-normal">{userEmail}</p>
                                    {(() => {
                                        // Support both single role (legacy) and roles array
                                        const roles = Array.isArray(userRole) ? userRole : (userRole ? [userRole] : []);
                                        if (roles.length === 0) return null;
                                        
                                        return (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {roles.map((role) => (
                                                    <Badge 
                                                        key={role} 
                                                        variant={getRoleBadgeVariant(role)} 
                                                        className="w-fit"
                                                    >
                                                        {getRoleLabel(role)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                                <User className="w-4 h-4 mr-2" />
                                <span className="flex-1">Profil Saya</span>
                                <Badge variant="outline" className="text-xs ml-2">Coming Soon</Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                                <User className="w-4 h-4 mr-2" />
                                <span className="flex-1">Pengaturan</span>
                                <Badge variant="outline" className="text-xs ml-2">Coming Soon</Badge>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                <LogOut className="w-4 h-4 mr-2" />
                                Keluar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile Search Expanded */}
            {showSearch && (
                <div className="md:hidden px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari..."
                            className="pl-9 pr-4 py-2 w-full rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
