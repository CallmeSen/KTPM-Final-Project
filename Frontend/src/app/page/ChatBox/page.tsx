'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

let socket: Socket;

export default function ChatBox() {
    
    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState<{ from: string; text: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {

        socket = io('http://localhost:3002');

        socket.on('connect', () => {
            setLogs((prev) => [
                ...prev,
                { from: 'system', text: `Connected: ${socket.id}` },
            ]);
        });

        socket.on('test', (data) => {
            setLogs((prev) => [...prev, { from: 'server', text: `${data}` }]);
        });

        socket.on('message', (data) => {
            setLogs((prev) => [...prev, { from: 'server', text: data.data }]);
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
        setLogs((prev) => [...prev, { from: 'me', text: message }]);
        setMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#20A090] text-white shadow-md">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push('/page/HomePage')}
                >
                    <ArrowLeft size={24} />
                    <span className="font-semibold text-lg">Back</span>
                </div>
                <h1 className="text-xl font-bold">Chat Application</h1>
                <div className="w-10" /> {/* spacing placeholder */}
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {logs.map((log, i) => (
                    <div
                        key={i}
                        className={`flex ${log.from === 'me' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`px-4 py-2 rounded-2xl max-w-[75%] break-words shadow ${log.from === 'me'
                                ? 'bg-[#20A090] text-white'
                                    : log.from === 'server'
                                        ? 'bg-white text-gray-900 border border-gray-300'
                                        : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            {log.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-white flex items-center gap-2 border-t border-gray-300">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 outline-none border border-gray-300"
                />
                <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-[#20A090] hover:bg-[#1A7D74] text-white rounded-lg font-semibold cursor-pointer transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
