import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  FileText,
  FileCode2,
  ChevronLeft,
  ChevronRight,
  FileBarChart
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import pdfimage from "../assest/pdf.png";
import csvimage from "../assest/csv.png";
import xmlimage from "../assest/xml.png";

function DataExportTable({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showChartModal, setShowChartModal] = useState(false);
  const rowsPerPage = 8;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const dataset = useMemo(() => {
    const counts = {};
    data.forEach((row) => {
      const month = new Date(row.addedOn).toLocaleString("default", { month: "short" });
      counts[month] = (counts[month] || 0) + 1;
    });
    const monthsOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return monthsOrder
        .filter((m) => counts[m])
        .map((m) => ({ month: m, count: counts[m] }));
  }, [data]);

  const exportToCSV = () => {
    const headers = ["Mobile Number","APN","IP Address","Package","Added On","Added By","Charge (Rs.)","Charge Added On","Charge Terminated"];
    const csvContent = [
      headers.join(","),
      ...data.map((r) =>
          [r.mobileNumber,r.apn,r.ipAddress,r.package,r.addedOn,r.addedBy,r.charge,r.chargeAddedOn,r.chargeTerminated].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apn-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("APN Report", 14, 10);

      autoTable(doc, {
        startY: 20,
        head: [["Mobile Number","APN","IP Address","Package","Added On","Added By","Charge (Rs.)","Charge Added On","Charge Terminated"]],
        body: data.map((r) => [
          r.mobileNumber,
          r.apn,
          r.ipAddress,
          r.package,
          r.addedOn,
          r.addedBy,
          r.charge,
          r.chargeAddedOn,
          r.chargeTerminated
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 60, 120], textColor: 255 },
        bodyStyles: { fillColor: [240, 240, 255] },
        alternateRowStyles: { fillColor: [220, 220, 255] },
        columnStyles: {
          6: { halign: 'right' }
        },
      });

      doc.save("apn-report.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  const exportToXML = () => {
    const xmlContent =
        '<?xml version="1.0" encoding="UTF-8"?>\n<APNReport>\n' +
        data.map((r) => `  <Record>
  <MobileNumber>${r.mobileNumber}</MobileNumber>
  <APN>${r.apn}</APN>
  <IPAddress>${r.ipAddress}</IPAddress>
  <Package>${r.package}</Package>
  <AddedOn>${r.addedOn}</AddedOn>
  <AddedBy>${r.addedBy}</AddedBy>
  <Charge>${r.charge}</Charge>
  <ChargeAddedOn>${r.chargeAddedOn}</ChargeAddedOn>
  <ChargeTerminated>${r.chargeTerminated}</ChargeTerminated>
</Record>`).join("\n") +
        "\n</APNReport>";

    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apn-report.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
      <div className="mt-8 bg-blue-950 rounded-xl shadow-lg border border-blue-800 p-4">
        <div className="p-4 flex justify-between items-center bg-blue-900 border-b border-blue-700">
          <h3 className="font-semibold text-white">Filtered Report</h3>
          <div className="flex items-center gap-3">
            <button
                onClick={() => setShowChartModal(true)}
                className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <FileBarChart size={18}/> Reports
            </button>

            <span>|</span>
            <h3 className="font-semibold text-white">Export Data</h3>

            <button
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <img src={pdfimage} alt="PDF" className="w-5 h-5 object-contain"/>
              <span>PDF</span>
            </button>

            <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <img src={csvimage} alt="PDF" className="w-5 h-5 object-contain"/>
              CSV
            </button>
            <button
                onClick={exportToXML}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <img src={xmlimage} alt="PDF" className="w-5 h-5 object-contain"/>
              XML
            </button>
          </div>
        </div>

        {showChartModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl w-11/12 md:w-3/4 p-4 relative">
                <button
                    onClick={() => setShowChartModal(false)}
                    className="absolute top-2 right-2 text-gray-700 font-bold text-lg"
                >
                  ✕
                </button>
                <h4 className="text-gray-900 text-lg mb-4 font-bold">Records Added Per Month</h4>
                <div style={{width: "100%", height: 300}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataset}>
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis dataKey="month"/>
                      <YAxis/>
                      <Tooltip/>
                      <Bar dataKey="count" fill="#0c0b4d"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
        )}

        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-blue-900 text-white uppercase text-xs">
            <tr>
              {[
                "Mobile Number", "APN", "IP Address", "Package", "Added On", "Added By", "Charge (Rs.)", "Charge Added On", "Charge Terminated"
              ].map((header) => (
                  <th key={header} className="border border-blue-700 p-2">{header}</th>
              ))}
            </tr>
            </thead>
            <tbody>
            {currentData.map((row) => (
                <tr key={row.id} className="even:bg-blue-700/30 odd:bg-blue-750/50 hover:bg-blue-600/50 transition">
                  <td className="border border-blue-800 p-2">{row.mobileNumber}</td>
                  <td className="border border-blue-800 p-2">{row.apn}</td>
                  <td className="border border-blue-800 p-2">{row.ipAddress}</td>
                  <td className="border border-blue-800 p-2">{row.package}</td>
                  <td className="border border-blue-800 p-2">{row.addedOn}</td>
                  <td className="border border-blue-800 p-2">{row.addedBy}</td>
                  <td className="border border-blue-800 p-2 text-right">{row.charge}</td>
                  <td className="border border-blue-800 p-2">{row.chargeAddedOn}</td>
                  <td className="border border-blue-800 p-2">{row.chargeTerminated}</td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between bg-blue-950 text-white p-4 border-t border-blue-800">
          <div className="text-sm text-gray-300">
            {startIndex + 1}–{Math.min(startIndex + rowsPerPage, data.length)} of {data.length}
          </div>

          <div className="flex items-center gap-1">
            <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-blue-900 hover:bg-blue-700 disabled:opacity-50"
            >
              <ChevronLeft size={16}/>
            </button>

            {Array.from({length: totalPages}, (_, i) => i + 1)
                .map((page) => {
                  if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-md ${
                                page === currentPage
                                    ? "bg-white text-black font-semibold"
                                    : "bg-blue-900 hover:bg-blue-700"
                            }`}
                        >
                          {page}
                        </button>
                    );
                  } else if (
                      page === 2 && currentPage > 3 ||
                      page === totalPages - 1 && currentPage < totalPages - 2
                  ) {
                    return <span key={page} className="px-2">...</span>;
                  } else {
                    return null;
                  }
                })}

            <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-blue-900 hover:bg-blue-700 disabled:opacity-50"
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </div>
  );
}

export default DataExportTable;
