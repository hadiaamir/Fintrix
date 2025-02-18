import React from "react";
import styles from "./Dividends.module.scss";

const Dividends = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["dividends__empty"]}>No dividend data available.</p>
    );
  }

  return (
    <div className={styles["dividends"]}>
      <h2 className={styles["dividends__title"]}>Dividend History</h2>
      <div className={styles["dividends__list"]}>
        {data.map((item, index) => (
          <div key={index} className={styles["dividends__item"]}>
            <div className={styles["dividends__header"]}>
              <h3>{item.label}</h3>
              <p>{item.date}</p>
            </div>
            <div className={styles["dividends__details"]}>
              <p>
                <strong>Dividend:</strong> ${item.dividend.toFixed(2)}
              </p>
              <p>
                <strong>Adj. Dividend:</strong> ${item.adjDividend.toFixed(2)}
              </p>
              <p>
                <strong>Record Date:</strong> {item.recordDate || "N/A"}
              </p>
              <p>
                <strong>Payment Date:</strong> {item.paymentDate || "N/A"}
              </p>
              <p>
                <strong>Declaration Date:</strong>{" "}
                {item.declarationDate || "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dividends;
