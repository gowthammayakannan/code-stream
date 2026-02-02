import { Room, Participant, FileNode, TerminalOutput, Language } from '@/types/codestream';

export const mockParticipants: Participant[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    color: '#00D9FF',
    isOnline: true,
    cursorPosition: { line: 15, column: 24 },
  },
  {
    id: '2',
    name: 'Sarah Miller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    color: '#FF00D4',
    isOnline: true,
    cursorPosition: { line: 8, column: 12 },
  },
  {
    id: '3',
    name: 'James Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    color: '#A855F7',
    isOnline: false,
  },
  {
    id: '4',
    name: 'Emma Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    color: '#22C55E',
    isOnline: true,
    cursorPosition: { line: 22, column: 5 },
  },
];

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'API Server',
    language: 'typescript',
    participants: mockParticipants.slice(0, 3),
    isActive: true,
    syncStatus: 'synced',
    lastActivity: new Date(),
  },
  {
    id: 'room-2',
    name: 'ML Pipeline',
    language: 'python',
    participants: mockParticipants.slice(1, 4),
    isActive: false,
    syncStatus: 'synced',
    lastActivity: new Date(Date.now() - 300000),
  },
  {
    id: 'room-3',
    name: 'Game Engine',
    language: 'rust',
    participants: [mockParticipants[0], mockParticipants[3]],
    isActive: false,
    syncStatus: 'syncing',
    lastActivity: new Date(Date.now() - 60000),
  },
];

export const mockFileTree: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'components',
        name: 'components',
        type: 'folder',
        isOpen: true,
        children: [
          { id: 'app-tsx', name: 'App.tsx', type: 'file', language: 'typescript' },
          { id: 'header-tsx', name: 'Header.tsx', type: 'file', language: 'typescript' },
          { id: 'sidebar-tsx', name: 'Sidebar.tsx', type: 'file', language: 'typescript' },
        ],
      },
      {
        id: 'utils',
        name: 'utils',
        type: 'folder',
        children: [
          { id: 'helpers-ts', name: 'helpers.ts', type: 'file', language: 'typescript' },
          { id: 'api-ts', name: 'api.ts', type: 'file', language: 'typescript' },
        ],
      },
      { id: 'main-ts', name: 'main.ts', type: 'file', language: 'typescript' },
      { id: 'index-css', name: 'index.css', type: 'file' },
    ],
  },
  {
    id: 'tests',
    name: 'tests',
    type: 'folder',
    children: [
      { id: 'app-test', name: 'App.test.ts', type: 'file', language: 'typescript' },
      { id: 'utils-test', name: 'utils.test.ts', type: 'file', language: 'typescript' },
    ],
  },
  { id: 'package-json', name: 'package.json', type: 'file' },
  { id: 'readme', name: 'README.md', type: 'file' },
  { id: 'tsconfig', name: 'tsconfig.json', type: 'file' },
];

export const mockTerminalOutput: TerminalOutput[] = [
  { id: '1', type: 'system', content: '> codestream@1.0.0 dev', timestamp: new Date(Date.now() - 10000) },
  { id: '2', type: 'system', content: '> vite --host', timestamp: new Date(Date.now() - 9000) },
  { id: '3', type: 'stdout', content: '', timestamp: new Date(Date.now() - 8000) },
  { id: '4', type: 'stdout', content: '  VITE v5.0.0  ready in 342 ms', timestamp: new Date(Date.now() - 7000) },
  { id: '5', type: 'stdout', content: '', timestamp: new Date(Date.now() - 6500) },
  { id: '6', type: 'stdout', content: '  ➜  Local:   http://localhost:5173/', timestamp: new Date(Date.now() - 6000) },
  { id: '7', type: 'stdout', content: '  ➜  Network: http://192.168.1.42:5173/', timestamp: new Date(Date.now() - 5500) },
  { id: '8', type: 'stdout', content: '  ➜  press h + enter to show help', timestamp: new Date(Date.now() - 5000) },
  { id: '9', type: 'stdout', content: '', timestamp: new Date(Date.now() - 4000) },
  { id: '10', type: 'stdout', content: '[HMR] connected', timestamp: new Date(Date.now() - 3000) },
  { id: '11', type: 'stderr', content: 'Warning: React.StrictMode is enabled', timestamp: new Date(Date.now() - 2000) },
  { id: '12', type: 'stdout', content: '✓ Build completed in 1.2s', timestamp: new Date(Date.now() - 1000) },
];

export const mockCodeSamples: Record<Language, string> = {
  typescript: `import { createServer } from 'http';
import { WebSocketServer } from 'ws';

interface Message {
  type: 'sync' | 'cursor' | 'edit';
  payload: unknown;
  userId: string;
  timestamp: number;
}

class CollaborationServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Set<WebSocket>> = new Map();
  
  constructor(port: number) {
    const server = createServer();
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws, req) => {
      const roomId = this.extractRoomId(req.url);
      this.joinRoom(ws, roomId);
      
      ws.on('message', (data) => {
        const message: Message = JSON.parse(data.toString());
        this.broadcast(roomId, message, ws);
      });
      
      ws.on('close', () => {
        this.leaveRoom(ws, roomId);
      });
    });
    
    server.listen(port, () => {
      console.log(\`🚀 Server running on port \${port}\`);
    });
  }
  
  private broadcast(roomId: string, msg: Message, exclude?: WebSocket) {
    const room = this.rooms.get(roomId);
    room?.forEach(client => {
      if (client !== exclude && client.readyState === 1) {
        client.send(JSON.stringify(msg));
      }
    });
  }
}

export default CollaborationServer;`,

  javascript: `const express = require('express');
const { Server } = require('socket.io');

const app = express();
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });
  
  socket.on('code-change', (data) => {
    socket.to(data.roomId).emit('code-update', data);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});`,

  python: `import asyncio
from typing import Dict, Set
from dataclasses import dataclass
from websockets import serve, WebSocketServerProtocol

@dataclass
class Room:
    participants: Set[WebSocketServerProtocol]
    code_buffer: str = ""
    language: str = "python"

class CollaborationServer:
    def __init__(self):
        self.rooms: Dict[str, Room] = {}
    
    async def handle_connection(self, websocket: WebSocketServerProtocol):
        room_id = await self.authenticate(websocket)
        room = self.get_or_create_room(room_id)
        room.participants.add(websocket)
        
        try:
            async for message in websocket:
                await self.broadcast(room, message, exclude=websocket)
        finally:
            room.participants.discard(websocket)
    
    async def broadcast(self, room: Room, message: str, exclude=None):
        for participant in room.participants:
            if participant != exclude:
                await participant.send(message)

async def main():
    server = CollaborationServer()
    async with serve(server.handle_connection, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())`,

  rust: `use tokio::sync::broadcast;
use warp::Filter;

#[derive(Clone, Debug)]
struct Message {
    room_id: String,
    user_id: String,
    content: String,
}

#[tokio::main]
async fn main() {
    let (tx, _rx) = broadcast::channel::<Message>(100);
    
    let tx = warp::any().map(move || tx.clone());
    
    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(tx)
        .map(|ws: warp::ws::Ws, tx| {
            ws.on_upgrade(move |socket| handle_connection(socket, tx))
        });
    
    println!("🦀 Server starting on ws://localhost:3030/ws");
    warp::serve(ws_route).run(([127, 0, 0, 1], 3030)).await;
}

async fn handle_connection(ws: WebSocket, tx: broadcast::Sender<Message>) {
    let (mut ws_tx, mut ws_rx) = ws.split();
    let mut rx = tx.subscribe();
    
    loop {
        tokio::select! {
            msg = ws_rx.next() => {
                // Handle incoming message
            }
            msg = rx.recv() => {
                // Broadcast to client
            }
        }
    }
}`,

  go: `package main

import (
    "log"
    "net/http"
    "sync"

    "github.com/gorilla/websocket"
)

type Room struct {
    clients map[*websocket.Conn]bool
    mutex   sync.RWMutex
}

var (
    rooms    = make(map[string]*Room)
    upgrader = websocket.Upgrader{
        CheckOrigin: func(r *http.Request) bool { return true },
    }
)

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
    roomID := r.URL.Query().Get("room")
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("Upgrade error:", err)
        return
    }
    defer conn.Close()

    room := getOrCreateRoom(roomID)
    room.addClient(conn)
    defer room.removeClient(conn)

    for {
        _, msg, err := conn.ReadMessage()
        if err != nil {
            break
        }
        room.broadcast(msg, conn)
    }
}

func main() {
    http.HandleFunc("/ws", handleWebSocket)
    log.Println("🚀 Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}`,

  java: `import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

public class CollaborationServer {
    private final Map<String, Set<WebSocket>> rooms = new ConcurrentHashMap<>();
    private final ExecutorService executor = Executors.newCachedThreadPool();
    
    public void start(int port) throws IOException {
        ServerSocket server = new ServerSocket(port);
        System.out.println("🚀 Server running on port " + port);
        
        while (true) {
            Socket client = server.accept();
            executor.submit(() -> handleClient(client));
        }
    }
    
    private void handleClient(Socket client) {
        try (var in = new BufferedReader(new InputStreamReader(client.getInputStream()));
             var out = new PrintWriter(client.getOutputStream(), true)) {
            
            String roomId = authenticate(in.readLine());
            WebSocket ws = new WebSocket(client, out);
            rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(ws);
            
            String message;
            while ((message = in.readLine()) != null) {
                broadcast(roomId, message, ws);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`,

  cpp: `#include <iostream>
#include <string>
#include <map>
#include <set>
#include <websocketpp/server.hpp>

using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;

typedef websocketpp::server<websocketpp::config::asio> server;

class CollaborationServer {
public:
    CollaborationServer() {
        m_server.init_asio();
        m_server.set_open_handler(bind(&CollaborationServer::on_open, this, _1));
        m_server.set_close_handler(bind(&CollaborationServer::on_close, this, _1));
        m_server.set_message_handler(bind(&CollaborationServer::on_message, this, _1, _2));
    }
    
    void run(uint16_t port) {
        m_server.listen(port);
        m_server.start_accept();
        std::cout << "🚀 Server running on port " << port << std::endl;
        m_server.run();
    }

private:
    void on_message(connection_hdl hdl, server::message_ptr msg) {
        std::string room_id = get_room_id(hdl);
        broadcast(room_id, msg->get_payload(), hdl);
    }
    
    void broadcast(const std::string& room_id, const std::string& msg, connection_hdl exclude) {
        for (auto& conn : m_rooms[room_id]) {
            if (conn.lock() != exclude.lock()) {
                m_server.send(conn, msg, websocketpp::frame::opcode::text);
            }
        }
    }
    
    server m_server;
    std::map<std::string, std::set<connection_hdl>> m_rooms;
};`,
};

export const languageConfig: Record<Language, { label: string; icon: string; color: string }> = {
  typescript: { label: 'TypeScript', icon: 'TS', color: '#3178C6' },
  javascript: { label: 'JavaScript', icon: 'JS', color: '#F7DF1E' },
  python: { label: 'Python', icon: 'PY', color: '#3776AB' },
  rust: { label: 'Rust', icon: 'RS', color: '#DEA584' },
  go: { label: 'Go', icon: 'GO', color: '#00ADD8' },
  java: { label: 'Java', icon: 'JV', color: '#ED8B00' },
  cpp: { label: 'C++', icon: 'C+', color: '#00599C' },
};
