import styles from "./StockListCard.module.scss";

const StockListCard = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["stock-list-card__empty"]}>No stocks available.</p>
    );
  }

  return (
    <div className={styles["stock-list-card"]}>
      {data.map((stock, index) => (
        <div key={index} className={styles["stock-list-card__item"]}>
          <div>
            <h2 className={styles["stock-list-card__symbol"]}>
              {stock.symbol}
            </h2>
            <p className={styles["stock-list-card__name"]}>{stock.name}</p>
          </div>
          <div>
            <p className={styles["stock-list-card__exchange"]}>
              {stock.exchange} ({stock.exchangeShortName})
            </p>
            <p className={styles["stock-list-card__price"]}>${stock.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockListCard;
