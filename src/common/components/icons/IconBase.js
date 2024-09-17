import React from 'react';
import PropTypes from 'prop-types';

const IconBase = ({ width, height, fill, viewBox, style, children, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox={viewBox}
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    style={style}
    {...props}
  >
    {children}
  </svg>
);

IconBase.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  fill: PropTypes.string,
  viewBox: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node.isRequired,
};

IconBase.defaultProps = {
  width:32,
  height:32,
  fill: '#0097CF',
  viewBox: "0 0 24 15",
  style: {},
  children: null,
}

export default IconBase;