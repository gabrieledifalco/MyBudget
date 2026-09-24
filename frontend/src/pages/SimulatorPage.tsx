import { useState } from "react";

import { SimulationHistory } from "@/features/simulator/SimulationHistory";
import { SimulatorBuilder } from "@/features/simulator/SimulatorBuilder";

export function SimulatorPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <section className="page">
      <h1>Simulatore di risparmio</h1>
      <SimulatorBuilder onSaved={() => setReloadKey((k) => k + 1)} />
      <SimulationHistory reloadKey={reloadKey} />
    </section>
  );
}
