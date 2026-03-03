import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Global WebSocket hook — connects to a role-specific channel.
 *
 * @param {string}   role             - 'admin' | 'employee' | 'customer'
 * @param {number}   userId           - Current user's database ID
 * @param {function} onMessageReceived - Callback fired on every WS message
 */
const useWebSocketNotification = (role, userId, onMessageReceived) => {
    const ws = useRef(null);
    const savedCallback = useRef(onMessageReceived);

    useEffect(() => {
        savedCallback.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        // Don't connect until we have both role and userId
        if (!role || !userId) return;

        let reconnectTimeout;
        let mounted = true;

        const connect = () => {
            if (!mounted) return;

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            let host = window.location.host;

            // Dev: redirect Vite dev server to Django backend
            if (host.includes('5173') || host.includes('localhost:') || host.includes('127.0.0.1:')) {
                host = 'api.hairways.in';
            }

            const wsUrl = `${protocol}//${host}/ws/notifications/${role}/${userId}/`;

            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log(`WS connected: ${role}/${userId}`);
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
                    console.error('WS message parse error:', error);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WS error:', error);
            };

            ws.current.onclose = (event) => {
                if (event.code === 1000 || !mounted) return;
                console.log(`WS lost (${event.code}). Reconnecting in 3s...`);
                reconnectTimeout = setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            mounted = false;
            clearTimeout(reconnectTimeout);
            if (ws.current) ws.current.close(1000);
        };
    }, [role, userId]);

    return ws.current;
};

export default useWebSocketNotification;
