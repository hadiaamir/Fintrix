import React from "react";
import styles from "./PriceTargets.module.scss";

const PriceTargets = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["price-targets__empty"]}>
        No price target data available.
      </p>
    );
  }

  return (
    <div className={styles["price-targets"]}>
      <h2 className={styles["price-targets__title"]}>Price Target Updates</h2>

      <div className={styles["price-targets__list"]}>
        {data.map((item, index) => (
          <div key={index} className={styles["price-targets__item"]}>
            <h3 className={styles["price-targets__company"]}>
              {item.newsTitle}
            </h3>

            <div className={styles["price-targets__header"]}>
              <p className={styles["price-targets__date"]}>
                {new Date(item.publishedDate).toLocaleDateString()}
              </p>
            </div>

            <p className={styles["price-targets__detail"]}>
              <strong>Analyst:</strong> {item.analystName}
            </p>
            <p className={styles["price-targets__detail"]}>
              <strong>Price Target:</strong> ${item.priceTarget.toFixed(2)}
            </p>
            <p className={styles["price-targets__detail"]}>
              <strong>Adj. Price Target:</strong> $
              {item.adjPriceTarget.toFixed(2)}
            </p>
            <p className={styles["price-targets__detail"]}>
              <strong>Price When Posted:</strong> $
              {item.priceWhenPosted.toFixed(2)}
            </p>

            <p className={styles["price-targets__source"]}>
              Source: <strong>{item.newsPublisher}</strong>
            </p>

            <a
              href={item.newsURL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles["price-targets__link"]}
            >
              Read More
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTargets;
