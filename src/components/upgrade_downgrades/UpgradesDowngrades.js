import React from "react";
import styles from "./UpgradesDowngrades.module.scss";

const UpgradesDowngrades = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["upgrades-downgrades__empty"]}>
        No upgrades or downgrades available.
      </p>
    );
  }

  return (
    <div className={styles["upgrades-downgrades"]}>
      <h2 className={styles["upgrades-downgrades__title"]}>
        Upgrades & Downgrades
      </h2>

      <div className={styles["upgrades-downgrades__list"]}>
        {data.map((item, index) => (
          <div key={index} className={styles["upgrades-downgrades__item"]}>
            <h3 className={styles["upgrades-downgrades__company"]}>
              {item.newsTitle}
            </h3>
            <div className={styles["upgrades-downgrades__header"]}>
              <p className={styles["upgrades-downgrades__date"]}>
                {new Date(item.publishedDate).toLocaleDateString()}
              </p>
            </div>

            <p className={styles["upgrades-downgrades__detail"]}>
              <strong>Symbol:</strong> {item.symbol}
            </p>
            <p className={styles["upgrades-downgrades__detail"]}>
              <strong>New Grade:</strong> {item.newGrade}
            </p>
            <p className={styles["upgrades-downgrades__detail"]}>
              <strong>Previous Grade:</strong> {item.previousGrade}
            </p>
            <p className={styles["upgrades-downgrades__detail"]}>
              <strong>Action:</strong> {item.action.toUpperCase()}
            </p>
            <p className={styles["upgrades-downgrades__detail"]}>
              <strong>Price When Posted:</strong> $
              {item.priceWhenPosted.toFixed(2)}
            </p>

            <p className={styles["upgrades-downgrades__source"]}>
              Source: <strong>{item.newsPublisher}</strong>
            </p>

            <a
              href={item.newsURL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles["upgrades-downgrades__link"]}
            >
              Read More
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpgradesDowngrades;
