import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { languageConfig } from '@/data/mockData';
import { Language } from '@/types/codestream';

interface CreateRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (name: string, language: Language) => void;
}

export default function CreateRoomDialog({ open, onOpenChange, onCreate }: CreateRoomDialogProps) {
    const [name, setName] = useState('');
    const [language, setLanguage] = useState<Language>('typescript');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name, language);
        setName('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-panel border-white/10 neon-glow-cyan">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                            Create New Workspace
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Set up a secure, real-time collaborative workspace for your team.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium text-white/70">
                                Workspace Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. backend-api, marketing-page"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-muted/30 border-white/10 focus-visible:ring-neon-cyan h-11"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="language" className="text-sm font-medium text-white/70">
                                Coding Environment
                            </Label>
                            <Select
                                value={language}
                                onValueChange={(value) => setLanguage(value as Language)}
                            >
                                <SelectTrigger id="language" className="bg-muted/30 border-white/10 focus:ring-neon-cyan h-11">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent className="glass-panel border-white/10">
                                    {Object.entries(languageConfig).map(([lang, config]) => (
                                        <SelectItem key={lang} value={lang} className="cursor-pointer hover:bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center"
                                                    style={{ backgroundColor: config.color + '20', color: config.color }}
                                                >
                                                    {config.icon}
                                                </span>
                                                <span>{config.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-muted-foreground hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim()}
                            className="bg-neon-cyan text-black hover:bg-cyan-400 font-bold px-8"
                        >
                            Initialize Workspace
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
