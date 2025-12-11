'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserRole, UserFilterParams } from '@/lib/api/users';
import { Search, X } from 'lucide-react';

interface UserFiltersProps {
    filters: UserFilterParams;
    onFiltersChange: (filters: UserFilterParams) => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'MENTOR', label: 'Mentor' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'MENTEE', label: 'Mentee' },
];

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearchChange = (value: string) => {
        setSearch(value);
        onFiltersChange({ ...filters, search: value || undefined, page: 1 });
    };

    const handleRoleToggle = (role: UserRole) => {
        const currentRoles = filters.roles || [];
        const newRoles = currentRoles.includes(role)
            ? currentRoles.filter(r => r !== role)
            : [...currentRoles, role];
        onFiltersChange({ ...filters, roles: newRoles.length > 0 ? newRoles : undefined, page: 1 });
    };

    const handleActiveToggle = (isActive: boolean | undefined) => {
        onFiltersChange({ ...filters, isActive, page: 1 });
    };

    const handleReset = () => {
        setSearch('');
        onFiltersChange({ page: 1, limit: 10 });
    };

    const hasActiveFilters = 
        !!filters.search || 
        (filters.roles && filters.roles.length > 0) || 
        filters.isActive !== undefined;

    return (
        <Card className="p-4">
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Role Filters */}
                <div>
                    <Label className="text-sm font-medium mb-2 block">Roles</Label>
                    <div className="flex flex-wrap gap-2">
                        {ROLE_OPTIONS.map((option) => {
                            const isSelected = filters.roles?.includes(option.value);
                            return (
                                <Button
                                    key={option.value}
                                    type="button"
                                    variant={isSelected ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleRoleToggle(option.value)}
                                    className="h-8"
                                >
                                    {option.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Active Status Filter */}
                <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={filters.isActive === true ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleActiveToggle(filters.isActive === true ? undefined : true)}
                            className="h-8"
                        >
                            Active
                        </Button>
                        <Button
                            type="button"
                            variant={filters.isActive === false ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleActiveToggle(filters.isActive === false ? undefined : false)}
                            className="h-8"
                        >
                            Inactive
                        </Button>
                    </div>
                </div>

                {/* Reset Button */}
                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="w-full"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Reset Filters
                    </Button>
                )}
            </div>
        </Card>
    );
}
