"use client";
import { useState } from "react";
import ChatInput from "../chat_input/ChatInput";
import styles from "./ChatWindow.module.scss";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);

  const handleSend = (message) => {
    console.log("message", message);

    setMessages([
      ...messages,
      { id: messages.length + 1, text: message, sender: "user" },
    ]);

    // Simulate bot response (replace with API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: "I'm still learning!", sender: "bot" },
      ]);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      {!(messages && messages.length > 0) && (
        <div className={styles.greeting}>
          <div className={styles.greeting_title}>How can I help today?</div>
          <div className={styles.greeting_subtitle}>
            Ask me anything about financial data, stock insights, and market
            trends. I'll provide real-time answers to help you make informed
            decisions.
          </div>
        </div>
      )}

      <div className={styles.messsages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender === "user" ? styles.userMessage : styles.botMessage
            }
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
