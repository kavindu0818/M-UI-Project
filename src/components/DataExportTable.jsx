import React, { useState, useMemo } from "react";
import {
    alpha, Box, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow, TableSortLabel, Toolbar, Typography, Paper,
    Checkbox, IconButton, Tooltip, Switch, FormControlLabel, Divider
} from "@mui/material";
import { Delete, ArrowBack } from "@mui/icons-material";
import { FileBarChart } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pdfimage from "../assest/pdf.png";
import csvimage from "../assest/csv.png";
import xlsximage from "../assest/xlsx.png";
import xmlimage from "../assest/xml.png";
import BarChartModal from "./ChartView.jsx";
import * as XLSX from "xlsx";

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}
function getComparator(order, orderBy) {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
    { id: "mobileNumber", label: "Mobile Number" },
    { id: "apn", label: "APN" },
    { id: "ipAddress", label: "IP Address" },
    { id: "package", label: "Package" },
    { id: "addedOn", label: "Added On" },
    { id: "addedBy", label: "Added By" },
    { id: "charge", label: "Charge (Rs.)", numeric: true },
    { id: "chargeAddedOn", label: "Charge Added On" },
    { id: "chargeTerminated", label: "Charge Terminated" },
];

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort }) {
    const createSortHandler = (property) => (event) => onRequestSort(event, property);

    return (
        <TableHead sx={{ backgroundColor: "#0c0b4d" }}>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? "right" : "left"}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                            color: "white",
                            fontWeight: 600,
                            "& .MuiTableSortLabel-root": { color: "white" },
                            "& .MuiTableSortLabel-root.Mui-active": { color: "white" },
                            "& .MuiTableSortLabel-icon": { color: "white !important" },
                        }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : "asc"}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

function EnhancedTableToolbar({ numSelected, exportToPDF, exportToCSV, exportToXLSX, exportToXML, onShowChart }) {
    return (
        <Toolbar
            sx={[
                { p: 2, borderBottom: "1px solid #e0e0e0" },
                numSelected > 0 && {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                },
            ]}
        >
                <Typography variant="h6" sx={{ flex: 1, color: "#0c0b4d", fontWeight: 600 }}>
                    APN Report
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Tooltip title="Show Report Chart">
                        <IconButton
                            onClick={onShowChart}
                            sx={{
                                backgroundColor: "#0c0b4d",
                                "&:hover": { backgroundColor: "#15136e" },
                                color: "white",
                                borderRadius: 2,
                            }}
                        >
                            <FileBarChart size={20} />
                        </IconButton>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem />

                    <h2 className="text-blue-950 font-bold">Export Data</h2>

                    <Tooltip title="Export PDF">
                        <IconButton
                            onClick={exportToPDF}
                            sx={{
                                backgroundColor: "#fff",
                                border: "2px solid #000",
                                "&:hover": { backgroundColor: "#c62828" },
                                borderRadius: 2,
                            }}
                        >
                            <img src={pdfimage} width="22" alt="PDF" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Export CSV (Excel Compatible)">
                        <IconButton
                            onClick={exportToCSV}
                            sx={{
                                backgroundColor: "#fff",
                                border: "2px solid #000",
                                "&:hover": { backgroundColor: "#1565c0" },
                                borderRadius: 2,
                            }}
                        >
                            <img src={csvimage} width="22" alt="CSV" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Export XLSX (Excel Format)">
                        <IconButton
                            onClick={exportToXLSX}
                            sx={{
                                backgroundColor: "#fff",
                                border: "2px solid #000",
                                "&:hover": { backgroundColor: "#2e7d32" },
                                borderRadius: 2,
                            }}
                        >
                            <img src={xlsximage} width="22" alt="XLSX" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Export XML">
                        <IconButton
                            onClick={exportToXML}
                            sx={{
                                backgroundColor: "#fff",
                                border: "2px solid #000",
                                "&:hover": { backgroundColor: "#f9a825" },
                                borderRadius: 2,
                            }}
                        >
                            <img src={xmlimage} width="22" alt="XML" />
                        </IconButton>
                    </Tooltip>
                </Box>
        </Toolbar>
    );
}


export default function DataExportTable({ data, onBack }) {
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("mobileNumber");
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showChartModal, setShowChartModal] = useState(false);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) setSelected(data.map((n) => n.mobileNumber));
        else setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        if (selectedIndex === -1) setSelected([...selected, id]);
        else setSelected(selected.filter((item) => item !== id));
    };

    const visibleRows = useMemo(
        () => [...data].sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [order, orderBy, page, rowsPerPage, data]
    );

    const dataset = useMemo(() => {
        const counts = {};
        data.forEach((row) => {
            const month = new Date(row.addedOn).toLocaleString("default", { month: "short" });
            counts[month] = (counts[month] || 0) + 1;
        });
        const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthsOrder.filter((m) => counts[m]).map((m) => ({ month: m, count: counts[m] }));
    }, [data]);



    const exportToCSV = () => {

        const headers = headCells.map(h => `"${h.label}"`);
        const rows = data.map(row =>
            headCells.map(h => {
                let value = row[h.id] ?? '';
                value = String(value).replace(/"/g, '""');
                return `="${value}"`;
            }).join(",")
        );

        const csvContent = [headers.join(","), ...rows].join("\r\n");
        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "apn-report.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    const exportToXLSX = () => {
        const headers = headCells.map(h => h.label);
        const rows = data.map(row =>
            headCells.map(h => row[h.id] !== undefined && row[h.id] !== null ? row[h.id] : "")
        );

        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        const columnWidths = headCells.map((h) => {
            const maxLength = Math.max(
                h.label.length,
                ...data.map(row => String(row[h.id] ?? '').length)
            );
            return { wch: Math.min(maxLength + 2, 30) };
        });
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "APN Report");
        XLSX.writeFile(workbook, "apn-report.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("APN Report", 14, 10);
        autoTable(doc, {
            startY: 20,
            head: [headCells.map((h) => h.label)],
            body: data.map((r) => headCells.map((h) => r[h.id] ?? '')),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [30, 60, 120], textColor: 255 },
        });
        doc.save("apn-report.pdf");
    };


    const exportToXML = () => {
        const xml =
            '<?xml version="1.0" encoding="UTF-8"?>\n<APNReport>\n' +
            data
                .map(
                    (r) =>
                        `  <Record>\n${headCells
                            .map((h) => {
                                const value = String(r[h.id] ?? '')
                                    .replace(/&/g, '&amp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/"/g, '&quot;')
                                    .replace(/'/g, '&apos;');
                                return `    <${h.id}>${value}</${h.id}>`;
                            })
                            .join("\n")}\n  </Record>`
                )
                .join("\n") +
            "\n</APNReport>";

        const blob = new Blob([xml], { type: "application/xml;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "apn-report.xml";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ width: "100%", backgroundColor: "#f9fafc", p: 3, borderRadius: 3 }}>
            <Box sx={{ mb: 3 }}>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 bg-[#0c0b4d] text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-[#15136e] transition-all duration-200 font-medium"
                >
                    <ArrowBack /> Back
                </button>
            </Box>

            <Paper sx={{ width: "100%", borderRadius: 3, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    exportToCSV={exportToCSV}
                    exportToXLSX={exportToXLSX}
                    exportToPDF={exportToPDF}
                    exportToXML={exportToXML}
                    onShowChart={() => setShowChartModal(true)}
                />

                <TableContainer>
                    <Table
                        size={dense ? "small" : "medium"}
                        sx={{
                            "& tbody tr:hover": { backgroundColor: "#eef4ff" },
                            "& tbody td": { color: "#1a237e", fontSize: 14 },
                        }}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={data.length}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const isItemSelected = selected.includes(row.mobileNumber);
                                return (
                                    <TableRow
                                        hover
                                        onClick={(e) => handleClick(e, row.mobileNumber)}
                                        key={row.mobileNumber}
                                        selected={isItemSelected}
                                        sx={{
                                            backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                                            transition: "background-color 0.2s ease",
                                        }}
                                    >
                                        {headCells.map((h) => (
                                            <TableCell key={h.id} align={h.numeric ? "right" : "left"}>
                                                {row[h.id]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />

                <FormControlLabel
                    sx={{ mt: 2, ml: 2, mb: 2 }}
                    control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} />}
                    label="Compact Table Mode"
                />
            </Paper>
            {showChartModal &&
                <BarChartModal
                    dataset={dataset} onClose={() => setShowChartModal(false)}
                />}
        </Box>
    );
}
