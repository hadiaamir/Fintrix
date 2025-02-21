import { marked } from "marked";
import SummaryStyles from "./Summary.module.scss";

const Summary = ({ data }) => {
  // Convert markdown to HTML
  const formattedResponse = marked(data);

  return (
    <div className={SummaryStyles["summary"]}>
      <div className={SummaryStyles["summary__title"]}>Summary</div>
      <hr />
      <div
        className={SummaryStyles["summary__content"]}
        dangerouslySetInnerHTML={{ __html: formattedResponse }}
      />
    </div>
  );
};

export default Summary;
