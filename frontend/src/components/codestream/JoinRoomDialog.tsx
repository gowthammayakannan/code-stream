import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Link2 } from 'lucide-react';

interface JoinRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJoin: (roomId: string) => void;
}

export default function JoinRoomDialog({ open, onOpenChange, onJoin }: JoinRoomDialogProps) {
    const [roomId, setRoomId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomId.trim()) return;
        onJoin(roomId.trim());
        setRoomId('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#0d1117] border-white/10 text-white shadow-[0_0_50px_rgba(0,217,255,0.1)]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold neon-text-cyan">
                        <Users className="w-6 h-6" />
                        Join Workspace
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground pt-2">
                        Enter a Room ID or invitation code to collaborate with your team.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-6 py-6">
                    <div className="grid gap-3">
                        <Label htmlFor="roomId" className="text-sm font-medium text-white/70">
                            Room ID / Invite Code
                        </Label>
                        <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="roomId"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="e.g. 65b8f1..."
                                className="bg-[#161b22] border-white/10 pl-10 h-12 focus-visible:ring-neon-cyan/50 focus-visible:border-neon-cyan transition-all"
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="hover:bg-white/5 text-white/70"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!roomId.trim()}
                            className="bg-neon-cyan text-background hover:bg-neon-cyan/90 font-bold px-8 shadow-[0_0_20px_rgba(0,217,255,0.2)]"
                        >
                            Join Now
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
