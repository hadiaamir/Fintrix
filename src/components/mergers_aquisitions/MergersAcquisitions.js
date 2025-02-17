import React from "react";
import styles from "./MergersAcquisitions.module.scss";

const MergersAcquisitions = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className={styles["mna__empty"]}>No M&A data available.</p>;
  }

  return (
    <div className={styles["mna"]}>
      <h2 className={styles["mna__title"]}>Mergers & Acquisitions</h2>
      <div className={styles["mna__list"]}>
        {data.map((item, index) => (
          <div key={index} className={styles["mna__item"]}>
            <div className={styles["mna__header"]}>
              <h3 className={styles["mna__company"]}>{item.companyName}</h3>
              <span className={styles["mna__symbol"]}>({item.symbol})</span>
            </div>

            <div className={styles["mna__details"]}>
              {item.targetedCompanyName && (
                <p>
                  <strong>Target Company:</strong> {item.targetedCompanyName}{" "}
                  {item.targetedSymbol && `(${item.targetedSymbol})`}
                </p>
              )}

              {item.transactionDate && (
                <p>
                  <strong>Transaction Date:</strong> {item.transactionDate}
                </p>
              )}

              {item.acceptanceTime && (
                <p>
                  <strong>Acceptance Time:</strong> {item.acceptanceTime}
                </p>
              )}

              {item.url && (
                <p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles["mna__link"]}
                  >
                    View Filing
                  </a>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MergersAcquisitions;
