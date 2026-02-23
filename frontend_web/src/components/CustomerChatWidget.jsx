import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatCustomerAI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CustomerChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm the HairWays AI Stylist. How can I help you today?", isBot: true }
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

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), text: inputValue, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const data = await chatCustomerAI(userMsg.text);
            const botMsg = { id: Date.now() + 1, text: data.response, isBot: true };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.", isBot: true };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-zinc-900 border border-gold/20 rounded-2xl shadow-2xl shadow-black/50 w-80 sm:w-96 flex flex-col overflow-hidden mb-4 transition-all duration-300 transform origin-bottom-right h-[500px] max-h-[80vh]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 border-b border-gold/20 p-4 flex justify-between items-center relative">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/30 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
                        </div>

                        <div className="flex items-center space-x-3 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                                <Bot size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-white tracking-wide text-sm">HairWays AI Stylist</span>
                                <span className="text-xs text-zinc-400 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5 relative z-10"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/50 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`max-w-[85%] flex ${msg.isBot ? 'flex-row' : 'flex-row-reverse items-end'}`}>
                                    {msg.isBot && (
                                        <div className="w-6 h-6 rounded-full bg-gold/20 flex-shrink-0 flex items-center justify-center text-gold mr-2 mt-1">
                                            <Bot size={12} />
                                        </div>
                                    )}
                                    <div
                                        className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.isBot
                                            ? 'bg-zinc-800 border border-white/5 text-zinc-200 rounded-tl-sm shadow-md'
                                            : 'bg-yellow-500 text-zinc-950 font-medium rounded-br-sm shadow-md shadow-yellow-500/20'
                                            }`}
                                        style={!msg.isBot ? { whiteSpace: 'pre-wrap' } : {}}
                                    >
                                        {msg.isBot ? (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1 marker:text-gold" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1 marker:text-gold" {...props} />,
                                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                                                    h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mt-4 mb-2 first:mt-0" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-base font-bold text-white mt-3 mb-2 first:mt-0" {...props} />,
                                                    h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-white mt-2 mb-1 first:mt-0" {...props} />,
                                                    a: ({ node, ...props }) => <a className="text-gold hover:underline" {...props} />,
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
                                    <div className="w-6 h-6 rounded-full bg-gold/20 flex-shrink-0 flex items-center justify-center text-gold mr-2 mt-1">
                                        <Bot size={12} />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-zinc-800 border border-white/5 text-zinc-200 rounded-tl-sm flex items-center space-x-1.5 shadow-md">
                                        <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-white/5 bg-zinc-900">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center bg-zinc-800/80 border border-white/10 rounded-full px-4 py-2 relative overflow-hidden focus-within:border-gold/30 focus-within:ring-1 focus-within:ring-gold/30 transition-all"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about styles, prices, matching..."
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-500 pr-10 py-1"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gold text-black hover:bg-yellow-500 hover:scale-105 active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} className="ml-0.5" />}
                            </button>
                        </form>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-zinc-600 font-medium">✨ Powered by Gemini AI</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <div className="relative">
                {!isOpen && (
                    <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-75"></div>
                )}
                <button
                    onClick={toggleChat}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-50 overflow-hidden relative group ${isOpen ? 'bg-zinc-800 border border-white/10 text-white' : 'bg-yellow-500 text-black shadow-yellow-500/50'}`}
                >
                    {!isOpen && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600 to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    <div className="relative z-10 line-clamp-1">
                        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default CustomerChatWidget;
