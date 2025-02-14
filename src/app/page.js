// pages
import ChatPage from "./chat/page";

// styles
import styles from "./page.module.scss";

export default function App() {
  return (
    <div className={styles.container}>
      <ChatPage />
    </div>
  );
}
