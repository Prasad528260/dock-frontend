import { motion } from 'framer-motion';
import { priorityLabel, priorityColor, statusColor, formatDuration } from '../utils/formatter';

const TruckCard = ({ truck }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
        >
            {/* Left */}
            <div className="space-y-1">
                <p className="text-white text-sm font-medium">{truck.truckId}</p>
                <p className="text-gray-500 text-xs">{truck.shipmentType}</p>
            </div>

            {/* Middle */}
            <div className="text-center">
                <p className={`text-xs font-semibold uppercase ${priorityColor(truck.priority)}`}>
                    {priorityLabel(truck.priority)}
                </p>
                <p className="text-gray-500 text-xs mt-1">{formatDuration(truck.processingDuration)}</p>
            </div>

            {/* Right */}
            <div className="text-right">
                <p className={`text-xs font-semibold uppercase ${statusColor(truck.status)}`}>
                    {truck.status}
                </p>
                {truck.waitTime > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                        wait: {formatDuration(truck.waitTime)}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default TruckCard;