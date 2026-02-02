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
import { File, Folder } from 'lucide-react';

interface CreateFileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (name: string, type: 'file' | 'folder') => void;
}

export default function CreateFileDialog({ open, onOpenChange, onCreate }: CreateFileDialogProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<'file' | 'folder'>('file');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name, type);
        setName('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-panel border-white/10">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-neon-cyan">
                            Create New Item
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            Add a new file or folder to your workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="type" className="text-sm font-medium text-white/70">
                                Type
                            </Label>
                            <Select
                                value={type}
                                onValueChange={(value) => setType(value as 'file' | 'folder')}
                            >
                                <SelectTrigger id="type" className="bg-muted/30 border-white/10 h-11">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="glass-panel border-white/10">
                                    <SelectItem value="file" className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <File className="w-4 h-4 text-neon-cyan" />
                                            <span>File</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="folder" className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <Folder className="w-4 h-4 text-neon-yellow" />
                                            <span>Folder</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium text-white/70">
                                Name
                            </Label>
                            <Input
                                id="name"
                                placeholder={type === 'file' ? "e.g. index.js" : "e.g. components"}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-muted/30 border-white/10 focus-visible:ring-neon-cyan h-11"
                                autoFocus
                                required
                            />
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
                            className="bg-neon-cyan text-black hover:bg-cyan-400 font-bold px-8 shadow-[0_0_15px_rgba(0,217,255,0.3)]"
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
