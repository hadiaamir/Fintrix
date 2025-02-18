import styles from "./EarningTranscript.module.scss";

const EarningTranscript = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className={styles["summary-card__empty"]}>No data available.</p>;
  }

  // Check if data contains nested arrays
  const isNestedArray = Array.isArray(data[0]);

  // Flatten only if it's an array of arrays
  const flattenedData = isNestedArray ? data.flat() : data;

  return (
    <div className={styles["summary-card"]}>
      <h2 className={styles["summary-card__title"]}>
        {flattenedData[0]?.prompt}
      </h2>
      <p className={styles["summary-card__answer"]}>
        {flattenedData[0]?.shortAnswer}
      </p>

      <div className={styles["summary-card__content"]}>
        {flattenedData.map((item, index) => (
          <div key={index} className={styles["summary-card__item"]}>
            <h3 className={styles["summary-card__item-title"]}>
              {item.symbol} - Q{item.quarter} {item.year}
            </h3>
            <p className={styles["summary-card__item-date"]}>{item.date}</p>
            <p className={styles["summary-card__item-content"]}>
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningTranscript;
