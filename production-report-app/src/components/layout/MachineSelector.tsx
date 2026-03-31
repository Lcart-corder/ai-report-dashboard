"use client";

import { useMachine } from "@/contexts/MachineContext";
import { MACHINES, MACHINE_LABELS } from "@/lib/constants";

export function MachineSelector() {
  const { machineNo, setMachineNo } = useMachine();

  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-300">
      {MACHINES.map((m) => (
        <button
          key={m}
          onClick={() => setMachineNo(m)}
          className={`px-3 py-1 text-sm font-medium transition-colors ${
            machineNo === m
              ? "bg-green-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {MACHINE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
