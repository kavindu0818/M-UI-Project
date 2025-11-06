import React, { useState, useMemo } from "react";
import { Search, Calendar, TrendingUp } from "lucide-react";
import "jspdf-autotable";
import DataExportTable from "./DataExportTable.jsx";
import { useTheme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { AccountBalance } from "@mui/icons-material";

export default function APNReportDashboard() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("apn-wise");
  const [apnName, setApnName] = useState("");
  const [dateApn, setDateApn] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const apnOptions = ["INTERNET", "CCL", "VPN"];

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

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

  const handleAccountWiseSubmit = (e) => {
    e.preventDefault();
    const filtered = allData.filter(
      (item) => item.mobileNumber === accountNumber
    );
    setFilteredData(filtered);
  };

  const handleBack = () => {
    setFilteredData([]);
    setFromDate("");
    setToDate("");
    setDateApn("");
    setApnName("");
    setAccountNumber("");
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
            <p className="text-blue-200 text-sm">Generate network reports</p>
          </div>
        </div>

        {!filteredData.length && (
          <div className="flex justify-center flex-wrap gap-3 mb-6 bg-blue-800/50 p-3 rounded-2xl shadow-md">
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
                  ? "bg-blue-700 text-white shadow-lg shadow-blue-400/30"
                  : "text-blue-200 hover:bg-blue-700/50"
              }`}
            >
              Date Wise Report
            </button>
            <button
              onClick={() => setActiveTab("account-wise")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "account-wise"
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
              <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-blue-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-900 to-blue-600 px-6 py-2">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                      {activeTab === "apn-wise" ? (
                        <>
                          <Search className="w-5 h-5" /> APN Wise Report
                        </>
                      ) : activeTab === "date-wise" ? (
                        <>
                          <Calendar className="w-5 h-5" /> Date Wise Report
                        </>
                      ) : (
                        <>
                          <AccountBalance className="w-5 h-5" /> Account Wise Report
                        </>
                      )}
                    </h2>
                  </div>

                  {activeTab === "apn-wise" && (
                      <form onSubmit={handleApnWiseSubmit} className="p-8 space-y-6">
                        <div>
                          <FormControl sx={{ width: "100%" }}>
                            <label className="block text-sm font-semibold mb-2 text-black">
                              APN Name <span className="text-red-400">*</span>
                            </label>
                            <Select
                                size="small"
                                labelId="apn-select-label"
                                id="apn-select"
                                value={apnName}
                                onChange={(e) => setApnName(e.target.value)}
                                MenuProps={MenuProps}
                                sx={{
                                  height: 36,
                                  ".MuiSelect-select": { paddingY: 0.5 },
                                }}
                                className="w-full border-2 border-blue-700 rounded-xl bg-blue-50 text-black focus:ring-2 focus:ring-blue-500"
                            >
                              <MenuItem value="">
                                <em>-- Please Select --</em>
                              </MenuItem>
                              {apnOptions.map((name) => (
                                  <MenuItem key={name} value={name}>
                                    {name}
                                  </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>

                        <div className="flex justify-center">
                          <button
                              type="submit"
                              className="w-1/5 bg-transparent text-black border-2 border-black py-2 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                  )}

                  {activeTab === "date-wise" && (
                      <form onSubmit={handleDateWiseSubmit} className="p-8 space-y-6">
                        <div>
                          <FormControl sx={{ width: "100%" }}>
                            <label className="block text-sm font-semibold mb-2 text-black">
                              APN Name <span className="text-red-400">*</span>
                            </label>
                            <Select
                                size="small"
                                labelId="date-apn-select-label"
                                id="date-apn-select"
                                value={dateApn}
                                onChange={(e) => setDateApn(e.target.value)}
                                MenuProps={MenuProps}
                                sx={{
                                  height: 36,
                                  ".MuiSelect-select": { paddingY: 0.5 },
                                }}
                                className="w-full border-2 border-blue-700 rounded-xl bg-blue-50 text-black focus:ring-2 focus:ring-blue-500"
                            >
                              <MenuItem value="">
                                <em>-- Please Select --</em>
                              </MenuItem>
                              {apnOptions.map((name) => (
                                  <MenuItem key={name} value={name}>
                                    {name}
                                  </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-black">
                            From Date <span className="text-red-400">*</span>
                          </label>
                          <input
                              type="date"
                              value={fromDate}
                              onChange={(e) => setFromDate(e.target.value)}
                              className="w-full h-9 px-3 py-1.5 border-2 border-blue-700 bg-blue-50 text-black focus:ring-2 focus:ring-blue-500"
                              required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-black">
                            To Date <span className="text-red-400">*</span>
                          </label>
                          <input
                              type="date"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                              className="w-full h-9 px-3 py-1.5 border-2 border-blue-700 bg-blue-50 text-black focus:ring-2 focus:ring-blue-500"
                              required
                          />
                        </div>

                        <div className="flex justify-center">
                          <button
                              type="submit"
                              className="w-1/5 bg-transparent text-black border-2 border-black py-2 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                  )}

                  {activeTab === "account-wise" && (
                      <form onSubmit={handleAccountWiseSubmit} className="p-8 space-y-6">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-black">
                            Account Number <span className="text-red-400">*</span>
                          </label>
                          <input
                              type="text"
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                              className="w-full h-9 px-3 py-1.5 border-2 border-blue-700 bg-blue-50 text-black focus:ring-2 focus:ring-blue-500"
                              required
                          />
                        </div>

                        <div className="flex justify-center">
                          <button
                              type="submit"
                              className="w-1/5 bg-transparent text-black border-2 border-black py-2 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                  )}
                </div>
              </div>
            ) : (
              <DataExportTable data={filteredData} onBack={handleBack} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
