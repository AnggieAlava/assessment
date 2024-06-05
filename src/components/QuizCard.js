import { Fragment, useEffect, useState } from "react";
import { StoreContext } from "@store/StoreProvider";
import styles from "@styles/Home.module.css";
import checkBoxStyle from "@styles/multiselect.module.css";
import { useContext } from "react";
import { types } from "@store/reducer";
import Answer from "./Answer"
import { getSession, setSession, destroySession } from "src/store/session";
import { useRouter } from 'next/router'
import { getQueryString, updateQueryStringWithCurrentURLParams } from "src/util";

const QuizCard = ({ onAnswer, onFinish, ...props }) => {
  const [currentTresh, setCurrentTresh] = useState(null);
  const [store, dispatch] = useContext(StoreContext);
  const session = getSession();
  const questions = store.questions
  const currentQuestion = store.currentQuestion
  const router = useRouter()
  const isEmbedded = getQueryString("embedded") === 'true';

  const getRandom = (type) => {
    const index = Math.floor(Math.random() * store.templates[type].length);
    return store.templates[type][index];
  }

  // console.log("CURRENT_QUESTIONS", questions)
  const verifyAnswer = (score) => {
    if (score > 0) {

      dispatch({
        type: types.setGetCorrect,
        payload: true
      })
      dispatch({
        type: types.setScore
      })
      setTimeout(() => {
        dispatch({
          type: types.setGetCorrect,
          payload: false
        })
      }, 1300)
      return getRandom("correct")
    } else {
      return getRandom("incorrect")
    }
  }

  const getResponse = (score) => {
    dispatch({
      type: types.setGetAnswer,
      payload: true
    })
    dispatch({
      type: types.setSelectedAnswer,
      payload: verifyAnswer(score)
    })
    setTimeout(() => {
      dispatch({
        type: types.setGetAnswer,
        payload: false
      })
      dispatch({
        type: types.setMultiAnswerSelection,
        payload: []
      })
      boxesArr.find(i => i.checked === true ? i.checked = false : null)
    }, 1300)
  }

  let boxes = document.getElementsByName("isMultiselect");
  let multiselection = []
  var boxesArr = Array.prototype.slice.call(boxes, 0);
  let checkedBoxes

  const verifyCurrentCheckbox = () => {
    checkedBoxes = boxesArr.filter((checkbox) => {
      return checkbox.checked;
    });

    multiselection = checkedBoxes.map((checkbox) => {
      return parseInt(checkbox.value);
    })
    dispatch({
      type: types.setMultiAnswerSelection,
      payload: multiselection
    })
  }

  const selectAnswer = (option) => {
    onAnswer(option)
    getResponse(option.score)
    if (currentQuestion < questions.length - 1) {
      dispatch({
        type: types.setCurrentQuestion
      })
    } else {
      clearInterval(store.timerRef)
      dispatch({
        type: types.setFinalScore,
        payload: true
      })
    }
  }

  useEffect(() => {
    if (questions.length <= 0) {
      clearInterval(store.timerRef)
      dispatch({
        type: types.setFinalScore,
        payload: true
      })

      if (isEmbedded === false) {
        setTimeout(() => {
          router.push('/')
        }, 5500)
      }
    }
  }, [questions])

  useEffect(() => {
    if(store.showFinalScore){
      onFinish();
    }
    if (store.showFinalScore && store.tresholds.length > 0) {
      let achieved = null;
      store.tresholds.map((tresh) => {
        if (store.score >= tresh.score_threshold) achieved = tresh;
      });

      setCurrentTresh(achieved);
    }
  }, [store.showFinalScore])

  const submitMultiselect = () => {
    let verifyError = store.multiAnswerSelection.find(score => score === 0)

    if (verifyError === 0) {
      return selectAnswer(verifyError)
    } else {
      return selectAnswer(1)
    }
  }

  return (
    <div className={`${styles.container} quiz-card`}>

      {store.getAnswer === true && store.isInstantFeedback ? <Answer /> : null}

      {store.showFinalScore === false && questions.length > 0 ? (
        <>
          <h1 className={styles.quiz_title_card}>
            {questions[currentQuestion].title}
          </h1>

          <div className={styles.quiz_grid}>
            {Array.isArray(questions[currentQuestion].options) && questions[currentQuestion].options.sort((a,b) => a.position > b.position ? 1 : -1).map((option, i) => {
              return (
                <Fragment key={i}  >
                  {questions[currentQuestion].question_type === "SELECT" ? (
                    <button
                      key={option.id}
                      name='isSelect'
                      onClick={() => selectAnswer(option)}
                      className={styles.quiz_card_option}>
                      <h2 className={styles.buttonTextSelector}>
                        {option.title}
                      </h2>
                      {props.debug && <div className={styles.debugScore}>
                          <p className="m-0 p-0">Score: {option.score}</p>
                          <p className="m-0 p-0">Pos: {option.position}</p>
                        </div>}
                    </button>
                  ) : questions[currentQuestion].question_type === "SELECT_MULTIPLE" ? (
                    <>
                      <label className={checkBoxStyle.multiSelect_label} key={option.id}>
                        <input
                          value={option.score}
                          name='isMultiselect'
                          type='checkbox'
                          onChange={() => verifyCurrentCheckbox()}
                          className={checkBoxStyle.buton_input}
                        />
                        <h2 className={checkBoxStyle.button_span} style={{ fontWeight: "normal" }}>
                          {option.title}
                        </h2>
                      </label>
                    </>
                  ) : <p>An error occurred. Please, report to your teacher</p>}
                </Fragment>
              )
            })}
          </div>

          {questions[currentQuestion].question_type === "SELECT_MULTIPLE" ? (
            <>
              {store.multiAnswerSelection.length <= 1 ? (
                <button
                  disabled
                  className={checkBoxStyle.multiSelect_SubmitButton}
                  style={{ textAlign: "center" }}
                >
                  <h2 style={{ fontWeight: "normal" }}>
                    Select 2 or more options
                  </h2>
                </button>
              ) : (
                <button
                  onClick={() => submitMultiselect()}
                  className={checkBoxStyle.multiSelect_SubmitButton}
                  style={{ textAlign: "center" }}
                >
                  <h2 style={{ fontWeight: "normal" }}>
                    Send
                  </h2>
                </button>
              )}

            </>
          ) : null}

        </>
      ) : (
        <>

          {questions.length === 0 && (
            <>
              <span style={{ fontSize: "var(--xxl)", margin: "10rem 10% 20px 10%", textAlign: "center" }}>
                This quizz does not have any questions to answer :c
              </span>
              {isEmbedded === false && (
                <span style={{ fontSize: "var(--m)", fontWeight: "200", margin: "20px 10%", textAlign: "center" }}>
                  Redirecting to home...
                </span>
              )}
            </>
          )}

          {store.showFinalScore === true && questions.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "10rem 0" }}>
              {props.toggleFinalScore && <>
                <span style={{ fontSize: "var(--xxl)", textAlign: "center", margin: "20px 0" }}>
                  {Math.floor(((store.score) / questions.length) * 100)}% accuracy
                </span>
                <span style={{ fontSize: "var(--m)", margin: "20px 0" }}>
                  Your Score: {store.score} / {questions.length}<br />
                </span>
              </>}
              {props.toggleTimer && <span style={{ fontSize: "var(--m)", margin: "20px 0" }}>
                Finished in: {store.timer} Seconds
              </span>}
              {(currentTresh || store.tresholds.length > 0) && (
                <>
                  <div
                    style={{ fontSize: "var(--m)", margin: "20px 0", textAlign: "center" }}
                    dangerouslySetInnerHTML={{ __html: currentTresh?.success_message || store.tresholds[0].fail_message }}
                  />


                  <a 
                    id="continueBtn" 
                    className={styles.continueBtn} 
                    href={updateQueryStringWithCurrentURLParams(
                      currentTresh?.success_next || store.tresholds[0].fail_next, 
                      { leadData: session && session.formData ? btoa(JSON.stringify(session.formData)) : undefined }
                    )} 
                    target="_parent">
                    Continue to Next Step
                  </a>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizCard;
