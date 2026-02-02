import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Search, Plus, MoreHorizontal } from 'lucide-react';
import { FileNode } from '@/types/codestream';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import axios from 'axios';
import CreateFileDialog from './CreateFileDialog';

interface FileItemProps {
  node: FileNode;
  depth: number;
  selectedFile: string | null;
  onSelect: (node: any) => void;
  onToggle: (id: string) => void;
}

function FileItem({ node, depth, selectedFile, onSelect, onToggle }: FileItemProps) {
  const isSelected = selectedFile === node.id;
  const isFolder = node.type === 'folder';

  const getFileIcon = () => {
    if (isFolder) {
      return node.isOpen ? (
        <FolderOpen className="w-4 h-4 text-neon-yellow" />
      ) : (
        <Folder className="w-4 h-4 text-neon-yellow" />
      );
    }

    const ext = node.name.split('.').pop();
    const colors: Record<string, string> = {
      tsx: 'text-neon-cyan',
      ts: 'text-neon-blue',
      js: 'text-neon-yellow',
      css: 'text-neon-magenta',
      json: 'text-neon-orange',
      md: 'text-muted-foreground',
    };

    return <File className={cn('w-4 h-4', colors[ext || ''] || 'text-muted-foreground')} />;
  };

  return (
    <div>
      <button
        onClick={() => (isFolder ? onToggle(node.id) : onSelect(node))}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-all',
          'hover:bg-muted/50 group',
          isSelected && 'bg-neon-cyan/10 text-neon-cyan'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder && (
          <span className="text-muted-foreground">
            {node.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        )}
        {!isFolder && <span className="w-3" />}
        {getFileIcon()}
        <span className="truncate flex-1 text-left">{node.name}</span>
        <MoreHorizontal className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
      </button>

      {isFolder && node.isOpen && node.children && (
        <div className="animate-fade-in">
          {node.children.map((child) => (
            <FileItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileExplorerProps {
  roomId: string | null;
  onSelectFile: (file: any) => void;
}

export default function FileExplorer({ roomId, onSelectFile }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchFiles = async () => {
    if (!roomId) {
      setFiles([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3002/api/rooms/${roomId}/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const mapNodes = (nodes: any[]): FileNode[] => nodes.map(n => ({
          id: n._id,
          name: n.name,
          type: n.type,
          language: n.language,
          isOpen: false,
          children: n.children ? mapNodes(n.children) : undefined
        }));
        setFiles(mapNodes(response.data.data));
      }
    } catch (error) {
      console.error('Fetch Files Error:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [roomId]);

  const handleFileClick = async (node: any) => {
    setSelectedFile(node.id);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3002/api/rooms/${roomId}/files/${node.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        onSelectFile(response.data.data);
      }
    } catch (error: any) {
      console.error('Load File Error:', error.response?.data || error.message);
      toast.error('Failed to load file content');
    }
  };

  const handleCreateConfirm = async (name: string, type: 'file' | 'folder') => {
    if (!roomId) {
      toast.error('Select a room first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3002/api/rooms/${roomId}/files`, {
        name,
        type,
        language: name.split('.').pop() || 'javascript'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`${type === 'file' ? 'File' : 'Folder'} created!`);
        fetchFiles();
      }
    } catch (error: any) {
      console.error('Create Item Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to create item');
    }
  };

  const toggleFolder = (id: string) => {
    const toggle = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: toggle(node.children) };
        }
        return node;
      });
    setFiles(toggle(files));
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col glass-panel border-r border-white/10">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explorer</h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-muted-foreground hover:text-foreground"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/30 border-white/10 focus:border-neon-cyan/50 focus:ring-neon-cyan/20"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {filteredFiles.map((node) => (
          <FileItem
            key={node.id}
            node={node}
            depth={0}
            selectedFile={selectedFile}
            onSelect={handleFileClick}
            onToggle={toggleFolder}
          />
        ))}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{files.filter(f => f.type === 'file').length} files</span>
          <span>{files.filter(f => f.type === 'folder').length} folders</span>
        </div>
      </div>

      <CreateFileDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateConfirm}
      />
    </div>
  );
}
