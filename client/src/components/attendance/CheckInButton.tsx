'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { checkIn } from '@/lib/api/attendance';
import { CheckCircle, Clock } from 'lucide-react';

interface CheckInButtonProps {
    sessionId: string;
    startTime: Date;
    checkInWindowMinutes: number;
    checkInCloseMinutes: number;
    onSuccess?: () => void;
}

export function CheckInButton({
    sessionId,
    startTime,
    checkInWindowMinutes,
    checkInCloseMinutes,
    onSuccess,
}: CheckInButtonProps) {
    const [loading, setLoading] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [canCheckIn, setCanCheckIn] = useState(false);

    useEffect(() => {
        const updateCheckInStatus = () => {
            const now = new Date();
            const checkInWindowStart = new Date(
                startTime.getTime() - checkInWindowMinutes * 60 * 1000,
            );
            const checkInWindowEnd = new Date(
                startTime.getTime() + checkInCloseMinutes * 60 * 1000,
            );

            if (now < checkInWindowStart) {
                const minutesUntilWindow = Math.ceil(
                    (checkInWindowStart.getTime() - now.getTime()) / (60 * 1000),
                );
                setTimeRemaining(`Check-in dibuka dalam ${minutesUntilWindow} menit`);
                setCanCheckIn(false);
            } else if (now > checkInWindowEnd) {
                setTimeRemaining('Jendela check-in telah ditutup');
                setCanCheckIn(false);
            } else {
                setTimeRemaining('Check-in tersedia');
                setCanCheckIn(true);
            }
        };

        updateCheckInStatus();
        const interval = setInterval(updateCheckInStatus, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [startTime, checkInWindowMinutes, checkInCloseMinutes]);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await checkIn(sessionId);
            setCheckedIn(true);
            onSuccess?.();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Gagal melakukan check-in');
        } finally {
            setLoading(false);
        }
    };

    if (checkedIn) {
        return (
            <Button disabled variant="outline" className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Sudah Check-in
            </Button>
        );
    }

    if (!canCheckIn) {
        return (
            <Button disabled variant="outline" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                {timeRemaining}
            </Button>
        );
    }

    return (
        <Button onClick={handleCheckIn} disabled={loading} className="w-full">
            {loading ? 'Memproses...' : 'Check-in'}
        </Button>
    );
}

