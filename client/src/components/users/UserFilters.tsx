'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserRole, UserFilterParams } from '@/lib/api/users';
import { Search, X, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserFiltersProps {
    filters: UserFilterParams;
    onFiltersChange: (filters: UserFilterParams) => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'MENTOR', label: 'Mentor' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'MENTEE', label: 'Mentee' },
];

const STATUS_OPTIONS: { value: boolean; label: string }[] = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');
    // Track selected statuses for UI (can have multiple)
    const [selectedStatuses, setSelectedStatuses] = useState<boolean[]>(
        filters.isActive !== undefined ? [filters.isActive] : []
    );

    // Sync selectedStatuses when filters.isActive changes externally
    useEffect(() => {
        if (filters.isActive !== undefined) {
            setSelectedStatuses([filters.isActive]);
        } else {
            setSelectedStatuses([]);
        }
    }, [filters.isActive]);

    // Sync search when filters.search changes externally
    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

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

    const handleStatusToggle = (status: boolean) => {
        const newStatuses = selectedStatuses.includes(status)
            ? selectedStatuses.filter(s => s !== status)
            : [...selectedStatuses, status];
        
        setSelectedStatuses(newStatuses);
        
        // Map to API format: if both selected or none selected, show all (undefined)
        // If only one selected, use that value
        if (newStatuses.length === 0 || newStatuses.length === 2) {
            onFiltersChange({ ...filters, isActive: undefined, page: 1 });
        } else {
            onFiltersChange({ ...filters, isActive: newStatuses[0], page: 1 });
        }
    };

    const handleReset = () => {
        setSearch('');
        setSelectedStatuses([]);
        onFiltersChange({ page: 1, limit: 10 });
    };

    const selectedRoles = filters.roles || [];

    const hasActiveFilters = 
        !!filters.search || 
        (filters.roles && filters.roles.length > 0) || 
        selectedStatuses.length > 0;

    const getRolesLabel = () => {
        if (selectedRoles.length === 0) return 'All Roles';
        if (selectedRoles.length === 1) {
            const role = ROLE_OPTIONS.find(r => r.value === selectedRoles[0]);
            return role?.label || selectedRoles[0];
        }
        return `${selectedRoles.length} selected`;
    };

    const getStatusLabel = () => {
        if (selectedStatuses.length === 0) return 'All Status';
        if (selectedStatuses.length === 2) return 'All Status';
        if (selectedStatuses.length === 1) {
            return selectedStatuses[0] ? 'Active' : 'Inactive';
        }
        return 'All Status';
    };

    return (
        <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {/* Search */}
                <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Role Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto justify-between">
                            {getRolesLabel()}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Roles</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {ROLE_OPTIONS.map((option) => (
                            <DropdownMenuCheckboxItem
                                key={option.value}
                                checked={selectedRoles.includes(option.value)}
                                onCheckedChange={() => handleRoleToggle(option.value)}
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Status Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto justify-between">
                            {getStatusLabel()}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {STATUS_OPTIONS.map((option) => (
                            <DropdownMenuCheckboxItem
                                key={String(option.value)}
                                checked={selectedStatuses.includes(option.value)}
                                onCheckedChange={() => handleStatusToggle(option.value)}
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Reset Button */}
                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="w-full sm:w-auto"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                )}
            </div>
        </Card>
    );
}
