'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    MenteeAttendanceHistory,
    ClassAttendanceHistory,
    AttendanceStatus,
} from '@/lib/api/attendance';
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
import { Calendar, TrendingUp, User } from 'lucide-react';

interface AttendanceHistoryProps {
    data: MenteeAttendanceHistory | ClassAttendanceHistory;
    userRole?: string;
}

const statusLabels: Record<AttendanceStatus, string> = {
    PRESENT: 'Hadir',
    ABSENT: 'Tidak Hadir',
    PERMIT: 'Izin',
    SICK: 'Sakit',
};

const statusColors: Record<AttendanceStatus, string> = {
    PRESENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    ABSENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    PERMIT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    SICK: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export function AttendanceHistory({ data, userRole }: AttendanceHistoryProps) {
    const isMenteeView = 'menteeId' in data;
    const isClassView = 'mentees' in data;

    if (isMenteeView) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Kehadiran Saya</CardTitle>
                    <CardDescription>
                        Statistik dan riwayat kehadiran Anda di kelas ini
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {data.statistics.present}
                                </div>
                                <div className="text-sm text-muted-foreground">Hadir</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                    {data.statistics.absent}
                                </div>
                                <div className="text-sm text-muted-foreground">Tidak Hadir</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {data.statistics.permit}
                                </div>
                                <div className="text-sm text-muted-foreground">Izin</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {data.statistics.sick}
                                </div>
                                <div className="text-sm text-muted-foreground">Sakit</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold">
                                    {data.statistics.attendanceRate.toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Tingkat Hadir</div>
                            </div>
                        </div>

                        {/* History Table */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Riwayat Sesi</h3>
                            <div className="space-y-2">
                                {data.history.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{item.session.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(new Date(item.session.startTime))}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.attendance ? (
                                                <Badge
                                                    className={
                                                        statusColors[item.attendance.status]
                                                    }
                                                >
                                                    {statusLabels[item.attendance.status]}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Belum Ada Data</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isClassView) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Kehadiran Kelas</CardTitle>
                    <CardDescription>
                        Statistik dan riwayat kehadiran semua mentee di kelas ini
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {data.mentees.map(menteeData => (
                            <div key={menteeData.mentee.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{menteeData.mentee.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {menteeData.mentee.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">
                                            {menteeData.statistics.attendanceRate.toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Tingkat Hadir
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                        <div className="font-semibold text-green-600">
                                            {menteeData.statistics.present}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Hadir</div>
                                    </div>
                                    <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                        <div className="font-semibold text-red-600">
                                            {menteeData.statistics.absent}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Tidak Hadir
                                        </div>
                                    </div>
                                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                        <div className="font-semibold text-yellow-600">
                                            {menteeData.statistics.permit}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Izin</div>
                                    </div>
                                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                        <div className="font-semibold text-blue-600">
                                            {menteeData.statistics.sick}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Sakit</div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {menteeData.history.slice(0, 5).map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between text-sm py-1"
                                        >
                                            <span className="text-muted-foreground">
                                                {item.session.title}
                                            </span>
                                            {item.attendance ? (
                                                <Badge
                                                    className={statusColors[item.attendance.status]}
                                                    variant="outline"
                                                >
                                                    {statusLabels[item.attendance.status]}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">-</Badge>
                                            )}
                                        </div>
                                    ))}
                                    {menteeData.history.length > 5 && (
                                        <p className="text-xs text-muted-foreground text-center pt-2">
                                            +{menteeData.history.length - 5} sesi lainnya
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}

