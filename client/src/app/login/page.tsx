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
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Harap masukkan alamat email yang valid'),
    password: z.string().min(1, 'Kata sandi wajib diisi'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Login gagal');
            }

            const result = await response.json();
            console.log('Login success:', result);
            // Save token and redirect
            localStorage.setItem('access_token', result.access_token);
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Login gagal. Harap periksa kredensial Anda dan coba lagi.');
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
                    <p className="text-muted-foreground mt-2">Selamat datang kembali! Silakan masuk untuk melanjutkan</p>
                </div>

                {/* Login Card */}
                <Card className="border-2 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <LogIn className="w-6 h-6 text-primary" />
                            Masuk
                        </CardTitle>
                        <CardDescription>
                            Masukkan kredensial Anda untuk mengakses akun
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                        Masuk...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Masuk
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                            Belum punya akun?{' '}
                            <Link
                                href="/register"
                                className="font-semibold text-primary hover:underline transition-colors"
                            >
                                Buat sekarang
                            </Link>
                        </div>
                        <div className="text-xs text-center text-muted-foreground">
                            <Link href="/forgot-password" className="hover:text-primary transition-colors">
                                Lupa kata sandi?
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    Dengan masuk, Anda menyetujui{' '}
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
