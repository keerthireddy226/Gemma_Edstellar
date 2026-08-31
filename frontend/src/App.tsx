import { useEffect, useState } from "react";

type HealthResponse = { status: string; db: string };

function App() {
  const [health, setHealth] = useState<HealthResponse | "loading" | "error">("loading");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch(() => setHealth("error"));
  }, []);

  return (
    <div className="app-surface min-h-screen flex items-center justify-center">
      <div className="bg-surface border border-rule rounded-card px-8 py-6 text-center space-y-2">
        <h1 className="font-display font-bold text-2xl text-ink">Gemma_Edstellar</h1>
        <p className="text-sm text-muted">
          {health === "loading" && "checking backend..."}
          {health === "error" && "backend unreachable"}
          {typeof health === "object" && `backend: ${health.status}, db: ${health.db}`}
        </p>
      </div>
    </div>
  );
}

export default App;
