import styles from "./CompanyInfoCard.module.scss";

const CompanyInfoCard = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["company-info-card__empty"]}>No data available.</p>
    );
  }

  // Ensure data is always an array
  const companies = Array.isArray(data) ? data : [data];

  return (
    <div className={styles["company-info-card__container"]}>
      {companies.map((company, index) => (
        <div key={index} className={styles["company-info-card"]}>
          <div className={styles["company-info-card__header"]}>
            {company.image && (
              <img
                src={company.image}
                alt={company.companyName || "Company Logo"}
                className={styles["company-info-card__logo"]}
              />
            )}
            <div>
              {company.companyName && (
                <h2 className={styles["company-info-card__title"]}>
                  {company.companyName}
                </h2>
              )}
              {company.symbol && (
                <p className={styles["company-info-card__symbol"]}>
                  ({company.symbol})
                </p>
              )}
              {company.industry && (
                <p className={styles["company-info-card__industry"]}>
                  {company.industry}
                </p>
              )}
            </div>
          </div>

          <div className={styles["company-info-card__content"]}>
            {company.ceo && (
              <p>
                <strong>CEO:</strong> {company.ceo}
              </p>
            )}
            {company.sector && (
              <p>
                <strong>Sector:</strong> {company.sector}
              </p>
            )}
            {company.exchange && (
              <p>
                <strong>Exchange:</strong> {company.exchange}
                {company.exchangeShortName && ` (${company.exchangeShortName})`}
              </p>
            )}
            {company.mktCap && (
              <p>
                <strong>Market Cap:</strong> ${company.mktCap.toLocaleString()}
              </p>
            )}
            {company.price && company.currency && (
              <p>
                <strong>Stock Price:</strong> ${company.price}{" "}
                {company.currency}
              </p>
            )}
            {company.range && (
              <p>
                <strong>52-Week Range:</strong> {company.range}
              </p>
            )}
            {company.fullTimeEmployees && (
              <p>
                <strong>Employees:</strong> {company.fullTimeEmployees}
              </p>
            )}
            {company.phone && (
              <p>
                <strong>Phone:</strong> {company.phone}
              </p>
            )}
            {company.website && (
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {company.website}
                </a>
              </p>
            )}
          </div>

          {company.description && (
            <div className={styles["company-info-card__description"]}>
              <h3>Company Description</h3>
              <p>{company.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CompanyInfoCard;
