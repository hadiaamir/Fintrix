"use client";
// libraries
import { useState } from "react";
import http from "@/utils/http";
import clsx from "clsx";
// components
import ChatInput from "../chat_input/ChatInput";
// styles
import ChatWindowStyles from "./ChatWindow.module.scss";
import SummaryCard from "@/components/summary_card/SummaryCard";
import SummaryContainer from "@/components/summary_card/SummaryCard";
import NewsCard from "@/components/news_card/NewsCard";
import CompanyInfoCard from "@/components/company_info_card/CompanyInfoCard";
import StockSearchCard from "@/components/stock_search_card/StockSearchCard";
import StockListCard from "@/components/stock_list_card/StockListCard";
import StockQuoteCard from "@/components/stock_quote_card/StockQuoteCard";
import FinancialStatementsCard from "@/components/financial_statements_card/FinancialStatementsCard";
import StatementAnalysisCard from "@/components/statement_analysis_card/StatementAnalysisCard";
import ValuationCard from "@/components/valuation_card/ValuationCard";
import PriceTargets from "@/components/price_targets/PriceTargets";
import UpgradesDowngrades from "@/components/upgrade_downgrades/UpgradesDowngrades";
import SecFilings from "@/components/sec_filings/SecFilings";
import Earnings from "@/components/earnings/Earnings";
import Dividends from "@/components/dividends/Dividends";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);

  const [responseData, setReponseData] = useState(null);
  const [dataType, setDataType] = useState(null);

  const handleSend = async (message) => {
    // add users new message to the list of messages
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
    };

    setMessages([...messages, newMessage]);

    try {
      // call chat api
      const response = await http.post("/chat", { prompt: message });

      if (!response) throw new Error(data.error || "Something went wrong");

      // if the response is succesful
      if (response) {
        // // update the messages with the AI's response added
        // setMessages((prev) => [
        //   ...prev,
        //   {
        //     id: prev.length + 1,
        //     text: response.data,
        //     sender: "bot",
        //   },
        // ]);

        console.log("response.key", response.key);

        setReponseData(response.data);
        setDataType(response.key);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to fetch response. Please try again.");
    }
  };

  return (
    <div className={ChatWindowStyles["container"]}>
      {!(messages && messages.length > 0) && (
        <div className={ChatWindowStyles["greeting"]}>
          <div className={ChatWindowStyles["greeting__title"]}>
            How can I help today?
          </div>
          <div className={ChatWindowStyles["greeting__subtitle"]}>
            Ask me anything about financial data, stock insights, and market
            trends. I'll provide real-time answers to help you make informed
            decisions.
          </div>
        </div>
      )}

      <div className={ChatWindowStyles["messsages"]}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              ChatWindowStyles["msg"],
              msg.sender === "user"
                ? ChatWindowStyles["msg--user"]
                : ChatWindowStyles["msg--bot"]
            )}
          >
            {msg.text}
          </div>
        ))}
      </div>
      {responseData && (
        <div>
          {/* <h1>Company Financial Overview</h1> */}

          {dataType === "Company Search" && (
            <StockSearchCard data={responseData} />
          )}

          {dataType === "Company Info" && (
            <CompanyInfoCard data={responseData} />
          )}

          {dataType === "Financial Statements" && (
            <FinancialStatementsCard data={responseData} />
          )}

          {dataType === "Statement Analysis" && (
            <StatementAnalysisCard data={responseData} />
          )}

          {dataType === "Upgrades & Downgrades" && (
            <UpgradesDowngrades data={responseData} />
          )}

          {dataType === "Price Targets" && <PriceTargets data={responseData} />}

          {dataType === "Valuation" && <ValuationCard data={responseData} />}

          {dataType === "Stock List" && <StockListCard data={responseData} />}

          {dataType === "Quote" && <StockQuoteCard data={responseData} />}

          {dataType === "SEC Filings" && <SecFilings data={responseData} />}

          {dataType === "Earnings Transcripts" && (
            <SummaryCard data={responseData} />
          )}

          {dataType === "Earnings" && <Earnings data={responseData} />}

          {dataType === "News" && <NewsCard data={responseData} />}

          {dataType === "Dividends" && <Dividends data={responseData} />}
        </div>
      )}

      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;
