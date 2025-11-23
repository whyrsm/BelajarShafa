'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreateSessionData, SessionType, Session } from '@/lib/api/sessions';
import { X } from 'lucide-react';

interface SessionFormProps {
    classId: string;
    session?: Session;
    onSuccess?: () => void;
    onCancel?: () => void;
    hideHeader?: boolean;
}

export function SessionForm({ classId, session, onSuccess, onCancel, hideHeader = false }: SessionFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const form = useForm<CreateSessionData & { type: SessionType }>({
        defaultValues: session
            ? {
                  title: session.title || '',
                  description: session.description || '',
                  startTime: session.startTime
                      ? new Date(session.startTime).toISOString().slice(0, 16)
                      : '',
                  endTime: session.endTime
                      ? new Date(session.endTime).toISOString().slice(0, 16)
                      : '',
                  type: session.type || 'ONLINE',
                  location: session.location || '',
                  meetingUrl: session.meetingUrl || '',
                  checkInWindowMinutes: session.checkInWindowMinutes || 15,
              }
            : {
                  title: '',
                  description: '',
                  startTime: '',
                  endTime: '',
                  type: 'ONLINE',
                  location: '',
                  meetingUrl: '',
                  checkInWindowMinutes: 15,
              },
    });

    const sessionType = form.watch('type');

    const onSubmit = async (data: CreateSessionData & { type: SessionType }) => {
        setLoading(true);
        setError('');

        try {
            const { createSession, updateSession } = await import('@/lib/api/sessions');
            if (session) {
                await updateSession(session.id, data);
            } else {
                await createSession(classId, data);
            }
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan sesi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            {!hideHeader && (
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{session ? 'Edit Sesi' : 'Buat Sesi Baru'}</CardTitle>
                            <CardDescription>
                                {session
                                    ? 'Ubah detail sesi mentoring'
                                    : 'Jadwalkan sesi mentoring baru untuk kelas ini'}
                            </CardDescription>
                        </div>
                        {onCancel && (
                            <Button variant="ghost" size="sm" onClick={onCancel}>
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
            )}
            <CardContent className={hideHeader ? 'pt-6' : ''}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="title"
                            rules={{ required: 'Judul wajib diisi' }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Judul Sesi</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Contoh: Sesi 1 - Pengenalan" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Deskripsi singkat tentang sesi ini"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                rules={{ required: 'Waktu mulai wajib diisi' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Waktu Mulai</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endTime"
                                rules={{ required: 'Waktu selesai wajib diisi' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Waktu Selesai</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="type"
                            rules={{ required: 'Tipe sesi wajib dipilih' }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipe Sesi</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih tipe sesi" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ONLINE">Online</SelectItem>
                                            <SelectItem value="OFFLINE">Offline</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {sessionType === 'OFFLINE' && (
                            <FormField
                                control={form.control}
                                name="location"
                                rules={{ required: 'Lokasi wajib diisi untuk sesi offline' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lokasi</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Contoh: Ruang A, Gedung X"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {sessionType === 'ONLINE' && (
                            <FormField
                                control={form.control}
                                name="meetingUrl"
                                rules={{ required: 'URL meeting wajib diisi untuk sesi online' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL Meeting</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="url"
                                                placeholder="https://meet.google.com/..."
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Link Zoom, Google Meet, atau platform meeting lainnya
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="checkInWindowMinutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jendela Check-in (menit sebelum sesi)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            {...field}
                                            value={field.value ?? 15}
                                            onChange={e => {
                                                const val = e.target.value;
                                                field.onChange(val ? parseInt(val, 10) : 15);
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Mentee dapat check-in X menit sebelum sesi dimulai
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2 justify-end">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Batal
                                </Button>
                            )}
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Menyimpan...' : session ? 'Update' : 'Buat Sesi'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

