import styles from "./SummaryCard.module.scss";

const NewsCard = ({ news }) => (
  <div className={styles["news__card"]}>
    <h3 className={styles["news__title"]}>Latest News</h3>
    <ul className={styles["news__list"]}>
      {news.articles.map((article, index) => (
        <li key={index} className={styles["news__item"]}>
          <a href={article.link} target="_blank" rel="noopener noreferrer">
            {article.headline}
          </a>
          <span className={styles["news__date"]}>{article.date}</span>
        </li>
      ))}
    </ul>
    <p className={styles["news__summary"]}>{news.summary}</p>
  </div>
);

const CompanyInfoCard = ({ company }) => (
  <div className={styles["company__card"]}>
    <h3 className={styles["company__title"]}>Company Info</h3>
    <p>
      <strong>Name:</strong> {company.name}
    </p>
    <p>
      <strong>Symbol:</strong> {company.symbol}
    </p>
    <p>
      <strong>Industry:</strong> {company.industry}
    </p>
    <p>
      <strong>CEO:</strong> {company.ceo}
    </p>
    <p className={styles["company__summary"]}>{company.summary}</p>
  </div>
);

const EarningsCard = ({ earnings }) => (
  <div className={styles["earnings__card"]}>
    <h3 className={styles["earnings__title"]}>Earnings Transcripts</h3>
    <p className={styles["earnings__summary"]}>{earnings.summary}</p>
  </div>
);

export default function SummaryCard({ summaryData }) {
  return (
    <div className={styles["summary__container"]}>
      {summaryData["latest_news"] && (
        <NewsCard news={summaryData["latest_news"]} />
      )}
      {summaryData["company_info"] && (
        <CompanyInfoCard company={summaryData["company_info"]} />
      )}
      {summaryData["earnings_transcripts"] && (
        <EarningsCard earnings={summaryData["earnings_transcripts"]} />
      )}
    </div>
  );
}
