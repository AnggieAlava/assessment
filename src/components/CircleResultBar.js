import React from "react";
import styles from "@styles/Home.module.css";
import PropTypes from 'prop-types';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ weight: '700', subsets: ['latin'] });

function CircleProgressBar({ percentage, circleWidth, strokeWidth, radius }) {

    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * percentage) / 100;

    const getColorByPercentage = (percentage) => {
        if (percentage < 50) return 'red';
        if (percentage === 50) return 'orange';
        return 'green';
    };

    return (
        <div>
            <svg
                width={circleWidth}
                height={circleWidth}
                viewBox={`0 0 ${circleWidth} ${circleWidth}`}
            >
                <circle
                    cx={circleWidth / 2}
                    cy={circleWidth / 2}
                    strokeWidth={strokeWidth}
                    r={radius}
                    className={styles.circleBackground}
                />
                <circle
                    cx={circleWidth / 2}
                    cy={circleWidth / 2}
                    strokeWidth={strokeWidth}
                    r={radius}
                    className={styles.circleProgress}
                    stroke={getColorByPercentage(percentage)}
                    style={{
                        strokeDasharray: dashArray,
                        strokeDashoffset: dashOffset
                    }}
                />
                <text x={'50%'} y={'58%'} textAnchor="middle" dy={'0.3rem'} fontSize={percentage < 100 ? 50 : 40} fontWeight={"bold"} className={spaceGrotesk.className}>
                    {percentage}%
                </text>
            </svg>
        </div>
    )
}

CircleProgressBar.propTypes = {
    percentage: PropTypes.number.isRequired,
    circleWidth: PropTypes.number,
    strokeWidth: PropTypes.number,
    radius: PropTypes.number
};

CircleProgressBar.defaultProps = {
    circleWidth: 140,
    strokeWidth: 5,
    radius: 60
};

export default CircleProgressBar