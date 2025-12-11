'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { RoleManager } from '@/components/users/RoleManager';
import { UserForm } from '@/components/users/UserForm';
import {
    getUserDetails,
    updateUser,
    updateUserRoles,
    toggleUserActive,
    UserDetails,
    UserRole,
    UpdateUserData,
} from '@/lib/api/users';
import { ArrowLeft, Edit, Power, PowerOff, GraduationCap, Briefcase, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';

const ROLE_COLORS: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    MANAGER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    MENTOR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    MENTEE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadUser();
    }, [userId]);

    const loadUser = async () => {
        setIsLoading(true);
        try {
            const userData = await getUserDetails(userId);
            setUser(userData);
        } catch (error) {
            console.error('Failed to load user:', error);
            alert('Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUser = async (data: UpdateUserData) => {
        setIsUpdating(true);
        try {
            await updateUser(userId, data);
            setIsEditDialogOpen(false);
            loadUser();
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateRoles = async (roles: UserRole[]) => {
        setIsUpdating(true);
        try {
            await updateUserRoles(userId, roles);
            setIsRoleDialogOpen(false);
            loadUser();
        } catch (error) {
            console.error('Failed to update roles:', error);
            alert('Failed to update roles. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleActive = async () => {
        try {
            await toggleUserActive(userId);
            loadUser();
        } catch (error) {
            console.error('Failed to toggle active status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 p-6">
                    <div className="h-8 w-64 animate-pulse bg-muted rounded" />
                    <div className="h-96 animate-pulse bg-muted rounded" />
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="text-center py-12 p-6">
                    <p className="text-muted-foreground">User not found</p>
                    <Link href="/dashboard/users">
                        <Button variant="outline" className="mt-4">
                            Back to Users
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                <Link href="/dashboard/users">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground mt-1">{user.email}</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            <UserForm
                                user={user}
                                onSubmit={handleUpdateUser}
                                onCancel={() => setIsEditDialogOpen(false)}
                                isLoading={isUpdating}
                            />
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant={user.isActive ? 'destructive' : 'default'}
                        onClick={handleToggleActive}
                    >
                        {user.isActive ? (
                            <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <Power className="h-4 w-4 mr-2" />
                                Activate
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        {user.gender && (
                            <div>
                                <p className="text-sm text-muted-foreground">Gender</p>
                                <p className="font-medium">{user.gender}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Verified</p>
                            <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                                {user.isVerified ? 'Verified' : 'Not Verified'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Member Since</p>
                            <p className="font-medium">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Roles */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Roles</h2>
                        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Manage Roles</DialogTitle>
                                </DialogHeader>
                                <RoleManager
                                    currentRoles={user.roles}
                                    onSave={handleUpdateRoles}
                                    onCancel={() => setIsRoleDialogOpen(false)}
                                    isLoading={isUpdating}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                </Card>

                {/* Classes */}
                {(user.joinedClasses && user.joinedClasses.length > 0) ||
                (user.mentoredClasses && user.mentoredClasses.length > 0) ? (
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Classes
                        </h2>
                        <div className="space-y-3">
                            {user.mentoredClasses && user.mentoredClasses.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Mentoring
                                    </p>
                                    {user.mentoredClasses.map((cls) => (
                                        <div
                                            key={cls.id}
                                            className="p-3 bg-muted rounded-lg mb-2"
                                        >
                                            <p className="font-medium">{cls.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Code: {cls.code}
                                            </p>
                                            {cls.organization && (
                                                <p className="text-sm text-muted-foreground">
                                                    {cls.organization.name}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {user.joinedClasses && user.joinedClasses.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Enrolled
                                    </p>
                                    {user.joinedClasses.map((cls) => (
                                        <div
                                            key={cls.id}
                                            className="p-3 bg-muted rounded-lg mb-2"
                                        >
                                            <p className="font-medium">{cls.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Code: {cls.code}
                                            </p>
                                            {cls.organization && (
                                                <p className="text-sm text-muted-foreground">
                                                    {cls.organization.name}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                ) : null}

                {/* Organizations */}
                {(user.managedOrgs && user.managedOrgs.length > 0) ||
                (user.memberOrgs && user.memberOrgs.length > 0) ? (
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Organizations
                        </h2>
                        <div className="space-y-3">
                            {user.managedOrgs && user.managedOrgs.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Managing
                                    </p>
                                    {user.managedOrgs.map((org) => (
                                        <div
                                            key={org.id}
                                            className="p-3 bg-muted rounded-lg mb-2"
                                        >
                                            <p className="font-medium">{org.name}</p>
                                            {org.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {org.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {user.memberOrgs && user.memberOrgs.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Member Of
                                    </p>
                                    {user.memberOrgs.map((org) => (
                                        <div
                                            key={org.id}
                                            className="p-3 bg-muted rounded-lg mb-2"
                                        >
                                            <p className="font-medium">{org.name}</p>
                                            {org.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {org.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                ) : null}

                {/* Enrollments */}
                {user.enrollments && user.enrollments.length > 0 && (
                    <Card className="p-6 md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Course Enrollments
                        </h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            {user.enrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="p-3 bg-muted rounded-lg"
                                >
                                    <p className="font-medium">{enrollment.course.title}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Progress: {Math.round(enrollment.progressPercent)}%
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
            </div>
        </DashboardLayout>
    );
}
