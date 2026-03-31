"use client";

import type { MachineNo } from "@/lib/types";
import React, { createContext, useContext, useState, useEffect } from "react";

interface MachineContextType {
  machineNo: MachineNo;
  setMachineNo: (m: MachineNo) => void;
}

const MachineContext = createContext<MachineContextType>({
  machineNo: "M06",
  setMachineNo: () => {},
});

export function MachineProvider({ children }: { children: React.ReactNode }) {
  const [machineNo, setMachineState] = useState<MachineNo>("M06");

  useEffect(() => {
    const saved = localStorage.getItem("machineNo") as MachineNo;
    if (saved === "M06" || saved === "M07") setMachineState(saved);
  }, []);

  const setMachineNo = (m: MachineNo) => {
    setMachineState(m);
    localStorage.setItem("machineNo", m);
  };

  return (
    <MachineContext.Provider value={{ machineNo, setMachineNo }}>
      {children}
    </MachineContext.Provider>
  );
}

export function useMachine() {
  return useContext(MachineContext);
}
