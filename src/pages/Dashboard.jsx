import { useEffect } from "react";
import { motion } from "framer-motion";
import useStore from "../store/useStore";
import useSocket from "../hooks/useSocket";
import DockCard from "../components/DockCard";
import TruckCard from "../components/TruckCard";
import EventLog from "../components/EventLog";
import api from "../services/api";

const Dashboard = () => {
  const { session, docks, trucks, setDocks, setTrucks } = useStore();

  useSocket(session?._id);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const [docksRes, trucksRes] = await Promise.all([
        api.get(`/docks?sessionId=${session._id}`),
        api.get(`/trucks?sessionId=${session._id}`),
      ]);
      setDocks(docksRes.data.data);
      setTrucks(trucksRes.data.data);
    };

    fetchData();
  }, [session]);

  const waitingTrucks = trucks.filter((t) => t.status === "waiting");
  const assignedTrucks = trucks.filter((t) => t.status === "assigned");
  const completedTrucks = trucks.filter((t) => t.status === "completed");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {session ? `Session: ${session._id}` : "No active simulation"}
        </p>
      </div>

      {/* Metrics bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Trucks", value: trucks.length },
          { label: "Waiting", value: waitingTrucks.length },
          { label: "Assigned", value: assignedTrucks.length },
          { label: "Completed", value: completedTrucks.length },
        ].map(({ label, value }) => (
          <motion.div
            key={label}
            layout
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <p className="text-gray-500 text-xs">{label}</p>
            <p className="text-white text-2xl font-bold mt-1">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Dock grid */}
      <div>
        <h2 className="text-white font-semibold mb-3">Docks</h2>
        {docks.length === 0 ? (
          <p className="text-gray-600 text-sm">
            No docks. Start a simulation first.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {docks.map((dock) => (
              <DockCard key={dock._id} dock={dock} />
            ))}
          </div>
        )}
      </div>

      {/* Truck queue + Event log */}
      <div className="grid grid-cols-2 gap-6">
        {/* Truck queue */}
        <div>
          <h2 className="text-white font-semibold mb-3">
            Truck Queue
            <span className="text-gray-500 text-sm font-normal ml-2">
              ({waitingTrucks.length} waiting)
            </span>
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {waitingTrucks.length === 0 ? (
              <p className="text-gray-600 text-sm">No trucks waiting.</p>
            ) : (
              waitingTrucks.map((truck) => (
                <TruckCard key={truck._id} truck={truck} />
              ))
            )}
          </div>
        </div>

        {/* Event log */}
        <EventLog />
      </div>
    </div>
  );
};

export default Dashboard;
