import React from "react";
import styles from "./SlidingPrompts.module.scss";

const SlidingPrompts = ({ direction = "left", prompts, triggerPrompt }) => {
  return (
    <div className={styles["sliding-buttons"]}>
      <div
        className={`${styles["sliding-buttons__wrapper"]} ${
          direction === "right" ? styles["slide-right"] : styles["slide-left"]
        }`}
      >
        {[...prompts, ...prompts].map((text, index) => (
          <button
            key={index}
            className={styles["sliding-buttons__item"]}
            onClick={() => {
              triggerPrompt(text);
            }}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlidingPrompts;
