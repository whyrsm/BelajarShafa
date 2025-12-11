'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole, CreateUserData, UpdateUserData, User } from '@/lib/api/users';

interface UserFormProps {
    user?: User;
    onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>(user?.gender || '');
    const [roles, setRoles] = useState<UserRole[]>(user?.roles || []);

    const isEdit = !!user;

    const handleRoleToggle = (role: UserRole) => {
        setRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (roles.length === 0) {
            alert('At least one role must be selected');
            return;
        }

        if (!isEdit && !password) {
            alert('Password is required for new users');
            return;
        }

        const data: any = {
            name,
            email,
            roles,
            ...(gender && { gender }),
            ...(!isEdit && { password }),
        };

        await onSubmit(data);
    };

    const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
        { value: 'MENTOR', label: 'Mentor' },
        { value: 'MANAGER', label: 'Manager' },
        { value: 'MENTEE', label: 'Mentee' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>

            <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>

            {!isEdit && (
                <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Minimum 8 characters
                    </p>
                </div>
            )}

            <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={(value) => setGender(value as any)}>
                    <SelectTrigger id="gender" disabled={isLoading}>
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label className="mb-3 block">Roles *</Label>
                <div className="space-y-2">
                    {ROLE_OPTIONS.map((option) => {
                        const isChecked = roles.includes(option.value);
                        return (
                            <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`form-role-${option.value}`}
                                    checked={isChecked}
                                    onCheckedChange={() => handleRoleToggle(option.value)}
                                    disabled={isLoading}
                                />
                                <Label
                                    htmlFor={`form-role-${option.value}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {option.label}
                                </Label>
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
                    type="submit"
                    disabled={isLoading || roles.length === 0}
                >
                    {isLoading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </form>
    );
}
