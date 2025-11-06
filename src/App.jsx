import React from "react";
import { Routes, Route } from "react-router-dom";
import APNReportTable from "./components/DataExportTable.jsx";
import FormPage from "./components/Form.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<FormPage />} />
            <Route path="/apn-report" element={<APNReportTable data={[]} />} />
        </Routes>
    );
}

export default App;
