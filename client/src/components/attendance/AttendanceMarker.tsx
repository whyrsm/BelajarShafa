'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Label } from '@/components/ui/label';
import { Session } from '@/lib/api/sessions';
import { AttendanceStatus } from '@/lib/api/attendance';
import { bulkMarkAttendance, AttendanceRecord } from '@/lib/api/attendance';
import { getClassById, Class } from '@/lib/api/classes';
import { Check } from 'lucide-react';

interface AttendanceMarkerProps {
    sessionId: string;
    session: Session;
    onSuccess?: () => void;
}

export function AttendanceMarker({ sessionId, session, onSuccess }: AttendanceMarkerProps) {
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
            <CardHeader>
                <CardTitle>Tandai Kehadiran</CardTitle>
                <CardDescription>
                    Tandai status kehadiran untuk semua mentee dalam sesi ini
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {classData.mentees.map(mentee => (
                        <div key={mentee.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{mentee.name}</p>
                                    <p className="text-sm text-muted-foreground">{mentee.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={attendanceRecords[mentee.id]?.status || 'PRESENT'}
                                    onValueChange={value =>
                                        handleStatusChange(mentee.id, value as AttendanceStatus)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRESENT">Hadir</SelectItem>
                                        <SelectItem value="ABSENT">Tidak Hadir</SelectItem>
                                        <SelectItem value="PERMIT">Izin</SelectItem>
                                        <SelectItem value="SICK">Sakit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Catatan (opsional)</Label>
                                <Input
                                    value={attendanceRecords[mentee.id]?.notes || ''}
                                    onChange={e => handleNotesChange(mentee.id, e.target.value)}
                                    placeholder="Tambahkan catatan jika perlu"
                                />
                            </div>
                        </div>
                    ))}
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

