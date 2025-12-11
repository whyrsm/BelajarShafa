'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, UserRole } from '@/lib/api/users';
import { Edit, Eye, Power, PowerOff } from 'lucide-react';

interface UserTableProps {
    users: User[];
    onToggleActive: (id: string) => Promise<void>;
    isLoading?: boolean;
}

const ROLE_COLORS: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    MANAGER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    MENTOR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    MENTEE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export function UserTable({ users, onToggleActive, isLoading }: UserTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                ))}
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No users found
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {user.name}
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {user.roles.map((role) => (
                                        <Badge
                                            key={role}
                                            variant="outline"
                                            className={ROLE_COLORS[role]}
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={user.isActive ? 'default' : 'secondary'}
                                >
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Link href={`/dashboard/users/${user.id}`}>
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onToggleActive(user.id)}
                                        title={user.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {user.isActive ? (
                                            <PowerOff className="h-4 w-4 text-destructive" />
                                        ) : (
                                            <Power className="h-4 w-4 text-green-600" />
                                        )}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
