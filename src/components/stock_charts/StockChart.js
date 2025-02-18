import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./StockChart.module.scss";

const StockChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["stock-chart__empty"]}>No stock data available.</p>
    );
  }

  // Format date for better readability
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <div className={styles["stock-chart"]}>
      <h2 className={styles["stock-chart__title"]}>Stock Price Chart</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="open"
            stroke="#3498db"
            name="Open Price"
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#e74c3c"
            name="Close Price"
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke="#2ecc71"
            name="High Price"
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="#f39c12"
            name="Low Price"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
