'use client';

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
        .min(6, 'Class code must be at least 6 characters')
        .max(8, 'Class code must be at most 8 characters')
        .regex(/^[A-Z0-9]+$/i, 'Class code must contain only letters and numbers'),
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
            setError(err instanceof Error ? err.message : 'Failed to join class');
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
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Join Card */}
                <Card className="border-2">
                    <CardHeader>
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                            <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-center">Join a Class</CardTitle>
                        <CardDescription className="text-center">
                            Enter the class code provided by your mentor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Successfully Joined!</h3>
                                <p className="text-muted-foreground mb-4">
                                    You have been added to the class. Redirecting...
                                </p>
                                <Link href={`/classes/${joinedClassId}`}>
                                    <Button>Go to Class</Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Class Code Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-muted-foreground" />
                                        Class Code
                                    </Label>
                                    <Input
                                        id="code"
                                        placeholder="Enter 6-8 character code"
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
                                            Code: {codeValue.toUpperCase()}
                                        </p>
                                    )}
                                </div>

                                {/* Info Box */}
                                <div className="p-4 rounded-lg bg-muted/50 border">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Note:</strong> Class codes are 6-8 characters long and contain only letters and numbers.
                                        Ask your mentor for the class code if you don't have it.
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
                                            Joining...
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            Join Class
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

