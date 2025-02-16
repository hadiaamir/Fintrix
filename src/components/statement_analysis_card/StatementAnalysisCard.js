import styles from "./StatementAnalysisCard.module.scss";

const StatementAnalysisCard = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["statement-analysis__empty"]}>No data available.</p>
    );
  }

  return (
    <div className={styles["statement-analysis"]}>
      {data.map((statement, index) => (
        <div key={index} className={styles["statement-analysis__item"]}>
          <div className={styles["statement-analysis__header"]}>
            <h2>
              {statement.symbol} - {statement.calendarYear} ({statement.period})
            </h2>
          </div>

          <div className={styles["statement-analysis__grid"]}>
            <div>
              <h3>Per Share Data</h3>
              <p>
                <strong>Revenue Per Share:</strong> $
                {statement.revenuePerShare.toFixed(2)}
              </p>
              <p>
                <strong>Net Income Per Share:</strong> $
                {statement.netIncomePerShare.toFixed(2)}
              </p>
              <p>
                <strong>Operating Cash Flow Per Share:</strong> $
                {statement.operatingCashFlowPerShare.toFixed(2)}
              </p>
              <p>
                <strong>Free Cash Flow Per Share:</strong> $
                {statement.freeCashFlowPerShare.toFixed(2)}
              </p>
              <p>
                <strong>Book Value Per Share:</strong> $
                {statement.bookValuePerShare.toFixed(2)}
              </p>
              <p>
                <strong>Tangible Book Value Per Share:</strong> $
                {statement.tangibleBookValuePerShare.toFixed(2)}
              </p>
              <p>
                <strong>Capex Per Share:</strong> $
                {statement.capexPerShare.toFixed(2)}
              </p>
            </div>

            <div>
              <h3>Valuation Ratios</h3>
              <p>
                <strong>P/E Ratio:</strong> {statement.peRatio.toFixed(2)}
              </p>
              <p>
                <strong>Price-to-Sales Ratio:</strong>{" "}
                {statement.priceToSalesRatio.toFixed(2)}
              </p>
              <p>
                <strong>P/B Ratio:</strong> {statement.pbRatio.toFixed(2)}
              </p>
              <p>
                <strong>EV to Sales:</strong> {statement.evToSales.toFixed(2)}
              </p>
              <p>
                <strong>EV to EBITDA:</strong>{" "}
                {statement.enterpriseValueOverEBITDA.toFixed(2)}
              </p>
              <p>
                <strong>Enterprise Value:</strong> $
                {statement.enterpriseValue.toLocaleString()}
              </p>
            </div>

            <div>
              <h3>Profitability & Returns</h3>
              <p>
                <strong>ROIC:</strong> {(statement.roic * 100).toFixed(2)}%
              </p>
              <p>
                <strong>ROE:</strong> {(statement.roe * 100).toFixed(2)}%
              </p>
              <p>
                <strong>Return on Tangible Assets:</strong>{" "}
                {(statement.returnOnTangibleAssets * 100).toFixed(2)}%
              </p>
              <p>
                <strong>Earnings Yield:</strong>{" "}
                {(statement.earningsYield * 100).toFixed(2)}%
              </p>
              <p>
                <strong>Free Cash Flow Yield:</strong>{" "}
                {(statement.freeCashFlowYield * 100).toFixed(2)}%
              </p>
            </div>

            <div>
              <h3>Liquidity & Debt</h3>
              <p>
                <strong>Debt-to-Equity:</strong>{" "}
                {statement.debtToEquity.toFixed(2)}
              </p>
              <p>
                <strong>Debt-to-Assets:</strong>{" "}
                {statement.debtToAssets.toFixed(2)}
              </p>
              <p>
                <strong>Current Ratio:</strong>{" "}
                {statement.currentRatio.toFixed(2)}
              </p>
              <p>
                <strong>Interest Coverage:</strong>{" "}
                {statement.interestCoverage.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatementAnalysisCard;
