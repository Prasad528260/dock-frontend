import { create } from "zustand";

const useStore = create((set) => ({
  session: null,
  setSession: (session) => set({ session }),

  docks: [],
  setDocks: (docks) => set({ docks }),
  updateDock: (updatedDock) =>
    set((state) => ({
      docks: state.docks.map((d) =>
        d._id === updatedDock._id ? { ...d, ...updatedDock } : d,
      ),
    })),

  trucks: [],
  setTrucks: (trucks) => set({ trucks }),
  addTruck: (truck) =>
    set((state) => {
      const exists = state.trucks.find((t) => t._id === truck._id);
      if (exists) return state;
      const newTrucks = [truck, ...state.trucks];
      newTrucks.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        if (a.processingDuration !== b.processingDuration)
          return a.processingDuration - b.processingDuration;
        return new Date(a.arrivalTime) - new Date(b.arrivalTime);
      });
      return { trucks: newTrucks };
    }),
  updateTruck: (updatedTruck) =>
    set((state) => ({
      trucks: state.trucks.map((t) =>
        t._id === updatedTruck._id ? { ...t, ...updatedTruck } : t,
      ),
    })),

  simStatus: "idle",
  setSimStatus: (simStatus) => set({ simStatus }),

  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [{ ...log, time: new Date() }, ...state.logs].slice(0, 50),
    })),
}));

export default useStore;
