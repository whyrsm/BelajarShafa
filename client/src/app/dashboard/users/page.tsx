'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { UserStatsCards } from '@/components/users/UserStatsCards';
import { UserFilters } from '@/components/users/UserFilters';
import { UserTable } from '@/components/users/UserTable';
import { UserForm } from '@/components/users/UserForm';
import {
    getAllUsers,
    getUserStats,
    createUser,
    toggleUserActive,
    UserFilterParams,
    UserStats,
    User,
    CreateUserData,
    UpdateUserData,
} from '@/lib/api/users';
import { Plus } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [filters, setFilters] = useState<UserFilterParams>({ page: 1, limit: 10 });
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersData, statsData] = await Promise.all([
                getAllUsers(filters),
                getUserStats(),
            ]);
            setUsers(usersData.data);
            setPagination(usersData.meta);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (data: CreateUserData | UpdateUserData) => {
        setIsCreating(true);
        try {
            // Type assertion: we know this is CreateUserData since user prop is undefined
            await createUser(data as CreateUserData);
            setIsCreateDialogOpen(false);
            loadData();
        } catch (error) {
            console.error('Failed to create user:', error);
            alert('Failed to create user. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleActive = async (id: string) => {
        try {
            await toggleUserActive(id);
            loadData();
        } catch (error) {
            console.error('Failed to toggle user active status:', error);
            alert('Failed to update user status. Please try again.');
        }
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage users in your organization and classes
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New User</DialogTitle>
                            </DialogHeader>
                            <UserForm
                                onSubmit={handleCreateUser}
                                onCancel={() => setIsCreateDialogOpen(false)}
                                isLoading={isCreating}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {stats && <UserStatsCards stats={stats} isLoading={isLoading} />}

                <UserFilters filters={filters} onFiltersChange={setFilters} />

                <Card className="p-6">
                    <UserTable
                        users={users}
                        onToggleActive={handleToggleActive}
                        isLoading={isLoading}
                    />

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                {pagination.total} users
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
