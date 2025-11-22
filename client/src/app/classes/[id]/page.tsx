'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberList } from '@/components/classes/MemberList';
import { SessionList } from '@/components/sessions/SessionList';
import { SessionForm } from '@/components/sessions/SessionForm';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';
import { getClassById, Class, deleteClass, leaveClass, removeMentee } from '@/lib/api/classes';
import { getSessions, Session } from '@/lib/api/sessions';
import { getClassAttendanceHistory } from '@/lib/api/attendance';
import { getProfile, UserProfile } from '@/lib/api/auth';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Code,
    Calendar,
    Users,
    LogOut,
    BookOpen,
    ClipboardList,
} from 'lucide-react';

type TabType = 'overview' | 'sessions' | 'members' | 'attendance';

export default function ClassDetailPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params.id as string;

    const [classData, setClassData] = useState<Class | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [attendanceData, setAttendanceData] = useState<any>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [showSessionForm, setShowSessionForm] = useState(false);
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

            // Load sessions
            try {
                const sessionsData = await getSessions(classId);
                setSessions(sessionsData);
            } catch (err) {
                console.error('Failed to load sessions:', err);
            }

            // Load attendance if on attendance tab
            if (activeTab === 'attendance') {
                try {
                    const attendance = await getClassAttendanceHistory(classId);
                    setAttendanceData(attendance);
                } catch (err) {
                    console.error('Failed to load attendance:', err);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat kelas');
            if (err instanceof Error && err.message.includes('404')) {
                router.push('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'attendance' && classData) {
            const loadAttendance = async () => {
                try {
                    const attendance = await getClassAttendanceHistory(classId);
                    setAttendanceData(attendance);
                } catch (err) {
                    console.error('Failed to load attendance:', err);
                }
            };
            loadAttendance();
        }
    }, [activeTab, classId, classData]);

    const handleDelete = async () => {
        if (
            !confirm('Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan.')
        ) {
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
            loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengeluarkan mentee');
        }
    };

    const handleSessionUpdate = () => {
        loadData();
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
    const canCreateSession = isManager || isMentor;

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

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: BookOpen },
        { id: 'sessions' as TabType, label: 'Sessions', icon: Calendar },
        { id: 'members' as TabType, label: 'Members', icon: Users },
        { id: 'attendance' as TabType, label: 'Attendance', icon: ClipboardList },
    ];

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

                {/* Class Header */}
                <Card className="mb-6 border-2">
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
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                            <Code className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Kode Kelas</p>
                                <p className="font-mono font-bold text-lg text-primary">
                                    {classData.code}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex gap-2 border-b">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-primary text-primary font-medium'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informasi Kelas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-4 rounded-lg border">
                                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Tanggal Mulai
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatDate(classData.startDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 rounded-lg border">
                                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Tanggal Selesai
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatDate(classData.endDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {isMentee && (
                                            <Button
                                                variant="outline"
                                                className="w-full mt-4"
                                                onClick={handleLeave}
                                                disabled={leaving}
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                {leaving ? 'Keluar...' : 'Keluar dari Kelas'}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>

                                <MemberList
                                    title="Mentor"
                                    members={classData.mentors}
                                    emptyMessage="Belum ada mentor yang ditetapkan"
                                />
                            </div>

                            <div className="space-y-6">
                                {canViewMentees && (
                                    <MemberList
                                        title="Mentee"
                                        members={classData.mentees}
                                        emptyMessage="Belum ada mentee yang terdaftar"
                                        showRemoveButton={isMentor || isManager}
                                        onRemove={handleRemoveMentee}
                                    />
                                )}

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Statistik Kelas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Mentor
                                                </span>
                                                <span className="font-semibold">
                                                    {classData.mentors.length}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Mentee
                                                </span>
                                                <span className="font-semibold">
                                                    {classData.mentees.length}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Sesi
                                                </span>
                                                <span className="font-semibold">
                                                    {sessions.length}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Dibuat
                                                </span>
                                                <span className="font-semibold text-xs">
                                                    {new Date(classData.createdAt).toLocaleDateString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="space-y-6">
                            {canCreateSession && (
                                <div>
                                    {showSessionForm ? (
                                        <SessionForm
                                            classId={classId}
                                            onSuccess={() => {
                                                setShowSessionForm(false);
                                                handleSessionUpdate();
                                            }}
                                            onCancel={() => setShowSessionForm(false)}
                                        />
                                    ) : (
                                        <Button onClick={() => setShowSessionForm(true)}>
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Buat Sesi Baru
                                        </Button>
                                    )}
                                </div>
                            )}

                            <SessionList
                                sessions={sessions}
                                userRole={user?.role}
                                userId={user?.userId}
                                onSessionUpdate={handleSessionUpdate}
                            />
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <MemberList
                                title="Mentor"
                                members={classData.mentors}
                                emptyMessage="Belum ada mentor yang ditetapkan"
                            />
                            {canViewMentees && (
                                <MemberList
                                    title="Mentee"
                                    members={classData.mentees}
                                    emptyMessage="Belum ada mentee yang terdaftar"
                                    showRemoveButton={isMentor || isManager}
                                    onRemove={handleRemoveMentee}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div>
                            {attendanceData ? (
                                <AttendanceHistory data={attendanceData} userRole={user?.role} />
                            ) : (
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-muted-foreground">Memuat data kehadiran...</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
