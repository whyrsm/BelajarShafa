'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    role: z.enum(['MENTEE', 'MENTOR']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'MENTEE',
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            const response = await fetch('http://localhost:4000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const result = await response.json();
            console.log('Registration success:', result);
            alert('Registration success!');
            // Redirect or show success message
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">Register</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input {...register('name')} className="w-full p-2 border rounded text-black" />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>
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
                <div>
                    <label className="block text-sm font-medium">Role</label>
                    <select {...register('role')} className="w-full p-2 border rounded text-black">
                        <option value="MENTEE">Mentee</option>
                        <option value="MENTOR">Mentor</option>
                    </select>
                    {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Register
                </button>
            </form>
        </div>
    );
}
