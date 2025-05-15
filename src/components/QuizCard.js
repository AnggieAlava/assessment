import { useEffect, useState } from "react";
import { StoreContext } from "@store/StoreProvider";
import styles from "@styles/Home.module.css";
import checkBoxStyle from "@styles/multiselect.module.css";
import { useContext } from "react";
import { types } from "@store/reducer";
import Answer from "./Answer";
import { getSession, setSession, destroySession } from "src/store/session";
import { useRouter } from "next/router";
import {
  getQueryString,
  updateQueryStringWithCurrentURLParams,
} from "src/util";
import IconBase from "src/common/components/icons/IconBase";
import CircleProgressBar from "./CircleResultBar";
import { timerIconPath } from "src/common/components/paths/timerIcon";
import QuestionContent from "./QuestionContent";
import PropTypes from 'prop-types'

const QuizCard = ({ onAnswer, onFinish, toggleFinalScore, toggleTimer, debug, slug }) => {
  const [currentTresh, setCurrentTresh] = useState(null);
  const [store, dispatch] = useContext(StoreContext);
  const session = getSession();
  const questions = store.questions;
  const currentQuestion = store.currentQuestion;
  const router = useRouter();
  const isEmbedded = getQueryString("embedded") === "true";

  const isMountSinaiEnglish = session?.formData?.programs === "mount-sinai-english";
  const isEnglish5 = slug === "english-5";

  const getRandom = (type) => {
    const index = Math.floor(Math.random() * store.templates[type].length);
    return store.templates[type][index];
  };

  const verifyAnswer = (score) => {
    if (score > 0) {
      dispatch({
        type: types.setGetCorrect,
        payload: true,
      });
      dispatch({
        type: types.setScore,
      });
      setTimeout(() => {
        dispatch({
          type: types.setGetCorrect,
          payload: false,
        });
      }, 1300);
      return getRandom("correct");
    } else {
      return getRandom("incorrect");
    }
  };

  const getResponse = (score) => {
    dispatch({
      type: types.setGetAnswer,
      payload: true,
    });
    dispatch({
      type: types.setSelectedAnswer,
      payload: verifyAnswer(score),
    });
    setTimeout(() => {
      dispatch({
        type: types.setGetAnswer,
        payload: false,
      });
      dispatch({
        type: types.setMultiAnswerSelection,
        payload: [],
      });
      boxesArr.find((i) => (i.checked === true ? (i.checked = false) : null));
    }, 1300);
  };

  let boxes = document.getElementsByName("isMultiselect");
  let multiselection = [];
  var boxesArr = Array.prototype.slice.call(boxes, 0);
  let checkedBoxes;

  const verifyCurrentCheckbox = () => {
    checkedBoxes = boxesArr.filter((checkbox) => {
      return checkbox.checked;
    });

    multiselection = checkedBoxes.map((checkbox) => {
      return parseInt(checkbox.value);
    });
    dispatch({
      type: types.setMultiAnswerSelection,
      payload: multiselection,
    });
  };

  const selectAnswer = (option) => {
    onAnswer(option);
    getResponse(option.score);
    if (currentQuestion < questions.length - 1) {
      dispatch({
        type: types.setCurrentQuestion,
      });
    } else {
      clearInterval(store.timerRef);
      dispatch({
        type: types.setFinalScore,
        payload: true,
      });
    }
  };

  useEffect(() => {
    if (questions.length <= 0) {
      clearInterval(store.timerRef);
      dispatch({
        type: types.setFinalScore,
        payload: true,
      });

      if (isEmbedded === false) {
        setTimeout(() => {
          router.push("/");
        }, 5500);
      }
    }
  }, [questions]);

  useEffect(() => {
    if (store.showFinalScore) {
      onFinish();
    }
    if (store.tresholds.length > 0) {
      let achieved = null;
      store.tresholds.map((tresh) => {
        if (store.score >= tresh.score_threshold) achieved = tresh;
      });

      setCurrentTresh(achieved);
    }
  }, [store.showFinalScore]);

  const submitMultiselect = () => {
    let verifyError = store.multiAnswerSelection.find((score) => score === 0);

    if (verifyError === 0) {
      return selectAnswer(verifyError);
    } else {
      return selectAnswer(1);
    }
  };

  return (
    <div className='quiz-card'>
      {store.showFinalScore === false && questions.length > 0 ? (
        <>
          {store.getAnswer === true && store.isInstantFeedback ?
            <Answer />
            :
            <>
              <div
                className={styles.quiz_card_top_wrapper}
                style={!toggleTimer ? { justifyContent: 'start' } : { justifyContent: 'space-between' }}>

                <div>
                  <p className='progress'>{currentQuestion}/{questions.length}</p>
                </div>

                <h1 className={styles.quiz_card_title} style={!toggleTimer ? { alignSelf: 'center', flexGrow: '1' } : {}}>
                  {questions[currentQuestion].title}
                  {debug && (
                    <div className={styles.debugScore}>
                      Pos: {questions[currentQuestion].position}
                    </div>
                  )}
                </h1>

                {toggleTimer &&
                  <div>
                    <p className='timer'>
                      <IconBase viewBox='0 0 24 15'>
                        {timerIconPath}
                      </IconBase>
                      {store.timer} sec
                    </p>
                  </div>
                }
              </div>

              <div className={styles.quiz_grid}>
                {Array.isArray(questions[currentQuestion].options) && (
                  <QuestionContent
                    question={questions[currentQuestion]}
                    selectAnswer={selectAnswer}
                    verifyCurrentCheckbox={verifyCurrentCheckbox}
                    debug={debug}
                  />
                )}
              </div>
            </>
          }

          {questions[currentQuestion].question_type === "SELECT_MULTIPLE" ? (
            <>
              {store.multiAnswerSelection.length <= 1 ? (
                <button
                  disabled
                  className={checkBoxStyle.multiSelect_SubmitButton}
                  style={{ textAlign: "center" }}>
                  <h2 style={{ fontWeight: "normal" }}>
                    Select 2 or more options
                  </h2>
                </button>
              ) : (
                <button
                  onClick={() => submitMultiselect()}
                  className={checkBoxStyle.multiSelect_SubmitButton}
                  style={{ textAlign: "center" }}>
                  <h2 style={{ fontWeight: "normal" }}>Send</h2>
                </button>
              )}
            </>
          ) : null}
        </>
      ) : (
        <>
          {questions.length === 0 && (
            <>
              <span
                style={{
                  fontSize: "var(--xxl)",
                  margin: "10rem 10% 20px 10%",
                  textAlign: "center",
                }}>
                This quiz does not have any questions to answer :c
              </span>
              {isEmbedded === false && (
                <span
                  style={{
                    fontSize: "var(--m)",
                    fontWeight: "200",
                    margin: "20px 10%",
                    textAlign: "center",
                  }}>
                  Redirecting to home...
                </span>
              )}
            </>
          )}

          {store.showFinalScore === true && questions.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
              {toggleFinalScore && !isMountSinaiEnglish && (
                <>
                  <p style={{ fontSize: "var(--sm)" }}>Your Score</p>
                  <CircleProgressBar
                    percentage={Math.floor((store.score / questions.length) * 100)}
                    circleWwidth={140}
                    strokeWidth={5}
                    radius={60}
                  />
                  <span style={{ fontSize: "var(--sm)", marginTop: '1.5rem' }}>
                    Accuracy: {store.score} / {questions.length}
                  </span>
                  {toggleTimer && (
                    <span style={{ fontSize: "var(--sm)", marginTop: '10px' }}>
                      Finished in: {store.timer} Seconds
                    </span>
                  )}
                </>
              )}
              {!toggleFinalScore && !toggleTimer && !currentTresh && !isMountSinaiEnglish && (
                <div style={{ textAlign: 'center' }}>
                  <h1>You have reached the end of this assessment. Thank you for your time!</h1>
                </div>
              )}
              {isMountSinaiEnglish ? (
                <div style={{ textAlign: 'center' }}>
                  {isEnglish5 ? (
                    <h1>
                      Thank you for completing the exam. One of our advisors will contact you shortly.
                    </h1>
                  ) : (
                    <h1>
                      You have reached the end of this assessment. Thank you for your time!
                    </h1>
                  )}
                </div>
              ) : (currentTresh || store.tresholds.length > 0) && (
                <>
                  <div
                    style={{
                      fontSize: "var(--m)",
                      margin: "20px 0",
                      textAlign: "center",
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        currentTresh?.success_message ||
                        store.tresholds[0].fail_message,
                    }}
                  />
                  {currentTresh?.success_next ||
                    store.tresholds[0].fail_next ? (
                    <a
                      id="continueBtn"
                      className='quiz_continue_button quiz_button'
                      href={updateQueryStringWithCurrentURLParams(
                        currentTresh?.success_next ||
                        store.tresholds[0].fail_next,
                        {
                          leadData:
                            session && session.formData
                              ? btoa(JSON.stringify(session.formData))
                              : undefined,
                        }
                      )}
                      target="_parent">
                      Continue to Next Step
                    </a>
                  ) : null}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

QuizCard.propTypes = {
  onAnswer: PropTypes.func,
  onFinish: PropTypes.func,
  debug: PropTypes.bool,
  toggleFinalScore: PropTypes.bool,
  toggleTimer: PropTypes.bool,
  slug: PropTypes.string,
};

QuizCard.defaultProps = {
  onAnswer: () => { },
  onFinish: () => { },
  debug: false,
  toggleFinalScore: true,
  toggleTimer: true,
  slug: '',
};

export default QuizCard;
