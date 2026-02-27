/**
 * Converts a 24-hour time string (e.g. "15:30:00" or "15:30") into
 * 12-hour AM/PM format (e.g. "03:30 PM").
 *
 * Returns '--' for falsy or invalid input.
 * Does NOT modify <input type="time"> values or API payloads — display-only.
 */
export const format12HourTime = (timeStr) => {
    if (!timeStr) return '--';

    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';

    if (isNaN(hours)) return timeStr; // pass-through if unparseable

    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // 0 → 12, 13 → 1, etc.

    return `${String(hours).padStart(2, '0')}:${minutes} ${suffix}`;
};
