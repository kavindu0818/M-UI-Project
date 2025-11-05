import { useState } from 'react';
// import StudentList from './components/DataExportTable.jsx';
import Form from './components/Form.jsx'

function App() {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleStudentAdded = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50">
  
          {/* Full-width StudentList */}
          <div className="w-full">
            <Form refresh={refreshCounter} />
          </div>
      
      </div>
  );
}

export default App;
