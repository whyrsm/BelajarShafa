'use client';

import { Card } from '@/components/ui/card';
import { UserStats } from '@/lib/api/users';
import { Users, UserCheck, UserX, GraduationCap, Briefcase, UserCircle } from 'lucide-react';

interface UserStatsCardsProps {
    stats: UserStats;
    isLoading?: boolean;
}

export function UserStatsCards({ stats, isLoading }: UserStatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="p-6">
                        <div className="h-16 animate-pulse bg-muted rounded" />
                    </Card>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Users',
            value: stats.total,
            icon: Users,
            className: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
        },
        {
            title: 'Active Users',
            value: stats.active,
            icon: UserCheck,
            className: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
        },
        {
            title: 'Inactive Users',
            value: stats.inactive,
            icon: UserX,
            className: 'bg-gray-50 text-gray-600 dark:bg-gray-950 dark:text-gray-400',
        },
        {
            title: 'Mentors',
            value: stats.byRole.mentors,
            icon: GraduationCap,
            className: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
        },
        {
            title: 'Managers',
            value: stats.byRole.managers,
            icon: Briefcase,
            className: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
        },
        {
            title: 'Mentees',
            value: stats.byRole.mentees,
            icon: UserCircle,
            className: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Card key={card.title} className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-bold mt-2">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${card.className}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
