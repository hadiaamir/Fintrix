import React from "react";
import styles from "./TechnicalIndicator.module.scss";

const TechnicalIndicator = ({ data }) => {
  return (
    <div className={styles["technical-indicator"]}>
      <h2 className={styles["technical-indicator__title"]}>
        Technical Indicator Overview
      </h2>
      <table className={styles["technical-indicator__table"]}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Close</th>
            <th>Volume</th>
            <th>SMA</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.open}</td>
              <td>{item.high}</td>
              <td>{item.low}</td>
              <td>{item.close}</td>
              <td>{item.volume}</td>
              <td>{item.sma}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TechnicalIndicator;
