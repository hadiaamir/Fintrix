// components
import ChatInput from "@/components/chat/chat_input/ChatInput";
import ChatWindow from "@/components/chat/chat_window/ChatWindow";

// styles
import styles from "./ChatPage.module.scss";

const ChatPage = () => {
  return (
    <div className={styles.container}>
      {/* <div className={styles.title}>
        AI-Powered Financial Insights. Smarter Decisions, Faster.
      </div> */}

      <ChatWindow />
    </div>
  );
};

export default ChatPage;
