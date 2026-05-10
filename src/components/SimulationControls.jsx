import { useState } from 'react';
import { Play, Pause, RotateCcw, DoorClosed, DoorOpen } from 'lucide-react';
import api from '../services/api';
import useStore from '../store/useStore';

const SimulationControls = () => {
    const { session, setSession, setDocks, setTrucks, simStatus, setSimStatus, addLog } = useStore();

    const [config, setConfig] = useState({
        dockCount: 3,
        arrivalFrequency: 15,
        delayProbability: 0.2,
        priorityFrequency: 0.3,
        simSpeed: 1,
    });

    const handleStart = async () => {
        try {
            const res = await api.post('/simulation/start', config);
            const newSession = res.data.data;
            setSession(newSession);
            setSimStatus('running');
            setTrucks([]);
            const docksRes = await api.get(`/docks?sessionId=${newSession._id}`);
            setDocks(docksRes.data.data);
            addLog({ message: 'Simulation started', type: 'info' });
        } catch (err) {
            console.error(err);
        }
    };

    const handlePause = async () => {
        try {
            await api.post('/simulation/pause', { sessionId: session._id });
            setSimStatus('paused');
            addLog({ message: 'Simulation paused', type: 'info' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleResume = async () => {
        try {
            await api.post('/simulation/resume', { sessionId: session._id });
            setSimStatus('running');
            addLog({ message: 'Simulation resumed', type: 'info' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleReset = async () => {
        try {
            await api.post('/simulation/reset', { sessionId: session._id });
            setSession(null);
            setDocks([]);
            setTrucks([]);
            setSimStatus('idle');
            addLog({ message: 'Simulation reset', type: 'info' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleCloseGate = async () => {
        try {
            await api.post('/simulation/close-gate', { sessionId: session._id });
            setSimStatus('closing');
            addLog({ message: 'Gate closed — no new trucks incoming', type: 'delay' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenGate = async () => {
        try {
            await api.post('/simulation/open-gate', { sessionId: session._id });
            setSimStatus('running');
            addLog({ message: 'Gate opened — trucks arriving again', type: 'info' });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-white font-semibold text-lg">Simulation Config</h2>

            {/* Config sliders */}
            <div className="space-y-4">
                {[
                    { label: 'Dock Count', key: 'dockCount', min: 1, max: 10, step: 1 },
                    { label: 'Arrival Frequency (s)', key: 'arrivalFrequency', min: 5, max: 60, step: 5 },
                    { label: 'Delay Probability', key: 'delayProbability', min: 0, max: 1, step: 0.1 },
                    { label: 'Priority Frequency', key: 'priorityFrequency', min: 0, max: 1, step: 0.1 },
                    { label: 'Sim Speed', key: 'simSpeed', min: 1, max: 5, step: 1 },
                ].map(({ label, key, min, max, step }) => (
                    <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">{label}</span>
                            <span className="text-white font-medium">{config[key]}</span>
                        </div>
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={config[key]}
                            onChange={(e) => setConfig({ ...config, [key]: parseFloat(e.target.value) })}
                            disabled={simStatus !== 'idle'}
                            className="w-full accent-blue-500"
                        />
                    </div>
                ))}
            </div>

            {/* Status indicator */}
            {simStatus === 'closing' && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3">
                    <p className="text-orange-400 text-sm">
                        🚧 Gate closed — processing remaining {' '}
                        trucks in queue. Reset when done.
                    </p>
                </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
                {simStatus === 'idle' && (
                    <button
                        onClick={handleStart}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                    >
                        <Play size={16} /> Start
                    </button>
                )}

                {simStatus === 'running' && (
                    <>
                        <button
                            onClick={handlePause}
                            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                        >
                            <Pause size={16} /> Pause
                        </button>
                        <button
                            onClick={handleCloseGate}
                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                        >
                            <DoorClosed size={16} /> Close Gate
                        </button>
                    </>
                )}

                {simStatus === 'paused' && (
                    <button
                        onClick={handleResume}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                    >
                        <Play size={16} /> Resume
                    </button>
                )}

                {simStatus === 'closing' && (
                    <button
                        onClick={handleOpenGate}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                    >
                        <DoorOpen size={16} /> Open Gate
                    </button>
                )}

                {simStatus !== 'idle' && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                )}
            </div>
        </div>
    );
};

export default SimulationControls;