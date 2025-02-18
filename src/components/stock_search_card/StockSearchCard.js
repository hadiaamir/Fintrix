import styles from "./StockSearchCard.module.scss";

const StockSearchCard = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["stock-search-card__empty"]}>No results found.</p>
    );
  }

  return (
    <div className={styles["stock-search-card"]}>
      {data.map((stock, index) => (
        <div key={index} className={styles["stock-search-card__item"]}>
          <h3 className={styles["stock-search-card__symbol"]}>
            {stock.symbol}
          </h3>
          <p className={styles["stock-search-card__name"]}>{stock.name}</p>
          <p className={styles["stock-search-card__exchange"]}>
            {stock.stockExchange} ({stock.exchangeShortName})
          </p>
          <p className={styles["stock-search-card__currency"]}>
            Currency: {stock.currency}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StockSearchCard;
