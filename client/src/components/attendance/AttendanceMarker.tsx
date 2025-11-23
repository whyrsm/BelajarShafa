'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Session } from '@/lib/api/sessions';
import { AttendanceStatus } from '@/lib/api/attendance';
import { bulkMarkAttendance, AttendanceRecord } from '@/lib/api/attendance';
import { getClassById, Class } from '@/lib/api/classes';
import { Check } from 'lucide-react';

interface AttendanceMarkerProps {
    sessionId: string;
    session: Session;
    onSuccess?: () => void;
    hideHeader?: boolean;
}

export function AttendanceMarker({ sessionId, session, onSuccess, hideHeader = false }: AttendanceMarkerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [classData, setClassData] = useState<Class | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<
        Record<string, { status: AttendanceStatus; notes?: string }>
    >({});

    useEffect(() => {
        const loadClassData = async () => {
            try {
                const data = await getClassById(session.classId);
                setClassData(data);

                // Initialize attendance records for all mentees
                const initialRecords: Record<string, { status: AttendanceStatus; notes?: string }> =
                    {};
                data.mentees.forEach(mentee => {
                    // Check if mentee already has attendance
                    const existingAttendance = session.attendances?.find(
                        a => a.userId === mentee.id,
                    );
                    initialRecords[mentee.id] = {
                        status: existingAttendance?.status || 'PRESENT',
                        notes: existingAttendance?.notes || '',
                    };
                });
                setAttendanceRecords(initialRecords);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal memuat data kelas');
            }
        };

        loadClassData();
    }, [session.classId, session.attendances]);

    const handleStatusChange = (menteeId: string, status: AttendanceStatus) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [menteeId]: {
                ...prev[menteeId],
                status,
            },
        }));
    };

    const handleNotesChange = (menteeId: string, notes: string) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [menteeId]: {
                ...prev[menteeId],
                notes,
            },
        }));
    };

    const handleSubmit = async () => {
        if (!classData) return;

        setLoading(true);
        setError('');

        try {
            const records: AttendanceRecord[] = classData.mentees.map(mentee => ({
                menteeId: mentee.id,
                status: attendanceRecords[mentee.id]?.status || 'PRESENT',
                notes: attendanceRecords[mentee.id]?.notes,
            }));

            await bulkMarkAttendance(sessionId, { records });
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan kehadiran');
        } finally {
            setLoading(false);
        }
    };

    if (!classData) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground">Memuat data...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            {!hideHeader && (
                <CardHeader>
                    <CardTitle>Tandai Kehadiran</CardTitle>
                    <CardDescription>
                        Tandai status kehadiran untuk semua mentee dalam sesi ini
                    </CardDescription>
                </CardHeader>
            )}
            <CardContent className={hideHeader ? 'pt-6' : ''}>
                {error && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium">Nama</th>
                                <th className="text-left py-3 px-4 font-medium">Status</th>
                                <th className="text-left py-3 px-4 font-medium">Catatan (opsional)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classData.mentees.map(mentee => {
                                const currentStatus = attendanceRecords[mentee.id]?.status || 'PRESENT';
                                const statusConfig = {
                                    PRESENT: {
                                        label: 'Hadir',
                                        bgColor: 'bg-green-100',
                                        textColor: 'text-green-800',
                                        borderColor: 'border-green-300',
                                        dotColor: 'bg-green-500',
                                    },
                                    ABSENT: {
                                        label: 'Tidak Hadir',
                                        bgColor: 'bg-red-100',
                                        textColor: 'text-red-800',
                                        borderColor: 'border-red-300',
                                        dotColor: 'bg-red-500',
                                    },
                                    PERMIT: {
                                        label: 'Izin',
                                        bgColor: 'bg-yellow-100',
                                        textColor: 'text-yellow-800',
                                        borderColor: 'border-yellow-300',
                                        dotColor: 'bg-yellow-500',
                                    },
                                    SICK: {
                                        label: 'Sakit',
                                        bgColor: 'bg-blue-100',
                                        textColor: 'text-blue-800',
                                        borderColor: 'border-blue-300',
                                        dotColor: 'bg-blue-500',
                                    },
                                };
                                const config = statusConfig[currentStatus];

                                return (
                                    <tr key={mentee.id} className="border-b hover:bg-muted/50">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium">{mentee.name}</p>
                                                <p className="text-sm text-muted-foreground">{mentee.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Select
                                                value={currentStatus}
                                                onValueChange={value =>
                                                    handleStatusChange(mentee.id, value as AttendanceStatus)
                                                }
                                            >
                                                <SelectTrigger
                                                    className={`w-full ${config.bgColor} ${config.textColor} ${config.borderColor} border font-medium`}
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PRESENT">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                            Hadir
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="ABSENT">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                            Tidak Hadir
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="PERMIT">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                                            Izin
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="SICK">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                            Sakit
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Input
                                                value={attendanceRecords[mentee.id]?.notes || ''}
                                                onChange={e => handleNotesChange(mentee.id, e.target.value)}
                                                placeholder="Tambahkan catatan jika perlu"
                                                className="w-full"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSubmit} disabled={loading}>
                        <Check className="w-4 h-4 mr-2" />
                        {loading ? 'Menyimpan...' : 'Simpan Kehadiran'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

