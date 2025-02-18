import React from "react";
import styles from "./Earnings.module.scss";

const Earnings = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["earnings__empty"]}>No earnings data available.</p>
    );
  }

  return (
    <div className={styles["earnings"]}>
      <h2 className={styles["earnings__title"]}>Earnings Reports</h2>

      <div className={styles["earnings__list"]}>
        {data.map((item, index) => (
          <div key={index} className={styles["earnings__item"]}>
            <div className={styles["earnings__header"]}>
              <h3 className={styles["earnings__symbol"]}>{item.symbol}</h3>
              <p className={styles["earnings__date"]}>
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>

            <p className={styles["earnings__detail"]}>
              <strong>Time:</strong> {item.time.toUpperCase()}
            </p>
            <p className={styles["earnings__detail"]}>
              <strong>EPS:</strong>{" "}
              {item.eps !== null ? `$${item.eps.toFixed(2)}` : "N/A"}
            </p>
            <p className={styles["earnings__detail"]}>
              <strong>EPS Estimate:</strong>{" "}
              {item.epsEstimated !== null
                ? `$${item.epsEstimated.toFixed(2)}`
                : "N/A"}
            </p>
            <p className={styles["earnings__detail"]}>
              <strong>Revenue:</strong>{" "}
              {item.revenue !== null
                ? `$${item.revenue.toLocaleString()}`
                : "N/A"}
            </p>
            <p className={styles["earnings__detail"]}>
              <strong>Revenue Estimate:</strong>{" "}
              {item.revenueEstimated !== null
                ? `$${item.revenueEstimated.toLocaleString()}`
                : "N/A"}
            </p>
            <p className={styles["earnings__detail"]}>
              <strong>Fiscal Date Ending:</strong>{" "}
              {new Date(item.fiscalDateEnding).toLocaleDateString()}
            </p>

            <p className={styles["earnings__updated"]}>
              <strong>Updated From:</strong>{" "}
              {new Date(item.updatedFromDate).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Earnings;
