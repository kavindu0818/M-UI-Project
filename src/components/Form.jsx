import React, { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  TrendingUp,
} from "lucide-react";
import "jspdf-autotable";
import DataExportTable from "./DataExportTable.jsx";


export default function APNReportDashboard() {
  const [activeTab, setActiveTab] = useState("apn-wise");
  const [apnName, setApnName] = useState("CCL");
  const [dateApn, setDateApn] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const apnOptions = ["INTERNET", "CCL", "VPN"];

  const generateDataset = (count = 50) => {
    const data = [];
    const packages = ["Basic", "Standard", "Premium"];
    const apn = ["INTERNET", "CCL", "VPN"];

    for (let i = 1; i <= count; i++) {
      const pkg = packages[i % packages.length];
      const ap = apn[i % apn.length];
      const date = new Date(2024, 0, 1 + i);

      const formattedDate = date.toISOString().split("T")[0];

      const futureDate = new Date(date);
      futureDate.setMonth(date.getMonth() + 2);
      const formattedFutureDate = futureDate.toISOString().split("T")[0];

      data.push({
        id: i,
        mobileNumber: `+9477${(1000000 + i).toString().slice(-7)}`,
        apn: ap,
        ipAddress: `192.168.${Math.floor(i / 255)}.${i % 255}`,
        package: pkg,
        addedOn: formattedDate,
        addedBy: "Admin",
        charge: pkg === "Premium" ? 500 : pkg === "Standard" ? 300 : 250,
        chargeAddedOn: formattedDate,
        chargeTerminated: formattedFutureDate,
      });
    }
    return data;
  };

  const allData = useMemo(() => generateDataset(1000), []);

  const handleApnWiseSubmit = (e) => {
    e.preventDefault();
    const filtered = allData.filter((item) => item.apn === apnName);
    setFilteredData(filtered);
  };

  const handleDateWiseSubmit = (e) => {
    e.preventDefault();
    const filtered = allData.filter((item) => {
      const itemDate = new Date(item.addedOn);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      return item.apn === dateApn && itemDate >= from && itemDate <= to;
    });
    setFilteredData(filtered);
  };

  const handleBack = () => {
    setFilteredData([]);
    setFromDate("");
    setToDate("");
    setDateApn("");
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-white to-white p-6 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-3 bg-blue-900 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">APN Analytics</h1>
              <p className="text-blue-200 text-sm">
                Generate network reports
              </p>
            </div>
          </div>

          {!filteredData.length && (
              <div className="flex flex-wrap gap-3 mb-6 bg-blue-800/50 p-3 rounded-2xl shadow-md">
                <button
                    onClick={() => setActiveTab("apn-wise")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === "apn-wise"
                            ? "bg-blue-900 text-white shadow-lg shadow-blue-400/30"
                            : "text-blue-200 hover:bg-blue-700/50"
                    }`}
                >
                  APN Wise Report
                </button>
                <button
                    onClick={() => setActiveTab("date-wise")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === "date-wise"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-400/30"
                            : "text-blue-200 hover:bg-blue-700/50"
                    }`}
                >
                  Date Wise Report
                </button>

                <button
                    onClick={() => setActiveTab("date-wise")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === "date-wise"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-400/30"
                            : "text-blue-200 hover:bg-blue-700/50"
                    }`}
                >
                  Account Wise Report
                </button>
              </div>
          )}


          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              {!filteredData.length ? (
                  <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-blue-800 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-900 to-blue-600 px-6 py-2">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                          {activeTab === "apn-wise" ? (
                              <>
                                <Search className="w-5 h-5"/> APN Wise Report
                              </>
                          ) : (
                              <>
                                <Calendar className="w-5 h-5"/> Date Wise Report
                              </>
                          )}


                        </h2>
                      </div>

                      {activeTab === "apn-wise" ? (
                          // APN-wise form
                          <form onSubmit={handleApnWiseSubmit} className="p-8 space-y-6">
                            <div>
                              <label className="block text-sm font-semibold mb-2 text-black">
                                APN Name <span className="text-black">*</span>
                              </label>
                              <select
                                  value={apnName}
                                  onChange={(e) => setApnName(e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-blue-700 rounded-xl bg-blue-50 text-black focus:ring-2 focus:ring-blue-500"
                              >
                                {apnOptions.map((a) => (
                                    <option key={a}>{a}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex justify-center">
                              <button
                                  type="submit"
                                  className="w-1/4 bg-transparent text-black border-2 border-black py-2 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:bg-blue-900 hover:text-white hover:border-blue-900"
                              >
                                Submit
                              </button>
                            </div>
                          </form>
                      ) : (
                          // Date-wise form
                          <form onSubmit={handleDateWiseSubmit} className="p-8 space-y-6">
                            <div>
                              <label className="block text-sm font-semibold mb-2 text-black">
                                Account Number <span className="text-red-400">*</span>
                              </label>
                              {/*<select*/}
                              {/*    value={dateApn}*/}
                              {/*    onChange={(e) => setDateApn(e.target.value)}*/}
                              {/*    className="w-full px-4 py-3 border-2 border-blue-700 rounded-xl bg-blue-50 text-black focus:ring-2 focus:ring-blue-500"*/}
                              {/*>*/}
                              {/*</select>*/}

                              <Input  className="w-full px-4 py-3 border-2 border-blue-700 rounded-xl bg-blue-50 text-black focus:ring-2 focus:ring-blue-500">

                              </Input>
                            </div>

                            <div className="flex justify-center">
                              <button
                                  type="submit"
                                  className="w-1/4 bg-transparent text-black border-2 border-black py-2 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:bg-blue-900 hover:text-white hover:border-blue-900"
                              >
                                Submit
                              </button>
                            </div>
                          </form>
                      )}

                    </div>
                  </div>


              ) : (
                  <DataExportTable data={filteredData} onBack={handleBack}/>
              )}
            </div>
          </div>
        </div>
      </div>

  );
}
