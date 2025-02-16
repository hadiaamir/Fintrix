import styles from "./NewsCard.module.scss";

const NewsCard = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className={styles["news-card__empty"]}>No news available.</p>;
  }

  return (
    <div className={styles["news-card"]}>
      {data.map((news, index) => (
        <div key={index} className={styles["news-card__item"]}>
          <img
            src={news.image}
            alt={news.title}
            className={styles["news-card__image"]}
          />
          <div className={styles["news-card__content"]}>
            <h2 className={styles["news-card__title"]}>
              <a href={news.url} target="_blank" rel="noopener noreferrer">
                {news.title}
              </a>
            </h2>
            <p className={styles["news-card__text"]}>{news.text}</p>
            <div className={styles["news-card__meta"]}>
              <span className={styles["news-card__site"]}>{news.site}</span>
              <span className={styles["news-card__date"]}>
                {new Date(news.publishedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsCard;
