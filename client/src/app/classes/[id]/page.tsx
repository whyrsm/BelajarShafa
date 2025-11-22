'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberList } from '@/components/classes/MemberList';
import { getClassById, Class, deleteClass, leaveClass, removeMentee } from '@/lib/api/classes';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { ArrowLeft, Edit, Trash2, Code, Calendar, Users, LogOut, X } from 'lucide-react';

export default function ClassDetailPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params.id as string;

    const [classData, setClassData] = useState<Class | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        loadData();
    }, [classId, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [classDataResult, userData] = await Promise.all([
                getClassById(classId),
                getProfile(),
            ]);
            setClassData(classDataResult);
            setUser(userData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat kelas');
            if (err instanceof Error && err.message.includes('404')) {
                router.push('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan.')) {
            return;
        }

        setDeleting(true);
        try {
            await deleteClass(classId);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menghapus kelas');
        } finally {
            setDeleting(false);
        }
    };

    const handleLeave = async () => {
        if (!confirm('Apakah Anda yakin ingin keluar dari kelas ini?')) {
            return;
        }

        setLeaving(true);
        try {
            await leaveClass(classId);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal keluar dari kelas');
        } finally {
            setLeaving(false);
        }
    };

    const handleRemoveMentee = async (menteeId: string) => {
        if (!confirm('Apakah Anda yakin ingin mengeluarkan mentee ini dari kelas?')) {
            return;
        }

        try {
            await removeMentee(classId, menteeId);
            loadData(); // Reload to update the list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengeluarkan mentee');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Tidak ditetapkan';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isMentor = user && classData?.mentors.some(m => m.id === user.userId);
    const isMentee = user && classData?.mentees.some(m => m.id === user.userId);
    const isManager = user?.role === 'MANAGER';
    const canEdit = isManager || isMentor;
    const canDelete = isManager;
    const canViewMentees = isManager || isMentor;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Memuat detail kelas...</p>
                </div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-destructive">Kelas tidak ditemukan</p>
                        <Link href="/dashboard">
                            <Button variant="outline" className="mt-4">
                                Kembali ke Dasbor
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Dasbor
                        </Button>
                    </Link>
                </div>

                {/* Error Message */}
                {error && (
                    <Card className="mb-6 border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Class Info Card */}
                        <Card className="border-2">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl mb-2">{classData.name}</CardTitle>
                                        <CardDescription>
                                            {classData.description || 'Tidak ada deskripsi'}
                                        </CardDescription>
                                    </div>
                                    {canEdit && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                            {canDelete && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleDelete}
                                                    disabled={deleting}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    {deleting ? 'Menghapus...' : 'Hapus'}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Class Code */}
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                                        <Code className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Kode Kelas</p>
                                            <p className="font-mono font-bold text-lg text-primary">
                                                {classData.code}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-4 rounded-lg border">
                                            <Calendar className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                                                <p className="font-medium">{formatDate(classData.startDate)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 rounded-lg border">
                                            <Calendar className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                                                <p className="font-medium">{formatDate(classData.endDate)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Leave Button for Mentees */}
                                    {isMentee && (
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleLeave}
                                            disabled={leaving}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            {leaving ? 'Keluar...' : 'Keluar dari Kelas'}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mentors List */}
                        <MemberList
                            title="Mentor"
                            members={classData.mentors}
                            emptyMessage="Belum ada mentor yang ditetapkan"
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Mentees List (only for Mentors/Managers) */}
                        {canViewMentees && (
                            <MemberList
                                title="Mentee"
                                members={classData.mentees}
                                emptyMessage="Belum ada mentee yang terdaftar"
                                showRemoveButton={isMentor || isManager}
                                onRemove={handleRemoveMentee}
                            />
                        )}

                        {/* Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Statistik Kelas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Mentor</span>
                                        <span className="font-semibold">{classData.mentors.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Mentee</span>
                                        <span className="font-semibold">{classData.mentees.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Dibuat</span>
                                        <span className="font-semibold text-xs">
                                            {new Date(classData.createdAt).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

