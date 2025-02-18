"use client"; // Ensures this runs in the browser

// libraries
import { useRef, useState } from "react";
import { ArrowRight } from "react-feather";

// styles
import styles from "./ChatInput.module.scss";

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef(null);

  const resetComponent = () => {
    setMessage("");

    // Reset textarea height
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px";
    }
  };

  const handleSend = async () => {
    if (message.trim()) {
      // call handleSend function from prop
      onSend(message);
      resetComponent();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // call handleSend function from prop
      handleSend(message);
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
