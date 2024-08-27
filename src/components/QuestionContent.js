import React from "react";
import PropTypes from 'prop-types';
import SelectQuestion from "./SelectQuestion";
import SelectMultipleQuestion from "./SelectMultipleQuestion";

const QuestionContent = ({ question, selectAnswer, verifyCurrentCheckbox, debug }) => {
    if (question.question_type === "SELECT") {
        return question.options.map((option, i) => (
            <SelectQuestion
                key={option.id}
                option={option}
                selectAnswer={selectAnswer}
                debug={debug}
            />
        ));
    }

    if (question.question_type === "SELECT_MULTIPLE") {
        return question.options.map((option, i) => (
            <SelectMultipleQuestion
                key={option.id}
                option={option}
                verifyCurrentCheckbox={verifyCurrentCheckbox}
            />
        ));
    }

    return <p>An error occurred. Please, report to your teacher</p>;
};

QuestionContent.propTypes = {
    question: PropTypes.shape({
        question_type: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            score: PropTypes.number,
            position: PropTypes.number
        })).isRequired
    }).isRequired,
    selectAnswer: PropTypes.func,
    verifyCurrentCheckbox: PropTypes.func,
    debug: PropTypes.bool
};

QuestionContent.defaultProps = {
    selectAnswer: () => { },
    verifyCurrentCheckbox: () => { },
    debug: false
};

export default QuestionContent;
