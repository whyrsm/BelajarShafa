'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassCard } from '@/components/classes/ClassCard';
import { getClasses, Class } from '@/lib/api/classes';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { Plus, LogOut, BookOpen, Users, Sparkles } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        loadData();
    }, [router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [classesData, userData] = await Promise.all([
                getClasses(),
                getProfile(),
            ]);
            setClasses(classesData);
            setUser(userData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
            if (err instanceof Error && err.message.includes('401')) {
                localStorage.removeItem('access_token');
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        router.push('/login');
    };

    const canCreateClass = user?.role === 'MANAGER' || user?.role === 'MENTOR';
    const canJoinClass = user?.role === 'MENTEE';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">BelajarShafa</h1>
                                <p className="text-xs text-muted-foreground">
                                    {user?.role === 'MANAGER' && 'Manager Dashboard'}
                                    {user?.role === 'MENTOR' && 'Mentor Dashboard'}
                                    {user?.role === 'MENTEE' && 'Mentee Dashboard'}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                    {canCreateClass && (
                        <Link href="/classes/create">
                            <Button size="lg">
                                <Plus className="w-5 h-5 mr-2" />
                                Create Class
                            </Button>
                        </Link>
                    )}
                    {canJoinClass && (
                        <Link href="/classes/join">
                            <Button size="lg" variant="outline">
                                <BookOpen className="w-5 h-5 mr-2" />
                                Join Class
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <Card className="mb-6 border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Classes Section */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">
                            {user?.role === 'MENTEE' ? 'My Classes' : 'My Classes'}
                        </h2>
                    </div>

                    {classes.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {canCreateClass
                                            ? 'Create your first class to get started'
                                            : canJoinClass
                                            ? 'Join a class using a class code'
                                            : 'You are not enrolled in any classes'}
                                    </p>
                                    {canCreateClass && (
                                        <Link href="/classes/create">
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Class
                                            </Button>
                                        </Link>
                                    )}
                                    {canJoinClass && (
                                        <Link href="/classes/join">
                                            <Button>
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                Join Class
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((classItem) => (
                                <ClassCard key={classItem.id} classData={classItem} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

