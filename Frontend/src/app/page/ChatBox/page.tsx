'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function ChatBox() {

    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState<{ from: string; text: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socket = io('http://localhost:3002');

        socket.on('connect', () => {
            setLogs(prev => [...prev, { from: 'system', text: `✅ Connected: ${socket.id}` }]);
        });

        socket.on('test', (data) => {
            setLogs(prev => [...prev, { from: 'server', text: `📢 Broadcast: ${data}` }]);
        });

        socket.on('message', (data) => {
            setLogs(prev => [...prev, { from: 'server', text: data.data }]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit('message', message);
        setLogs(prev => [...prev, { from: 'me', text: message }]);
        setMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div className="flex flex-col h-screen bg-[#FFFFFF] text-gray-900">
            {/* Header */}
            <div className="p-4 bg-blue-300 text-lg font-semibold border-b border-blue-400 shadow">
                Chat Application
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {logs.map((log, i) => (
                    <div
                        key={i}
                        className={`flex ${log.from === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`px-4 py-2 rounded-2xl max-w-[70%] break-words shadow 
                                ${log.from === 'me'
                                ? 'bg-gray-300 text-black rounded-br-none'
                                    : log.from === 'server'
                                    ? 'bg-[#20A090] text-white rounded-bl-none'
                                    : 'bg-[#20A090] text-white rounded-bl-none'
                                }`}
                        >
                            {log.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-[#F3F6F6] flex items-center gap-2 border-t border-blue-300">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-lg bg-white text-gray-800 outline-none border border-blue-300"
                />
                <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-semibold"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
