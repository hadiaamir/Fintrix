import React from "react";
import styles from "./Spinner.module.scss";

const Spinner = () => (
  <div className={styles.spinner}>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
  </div>
);

export default Spinner;
