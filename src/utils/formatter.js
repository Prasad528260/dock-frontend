export const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
};

export const formatTime = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleTimeString();
};

export const priorityLabel = (priority) => {
    const map = { 1: 'LOW', 2: 'MEDIUM', 3: 'HIGH' };
    return map[priority] || 'LOW';
};

export const priorityColor = (priority) => {
    const map = {
        1: 'text-green-400',
        2: 'text-yellow-400',
        3: 'text-red-400'
    };
    return map[priority] || 'text-green-400';
};

export const statusColor = (status) => {
    const map = {
        waiting: 'text-yellow-400',
        assigned: 'text-blue-400',
        processing: 'text-purple-400',
        delayed: 'text-red-400',
        completed: 'text-green-400',
        available: 'text-green-400',
        occupied: 'text-red-400',
        maintenance: 'text-gray-400',
    };
    return map[status] || 'text-gray-400';
};