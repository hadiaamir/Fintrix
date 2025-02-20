"use client";
// libraries
import { useEffect, useState } from "react";
import http from "@/utils/http";
import clsx from "clsx";
// components
import ChatInput from "../chat_input/ChatInput";
// styles
import ChatWindowStyles from "./ChatWindow.module.scss";

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
import Splits from "@/components/splits/Splits";
import IPOCalendar from "@/components/ipo_calendar/IPOCalender";
import MergersAcquisitions from "@/components/mergers_aquisitions/MergersAcquisitions";
import StockChart from "@/components/stock_charts/StockChart";
import TechnicalIndicator from "@/components/technical_indicator/TechnicalIndicator";
import SlidingPrompts from "@/components/sliding_prompts/SlidingPrompts";
import Spinner from "@/components/spinner/Spinner";
import EarningTranscript from "@/components/earnings_transcript/EarningTranscript";
import Summary from "@/components/summary/Summary";

const prompts1 = [
  "Summarize Spotify's latest conference call.",
  "What are Mark Zuckerberg's and Satya Nadella's recent comments about AI?",
  "Compare the revenue growth between Amazon and Microsoft over the past year.",
  "What is the P/E ratio for Tesla as of the latest earnings report?",
  "Summarize the executive statements made by Microsoft during their earnings call.",
  "What guidance did Amazon provide for the next quarter?",
  "What has been the trend in Apple's gross profit margin over the last 3 years?",
  "Can you show Tesla’s quarterly earnings growth over the past year?",
  "What were the key highlights from Apple's Q4 2024 management commentary?",
  "Can you summarize the CEO's outlook on growth for Tesla?",
  "How does Tesla’s current market cap compare to that of Apple?",
  "What’s the operating income for Google in the most recent fiscal year?",
];

const prompts2 = [
  "How many new large deals did ServiceNow sign in the last quarter?",
  "What has Airbnb management said about profitability over the last few earnings calls?",
  "Can you provide a summary of the latest earnings call for Tesla?",
  "What are the major takeaways from Amazon’s most recent transcript?",
  "How much revenue did Apple generate in Q4 2024?",
  "What are Google's expectations for capital expenditures in the coming year?",
  "What are the recent trends in revenue for Microsoft over the last 5 quarters?",
  "Can you show me the free cash flow for Amazon from their last earnings report?",
  "What are the differences in operating margins between Google and Microsoft?",
  "What is the current debt-to-equity ratio of Microsoft?",
  "Give me the transcript summary of Google’s latest quarterly results.",
  "What’s the operating income for Google in the most recent fiscal year?",
];

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);

  const [responseData, setReponseData] = useState(null);
  const [dataType, setDataType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const [summarizedResposne, setSummarizedPrompt] = useState("");

  const handleSend = async (message) => {
    setLoading(true);
    setCurrentPrompt(message);
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

      console.log("response", response);

      if (!response) throw new Error(data.error || "Something went wrong");

      // if the response is succesful
      if (response) {
        console.log("response.key", response.key);

        if (response.data.length > 0) {
          setSummarizedPrompt(response.summary);
          setReponseData(response.data);
          setDataType(response.key);
        } else {
          resetComponent();
        }

        setLoading(false);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to fetch response. Please try again.");
    }
  };

  // const summarizeContent = async (objectsArray) => {
  //   try {
  //     const response = await http.post("/summarize", { objectsArray });

  //     setSummarizedPrompt(response.summary);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  const resetComponent = () => {
    setReponseData(null);
    setLoading(false);
    setCurrentPrompt("");
  };

  useEffect(() => {
    return () => {
      resetComponent();
    };
  }, []);

  return (
    <div
      className={clsx(
        ChatWindowStyles["container"],
        responseData && ChatWindowStyles["container--wide"]
      )}
    >
      <div className={ChatWindowStyles["greeting"]}>
        <img
          className={ChatWindowStyles["logo"]}
          src="/fintrix-logo.svg" // Path relative to the public folder
          alt="Fintrix Logo"
          width={100}
          height={100}
        />
        {!loading && (
          <div className={ChatWindowStyles["current-prompt"]}>
            {currentPrompt}
          </div>
        )}

        {!loading && !responseData && (
          <>
            <div className={ChatWindowStyles["greeting__title"]}>
              How can I help today?
            </div>
            <div className={ChatWindowStyles["greeting__subtitle"]}>
              Ask me anything about financial data, stock insights, and market
              trends. I'll provide real-time answers to help you make informed
              decisions.
            </div>
          </>
        )}
      </div>

      {/* prompt suggestions */}
      {!loading && !responseData && (
        <>
          <SlidingPrompts
            direction="left"
            prompts={prompts1}
            triggerPrompt={handleSend}
          />
          <SlidingPrompts
            direction="right"
            prompts={prompts2}
            triggerPrompt={handleSend}
          />
        </>
      )}

      {loading && (
        <div className={ChatWindowStyles["spinner-container"]}>
          <Spinner />

          <div
            className={ChatWindowStyles["spinner-container__current-prompt"]}
          >
            {currentPrompt}
          </div>
        </div>
      )}

      {/* RESPONSE SECTION */}
      {!loading && responseData && (
        <div className={ChatWindowStyles["response-section"]}>
          {/* <h1>Company Financial Overview</h1> */}

          {summarizedResposne && <Summary data={summarizedResposne} />}

          <div>
            <div className={ChatWindowStyles["detailed-header"]}>
              <div className={ChatWindowStyles["detailed-header__title"]}>
                Detailed
              </div>
              <hr></hr>
            </div>
            <div className={ChatWindowStyles["detailed-response"]}>
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
              {dataType === "Price Targets" && (
                <PriceTargets data={responseData} />
              )}
              {dataType === "Valuation" && (
                <ValuationCard data={responseData} />
              )}
              {dataType === "Stock List" && (
                <StockListCard data={responseData} />
              )}
              {dataType === "Quote" && <StockQuoteCard data={responseData} />}
              {dataType === "SEC Filings" && <SecFilings data={responseData} />}
              {dataType === "Earnings Transcripts" && (
                <>
                  <EarningTranscript data={responseData} />
                </>
              )}
              {dataType === "Earnings" && <Earnings data={responseData} />}
              {dataType === "News" && <NewsCard data={responseData} />}
              {dataType === "Dividends" && <Dividends data={responseData} />}
              {dataType === "Splits" && <Splits data={responseData} />}
              {dataType === "IPO Calendar" && (
                <IPOCalendar data={responseData} />
              )}
              {dataType === "Mergers & Acquisitions" && (
                <MergersAcquisitions data={responseData} />
              )}
              {dataType === "Charts" && <StockChart data={responseData} />}
              {dataType === "Technical Indicators" && (
                <TechnicalIndicator data={responseData} />
              )}
            </div>
          </div>

          <div className={ChatWindowStyles["common-q"]}>
            <div className={ChatWindowStyles["detailed-header"]}>
              <div className={ChatWindowStyles["detailed-header__title"]}>
                Common Questions
              </div>
              <hr></hr>
            </div>
            <SlidingPrompts
              direction="left"
              prompts={prompts1}
              triggerPrompt={handleSend}
            />
            <SlidingPrompts
              direction="right"
              prompts={prompts2}
              triggerPrompt={handleSend}
            />
          </div>
        </div>
      )}

      {!loading && <ChatInput onSend={handleSend} />}
    </div>
  );
};

export default ChatWindow;
