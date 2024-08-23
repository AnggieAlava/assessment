import { StoreContext } from "@store/StoreProvider";
import { useContext, useRef } from "react";
import { thumbUpIconPath } from "src/common/components/paths/thumbup";
import { thumbDownIconPath } from "src/common/components/paths/thumbdown";
import IconBase from "src/common/components/icons/IconBase";
import Spinner from "./Spinner";
import styles from "@styles/Home.module.css";

export const Answer = () => {
  const [store, dispatch] = useContext(StoreContext);

  return (
    <div className={styles.Answer_Change}>
      <h2 className={styles.quiz_title}>{store.selectedAnswer}</h2>

      <div className={styles.thumb_answer}>
        {store.correct ?
          <IconBase
            viewBox="0 0 96 95"
            width={95}
            height={95}
          >
            {thumbUpIconPath}
          </IconBase>
          :
          <IconBase viewBox="0 0 96 95" width={95} height={95}>{thumbDownIconPath}</IconBase>
        }
      </div>

      <Spinner/>

      <style jsx>
        {`
          transition: linear 0.5s;
          background-color: ${store.correct === true ? "#45a755" : "#A74545"};
          
        `}
      </style>
    </div>
  );
};

export default Answer;
