import styles from "./FinancialStatementsCard.module.scss";

const FinancialStatementsCard = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles["financial-statements__empty"]}>
        No data available.
      </p>
    );
  }

  return (
    <div className={styles["financial-statements"]}>
      {data.map((statement, index) => (
        <div key={index} className={styles["financial-statements__item"]}>
          <div className={styles["financial-statements__header"]}>
            <h2>
              {statement.symbol} - {statement.calendarYear} ({statement.period})
            </h2>
            <p>Reported Currency: {statement.reportedCurrency}</p>
          </div>

          <table className={styles["financial-statements__table"]}>
            <tbody>
              <tr>
                <td>
                  <strong>Revenue:</strong>
                </td>
                <td>${statement.revenue.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Gross Profit:</strong>
                </td>
                <td>${statement.grossProfit.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Operating Income:</strong>
                </td>
                <td>${statement.operatingIncome.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Net Income:</strong>
                </td>
                <td>${statement.netIncome.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>EPS:</strong>
                </td>
                <td>{statement.eps.toFixed(2)}</td>
              </tr>
              <tr>
                <td>
                  <strong>EBITDA:</strong>
                </td>
                <td>${statement.ebitda.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Cost of Revenue:</strong>
                </td>
                <td>${statement.costOfRevenue.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Operating Expenses:</strong>
                </td>
                <td>${statement.operatingExpenses.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Income Before Tax:</strong>
                </td>
                <td>${statement.incomeBeforeTax.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Income Tax Expense:</strong>
                </td>
                <td>${statement.incomeTaxExpense.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Weighted Avg Shares (Diluted):</strong>
                </td>
                <td>{statement.weightedAverageShsOutDil.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles["financial-statements__links"]}>
            <a
              href={statement.finalLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Full Report
            </a>
            <a href={statement.link} target="_blank" rel="noopener noreferrer">
              SEC Filing
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinancialStatementsCard;
