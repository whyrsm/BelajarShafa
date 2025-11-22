'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Class } from '@/lib/api/classes';
import { Users, Calendar, Code, ArrowRight } from 'lucide-react';

interface ClassCardProps {
    classData: Class;
    showActions?: boolean;
}

export function ClassCard({ classData, showActions = true }: ClassCardProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{classData.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {classData.description || 'No description provided'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Class Code */}
                    <div className="flex items-center gap-2 text-sm">
                        <Code className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono font-semibold text-primary">{classData.code}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{classData.mentors.length} Mentor{classData.mentors.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{classData.mentees.length} Mentee{classData.mentees.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {formatDate(classData.startDate)} - {formatDate(classData.endDate)}
                        </span>
                    </div>

                    {/* Action Button */}
                    {showActions && (
                        <Link href={`/classes/${classData.id}`}>
                            <Button variant="outline" className="w-full mt-4">
                                View Details
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

