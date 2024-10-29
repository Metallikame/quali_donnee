import React from 'react';
import NantesMap from './component/NantesMap';

function App() {
  return (
      <div className='flex flex-col min-h-screen'>
        <h1>Carte centrée sur Nantes</h1>
        <div className='flex flex-grow'>
          <NantesMap />
        </div>
      </div>
  );
}

export default App;