import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

export default function BarChartModal({ dataset, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl w-11/12 md:w-3/4 p-6 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-700 hover:text-black font-bold text-xl"
                >
                    ✕
                </button>
                <h4 className="text-gray-900 text-xl mb-4 font-semibold">
                    📊 Records Added Per Month
                </h4>
                <BarChart
                    dataset={dataset}
                    xAxis={[
                        { dataKey: "month", tickPlacement: "middle", tickLabelPlacement: "middle" },
                    ]}
                    series={[{ dataKey: "count", label: "Added Records", color: "#0c0b4d" }]}
                    yAxis={[{ label: "Records" }]}
                    height={300}
                    margin={{ left: 70 }}
                />
            </div>
        </div>
    );
}
