import React from "react";
import styles from "./IPOCalendar.module.scss";

const IPOCalendar = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["ipo-calendar__empty"]}>No IPO data available.</p>
    );
  }

  return (
    <div className={styles["ipo-calendar"]}>
      <h2 className={styles["ipo-calendar__title"]}>Upcoming IPOs</h2>
      <div className={styles["ipo-calendar__list"]}>
        {data.map((ipo, index) => (
          <div key={index} className={styles["ipo-calendar__item"]}>
            <div className={styles["ipo-calendar__header"]}>
              <span className={styles["ipo-calendar__company"]}>
                {ipo.company}
              </span>
              <span className={styles["ipo-calendar__symbol"]}>
                ({ipo.symbol})
              </span>
            </div>
            <div className={styles["ipo-calendar__details"]}>
              <p>
                <strong>Date:</strong> {ipo.date}
              </p>
              <p>
                <strong>Exchange:</strong> {ipo.exchange}
              </p>

              <p>
                <strong>Shares Offered:</strong> {ipo.shares}
              </p>
              <p>
                <strong>Price Range:</strong> {ipo.priceRange}
              </p>
              <p>
                <strong>Market Cap:</strong> ${ipo.marketCap}
              </p>
              <p>
                <strong>Status:</strong> {ipo.actions}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IPOCalendar;
