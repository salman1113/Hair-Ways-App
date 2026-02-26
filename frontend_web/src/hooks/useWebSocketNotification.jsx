import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const useWebSocketNotification = (onMessageReceived) => {
    const ws = useRef(null);

    useEffect(() => {
        // Construct the WebSocket URL dynamically based on the current window location
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Override host for local testing due to Nginx failure on Windows Docker
        const wsUrl = `ws://127.0.0.1:8000/ws/notifications/`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Trigger a toast notification
                toast(data.message, {
                    icon: '🔔',
                    style: {
                        borderRadius: '10px',
                        background: '#3F0D12',
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                });

                // Call the optional callback to trigger refetches (e.g., dashboard data)
                if (onMessageReceived) {
                    onMessageReceived(data);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Cleanup on unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [onMessageReceived]);

    return ws.current;
};

export default useWebSocketNotification;
