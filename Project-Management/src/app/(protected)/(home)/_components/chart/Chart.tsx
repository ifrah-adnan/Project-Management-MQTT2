import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import "./style.css";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

interface ChartProps {
  title: string;
  data: Array<{ name: string; Total: number }>;
  width: number | string;
  height: number | string;
  totalOperations: number;
}

const Chart: React.FC<ChartProps> = ({
  title,
  data,
  width,
  height,
  totalOperations,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const getBarFill = (index: number) => {
    return activeIndex === index ? "#FF6B00" : "#2B2D42";
  };

  const generatePDF = () => {
    const pdf = new jsPDF() as jsPDFWithAutoTable;

    const primaryColor = "#2B2D42";
    const secondaryColor = "#8D99AE";
    const accentColor = "#FF6B00";

    pdf.setFontSize(24);
    pdf.setTextColor(primaryColor);
    pdf.text(title, 20, 20);

    pdf.setFontSize(14);
    pdf.setTextColor(secondaryColor);
    pdf.text(`Total Operations: ${totalOperations}`, 20, 30);

    pdf.setDrawColor(accentColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 35, 190, 35);

    const tableData = data.map((item) => [item.name, item.Total.toString()]);

    pdf.autoTable({
      startY: 45,
      head: [["Name", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: primaryColor, textColor: "#FFFFFF" },
      bodyStyles: { textColor: primaryColor },
      alternateRowStyles: { fillColor: "#EDF2F4" },
      margin: { top: 40 },
    });

    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(secondaryColor);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.width - 30,
        pdf.internal.pageSize.height - 10,
      );
    }

    return pdf;
  };

  const handleDownload = () => {
    const pdf = generatePDF();
    pdf.save("project_info.pdf");
  };

  return (
    <div className="chart industrial-chart" style={{ width, height }}>
      <div className="title industrial-title">{title}</div>
      <div className="total-operations">
        Total Operations: {totalOperations}
      </div>
      <div
        className="chart-container"
        style={{ width: "100%", height: "calc(100% - 80px)" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#8D99AE" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#2B2D42" }}
              axisLine={{ stroke: "#2B2D42" }}
            />
            <YAxis
              tick={{ fill: "#2B2D42" }}
              axisLine={{ stroke: "#2B2D42" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#EDF2F4",
                border: "1px solid #8D99AE",
                borderRadius: "0",
              }}
              cursor={{ fill: "rgba(43, 45, 66, 0.1)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey="Total"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarFill(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Button onClick={handleDownload} className="download-btn industrial-btn">
        Download project information
      </Button>
    </div>
  );
};

export default Chart;
