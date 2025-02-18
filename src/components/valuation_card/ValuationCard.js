import styles from "./ValuationCard.module.scss";

const ValuationCard = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["valuation-card__empty"]}>No data available.</p>
    );
  }

  return (
    <div className={styles["valuation-card"]}>
      {data.map((valuation, index) => (
        <div key={index} className={styles["valuation-card__item"]}>
          <div className={styles["valuation-card__header"]}>
            <h2>{valuation.symbol} - Valuation Rating</h2>

            <div className={styles["valuation-card__rating-container"]}>
              <p className={styles["valuation-card__rating"]}>
                <strong>Overall Rating:</strong> {valuation.rating} (
                {valuation.ratingRecommendation})
              </p>
              <p className={styles["valuation-card__date"]}>
                <strong>Date:</strong> {valuation.date}
              </p>{" "}
            </div>
          </div>

          <div className={styles["valuation-card__grid"]}>
            <div>
              <h3>DCF (Discounted Cash Flow)</h3>
              <p>
                <strong>Score:</strong> {valuation.ratingDetailsDCFScore}
              </p>
              <p>
                <strong>Recommendation:</strong>{" "}
                {valuation.ratingDetailsDCFRecommendation}
              </p>
            </div>

            <div>
              <h3>ROE (Return on Equity)</h3>
              <p>
                <strong>Score:</strong> {valuation.ratingDetailsROEScore}
              </p>
              <p>
                <strong>Recommendation:</strong>{" "}
                {valuation.ratingDetailsROERecommendation}
              </p>
            </div>

            <div>
              <h3>ROA (Return on Assets)</h3>
              <p>
                <strong>Score:</strong> {valuation.ratingDetailsROAScore}
              </p>
              <p>
                <strong>Recommendation:</strong>{" "}
                {valuation.ratingDetailsROARecommendation}
              </p>
            </div>

            <div>
              <h3>Debt-to-Equity (D/E)</h3>
              <p>
                <strong>Score:</strong> {valuation.ratingDetailsDEScore}
              </p>
              <p>
                <strong>Recommendation:</strong>{" "}
                {valuation.ratingDetailsDERecommendation}
              </p>
            </div>

            <div>
              <h3>P/E Ratio</h3>
              <p>
                <strong>Score:</strong> {valuation.ratingDetailsPEScore}
              </p>
              <p>
                <strong>Recommendation:</strong>{" "}
                {valuation.ratingDetailsPERecommendation}
              </p>
            </div>

            <div>
              <h3>P/B Ratio</h3>
              <p>
                <strong>Score:</strong> {valuation.ratingDetailsPBScore}
              </p>
              <p>
                <strong>Recommendation:</strong>{" "}
                {valuation.ratingDetailsPBRecommendation}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ValuationCard;
