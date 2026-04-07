import React from 'react';
import Timeline from './Timeline';
import PortTable from './PortTable';

function App() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ padding: '20px 0', borderBottom: '1px solid #27272a', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Dashboard de Tráfico de Puertos</h1>
        <p style={{ color: '#71717a' }}>Monitoreo en tiempo real - Estilo Beszel</p>
      </header>
      
      <main>
        <Timeline />
        <div style={{ marginTop: '40px' }}>
          <PortTable />
        </div>
      </main>
    </div>
  );
}

export default App;
