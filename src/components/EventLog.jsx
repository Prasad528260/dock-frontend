import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatTime } from '../utils/formatter';

const logColor = (type) => {
    const map = {
        assigned: 'text-blue-400',
        available: 'text-green-400',
        arrival: 'text-yellow-400',
        delay: 'text-red-400',
        info: 'text-gray-400',
    };
    return map[type] || 'text-gray-400';
};

const EventLog = () => {
    const logs = useStore((state) => state.logs);

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-96 flex flex-col">
            <h3 className="text-white font-semibold mb-4">Event Log</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <AnimatePresence>
                    {logs.length === 0 && (
                        <p className="text-gray-600 text-sm">No events yet. Start simulation.</p>
                    )}
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 text-xs"
                        >
                            <span className="text-gray-600 shrink-0">{formatTime(log.time)}</span>
                            <span className={logColor(log.type)}>{log.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EventLog;