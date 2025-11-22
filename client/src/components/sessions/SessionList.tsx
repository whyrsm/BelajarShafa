'use client';

import { Session } from '@/lib/api/sessions';
import { SessionCard } from './SessionCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface SessionListProps {
    sessions: Session[];
    userRole?: string;
    userId?: string;
    onSessionUpdate?: () => void;
}

export function SessionList({ sessions, userRole, userId, onSessionUpdate }: SessionListProps) {
    const now = new Date();
    const upcomingSessions = sessions.filter(
        s => new Date(s.startTime) > now,
    );
    const pastSessions = sessions.filter(s => new Date(s.startTime) <= now);

    if (sessions.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada sesi yang dijadwalkan</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {upcomingSessions.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Sesi Mendatang</h3>
                    <div className="space-y-3">
                        {upcomingSessions.map(session => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                userRole={userRole}
                                userId={userId}
                                onUpdate={onSessionUpdate}
                            />
                        ))}
                    </div>
                </div>
            )}

            {pastSessions.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Sesi Sebelumnya</h3>
                    <div className="space-y-3">
                        {pastSessions.map(session => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                userRole={userRole}
                                userId={userId}
                                onUpdate={onSessionUpdate}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

