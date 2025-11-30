'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { joinClass } from '@/lib/api/classes';
import { ArrowLeft, BookOpen, CheckCircle2, Code } from 'lucide-react';

const joinClassSchema = z.object({
    code: z.string()
        .min(6, 'Kode kelas minimal 6 karakter')
        .max(8, 'Kode kelas maksimal 8 karakter')
        .regex(/^[A-Z0-9]+$/i, 'Kode kelas hanya boleh berisi huruf dan angka'),
});

type JoinClassFormValues = z.infer<typeof joinClassSchema>;

export default function JoinClassPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [joinedClassId, setJoinedClassId] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<JoinClassFormValues>({
        resolver: zodResolver(joinClassSchema),
    });

    const codeValue = watch('code');

    const onSubmit = async (data: JoinClassFormValues) => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const classData = await joinClass({ code: data.code.toUpperCase() });
            setSuccess(true);
            setJoinedClassId(classData.id);
            
            // Redirect after 2 seconds
            setTimeout(() => {
                router.push(`/classes/${classData.id}`);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal bergabung dengan kelas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-md">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Dasbor
                        </Button>
                    </Link>
                </div>

                {/* Join Card */}
                <Card className="border-2">
                    <CardHeader>
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                            <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-center">Gabung Kelas</CardTitle>
                        <CardDescription className="text-center">
                            Masukkan kode kelas yang diberikan oleh mentor Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Berhasil Bergabung!</h3>
                                <p className="text-muted-foreground mb-4">
                                    Anda telah ditambahkan ke kelas. Mengalihkan...
                                </p>
                                <Link href={`/classes/${joinedClassId}`}>
                                    <Button>Ke Kelas</Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Class Code Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-muted-foreground" />
                                        Kode Kelas
                                    </Label>
                                    <Input
                                        id="code"
                                        placeholder="Masukkan kode 6-8 karakter"
                                        {...register('code')}
                                        className={`text-center text-lg font-mono tracking-wider uppercase ${
                                            errors.code ? 'border-destructive' : ''
                                        }`}
                                        maxLength={8}
                                        onChange={(e) => {
                                            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                        }}
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-destructive">{errors.code.message}</p>
                                    )}
                                    {codeValue && !errors.code && (
                                        <p className="text-xs text-muted-foreground">
                                            Kode: {codeValue.toUpperCase()}
                                        </p>
                                    )}
                                </div>

                                {/* Info Box */}
                                <div className="p-4 rounded-lg bg-muted/50 border">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Catatan:</strong> Kode kelas terdiri dari 6-8 karakter dan hanya berisi huruf dan angka.
                                        Tanyakan mentor Anda untuk kode kelas jika Anda tidak memilikinya.
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                        <p className="text-sm text-destructive font-medium">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                                            Bergabung...
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            Gabung Kelas
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

