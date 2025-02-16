import React from "react";
import styles from "./SecFilings.module.scss";

const SecFilings = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["sec-filings__empty"]}>No SEC filings available.</p>
    );
  }

  return (
    <div className={styles["sec-filings"]}>
      <h2 className={styles["sec-filings__title"]}>SEC Filings</h2>

      <div className={styles["sec-filings__list"]}>
        {data.map((item, index) => (
          <div key={index} className={styles["sec-filings__item"]}>
            <div className={styles["sec-filings__header"]}>
              <h3 className={styles["sec-filings__symbol"]}>{item.symbol}</h3>
              <p className={styles["sec-filings__date"]}>
                {new Date(item.fillingDate).toLocaleDateString()}
              </p>
            </div>

            <p className={styles["sec-filings__detail"]}>
              <strong>CIK:</strong> {item.cik}
            </p>
            <p className={styles["sec-filings__detail"]}>
              <strong>Type:</strong> {item.type}
            </p>
            <p className={styles["sec-filings__detail"]}>
              <strong>Accepted Date:</strong>{" "}
              {new Date(item.acceptedDate).toLocaleString()}
            </p>

            <div className={styles["sec-filings__links"]}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles["sec-filings__link"]}
              >
                SEC Filing Index
              </a>
              <a
                href={item.finalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles["sec-filings__link"]}
              >
                Full Filing
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecFilings;
