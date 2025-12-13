'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClass, CreateClassData } from '@/lib/api/classes';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { ArrowLeft, Plus } from 'lucide-react';

const createClassSchema = z.object({
    name: z.string().min(3, 'Nama kelas minimal 3 karakter'),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

type CreateClassFormValues = z.infer<typeof createClassSchema>;

export default function CreateClassPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<CreateClassFormValues>({
        resolver: zodResolver(createClassSchema),
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await getProfile();
            setUser(userData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
        }
    };

    const onSubmit = async (data: CreateClassFormValues) => {
        if (!user) {
            setError('Gagal memuat informasi pengguna');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Automatically set the creator as the mentor
            const classData: CreateClassData = {
                name: data.name,
                description: data.description,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
                mentorIds: [user.userId], // Creator is automatically the mentor
            };

            const newClass = await createClass(classData);
            router.push(`/classes/${newClass.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal membuat kelas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Dasbor
                        </Button>
                    </Link>
                </div>

                {/* Form Card */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Plus className="w-6 h-6 text-primary" />
                            Buat Kelas Baru
                        </CardTitle>
                        <CardDescription>
                            Siapkan kelas mentoring baru
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Class Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Kelas <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="contoh: Pengenalan Pengembangan Web"
                                    {...register('name')}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <textarea
                                    id="description"
                                    placeholder="Jelaskan tentang kelas ini..."
                                    {...register('description')}
                                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Tanggal Mulai</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        {...register('startDate')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">Tanggal Selesai</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        {...register('endDate')}
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                    <p className="text-sm text-destructive font-medium">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <Link href="/dashboard">
                                    <Button type="button" variant="outline" className="flex-1">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                                            Membuat...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Buat Kelas
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

