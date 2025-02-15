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

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);

  const [responseData, setReponseData] = useState(null);

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

        console.log("response", response);

        setReponseData(response);
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
          <h1>Company Financial Overview</h1>
          <SummaryCard summaryData={responseData} />
        </div>
      )}

      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;
