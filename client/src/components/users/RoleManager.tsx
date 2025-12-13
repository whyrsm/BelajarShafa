'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/lib/api/users';
import { Checkbox } from '@/components/ui/checkbox';

interface RoleManagerProps {
    currentRoles: UserRole[];
    onSave: (roles: UserRole[]) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
    { value: 'MENTOR', label: 'Mentor', description: 'Can mentor mentees in classes' },
    { value: 'MANAGER', label: 'Manager', description: 'Can manage organizations and classes' },
    { value: 'MENTEE', label: 'Mentee', description: 'Can enroll in classes and courses' },
];

export function RoleManager({ currentRoles, onSave, onCancel, isLoading }: RoleManagerProps) {
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(currentRoles);

    const handleRoleToggle = (role: UserRole) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSave = async () => {
        if (selectedRoles.length === 0) {
            alert('At least one role must be selected');
            return;
        }
        await onSave(selectedRoles);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm font-medium mb-3 block">Select Roles</Label>
                <div className="space-y-3">
                    {ROLE_OPTIONS.map((option) => {
                        const isChecked = selectedRoles.includes(option.value);
                        return (
                            <div key={option.value} className="flex items-start space-x-3">
                                <Checkbox
                                    id={`role-${option.value}`}
                                    checked={isChecked}
                                    onCheckedChange={() => handleRoleToggle(option.value)}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <Label
                                        htmlFor={`role-${option.value}`}
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        {option.label}
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading || selectedRoles.length === 0}
                >
                    {isLoading ? 'Saving...' : 'Save Roles'}
                </Button>
            </div>
        </div>
    );
}


