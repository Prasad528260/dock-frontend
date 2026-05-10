import { motion, AnimatePresence } from 'framer-motion';
import { priorityColor, priorityLabel, formatTime, formatDuration } from '../utils/formatter';

const TruckInDock = ({ truck }) => (
    <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-gray-800 border border-gray-600 rounded-lg p-3 space-y-2"
    >
        {/* Truck icon + ID */}
        <div className="flex items-center gap-2">
            <span className="text-2xl">🚛</span>
            <div>
                <p className="text-white text-xs font-bold">{truck.truckId}</p>
                <p className="text-gray-400 text-xs capitalize">{truck.shipmentType}</p>
            </div>
        </div>

        {/* Priority + duration */}
        <div className="flex justify-between items-center">
            <span className={`text-xs font-semibold uppercase ${priorityColor(truck.priority)}`}>
                {priorityLabel(truck.priority)}
            </span>
            <span className="text-gray-400 text-xs">
                {formatDuration(truck.processingDuration)}
            </span>
        </div>

        {/* Progress bar — visual indicator */}
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: truck.processingDuration, ease: 'linear' }}
            />
        </div>
    </motion.div>
);

const DockCard = ({ dock }) => {
    const isOccupied = dock.status === 'occupied';
    const isMaintenance = dock.status === 'maintenance';

    return (
        <motion.div
            layout
            className={`rounded-xl border-2 p-4 space-y-3 transition-colors duration-500 ${
                isOccupied
                    ? 'border-blue-500 bg-gray-900'
                    : isMaintenance
                    ? 'border-red-800 bg-gray-900'
                    : 'border-gray-700 bg-gray-900'
            }`}
        >
            {/* Dock header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Status dot */}
                    <span className={`w-2 h-2 rounded-full ${
                        isOccupied ? 'bg-blue-400 animate-pulse' : 'bg-green-400'
                    }`} />
                    <h3 className="text-white font-bold text-sm">Dock {dock.dockNumber}</h3>
                </div>
                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${
                    isOccupied
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                }`}>
                    {dock.status}
                </span>
            </div>

            {/* Dock bay — where truck sits */}
            <div className={`min-h-32 rounded-lg border border-dashed flex items-center justify-center transition-colors ${
                isOccupied ? 'border-blue-500/40' : 'border-gray-700'
            }`}>
                <AnimatePresence mode="wait">
                    {isOccupied && dock.currentTruck ? (
                        <TruckInDock key={dock.currentTruck._id} truck={dock.currentTruck} />
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-1"
                        >
                            <p className="text-3xl">🏭</p>
                            <p className="text-gray-600 text-xs">Bay empty</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Free at time */}
            {isOccupied && dock.estimatedFreeAt && (
                <p className="text-gray-500 text-xs text-center">
                    Free at {formatTime(dock.estimatedFreeAt)}
                </p>
            )}
        </motion.div>
    );
};

export default DockCard;