'use client';

import { useState } from 'react';
import { Session } from '@/lib/api/sessions';
import { AttendanceStatus } from '@/lib/api/attendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Video, Edit, Trash2, Users } from 'lucide-react';
import { CheckInButton } from '@/components/attendance/CheckInButton';
import { AttendanceMarker } from '@/components/attendance/AttendanceMarker';
import { SessionForm } from './SessionForm';
// Date formatting helper
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

interface SessionCardProps {
    session: Session;
    userRole?: string;
    userId?: string;
    onUpdate?: () => void;
}

export function SessionCard({ session, userRole, userId, onUpdate }: SessionCardProps) {
    const [showEdit, setShowEdit] = useState(false);
    const [showAttendance, setShowAttendance] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const now = new Date();
    const isUpcoming = startTime > now;
    const isPast = endTime < now;

    const canEdit = userRole === 'MANAGER' || userRole === 'MENTOR';
    const canMarkAttendance = userRole === 'MANAGER' || userRole === 'MENTOR';

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus sesi ini?')) {
            return;
        }

        setDeleting(true);
        try {
            const { deleteSession } = await import('@/lib/api/sessions');
            await deleteSession(session.id);
            onUpdate?.();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Gagal menghapus sesi');
        } finally {
            setDeleting(false);
        }
    };

    const attendanceCount = session.attendances?.filter(a => a.status === 'PRESENT').length || 0;
    const totalMentees = session.attendances?.length || 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription className="mt-1">
                            {session.description || 'Tidak ada deskripsi'}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={isUpcoming ? 'default' : isPast ? 'secondary' : 'outline'}>
                            {isUpcoming ? 'Mendatang' : isPast ? 'Selesai' : 'Berlangsung'}
                        </Badge>
                        <Badge variant="outline">{session.type}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                                {formatDate(startTime)} - {formatTime(endTime)}
                            </span>
                        </div>
                        {session.type === 'ONLINE' ? (
                            <div className="flex items-center gap-2 text-sm">
                                <Video className="w-4 h-4 text-muted-foreground" />
                                <a
                                    href={session.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    {session.meetingUrl}
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{session.location}</span>
                            </div>
                        )}
                    </div>

                    {session.attendances && session.attendances.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>
                                {attendanceCount} dari {totalMentees} hadir
                            </span>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        {userRole === 'MENTEE' && isUpcoming && (
                            <CheckInButton
                                sessionId={session.id}
                                startTime={startTime}
                                checkInWindowMinutes={session.checkInWindowMinutes}
                                checkInCloseMinutes={session.checkInCloseMinutes}
                                onSuccess={onUpdate}
                            />
                        )}

                        {canMarkAttendance && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAttendance(!showAttendance)}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                {showAttendance ? 'Sembunyikan' : 'Tandai Kehadiran'}
                            </Button>
                        )}

                        {canEdit && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowEdit(!showEdit)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {deleting ? 'Menghapus...' : 'Hapus'}
                                </Button>
                            </>
                        )}
                    </div>

                    {showAttendance && canMarkAttendance && (
                        <div className="pt-4 border-t">
                            <AttendanceMarker
                                sessionId={session.id}
                                session={session}
                                onSuccess={() => {
                                    setShowAttendance(false);
                                    onUpdate?.();
                                }}
                            />
                        </div>
                    )}

                    {showEdit && canEdit && (
                        <div className="pt-4 border-t">
                            <SessionForm
                                classId={session.classId}
                                session={session}
                                onSuccess={() => {
                                    setShowEdit(false);
                                    onUpdate?.();
                                }}
                                onCancel={() => setShowEdit(false)}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

