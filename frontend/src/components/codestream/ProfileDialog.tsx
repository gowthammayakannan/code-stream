import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Calendar } from 'lucide-react';

interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
    // Robust data retrieval from the centralized 'user' object if available
    const storedUserStr = localStorage.getItem('user');
    let storedUser = { name: '', email: '', avatar: '' };

    try {
        if (storedUserStr) {
            storedUser = JSON.parse(storedUserStr);
        }
    } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
    }

    const name = storedUser.name || localStorage.getItem('userName') || 'Gowtham M';
    const email = storedUser.email || localStorage.getItem('userEmail') || 'user@codestream.io';

    // Force strictly male appearance with facial hair and non-female clothing
    // Using clothingType instead of clothing for DiceBear Avataaars compatibility
    const avatarSeed = name.replace(/\s+/g, '') + '_v4';
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&top=shortHair,shortHairTheCaesar,shortHairShortFlat,shortHairShortRound&facialHair=beardLight,beardMedium,beardMajestic&facialHairProbability=100&clothingType=hoodie,shirtCrewNeck,blazerShirt`;

    const user = {
        name,
        email,
        role: "Developer",
        joined: "February 2026",
        avatar: storedUser.avatar || defaultAvatar
    };

    const userInitials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-[#0d1117] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-neon-cyan flex items-center gap-2">
                        <User className="w-5 h-5" />
                        User Profile
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-6">
                    <Avatar className="w-24 h-24 border-4 border-neon-cyan/20 shadow-2xl">
                        <AvatarImage src={user.avatar} crossOrigin="anonymous" />
                        <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xl">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>

                    <div className="w-full space-y-4 bg-white/5 p-4 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-neon-cyan" />
                            <div className="text-sm">
                                <p className="text-xs text-muted-foreground">Email Address</p>
                                <p>{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-neon-purple" />
                            <div className="text-sm">
                                <p className="text-xs text-muted-foreground">Access Level</p>
                                <p>Standard Member</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-neon-green" />
                            <div className="text-sm">
                                <p className="text-xs text-muted-foreground">Member Since</p>
                                <p>{user.joined}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
