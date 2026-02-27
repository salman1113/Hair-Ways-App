import React, { useState, useEffect } from 'react';

/**
 * LiveTimer — Countdown timer showing remaining time as MM:SS.
 * When time runs out, switches to red "Overdue MM:SS" display.
 *
 * Props:
 *  - startTime      : ISO string (actual_start_time from backend)
 *  - durationMinutes : total estimated duration across all services
 */
const LiveTimer = ({ startTime, durationMinutes = 30 }) => {
    const [remaining, setRemaining] = useState(0); // seconds (negative = overdue)

    useEffect(() => {
        if (!startTime) return;

        const endTime = new Date(startTime).getTime() + durationMinutes * 60 * 1000;

        const tick = () => {
            setRemaining(Math.floor((endTime - Date.now()) / 1000));
        };

        tick(); // immediate first tick
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startTime, durationMinutes]);

    const isOverdue = remaining <= 0;
    const absSeconds = Math.abs(remaining);
    const mm = String(Math.floor(absSeconds / 60)).padStart(2, '0');
    const ss = String(absSeconds % 60).padStart(2, '0');

    return (
        <div className="flex items-center gap-2">
            {isOverdue ? (
                <>
                    <span className="font-mono font-bold text-sm tabular-nums text-red-500">
                        +{mm}:{ss}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-600 animate-pulse">
                        Overdue
                    </span>
                </>
            ) : (
                <span className="font-mono font-bold text-sm tabular-nums text-blue-600">
                    {mm}:{ss}
                </span>
            )}
        </div>
    );
};

export default LiveTimer;
