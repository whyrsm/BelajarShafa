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
import { getMentors, Mentor } from '@/lib/api/users';
import { getProfile, UserProfile } from '@/lib/api/auth';
import { ArrowLeft, Plus, Check, X } from 'lucide-react';

const createClassSchema = z.object({
    name: z.string().min(3, 'Nama kelas minimal 3 karakter'),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    mentorIds: z.array(z.string()).min(1, 'Harap pilih setidaknya satu mentor'),
});

type CreateClassFormValues = z.infer<typeof createClassSchema>;

export default function CreateClassPage() {
    const router = useRouter();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateClassFormValues>({
        resolver: zodResolver(createClassSchema),
        defaultValues: {
            mentorIds: [],
        },
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [mentorsData, userData] = await Promise.all([
                getMentors(),
                getProfile(),
            ]);
            setMentors(mentorsData);
            setUser(userData);

            // If current user is a mentor, automatically select them
            if (userData.role === 'MENTOR') {
                const currentUserMentor = mentorsData.find(m => m.id === userData.userId);
                if (currentUserMentor) {
                    setSelectedMentorIds([userData.userId]);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
        }
    };

    useEffect(() => {
        setValue('mentorIds', selectedMentorIds);
    }, [selectedMentorIds, setValue]);

    const toggleMentor = (mentorId: string) => {
        // Prevent mentors from deselecting themselves
        if (user?.role === 'MENTOR' && user.userId === mentorId) {
            return;
        }
        
        setSelectedMentorIds((prev) =>
            prev.includes(mentorId)
                ? prev.filter((id) => id !== mentorId)
                : [...prev, mentorId]
        );
    };

    const onSubmit = async (data: CreateClassFormValues) => {
        if (selectedMentorIds.length === 0) {
            setError('Harap pilih setidaknya satu mentor');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const classData: CreateClassData = {
                name: data.name,
                description: data.description,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
                mentorIds: selectedMentorIds,
            };

            const newClass = await createClass(classData);
            router.push(`/classes/${newClass.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal membuat kelas');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
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
                            Siapkan kelas mentoring baru dan tetapkan mentor
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

                            {/* Mentor Selection */}
                            <div className="space-y-2">
                                <Label>
                                    Pilih Mentor <span className="text-destructive">*</span>
                                </Label>
                                {mentors.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Tidak ada mentor tersedia. Harap buat akun mentor terlebih dahulu.
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                                        {mentors.map((mentor) => {
                                            const isSelected = selectedMentorIds.includes(mentor.id);
                                            const isCurrentUser = user?.userId === mentor.id && user?.role === 'MENTOR';
                                            return (
                                                <div
                                                    key={mentor.id}
                                                    onClick={() => {
                                                        // Prevent deselecting if it's the current user (mentor creating class)
                                                        if (isCurrentUser && isSelected) {
                                                            return;
                                                        }
                                                        toggleMentor(mentor.id);
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                                        isCurrentUser && isSelected
                                                            ? 'bg-primary/10 border-primary cursor-default'
                                                            : isSelected
                                                            ? 'bg-primary/10 border-primary cursor-pointer'
                                                            : 'hover:bg-muted cursor-pointer'
                                                    }`}
                                                >
                                                    {mentor.avatarUrl ? (
                                                        <img
                                                            src={mentor.avatarUrl}
                                                            alt={mentor.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-sm font-semibold text-primary">
                                                                {getInitials(mentor.name)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">
                                                            {mentor.name}
                                                            {isCurrentUser && (
                                                                <span className="ml-2 text-xs text-muted-foreground">(Anda)</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{mentor.email}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-primary-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {selectedMentorIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedMentorIds.map((mentorId) => {
                                            const mentor = mentors.find((m) => m.id === mentorId);
                                            const isCurrentUser = user?.userId === mentorId && user?.role === 'MENTOR';
                                            return mentor ? (
                                                <div
                                                    key={mentorId}
                                                    className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm"
                                                >
                                                    <span>{mentor.name}</span>
                                                    {!isCurrentUser && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleMentor(mentorId)}
                                                            className="hover:bg-primary/20 rounded-full p-0.5"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                                {errors.mentorIds && (
                                    <p className="text-sm text-destructive">{errors.mentorIds.message}</p>
                                )}
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

