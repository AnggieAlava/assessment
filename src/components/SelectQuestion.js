import React from "react";
import PropTypes from "prop-types";
import styles from "@styles/Home.module.css";

const SelectQuestion = ({ option, selectAnswer, debug }) => (
    <button
        key={option.id}
        name="isSelect"
        onClick={() => selectAnswer(option)}
        className={styles.quiz_card_option}
    >
        <h2 className={styles.buttonTextSelector}>
            {option.title}
        </h2>
        {debug && (
            <div className={styles.debugScore}>
                <p className="m-0 p-0">Score: {option.score}</p>
                <p className="m-0 p-0">Pos: {option.position}</p>
            </div>
        )}
    </button>
);

SelectQuestion.propTypes = {
    option: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        score: PropTypes.number,
        position: PropTypes.number
    }).isRequired,
    selectAnswer: PropTypes.func,
    debug: PropTypes.bool
};

SelectQuestion.defaultProps = {
    selectAnswer: () => { },
    debug: false
};

export default SelectQuestion;
