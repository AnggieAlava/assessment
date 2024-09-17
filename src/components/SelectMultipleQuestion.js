import React from "react";
import PropTypes from "prop-types";
import checkBoxStyle from "@styles/multiselect.module.css";

const SelectMultipleQuestion = ({ option, verifyCurrentCheckbox }) => (
  <label
    className={checkBoxStyle.multiSelect_label}
    key={option.id}
  >
    <input
      value={option.score}
      name="isMultiselect"
      type="checkbox"
      onChange={() => verifyCurrentCheckbox()}
      className={checkBoxStyle.buton_input}
    />
    <h2
      className={checkBoxStyle.button_span}
      style={{ fontWeight: "normal" }}
    >
      {option.title}
    </h2>
  </label>
);

SelectMultipleQuestion.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired
  }).isRequired,
  verifyCurrentCheckbox: PropTypes.func
};

SelectMultipleQuestion.defaultProps = {
  verifyCurrentCheckbox: () => {}
};

export default SelectMultipleQuestion;
