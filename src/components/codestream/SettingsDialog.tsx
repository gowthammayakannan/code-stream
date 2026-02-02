import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, Monitor, Code, Zap } from 'lucide-react';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    settings: {
        fontSize: number;
        minimap: boolean;
        lineNumbers: boolean;
        wordWrap: boolean;
    };
    onSettingsChange: (settings: any) => void;
}

export default function SettingsDialog({ open, onOpenChange, settings, onSettingsChange }: SettingsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#0d1117] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-neon-cyan">
                        <SettingsIcon className="w-5 h-5" />
                        Editor Settings
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Customize your coding environment. Changes are applied in real-time.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Font Size */}
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-muted-foreground" />
                                Font Size ({settings.fontSize}px)
                            </Label>
                        </div>
                        <Slider
                            value={[settings.fontSize]}
                            min={12}
                            max={24}
                            step={1}
                            onValueChange={([val]) => onSettingsChange({ ...settings, fontSize: val })}
                            className="py-2"
                        />
                    </div>

                    {/* Minimap */}
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 cursor-pointer" htmlFor="minimap">
                            <Code className="w-4 h-4 text-muted-foreground" />
                            Show Minimap
                        </Label>
                        <Switch
                            id="minimap"
                            checked={settings.minimap}
                            onCheckedChange={(val) => onSettingsChange({ ...settings, minimap: val })}
                        />
                    </div>

                    {/* Line Numbers */}
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 cursor-pointer" htmlFor="line-numbers">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            Line Numbers
                        </Label>
                        <Switch
                            id="line-numbers"
                            checked={settings.lineNumbers}
                            onCheckedChange={(val) => onSettingsChange({ ...settings, lineNumbers: val })}
                        />
                    </div>

                    {/* Word Wrap */}
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 cursor-pointer" htmlFor="word-wrap">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            Word Wrap
                        </Label>
                        <Switch
                            id="word-wrap"
                            checked={settings.wordWrap}
                            onCheckedChange={(val) => onSettingsChange({ ...settings, wordWrap: val })}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
