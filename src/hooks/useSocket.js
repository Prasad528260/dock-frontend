import { useEffect } from "react";
import socket from "../services/socket";
import useStore from "../store/useStore";

const useSocket = (sessionId) => {
  const { updateDock, addTruck, updateTruck, addLog } = useStore();

  useEffect(() => {
    if (!sessionId) return;

    socket.emit("join:session", sessionId);

    socket.on("truck:assigned", ({ truck, dock }) => {
      updateTruck(truck);
      updateDock(dock);
      addLog({
        message: `Truck ${truck.truckId} assigned to Dock ${dock.dockNumber}`,
        type: "assigned",
      });
    });

   socket.on("dock:updated", (dockData) => {
    updateDock(dockData);
    addLog({ message: `Dock is now available`, type: "available" });
});

    socket.on("sim:tick", ({ truck }) => {
      addTruck(truck);
      addLog({ message: `Truck ${truck.truckId} arrived`, type: "arrival" });
    });

    socket.on("delay:triggered", ({ truckId, delay }) => {
      addLog({ message: `Delay of ${delay}s triggered`, type: "delay" });
    });
    socket.on("truck:completed", ({ truckId }) => {
      updateTruck({ _id: truckId, status: "completed" });
      addLog({ message: `Truck completed`, type: "available" });
    });
    socket.on('gate:closed', () => {
    addLog({ message: 'Gate closed — processing remaining trucks', type: 'delay' });
});

    return () => {
      socket.emit("leave:session", sessionId);
      socket.off("truck:assigned");
      socket.off("dock:updated");
      socket.off("sim:tick");
      socket.off('truck:completed');
      socket.off("delay:triggered");
    };
  }, [sessionId]);
};

export default useSocket;
