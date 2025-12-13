'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, Mail, Lock, User, GraduationCap, Sparkles, Phone, Eye, EyeOff, CheckCircle2, XCircle, Check } from 'lucide-react';
import { register as registerUser } from '@/lib/api/auth';
import { UserRole } from '@/lib/api/users';

const registerSchema = z.object({
    email: z.string().email('Harap masukkan alamat email yang valid'),
    password: z.string()
        .min(8, 'Kata sandi minimal 8 karakter')
        .regex(/[A-Za-z]/, 'Kata sandi harus mengandung huruf')
        .regex(/[0-9]/, 'Kata sandi harus mengandung angka'),
    confirmPassword: z.string(),
    name: z.string().min(1, 'Nama wajib diisi'),
    whatsappNumber: z.string()
        .min(1, 'Nomor WhatsApp wajib diisi')
        .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor WhatsApp tidak valid. Gunakan format: +6281234567890, 6281234567890, atau 081234567890'),
    roles: z.array(z.enum(['MENTEE', 'MENTOR'])).min(1, 'Pilih minimal satu peran'),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak cocok',
    path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type PasswordStrength = 'weak' | 'medium' | 'strong';

function getPasswordStrength(password: string): PasswordStrength {
    if (password.length < 8) return 'weak';
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    
    const score = [hasLetter, hasNumber, hasSpecial, hasUpper, hasLower].filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
}

export default function RegisterPage() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['MENTEE']);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            roles: ['MENTEE'],
        },
    });

    const password = watch('password', '');

    // Update password strength when password changes
    useEffect(() => {
        if (password) {
            setPasswordStrength(getPasswordStrength(password));
        } else {
            setPasswordStrength('weak');
        }
    }, [password]);

    const handleRoleToggle = (role: 'MENTEE' | 'MENTOR') => {
        setSelectedRoles(prev => {
            const newRoles = prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role];
            setValue('roles', newRoles as ('MENTEE' | 'MENTOR')[]);
            return newRoles;
        });
    };

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError('');

        try {
            // Transform data to match backend API
            const registrationData = {
                email: data.email,
                password: data.password,
                name: data.name,
                whatsappNumber: data.whatsappNumber,
                roles: data.roles,
                ...(data.gender && { gender: data.gender }),
            };

            const result = await registerUser(registrationData);
            console.log('Registration success:', result);
            // Redirect to login
            window.location.href = '/login?registered=true';
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registrasi gagal. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrengthColors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500',
    };

    const passwordStrengthLabels = {
        weak: 'Lemah',
        medium: 'Sedang',
        strong: 'Kuat',
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
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        {...register('password')}
                                        className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                                        onChange={(e) => {
                                            register('password').onChange(e);
                                            if (e.target.value) {
                                                setPasswordStrength(getPasswordStrength(e.target.value));
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {password && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${passwordStrengthColors[passwordStrength]}`}
                                                    style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${
                                                passwordStrength === 'weak' ? 'text-red-500' :
                                                passwordStrength === 'medium' ? 'text-yellow-500' :
                                                'text-green-500'
                                            }`}>
                                                {passwordStrengthLabels[passwordStrength]}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                            <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                {password.length >= 8 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                Minimal 8 karakter
                                            </div>
                                            <div className={`flex items-center gap-1 ${/[A-Za-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                {/[A-Za-z]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                Mengandung huruf
                                            </div>
                                            <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                {/[0-9]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                Mengandung angka
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {errors.password && (
                                    <p className="text-sm text-destructive font-medium">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                    Konfirmasi Kata Sandi
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        {...register('confirmPassword')}
                                        className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive font-medium">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* WhatsApp Number Field */}
                            <div className="space-y-2">
                                <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    Nomor WhatsApp
                                </Label>
                                <Input
                                    id="whatsappNumber"
                                    type="tel"
                                    placeholder="+6281234567890 atau 081234567890"
                                    {...register('whatsappNumber')}
                                    className={errors.whatsappNumber ? 'border-destructive' : ''}
                                />
                                {errors.whatsappNumber && (
                                    <p className="text-sm text-destructive font-medium">
                                        {errors.whatsappNumber.message}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Nomor WhatsApp diperlukan untuk notifikasi aplikasi dan pemulihan kata sandi
                                </p>
                            </div>

                            {/* Gender Field */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    Jenis Kelamin (Opsional)
                                </Label>
                                <RadioGroup
                                    value={watch('gender') || ''}
                                    onValueChange={(value) => setValue('gender', value as 'MALE' | 'FEMALE')}
                                    className="flex flex-row gap-6"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="MALE" id="gender-male" />
                                        <Label htmlFor="gender-male" className="text-sm font-normal cursor-pointer">
                                            Laki-laki
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="FEMALE" id="gender-female" />
                                        <Label htmlFor="gender-female" className="text-sm font-normal cursor-pointer">
                                            Perempuan
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                    Saya ingin bergabung sebagai <span className="text-destructive">*</span>
                                </Label>
                                <div className="space-y-3">
                                    <div
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            selectedRoles.includes('MENTEE')
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                                : 'border-border hover:border-blue-300'
                                        }`}
                                        onClick={() => handleRoleToggle('MENTEE')}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                                                selectedRoles.includes('MENTEE')
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-muted-foreground'
                                            }`}>
                                                {selectedRoles.includes('MENTEE') && (
                                                    <Check className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <h4 className="font-semibold text-sm">Mentee</h4>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Saya ingin belajar dan mengikuti kelas
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            selectedRoles.includes('MENTOR')
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                                                : 'border-border hover:border-purple-300'
                                        }`}
                                        onClick={() => handleRoleToggle('MENTOR')}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                                                selectedRoles.includes('MENTOR')
                                                    ? 'border-purple-500 bg-purple-500'
                                                    : 'border-muted-foreground'
                                            }`}>
                                                {selectedRoles.includes('MENTOR') && (
                                                    <Check className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                    <h4 className="font-semibold text-sm">Mentor</h4>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Saya ingin mengajar dan membimbing siswa
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {errors.roles && (
                                    <p className="text-sm text-destructive font-medium">
                                        {errors.roles.message}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Anda dapat memilih satu atau kedua peran
                                </p>
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
                                disabled={isLoading || selectedRoles.length === 0}
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
