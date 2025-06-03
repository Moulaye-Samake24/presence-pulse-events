import React from 'react';

const TestPage = () => {
  const [result, setResult] = React.useState<string>('');
  
  const testFetch = async () => {
    try {
      const PULSE_SHEET_ID = import.meta.env.VITE_PULSE_SHEET_ID;
      const csvUrl = `https://docs.google.com/spreadsheets/d/${PULSE_SHEET_ID}/gviz/tq?tqx=out:csv`;
      
      console.log('Fetching from:', csvUrl);
      
      const response = await fetch(csvUrl);
      const csvText = await response.text();
      
      console.log('Got CSV:', csvText);
      setResult(csvText);
      
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: ' + error);
    }
  };
  
  React.useEffect(() => {
    testFetch();
  }, []);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Simple Test Page</h1>
      <h2>Environment:</h2>
      <p>VITE_PULSE_SHEET_ID: {import.meta.env.VITE_PULSE_SHEET_ID}</p>
      <h2>CSV Result:</h2>
      <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
        {result}
      </pre>
    </div>
  );
};

export default TestPage;
