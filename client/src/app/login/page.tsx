'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await fetch('http://localhost:4000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const result = await response.json();
            console.log('Login success:', result);
            alert('Login success! Token: ' + result.access_token);
            // Save token and redirect
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input {...register('email')} className="w-full p-2 border rounded text-black" />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input type="password" {...register('password')} className="w-full p-2 border rounded text-black" />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Login
                </button>
            </form>
        </div>
    );
}
