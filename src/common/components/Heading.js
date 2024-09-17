import React from 'react';
import PropTypes from 'prop-types';
import IconBase from './icons/IconBase';

const Heading = ({ title, iconPath, iconWidth, iconHeight, iconStyle, iconViewBox, className, style }) => (
    <h1 className={className} style={style}>
        {iconPath &&
            <IconBase width={iconWidth} height={iconHeight} style={iconStyle} viewBox={iconViewBox}>
                {iconPath}
            </IconBase>
        }
        {title}
    </h1>
);

Heading.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node,
    iconWidth: PropTypes.number,
    iconHeight: PropTypes.number,
    iconStyle: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
};

Heading.defaultProps = {
    icon: null,
    iconHeight: null,
    iconWidth: null,
    iconStyle: null,
    className: '',
    style: {},
};

export default Heading;