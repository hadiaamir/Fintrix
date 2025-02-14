"use client"; // Ensures this runs in the browser

import { useRef, useState } from "react";

import styles from "./ChatInput.module.scss";
import { ArrowRight, Send } from "react-feather";

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef(null);

  const handleSend = async () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
      textAreaRef.current.style.height = "40px"; // Reset height

      // CALL THE API
      await fetch("/api/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("Send message:", message);
      setMessage(""); // Clear input
      textAreaRef.current.style.height = "40px"; // Reset height
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);

    // Auto-resize the textarea
    textAreaRef.current.style.height = "40px"; // Reset height
    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
  };

  return (
    <div className={styles.container}>
      <textarea
        ref={textAreaRef}
        className={styles.input}
        placeholder="Type a message..."
        value={message}
        onChange={handleInput}
        onKeyDown={handleKeyPress}
        rows={1}
      />
      <button
        className={styles.button}
        onClick={handleSend}
        disabled={!message.trim()}
      >
        <ArrowRight size={24} color="#000" />
      </button>
    </div>
  );
}
