import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, X, Loader2, Sparkles, Database } from 'lucide-react';
import { chatAdminAI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AdminChatDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Welcome to HairWays Admin Data Insights. Ask me anything about bookings, services, or revenue.", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const toggleDrawer = () => setIsOpen(!isOpen);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), text: inputValue, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const data = await chatAdminAI(userMsg.text);
            const botMsg = { id: Date.now() + 1, text: data.response, isBot: true };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Admin chat error:", error);
            const errorMsg = { id: Date.now() + 1, text: "Error connecting to the database agent. Please check the backend connection.", isBot: true };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Overlay when drawer is open */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleDrawer}
            ></div>

            {/* Floating Toggle Button (Always visible on the right if closed) */}
            {!isOpen && (
                <button
                    onClick={toggleDrawer}
                    className="fixed bottom-6 right-6 z-30 bg-[#3F0D12] text-white p-4 rounded-full shadow-2xl hover:bg-[#D72638] transition-all duration-300 group flex items-center justify-center border-2 border-[#D72638]/30"
                    title="Data Insights AI"
                >
                    <Database size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-2 -right-2 bg-[#D72638] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center shadow-md">
                        AI <Sparkles size={8} className="ml-0.5" />
                    </span>
                </button>
            )}

            {/* Sliding Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-zinc-50 z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col border-l border-zinc-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="bg-[#3F0D12] text-white p-5 flex items-center justify-between shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D72638] rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="flex items-center space-x-3 relative z-10">
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
                            <Database size={22} className="text-[#FBE4E3]" />
                        </div>
                        <div>
                            <h3 className="font-serif font-bold text-lg tracking-wide flex items-center">
                                Data Insights AI <Sparkles size={14} className="text-yellow-400 ml-1.5" />
                            </h3>
                            <p className="text-xs text-white/70 font-medium">Read-Only SQL Agent</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleDrawer}
                        className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors relative z-10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-zinc-50 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-[85%] flex ${msg.isBot ? 'flex-row' : 'flex-row-reverse items-end'}`}>
                                {msg.isBot && (
                                    <div className="w-8 h-8 rounded-full bg-[#3F0D12] flex-shrink-0 flex items-center justify-center text-white mr-3 shadow-sm border border-[#3F0D12]/20">
                                        <Database size={14} />
                                    </div>
                                )}
                                <div
                                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isBot
                                        ? 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm font-mono text-[13px]'
                                        : 'bg-[#D72638] text-white rounded-br-sm'
                                        }`}
                                    style={!msg.isBot ? { whiteSpace: 'pre-wrap' } : {}}
                                >
                                    {msg.isBot ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1 marker:text-[#3F0D12]" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1 marker:text-[#3F0D12]" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold text-[#3F0D12]" {...props} />,
                                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-[#3F0D12] mt-4 mb-2 first:mt-0" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-base font-bold text-[#3F0D12] mt-3 mb-2 first:mt-0" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-[#3F0D12] mt-2 mb-1 first:mt-0" {...props} />,
                                                a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] flex flex-row">
                                <div className="w-8 h-8 rounded-full bg-[#3F0D12] flex-shrink-0 flex items-center justify-center text-white mr-3 shadow-md border border-[#3F0D12]/20">
                                    <Database size={14} />
                                </div>
                                <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-500 rounded-tl-sm flex items-center space-x-1.5 shadow-sm">
                                    <span className="font-mono text-[13px] mr-1">Querying Database</span>
                                    <div className="w-1.5 h-1.5 bg-[#D72638] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-[#D72638] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-[#D72638] rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-zinc-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 relative overflow-hidden focus-within:border-[#D72638] focus-within:ring-1 focus-within:ring-[#D72638] focus-within:bg-white transition-all shadow-inner"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="e.g., Show me total revenue for June..."
                            className="flex-1 bg-transparent text-zinc-800 text-sm outline-none placeholder:text-zinc-400 pr-10 font-medium"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-[#3F0D12] text-white hover:bg-[#D72638] hover:scale-105 active:scale-95 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} className="ml-0.5" />}
                        </button>
                    </form>
                    <div className="text-center mt-3 flex items-center justify-center space-x-1 text-zinc-400">
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Protected Database Connection</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminChatDrawer;
