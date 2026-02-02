import React, { useEffect, useState } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Layout, Palette, Search, Settings, User, Users, Plus } from 'lucide-react';
import { Theme } from '@/types/codestream';

interface CommandPaletteProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onThemeChange: (theme: Theme) => void;
    onJoinClick: () => void;
    onCreateClick?: () => void;
    onSettingsClick?: () => void;
    onProfileClick?: () => void;
}

export default function CommandPalette({ open, setOpen, onThemeChange, onJoinClick, onCreateClick, onSettingsClick, onProfileClick }: CommandPaletteProps) {
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev: boolean) => !prev);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [setOpen]);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => { onCreateClick?.(); setOpen(false); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create New Room</span>
                    </CommandItem>
                    <CommandItem onSelect={() => { onJoinClick(); setOpen(false); }}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Join Workspace</span>
                    </CommandItem>
                    <CommandItem onSelect={() => setOpen(false)}>
                        <Search className="mr-2 h-4 w-4" />
                        <span>Search Files</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Themes">
                    <CommandItem onSelect={() => { onThemeChange('cyberpunk'); setOpen(false); }}>
                        <Palette className="mr-2 h-4 w-4" />
                        <span>Cyberpunk Neon</span>
                    </CommandItem>
                    <CommandItem onSelect={() => { onThemeChange('dracula'); setOpen(false); }}>
                        <Palette className="mr-2 h-4 w-4" />
                        <span>Dracula Classic</span>
                    </CommandItem>
                    <CommandItem onSelect={() => { onThemeChange('minimal'); setOpen(false); }}>
                        <Palette className="mr-2 h-4 w-4" />
                        <span>Minimal Dark</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => { onProfileClick?.(); setOpen(false); }}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </CommandItem>
                    <CommandItem onSelect={() => { onSettingsClick?.(); setOpen(false); }}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
