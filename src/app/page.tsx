import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>Taken Dashboard</h1>
          <p>Beheer je taken en planning op één plek.</p>
        </div>
        <span className="source-badge" title="Actieve takenbron">
          bron: lokaal · Akiflow volgt
        </span>
      </header>
      <Dashboard />
    </main>
  );
}
