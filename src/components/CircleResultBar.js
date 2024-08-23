import React from "react";
import styles from "@styles/Home.module.css";
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ weight: '700', subsets: ['latin'] });

function CircleProgressBar({ percentage, circleWwidth, strokeWidth, radius }) {

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
                width={circleWwidth}
                height={circleWwidth}
                viewBox={`0 0 ${circleWwidth} ${circleWwidth}`}
            >
                <circle
                    cx={circleWwidth / 2}
                    cy={circleWwidth / 2}
                    strokeWidth={strokeWidth}
                    r={radius}
                    className={styles.circleBackground}
                />
                <circle
                    cx={circleWwidth / 2}
                    cy={circleWwidth / 2}
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

export default CircleProgressBar