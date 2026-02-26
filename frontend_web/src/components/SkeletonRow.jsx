import React from 'react';

// Generic skeleton shimmer row for admin tables
// Pass `cols` to customize column count (default: 7 for bookings table)
const SkeletonRow = ({ cols = 7 }) => (
    <tr className="animate-pulse">
        {/* Token / ID */}
        <td className="p-4 md:p-5"><div className="h-8 w-14 bg-gray-200 rounded-lg"></div></td>
        {/* Time / Secondary */}
        <td className="p-4 md:p-5"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
        {/* Avatar + Name */}
        <td className="p-4 md:p-5">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0"></div>
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                    <div className="h-3 w-20 bg-gray-100 rounded"></div>
                </div>
            </div>
        </td>
        {/* Middle columns */}
        {cols >= 5 && <td className="p-4 md:p-5"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>}
        {cols >= 6 && (
            <td className="p-4 md:p-5">
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-12 bg-gray-100 rounded"></div>
                </div>
            </td>
        )}
        {/* Status badge */}
        {cols >= 4 && <td className="p-4 md:p-5"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>}
        {/* Action button */}
        {cols >= 7 && <td className="p-4 md:p-5 text-center"><div className="h-9 w-9 bg-gray-200 rounded-lg mx-auto"></div></td>}
    </tr>
);

// Renders multiple skeleton rows
export const SkeletonTable = ({ rows = 5, cols = 7 }) => (
    <>
        {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
        ))}
    </>
);

export default SkeletonRow;
