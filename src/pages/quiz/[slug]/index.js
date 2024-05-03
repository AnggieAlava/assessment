import { useState, useContext, useEffect, useRef, Fragment } from "react";
import { StoreContext } from "@store/StoreProvider";
import { types } from "@store/reducer";
import { useRouter } from "next/router";
import styles from "@styles/Home.module.css";
import QuizCard from "src/components/QuizCard";
import Styles from "src/components/Styles";
import { getSession, setSession, destroySession } from "../../../store/session";
import LeadForm from "src/components/LeadForm.js";
import Head from "next/head";
import { isWindow } from "src/util";

const updateQueystring = (key, val) => {
  const currentUrl = new URL(window.location);
  const searchParams = currentUrl.searchParams;
  searchParams.set(key, val); // 'newParam' is the query parameter you want to add or modify
  history.pushState({}, '', currentUrl.toString());
}

const QuizSlug = () => {
  const [store, dispatch] = useContext(StoreContext);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(null);
  const [layoutStyles, setLayoutStyles] = useState(null);
  const [toggleTimer, setToggleTimer] = useState(true);
  const [toggleFinalScore, setToggleFinalScore] = useState(true);
  const [userAssessment, setUserAssessment] = useState(null);
  const intervalRef = useRef(null);
  const router = useRouter();
  const { academy, slug, time, score, debug, token=null, ua_token, isAnon=false, campaign, medium, source, email=null, layout } = router.query; // Asegúrate de obtener 'time' del query string

  const createUserAssessment = async (formData=null) => {
    if(isAnon && isAnon != "false") return false;
    try {
      
      let headers = {}
      if(token) headers['Authorization'] = `Token ${token}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/assessment/user/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          academy,
          assessment: quiz.id,
          owner_email: formData?.email,
          conversion_info: { campaign, source, medium, ...formData },
        })
      });
  
      if(response.status == 401) setLoading({ "message": "Missing or invalid autentication information"})
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      setUserAssessment(data);
      updateQueystring('ua_token', data.token)
      return data;
    } catch (error) {
      console.error('Failed to create user assessment:', error);
      // Handle the error according to your application's needs
    }
  }
  const loadUserAssessment = async () => {
    if(isAnon && isAnon != "false") return false;
    try {
      
      let headers = {}
      setLoading({ message: "Loading previous assessment session" });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/assessment/user/assessment/${ua_token}`);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      setUserAssessment(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Failed to load user assessment:', error);
      setLoading({ message: "Session has expired or was not found."});
      // Handle the error according to your application's needs
    }
  }

  const finishUserAssessment = async () => {
    if(isAnon && isAnon != "false") return false;
    try {
      
      let headers = {}
      if(token) headers['Authorization'] = `Token ${token}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/assessment/user/assessment/${userAssessment.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          status: "ANSWERED",
        })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      // destroySession();
      return data;
    } catch (error) {
      console.error('Failed to create user assessment:', error);
      // Handle the error according to your application's needs
    }
  }

  const createUserAnswer = async (option) => {
    if(isAnon && isAnon != "false") return false;
    try {
      let headers = {}
      if(token) headers['Authorization'] = `Token ${token}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/assessment/user/assessment/${userAssessment.token}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          "value": option.score,
          "option": option.id
        })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Failed to create user assessment:', error);
      // Handle the error according to your application's needs
    }
  }

  useEffect(() => {
    if (isWindow) {
      setSession({ academy, source, campaign, medium, email });
      if (time && time.toLowerCase() === "false") setToggleTimer(false);
      if (score && score.toLowerCase() === "false") setToggleFinalScore(false);
    }

  }, [academy, time, score, source, campaign, medium, email]);

  useEffect(() => {
    const getLayout = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/assessment/layout/${layout}`);
      const data = await res.json();
      setLayoutStyles(data);
    }
    if(layout) getLayout();
  }, [layout]);

  useEffect(() => {

    if(quiz){
      if(ua_token) loadUserAssessment();
      else if(token) createUserAssessment();
    }

  }, [quiz]);
  
  useEffect(() => {

    if(userAssessment){

      // set current question position or index
      let index = store.questions.findIndex(q => q.id == userAssessment.last_answer?.question?.id) + 1;
      if(store.questions[index].position !== null) index = store.questions[index].position + 1;
      console.log("current index", index)

      if(index > 0) dispatch({
        type: types.setCurrentQuestion,
        payload: index
      })
    }

  }, [userAssessment]);
  
  useEffect(() => {

    const getInfo = async () => {
      
      setLoading({ message: "Loading questions..."});
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/assessment/${slug}`
      );

      const data = await res.json();
      setQuiz(data);
      setLoading(null)

      dispatch({
        type: types.setQuesions,
        payload: data.questions,
      });

      dispatch({
        type: types.setIsInstantFeedback,
        payload: data.is_instant_feedback,
      });
    }

    const getThreshholds = async () => {

      const resThresh = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/assessment/${slug}/threshold${academy ? `?academy=${academy}` : ""
        }`
      );

      const dataThresh = await resThresh.json();

      const compare = (a, b) => {
        if (a.score_threshold < b.score_threshold) {
          return -1;
        }
        if (a.score_threshold > b.score_threshold) {
          return 1;
        }
        return 0;
      };

      const thres = dataThresh.sort(compare);

      dispatch({
        type: types.setTresholds,
        payload: thres,
      });
    }

    if (slug) getInfo();
    if (slug && academy) getThreshholds();
  }, [slug, academy]);

  const handleStartQuiz = () => {
    if (store.started) {
      dispatch({
        type: types.timerRef,
        payload: intervalRef.current,
      });
    } else {
      const currentTime = Date.now() - store.timer;
      store.timerRef = setInterval(() => {
        dispatch({
          type: types.startTimer,
          payload: Math.floor((Date.now() - currentTime) / 1000),
        });
      }, 1000);
      dispatch({ type: types.setStarted });
    }
  };

  if (loading || !quiz) return (
    <div className={styles.container}>
      <div className={styles.quiz_main}>
        <h3 className={styles.quiz_title}>{loading?.message || "Loading..."}</h3>
      </div>
    </div>
  )

  return (
    <div className={styles.container}>
      {layoutStyles && <Styles base64CSS={layoutStyles.additional_styles} />}
      <Head>
        <title>{quiz?.title}</title>
        <meta name="description" content={quiz?.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!token && !userAssessment && !(isAnon && isAnon != "false") ? 
        <LeadForm onSubmit={data => createUserAssessment(data)} />
        :
        <Fragment>
          {store.showFinalScore !== true && store.started === true ? (
            <p className={styles.currentQuestion} style={{ zIndex: -1 }}>
              {store.currentQuestion + 1}/{store.questions.length}
            </p>
          ) : null}

          {toggleTimer && <p className={styles.quiz_timer} style={{ zIndex: 99 }}>
            {toggleTimer && `${store.timer} sec`}
          </p>}

          <div className={styles.quiz_main}>
            {!store.started ? (
              <>
                <h1 className={styles.quiz_title}>{quiz?.title}</h1>

                <div className={styles.grid_start}>
                  <button id="startBtn" className={styles.start} onClick={handleStartQuiz}>
                    <h2 style={{ margin: "5px 0" }}>Start</h2>
                  </button>
                </div>
              </>
            ) : (
              <QuizCard 
                onAnswer={(option) => createUserAnswer(option)} 
                onFinish={() => finishUserAssessment()} 
                toggleFinalScore={toggleFinalScore} 
                toggleTimer={toggleTimer} 
                debug={debug == "true"} 
              />
            )}
          </div>
        </Fragment>
      }
    </div>
  );
};

export default QuizSlug;
