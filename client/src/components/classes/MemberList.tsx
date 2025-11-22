'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface Member {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

interface MemberListProps {
    title: string;
    members: Member[];
    emptyMessage?: string;
    onRemove?: (memberId: string) => void;
    showRemoveButton?: boolean;
}

export function MemberList({ 
    title, 
    members, 
    emptyMessage = 'No members yet',
    onRemove,
    showRemoveButton = false 
}: MemberListProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {title} ({members.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
                ) : (
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {member.avatarUrl ? (
                                        <img
                                            src={member.avatarUrl}
                                            alt={member.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-semibold text-primary">
                                                {getInitials(member.name)}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-sm">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                {showRemoveButton && onRemove && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemove(member.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

