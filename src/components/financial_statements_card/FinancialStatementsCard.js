import React from "react";
import styles from "./FinancialStatementsCard.module.scss"; // Import SCSS module

const FinancialStatementsCard = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className={styles["item--no-data"]}>No data available.</div>;
  }

  return (
    <div className={styles.card}>
      {data.map((statement, index) => (
        <div key={index} className={styles["container"]}>
          <div className={styles["header"]}>
            <h2 className={styles["header__title"]}>
              {statement.symbol} - {statement.calendarYear} ({statement.period})
            </h2>
            <p className={styles["header__info"]}>
              Reported Currency: {statement.reportedCurrency}
            </p>
          </div>

          <div className={styles["table"]}>
            <table>
              <thead>
                <tr>
                  <th className={styles["table__header-label"]}>Metric</th>
                  <th className={styles["table__header-label"]}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      Revenue:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    ${statement.revenue.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      Gross Profit:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    ${statement.grossProfit.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      Operating Income:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    ${statement.operatingIncome.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      Net Income:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    ${statement.netIncome.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      EPS:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    {statement.eps.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      EBITDA:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    ${statement.ebitda.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      Cost of Revenue:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    ${statement.costOfRevenue.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      Operating Expenses:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    ${statement.operatingExpenses.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      Income Before Tax:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    ${statement.incomeBeforeTax.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      Income Tax Expense:
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    ${statement.incomeTaxExpense.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className={styles["table-cell"]}>
                    <strong className={styles["table-cell__strong"]}>
                      Weighted Avg Shares (Diluted):
                    </strong>
                  </td>
                  <td className={styles["table-cell"]}>
                    {statement.weightedAverageShsOutDil.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles["links"]}>
            <a
              className={styles["links__link"]}
              href={statement.finalLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Full Report
            </a>
            <a
              className={styles["links__link"]}
              href={statement.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              SEC Filing
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinancialStatementsCard;
