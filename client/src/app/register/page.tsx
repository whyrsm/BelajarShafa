'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Lock, User, GraduationCap, Sparkles } from 'lucide-react';
import { register as registerUser } from '@/lib/api/auth';

const registerSchema = z.object({
    email: z.string().email('Harap masukkan alamat email yang valid'),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
    name: z.string().min(1, 'Nama wajib diisi'),
    role: z.enum(['MENTEE', 'MENTOR']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'MENTEE' | 'MENTOR'>('MENTEE');

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'MENTEE',
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError('');

        try {
            const result = await registerUser(data);
            console.log('Registration success:', result);
            // Redirect to login
            window.location.href = '/login?registered=true';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registrasi gagal. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
            <div className="w-full max-w-md animate-fade-in">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
                        <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary">
                        BelajarShafa
                    </h1>
                    <p className="text-muted-foreground mt-2">Buat akun Anda dan mulai belajar</p>
                </div>

                {/* Register Card */}
                <Card className="border-2 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-primary" />
                            Buat Akun
                        </CardTitle>
                        <CardDescription>
                            Bergabunglah dengan komunitas pembelajar dan mentor kami
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Nama Anda"
                                    {...register('name')}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive font-medium">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="anda@contoh.com"
                                    {...register('email')}
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive font-medium">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                    Kata Sandi
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                    className={errors.password ? 'border-destructive' : ''}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive font-medium">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                    Saya ingin bergabung sebagai
                                </Label>
                                <Select
                                    value={selectedRole}
                                    onValueChange={(value: 'MENTEE' | 'MENTOR') => {
                                        setSelectedRole(value);
                                        setValue('role', value);
                                    }}
                                >
                                    <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih peran Anda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MENTEE">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <div>
                                                    <div className="font-medium">Mentee</div>
                                                    <div className="text-xs text-muted-foreground">Saya ingin belajar</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="MENTOR">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                <div>
                                                    <div className="font-medium">Mentor</div>
                                                    <div className="text-xs text-muted-foreground">Saya ingin mengajar</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-sm text-destructive font-medium">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>

                            {/* Role Info Card */}
                            <div className="p-4 rounded-lg bg-muted/50 border border-border">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRole === 'MENTEE'
                                        ? 'bg-blue-500/10 text-blue-500'
                                        : 'bg-purple-500/10 text-purple-500'
                                        }`}>
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm mb-1">
                                            {selectedRole === 'MENTEE' ? 'Sebagai Mentee' : 'Sebagai Mentor'}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedRole === 'MENTEE'
                                                ? 'Anda dapat mendaftar ke kelas, melacak kemajuan, dan terhubung dengan mentor berpengalaman.'
                                                : 'Anda dapat membuat kelas, berbagi pengetahuan, dan membimbing siswa dalam perjalanan belajar mereka.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                    <p className="text-sm text-destructive font-medium">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full shadow-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                                        Membuat akun...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Buat Akun
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                            Sudah punya akun?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-primary hover:underline transition-colors"
                            >
                                Masuk di sini
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    Dengan membuat akun, Anda menyetujui{' '}
                    <Link href="/terms" className="underline hover:text-primary transition-colors">
                        Syarat Layanan
                    </Link>
                    {' '}dan{' '}
                    <Link href="/privacy" className="underline hover:text-primary transition-colors">
                        Kebijakan Privasi
                    </Link>
                </p>
            </div>
        </div>
    );
}
