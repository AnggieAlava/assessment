import { useState } from "react";
import Link from "next/link";
import styles from "@styles/Home.module.css";

const CampusSelectionAdvanced = ({ onSelectCampus }) => {
    const [selectedCampus, setSelectedCampus] = useState(null);
    const courseUrl = "https://ce.mdc.edu/search/publicCourseSearchDetails.do?method=load&courseId=";

    const handleCampusSelection = (campus) => {
        setSelectedCampus(campus);
        onSelectCampus(campus);
    };

    const campusOptions = [
        { name: "Kendall", courseId: [1154969] },
        { name: "North", courseId: [1166445] },
        { name: "Padron", courseId: [1171998] },
        { name: "West", courseId: [1171294] },
        { name: "Wolfson", courseId: [1161210] },
    ];

    return (
        <div className={styles.campusSelection}>
            <div className={`campus-grid ${styles.campusGrid}`}>
                {campusOptions.map(({ name, courseId }) => (
                    <div key={name} className="card rounded">
                        <div
                            className={`card-body ${styles.campusCard} ${
                                selectedCampus === name ? styles.selectedCampus : ""
                            }`}
                            onClick={() => handleCampusSelection(name)}
                        >
                            <h3 className="card-title">{name}</h3>
                            {courseId.length > 0 &&
                                courseId.map((id) => (
                                    <Link
                                        href={`${courseUrl}${id}`}
                                        key={id}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div className={`card-body`}>
                                            <p className="card-text">{name} - {id}</p>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CampusSelectionAdvanced;