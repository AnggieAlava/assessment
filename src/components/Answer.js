import { StoreContext } from "@store/StoreProvider";
import styles from "@styles/Home.module.css";
import { useContext, useRef } from "react";

export const Answer = () => {
  const [store, dispatch] = useContext(StoreContext);

  return (
    <div className={styles.Answer_Change}>
      <h2 className={styles.quiz_title}>{store.selectedAnswer}</h2>

      <style jsx>
        {`
          transition: linear 0.5s;
          background-color: ${store.correct ===true ? "#45a755" : "#A74545" };
          
        `}
      </style>
    </div>
  );
};

export default Answer;
