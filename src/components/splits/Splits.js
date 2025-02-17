import React from "react";
import styles from "./Splits.module.scss";

const Splits = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className={styles["splits__empty"]}>No split data available.</p>;
  }

  return (
    <div className={styles.splits}>
      <h2 className={styles["splits__title"]}>Stock Splits</h2>
      <div className={styles["splits__list"]}>
        {data.map((split, index) => (
          <div key={index} className={styles["splits__item"]}>
            <div className={styles["splits__header"]}>
              <span className={styles["splits__date"]}>{split.date}</span>
              <span className={styles["splits__label"]}>{split.label}</span>
            </div>
            <div className={styles["splits__details"]}>
              <p>
                <strong>Symbol:</strong> {split.symbol}
              </p>
              <p>
                <strong>Split Ratio:</strong> {split.numerator}:
                {split.denominator}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Splits;
