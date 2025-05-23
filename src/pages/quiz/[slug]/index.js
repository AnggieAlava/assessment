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
import { isWindow, updateQueystring, rand, parseQuery } from "src/util";

import Heading from "src/common/components/Heading";
import { codeIconPath } from "src/common/components/paths/codeIcon";

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
    slug, //check
    time, //false-true
    score, //false-true
    debug, //false-true
    token = null, //token:string
    ua_token, //token:string
    isAnon = false, //true-false
    campaign,
    medium,
    source,
    conversion_url,
    landing_url,
    email = null,
    layout, //layout:string
    threshold_id,
    threshold_tag, //check
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
            conversion_info: { campaign, source, medium, conversion_url, landing_url, ...formData },
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

      updateQueystring({
        ua_token: data.token,
        leadData: null,
      });

      if (formData) setSession({ formData });

      return data;

    } catch (error) {
      console.error("Failed to create user assessment:", error);
    }
  };

  const loadUserAssessment = async () => {
    if (isAnon && isAnon != "false") return false;
    try {
      setLoading({ message: "Loading previous assessment session" });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/assessment/user/assessment/${ua_token}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setUserAssessment(data);

      if (data?.academy?.id) getThreshholds({ academy: data.academy.id, tag: threshold_tag || undefined });

      if (data?.status === "DRAFT" && data?.summary?.last_answer) {
        const startTime = new Date(data.started_at).getTime();

        store.timerRef = setInterval(() => {
          const newCurrentTime = Date.now();  // Obtener el tiempo actual en cada intervalo
          const totalElapsedInSeconds = Math.floor((newCurrentTime - startTime) / 1000);  // Calcula el tiempo total desde `started_at`

          dispatch({
            type: types.startTimer,
            payload: totalElapsedInSeconds,  // Pasar el tiempo transcurrido total al dispatch
          });
        }, 1000);  // Actualiza cada segundo
      }

      return data;
    } catch (error) {
      console.error("Failed to load user assessment:", error);
      setLoading({ message: "Session has expired or was not found." });
      // Handle the error according to your application's needs
    }
    finally {
      setLoading(false);
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

  const getThreshholds = async (queryObject) => {
    const qs = parseQuery(queryObject);
    const resThresh = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/assessment/${slug}/threshold${qs}`
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
    const resThresh = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/assessment/${slug}/threshold/${threshold_id}`);

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

  useEffect(() => {
    if (isWindow) {
      if (time && time.toLowerCase() === "false") setToggleTimer(false);
      if (score && score.toLowerCase() === "false") setToggleFinalScore(false);
    }
  }, [academy, time, score, source, campaign, medium, conversion_url, landing_url, email]);

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
        }
      }
    }
  }, [quiz]);

  useEffect(() => {
    if (userAssessment && userAssessment.finished_at && userAssessment.status === "ANSWERED" && !leadData) {
      updateQueystring({
        ua_token: null,
      });
      setUserAssessment(null)
    }

    if (userAssessment) {
      let index =
        store.questions.findIndex(
          (q) => q.id == userAssessment.summary?.last_answer?.question?.id
        );
      if (index < 0) index = 0

      if (index >= store.questions.length)
        setLoading({
          message: "All the assessment questions have been answered",
        });
      else {
        if (
          store.questions[index].position !== null &&
          store.questions[index].position > 0 // Esta condición asegura que solo se ajuste el índice si la posición es mayor que 0, previniendo un salto a una pregunta incorrecta.
        )
          index = store.questions[index].position + 1; // Esto ajusta el índice a la siguiente pregunta basada en la posición.

        if (index > 0 && index < store.questions.length)
          // Solo se despacha la acción si el índice es mayor que 0, evitando un índice negativo o incorrecto.
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
    if (slug && academy) getThreshholds({ academy, tag: threshold_tag || undefined });
    if (slug && threshold_id) getThresholdsById(threshold_id);
  }, [slug, academy, threshold_id, threshold_tag]);

  const handleStartQuiz = () => {
    if (store.started) {
      dispatch({
        type: types.timerRef,
        payload: intervalRef.current,
      });
    }
    else {
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

  if (loading || !quiz) {
    return (
      <div className={styles.container}>
        <div className={styles.quiz_main}>
          <h3 className={styles.quiz_title}>
            {loading?.message || "Loading..."}
          </h3>
        </div>
      </div>
    );
  }

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
        <div className={styles.quiz_main}>
          {!store.started && !userAssessment?.summary?.last_answer ? (
            <div className='quiz_wrapper'>
              <Heading
                className={styles.quiz_title}
                title={layout === 'mdc' && slug?.match(/^english-[1-5]$/) ? quiz?.title : `Quiz: ${quiz?.title}`}
                iconPath={codeIconPath}
                iconWidth={32}
                iconHeight={23}
                iconViewBox={'0 0 24 15'}
                iconStyle={{ marginRight: "1.2rem" }}
              />

              <p className={styles.quiz_description}>
                Welcome to an interactive quiz. Test your knowledge by answering simple selection questions and see your result at the end of the exercise.
              </p>

              <div className={styles.grid_start}>
                <button
                  id="startBtn"
                  className='quiz_start_button quiz_button'
                  onClick={handleStartQuiz}>
                  <h2 style={{ margin: "5px 0" }}>
                    Start
                    <span style={{ marginLeft: "1rem" }}> {"⟶"} </span>
                  </h2>
                </button>
              </div>
            </div>
          ) : (
            <>
              <Heading
                className={styles.quiz_title}
                title={layout === 'mdc' && slug?.match(/^english-[1-5]$/) ? quiz?.title : `Quiz: ${quiz?.title}`}
                iconPath={codeIconPath}
                iconWidth={32}
                iconHeight={23}
                iconViewBox={'0 0 24 15'}
                iconStyle={{ marginRight: "1.2rem" }}
              />
              <div className='quiz_wrapper'>
                <QuizCard
                  onAnswer={(option) => createUserAnswer(option)}
                  onFinish={() => finishUserAssessment()}
                  toggleFinalScore={toggleFinalScore}
                  toggleTimer={toggleTimer}
                  debug={debug == "true"}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizSlug;
