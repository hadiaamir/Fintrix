"use client";
// libraries
import { useState } from "react";
import http from "@/utils/api";
// components
import ChatInput from "../chat_input/ChatInput";
// styles
import ChatWindowStyles from "./ChatWindow.module.scss";
import clsx from "clsx";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);

  const handleSend = async (message) => {
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
    };

    setMessages([...messages, newMessage]);

    try {
      const response = await http.post("/chat", { message });

      console.log("Response from server:", response.data);
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response ? error.response.data : error.message
      );
    }

    //  Simulate bot response (replace with API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Hi, Hadi how are you doing?",
          sender: "bot",
        },
      ]);
    }, 1000);
  };

  // const handleSend = async (message) => {
  //   console.log("message", message);

  //   const response = await fetch("http://localhost:3000/api/chat", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ message }),
  //   });

  //   console.log("RESPONSE", response);

  // setMessages([
  //   ...messages,
  //   { id: messages.length + 1, text: message, sender: "user" },
  // ]);

  // Simulate bot response (replace with API call)
  // setTimeout(() => {
  //   setMessages((prev) => [
  //     ...prev,
  //     { id: prev.length + 1, text: "I'm still learning!", sender: "bot" },
  //   ]);
  // }, 1000);
  // };

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
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;
