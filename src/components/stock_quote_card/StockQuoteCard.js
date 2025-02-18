import styles from "./StockQuoteCard.module.scss";

const StockQuoteCard = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className={styles["card__empty"]}>No data available.</p>;
  }

  return (
    <div className={styles["card"]}>
      {data.map((stock, index) => (
        <div key={index} className={styles["card__item"]}>
          <div className={styles["card__header"]}>
            <h2 className={styles["card__title"]}>
              {stock.name} ({stock.symbol})
            </h2>
            {stock.exchange && (
              <p className={styles["card__exchange"]}>{stock.exchange}</p>
            )}
          </div>

          <div className={styles["card__content"]}>
            {stock.price && (
              <p>
                <strong>Price:</strong> ${stock.price.toFixed(2)}
              </p>
            )}
            {stock.change && stock.changesPercentage && (
              <p>
                <strong>Change:</strong> {stock.change.toFixed(2)} (
                {(stock.changesPercentage * 100).toFixed(2)}%)
              </p>
            )}
            {stock.dayLow && stock.dayHigh && (
              <p>
                <strong>Day Low / High:</strong> ${stock.dayLow.toFixed(2)} / $
                {stock.dayHigh.toFixed(2)}
              </p>
            )}
            {stock.yearLow && stock.yearHigh && (
              <p>
                <strong>52-Week Low / High:</strong> ${stock.yearLow.toFixed(2)}{" "}
                / ${stock.yearHigh.toFixed(2)}
              </p>
            )}
            {stock.marketCap && (
              <p>
                <strong>Market Cap:</strong> ${stock.marketCap.toLocaleString()}
              </p>
            )}
            {stock.priceAvg50 && (
              <p>
                <strong>50-Day Avg Price:</strong> $
                {stock.priceAvg50.toFixed(2)}
              </p>
            )}
            {stock.priceAvg200 && (
              <p>
                <strong>200-Day Avg Price:</strong> $
                {stock.priceAvg200.toFixed(2)}
              </p>
            )}
            {stock.volume && (
              <p>
                <strong>Volume:</strong> {stock.volume.toLocaleString()}
              </p>
            )}
            {stock.avgVolume && (
              <p>
                <strong>Avg Volume:</strong> {stock.avgVolume.toLocaleString()}
              </p>
            )}
            {stock.open && (
              <p>
                <strong>Open:</strong> ${stock.open.toFixed(2)}
              </p>
            )}
            {stock.previousClose && (
              <p>
                <strong>Previous Close:</strong> $
                {stock.previousClose.toFixed(2)}
              </p>
            )}
            {stock.eps && (
              <p>
                <strong>EPS:</strong> {stock.eps.toFixed(2)}
              </p>
            )}
            {stock.pe && (
              <p>
                <strong>P/E Ratio:</strong> {stock.pe.toFixed(2)}
              </p>
            )}
            {stock.sharesOutstanding && (
              <p>
                <strong>Shares Outstanding:</strong>{" "}
                {stock.sharesOutstanding.toLocaleString()}
              </p>
            )}
            {stock.earningsAnnouncement && (
              <p>
                <strong>Earnings Announcement:</strong>{" "}
                {new Date(stock.earningsAnnouncement).toLocaleString()}
              </p>
            )}
            {stock.timestamp && (
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(stock.timestamp * 1000).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockQuoteCard;
