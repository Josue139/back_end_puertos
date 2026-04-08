import React, { useState } from 'react';
import Timeline from './Timeline';
import PortTable from './PortTable';

function App() {
  const [selectedPort, setSelectedPort] = useState(null);

  return (
    <div style={{ backgroundColor: '#09090b', minHeight: '100vh', padding: '40px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: '700', margin: 0 }}>Tráfico de Puertos</h1>
          <p style={{ color: '#71717a', fontSize: '14px', margin: '5px 0 0 0' }}>Análisis Forense en Tiempo Real</p>
        </header>

        <Timeline onPortClick={setSelectedPort} selectedPort={selectedPort} />
        
        {/* Esto restaurará la parte de abajo */}
        <div style={{ marginTop: '30px' }}>
          <PortTable filterPort={selectedPort} />
        </div>
      </div>
    </div>
  );
}

export default App;
