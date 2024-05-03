import { startTransition } from "react"

export const types = {
  setScore: "score - puntos",
  setQuesions: "quiz - prueba",
  setTresholds: "tresholds",
  setIsInstantFeedback: "set isInstantFeedback",
  setTemplate: "template",
  setStarted: "start - empezar",
  startTimer: "start_timer - iniciar_temporizador",
  resetTimer: "reset_timer - reiniciar_temporizador",
  timerRef: "timerRef",
  setCurrentQuestion: "setCurrentQuestion",
  setSelectedAnswer: "Selected_Answer",
  setMultiAnswerSelection: "setMultiAnswerSelection",
  setGetAnswer: "setGetAnswer",
  setGetCorrect: "setGetCorrect",
  setFinishedQuiz: "setFinishedQuiz",
  setFinalScore: "setFinalScore",
  resetCurrentQuestion: "resetCurrentQuestion"
}

export const initialStore = {
  started: false,
  score: 0,
  questions: [],
  totalTime: 0,
  timer: 0,
  timerRef: null,
  currentQuestion: 0,
  getAnswer: false,
  correct: false,
  showFinalScore: false,
  selectedAnswer: "",
  multiAnswerSelection: [],
  tresholds: [],
  isInstantFeedback: true,
  templates: {
      correct: ['That\'s right!','Yes! Maybe you paid attention?','You seem to know most of the anwers','Keep it up!'],
      incorrect: ['Uhh no.', 'Nop, you are wrong dude.', 'Mmmmm... almost there, but no.', 'No! Have you been paying attention?']
  }
}

const storeReducer = (state, action) => {
  switch (action.type) {
    case types.setStarted:
      return {
        ...state,
        started: true,
      }
    case types.startTimer:
      return {
        ...state,
        timer: action.payload
      }
    case types.timerRef:
      return {
        ...state,
        timerRef: action.payload
      }
    case types.resetTimer:
      return {
        ...state,
        timer: 0,
        started: false
      }

    case types.setCurrentQuestion:
      return {
        ...state,
        currentQuestion: action.payload || state.currentQuestion + 1,
        score: action.score || state.score,
        started: true
      }
    case types.setSelectedAnswer:
      return {
        ...state,
        selectedAnswer: action.payload
      }
    case types.setMultiAnswerSelection:
      return {
        ...state,
        multiAnswerSelection: action.payload
      }
    case types.setGetAnswer:
      return {
        ...state,
        getAnswer: action.payload
      }
    case types.setTresholds:
        return {
          ...state,
          tresholds: action.payload
        }
    case types.setIsInstantFeedback:
        return {
          ...state,
          isInstantFeedback: action.payload
        }
    case types.setGetCorrect:
      return {
        ...state,
        correct: action.payload
      }
    case types.setScore: 
      return {
        ...state,
        score: state.score + 1
      }
    case types.setQuesions:
      return {
        ...state,
        questions: action.payload
      }

    case types.setFinalScore:
      return {
        ...state,
        showFinalScore: action.payload
      }
    case types.resetCurrentQuestion:
      return {
        ...state,
        currentQuestion: 0,
        score: 0
      }
    default:
      return state
  }
}

export default storeReducer
