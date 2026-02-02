import React from 'react';
import Holdings from './holdings';



const App = () => {

  return (
    <>
      {/* Tab links (same as old HTML) */}
      <div className="tab">
        <a href="/index.html" className="active">Portfolio</a>
        <a href="/home.html">Home</a>
      </div>

      {/* Page content */}
      <h1>Portfolio</h1>

      <Holdings />
    </>
  );
}


export default App