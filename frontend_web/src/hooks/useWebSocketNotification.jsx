import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const useWebSocketNotification = (onMessageReceived) => {
    const ws = useRef(null);
    const savedCallback = useRef(onMessageReceived);

    // Remember the latest callback if it changes.
    useEffect(() => {
        savedCallback.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        let reconnectTimeout;
        let mounted = true;

        const connect = () => {
            if (!mounted) return; // Don't connect if already unmounted

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            let host = window.location.host;

            // If we're hitting the Vite dev server (usually 5173), route to Django backend 8000
            if (host.includes('5173') || host.includes('localhost:') || host.includes('127.0.0.1:')) {
                host = '127.0.0.1:8000';
            }

            const wsUrl = `${protocol}//${host}/ws/notifications/`;

            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('WebSocket connection established');
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    toast(data.message, {
                        icon: '🔔',
                        style: {
                            borderRadius: '10px',
                            background: '#3F0D12',
                            color: '#fff',
                            fontWeight: 'bold',
                        },
                    });

                    if (savedCallback.current) {
                        savedCallback.current(data);
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            ws.current.onclose = (event) => {
                if (event.code === 1000 || !mounted) {
                    console.log(`WebSocket closed cleanly (${event.code}).`);
                    return; // Don't reconnect on intentional close or after unmount
                }
                console.log(`WebSocket connection lost (${event.code}). Reconnecting in 3s...`);
                reconnectTimeout = setTimeout(connect, 3000);
            };
        };

        connect();

        // Cleanup on unmount
        return () => {
            mounted = false;
            clearTimeout(reconnectTimeout);
            if (ws.current) {
                ws.current.close(1000);
            }
        };
    }, []);

    return ws.current;
};

export default useWebSocketNotification;
