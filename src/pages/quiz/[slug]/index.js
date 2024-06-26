import { useState, useContext, useEffect, useRef, Fragment } from "react";
import { StoreContext } from "@store/StoreProvider";
import { types } from "@store/reducer";
import { useRouter } from "next/router";
import styles from "@styles/Home.module.css";
import QuizCard from "src/components/QuizCard";
import Styles from "src/components/Styles";
import { setSession } from "src/store/session";
import LeadForm from "src/components/LeadForm.js";
import Head from "next/head";
import { isWindow, updateQueystring, rand } from "src/util";

const QuizSlug = () => {
  const [store, dispatch] = useContext(StoreContext);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(null);
  const [layoutConfig, setLayoutConfig] = useState(null);
  const [toggleTimer, setToggleTimer] = useState(true);
  const [toggleFinalScore, setToggleFinalScore] = useState(true);
  const [userAssessment, setUserAssessment] = useState(null);
  const intervalRef = useRef(null);
  const router = useRouter();
  const {
    academy,
    slug,
    time,
    score,
    debug,
    token = null,
    ua_token,
    isAnon = false,
    campaign,
    medium,
    source,
    email = null,
    layout,
    threshold_id,
    threshold_tag,
  } = router.query; // Asegúrate de obtener 'time' del query string

  // If coming from a previous assessment, here we have the conversion info
  const { leadData } = router.query;

  const createUserAssessment = async (formData = null) => {
    if (isAnon && isAnon != "false") return false;
    try {
      let headers = {};
      if (token) headers["Authorization"] = `Token ${token}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/assessment/user/assessment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            academy,
            assessment: quiz.id,
            owner_email: formData?.email,
            conversion_info: { campaign, source, medium, ...formData },
          }),
        }
      );

      if (response.status == 401)
        setLoading({ message: "Missing or invalid autentication information" });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setUserAssessment(data);

      // keep user assessment session info on the URL to persist on window refresh
      updateQueystring({
        ua_token: data.token,
        //remove lead information from queystring because it was already included in the user assessment session
        leadData: null,
      });

      //include in the session the formData just in case it will be passed to the next assessment (chained assessments)
      if (formData) setSession({ formData });

      return data;
    } catch (error) {
      console.error("Failed to create user assessment:", error);
      // Handle the error according to your application's needs
    }
  };
  const loadUserAssessment = async () => {
    if (isAnon && isAnon != "false") return false;
    try {
      let headers = {};
      setLoading({ message: "Loading previous assessment session" });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/assessment/user/assessment/${ua_token}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setUserAssessment(data);
      if (data?.academy?.id) getThreshholds(data.academy.id);
      setLoading(false);
      return data;
    } catch (error) {
      console.error("Failed to load user assessment:", error);
      setLoading({ message: "Session has expired or was not found." });
      // Handle the error according to your application's needs
    }
  };

  const finishUserAssessment = async () => {
    if (isAnon && isAnon != "false") return false;
    try {
      let headers = {};
      if (token) headers["Authorization"] = `Token ${token}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/assessment/user/assessment/${userAssessment.token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            status: "ANSWERED",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      // destroySession();
      return data;
    } catch (error) {
      console.error("Failed to create user assessment:", error);
      // Handle the error according to your application's needs
    }
  };

  const createUserAnswer = async (option) => {
    if (isAnon && isAnon != "false") return false;
    try {
      let headers = {};
      if (token) headers["Authorization"] = `Token ${token}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/assessment/user/assessment/${userAssessment.token}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            value: option.score,
            option: option.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Failed to create user assessment:", error);
      // Handle the error according to your application's needs
    }
  };

  const getThreshholds = async (_academy) => {
    const resThresh = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/assessment/${slug}/threshold${
        _academy ? `?academy=${_academy}` : ""
      }`
    );

    const payload = await resThresh.json();
    if (resThresh.status < 400) {
      const compare = (a, b) => {
        if (a.score_threshold < b.score_threshold) {
          return -1;
        }
        if (a.score_threshold > b.score_threshold) {
          return 1;
        }
        return 0;
      };

      const thres = payload.sort(compare);

      dispatch({
        type: types.setTresholds,
        payload: thres,
      });
    } else {
      setLoading({
        message:
          payload?.detail ||
          payload?.details ||
          "Error loading assessment thresholds",
      });
    }
  };

  const getThresholdsById = async (threshold_id) => {
    const resThresh = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/assessment/${slug}/threshold/${threshold_id}`
    );

    const payload = await resThresh.json();
    if (resThresh.status < 400) {
      const compare = (a, b) => {
        if (a.score_threshold < b.score_threshold) {
          return -1;
        }
        if (a.score_threshold > b.score_threshold) {
          return 1;
        }
        return 0;
      };

      const thres = payload.sort(compare);

      dispatch({
        type: types.setTresholds,
        payload: thres,
      });
    } else {
      setLoading({
        message:
          payload?.detail ||
          payload?.details ||
          "Error loading assessment thresholds",
      });
    }
  };

  const getThresholdsByTag = async (threshold_tag) => {
    const resThresh = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/assessment/${slug}/threshold?tag=${threshold_tag}`
    );

    const payload = await resThresh.json();

    if (resThresh.status < 400) {
      let arrayPayload = [];

      if (!Array.isArray(payload)) {
        // Transforma el payload en un array
        arrayPayload.push(payload);
      } else {
        arrayPayload = payload;
      }

      const compare = (a, b) => {
        if (a.score_threshold < b.score_threshold) {
          return -1;
        }
        if (a.score_threshold > b.score_threshold) {
          return 1;
        }
        return 0;
      };

      const thres = arrayPayload.sort(compare);

      dispatch({
        type: types.setTresholds,
        payload: thres,
      });
    } else {
      setLoading({
        message:
          payload?.detail ||
          payload?.details ||
          "Error loading assessment thresholds by tag",
      });
    }
  };

  useEffect(() => {
    if (isWindow) {
      if (time && time.toLowerCase() === "false") setToggleTimer(false);
      if (score && score.toLowerCase() === "false") setToggleFinalScore(false);
    }
  }, [academy, time, score, source, campaign, medium, email]);

  useEffect(() => {
    const getLayout = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/assessment/layout/${layout}`
      );
      const data = await res.json();
      setLayoutConfig(data);
    };
    if (layout) getLayout();
  }, [layout]);

  useEffect(() => {
    if (quiz) {
      if (ua_token) loadUserAssessment();
      else if (token) createUserAssessment();
      else if (leadData) {
        try {
          const _formData = JSON.parse(atob(leadData));
          createUserAssessment(_formData);
        } catch (e) {
          console.error(
            "Error loading information from previous assessment",
            e
          );
          // setLoading({ messa})
        }
      }
    }
  }, [quiz]);

  useEffect(() => {
    if (userAssessment) {
      // set current question position or index
      let index =
        store.questions.findIndex(
          (q) => q.id == userAssessment.summary?.last_answer?.question?.id
        ) + 1;

      if (index >= store.questions.length)
        setLoading({
          message: "All the assessment questions have been answered",
        });
      else {
        if (store.questions[index].position !== null)
          index = store.questions[index].position + 1;

        if (index > 0)
          dispatch({
            type: types.setCurrentQuestion,
            score: userAssessment.summary?.live_score,
            payload: index,
          });
      }
    }
  }, [userAssessment]);

  useEffect(() => {
    const getInfo = async () => {
      setLoading({ message: "Loading questions..." });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/assessment/${slug}`
      );

      const data = await res.json();
      if (res.status < 400) {
        setQuiz(data);
        setLoading(null);

        dispatch({
          type: types.setQuesions,
          payload: data.questions
            .map((q, i) => ({
              ...q,
              position: q.position || i,
              options: q.options
                .map((a) => ({
                  ...a,
                  position: a.position || rand(0, 20),
                }))
                .sort((a, b) => (a.position > b.position ? 1 : -1)),
            }))
            .sort((a, b) => (a.position > b.position ? 1 : -1)),
        });

        dispatch({
          type: types.setIsInstantFeedback,
          payload: data.is_instant_feedback,
        });
      }
    };

    if (slug) getInfo();
    if (slug && academy) getThreshholds(academy);
    if (slug && threshold_id) getThresholdsById(threshold_id);
    if (slug && threshold_tag) getThresholdsByTag(threshold_tag);
  }, [slug, academy, threshold_id, threshold_tag]);

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

  if (loading || !quiz)
    return (
      <div className={styles.container}>
        <div className={styles.quiz_main}>
          <h3 className={styles.quiz_title}>
            {loading?.message || "Loading..."}
          </h3>
        </div>
      </div>
    );

  return (
    <div className={styles.container}>
      {layoutConfig && layoutConfig.additional_styles && (
        <Styles base64CSS={layoutConfig.additional_styles} />
      )}
      <Head>
        <title>{quiz?.title}</title>
        <meta name="description" content={quiz?.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!token && !userAssessment && !(isAnon && isAnon != "false") ? (
        <LeadForm
          onSubmit={(data) => createUserAssessment(data)}
          extraFields={layoutConfig?.variables?.fields}
        />
      ) : (
        <Fragment>
          {store.showFinalScore !== true && store.started === true ? (
            <p className={styles.currentQuestion} style={{ zIndex: -1 }}>
              {store.currentQuestion + 1}/{store.questions.length}
            </p>
          ) : null}

          {toggleTimer && (
            <p className={styles.quiz_timer} style={{ zIndex: 99 }}>
              {toggleTimer && `${store.timer} sec`}
            </p>
          )}

          <div className={styles.quiz_main}>
            {!store.started ? (
              <>
                <h1 className={styles.quiz_title}>{quiz?.title}</h1>

                <div className={styles.grid_start}>
                  <button
                    id="startBtn"
                    className={styles.start}
                    onClick={handleStartQuiz}>
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
      )}
    </div>
  );
};

export default QuizSlug;
