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
  "What has Airbnb management said about profitability over the last few earnings calls?",
  "What are Mark Zuckerberg's and Satya Nadella's recent comments about AI?",
  "How many new large deals did ServiceNow sign in the last quarter?",
  "Summarize Tesla's latest conference call.",
  "What has Amazon's management said about profitability over the last few earnings calls?",
  "What are Tim Cook's and Sundar Pichai's recent comments about AI?",
  "How many new large deals did Salesforce sign in the last quarter?",
  "Summarize Microsoft’s most recent earnings call.",
  "What has Netflix management said about subscriber growth in the last few earnings calls?",
  "What are Elon Musk's and Jeff Bezos' views on space exploration?",
  "How did Adobe perform in terms of new customer acquisition last quarter?",
  "What has Meta's management said about their investments in virtual reality?",
  "How many new partnerships did Shopify sign in the last quarter?",
];

const prompts2 = [
  "Summarize Apple's latest conference call.",
  "What has Google management said about profitability over the last few earnings calls?",
  "What are Satya Nadella's and Sundar Pichai's recent comments about AI?",
  "How many new large deals did Oracle sign in the last quarter?",
  "Summarize Adobe's most recent earnings call.",
  "What has Zoom management said about profitability in the last few earnings calls?",
  "What are Jack Dorsey's and Parag Agrawal's recent comments about AI?",
  "How many new large deals did Slack sign in the last quarter?",
  "Summarize Intel’s latest earnings call.",
  "What has Nvidia management said about profitability over the last few earnings calls?",
  "What are Bill Gates' and Satya Nadella's thoughts on AI advancements?",
  "How did Spotify perform in terms of new subscriber growth last quarter?",
  "What has Uber's management said about future profitability?",
  "How many new partnerships did Pinterest sign in the last quarter?",
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
