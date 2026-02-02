// CodeStream Types

export type Language = 'javascript' | 'typescript' | 'python' | 'rust' | 'go' | 'java' | 'cpp';

export type Theme = 'cyberpunk' | 'dracula' | 'minimal';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  cursorPosition?: { line: number; column: number };
}

export interface Room {
  id: string;
  name: string;
  language: Language;
  participants: Participant[];
  codeBuffer?: string;
  isActive: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastActivity: Date;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: Language;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface TerminalOutput {
  id: string;
  type: 'stdout' | 'stderr' | 'system';
  content: string;
  timestamp: Date;
}

export interface CodeBuffer {
  roomId: string;
  content: string;
  language: Language;
  cursors: { participantId: string; line: number; column: number }[];
}
