import { useRef, useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Play, RotateCcw, Copy, Download, Maximize2 } from 'lucide-react';
import { Language } from '@/types/codestream';
import { mockCodeSamples } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import { toast } from 'sonner';
import socketService from '@/services/socket';

interface EditorSettings {
  fontSize: number;
  minimap: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
}

interface EditorPanelProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onRun: () => void;
  onCodeChange?: (code: string) => void;
  roomId: string;
  isConnected: boolean;
  settings: EditorSettings;
  initialCode?: string;
  fileName?: string;
  fileId?: string;
}

export default function EditorPanel({
  language,
  onLanguageChange,
  onRun,
  onCodeChange,
  roomId,
  isConnected,
  settings,
  initialCode = '',
  fileName,
  fileId
}: EditorPanelProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const isProgrammaticRef = useRef(false);

  const monacoLanguage = language === 'cpp' ? 'cpp' : language;

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    const startCode = initialCode || mockCodeSamples[language] || '';
    isProgrammaticRef.current = true;
    editor.setValue(startCode);
    setTimeout(() => { isProgrammaticRef.current = false; }, 100);

    console.log('✅ Editor mounted, language:', language);
  };

  useEffect(() => {
    if (!isConnected) return;

    const handleRemoteUpdate = (data: any) => {
      const myUserId = localStorage.getItem('userId');
      if (data.userId === myUserId) return;

      console.log('📥 Remote update from', data.userId);

      if (editorRef.current) {
        const pos = editorRef.current.getPosition();
        const scroll = editorRef.current.getScrollTop();

        isProgrammaticRef.current = true;
        editorRef.current.setValue(data.code);

        if (pos) editorRef.current.setPosition(pos);
        editorRef.current.setScrollTop(scroll);

        // Also update local state when remote update happens
        if (onCodeChange) onCodeChange(data.code);

        setTimeout(() => { isProgrammaticRef.current = false; }, 100);
      }
    };

    const handleLanguageUpdate = (data: any) => {
      console.log('🔄 Language update:', data.language);
      onLanguageChange(data.language);
    };

    socketService.onCodeUpdate(handleRemoteUpdate);
    socketService.onLanguageUpdate(handleLanguageUpdate);

    return () => {
      socketService.socket?.off('code-update', handleRemoteUpdate);
      socketService.socket?.off('language-update', handleLanguageUpdate);
    };
  }, [isConnected, onLanguageChange, onCodeChange]);

  const handleChange = (value: string | undefined) => {
    if (!value || isProgrammaticRef.current) return;

    if (onCodeChange) {
      onCodeChange(value);
    }

    if (isConnected) {
      const userId = localStorage.getItem('userId');
      socketService.sendCodeChange(roomId, value, userId);
    }
  };

  const handleLanguageSelect = (newLang: Language) => {
    const template = mockCodeSamples[newLang] || '';

    if (editorRef.current) {
      isProgrammaticRef.current = true;
      editorRef.current.setValue(template);
      setTimeout(() => { isProgrammaticRef.current = false; }, 100);
    }

    if (isConnected) {
      socketService.sendLanguageChange(roomId, newLang);
    }

    onLanguageChange(newLang);
  };

  const handleCopy = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      navigator.clipboard.writeText(code);
      toast.success('Code copied!');
    }
  };

  const handleDownload = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `code.${language}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    }
  };

  const handleReset = () => {
    const template = mockCodeSamples[language] || '';
    if (editorRef.current) {
      isProgrammaticRef.current = true;
      editorRef.current.setValue(template);
      setTimeout(() => { isProgrammaticRef.current = false; }, 100);
    }
    toast.success('Reset!');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <LanguageSwitcher
            currentLanguage={language}
            onLanguageChange={handleLanguageSelect}
          />
          {fileName && (
            <span className="text-sm text-gray-400 ml-2">{fileName}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRun}
            className="text-neon-green hover:text-neon-green hover:bg-neon-green/10 gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline font-semibold">Run</span>
          </Button>
          <div className="h-4 w-px bg-[#30363d] mx-1" />
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-400 hover:text-white">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-white">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="text-gray-400 hover:text-white">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={monacoLanguage}
          defaultValue={initialCode || mockCodeSamples[language]}
          theme="vs-dark"
          onChange={handleChange}
          onMount={(editor, monaco) => {
            handleEditorMount(editor, monaco);

            // Track cursor movement
            editor.onDidChangeCursorPosition((e: any) => {
              if (isConnected && roomId) {
                const userId = localStorage.getItem('userId');
                socketService.socket?.emit('cursor-move', {
                  roomId,
                  userId,
                  line: e.position.lineNumber,
                  column: e.position.column
                });
              }
            });
          }}
          options={{
            fontSize: settings.fontSize,
            minimap: { enabled: settings.minimap },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
