import { Fragment, useEffect, useState } from "react";
import styles from "@styles/leadform.module.css";

function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D+/g, '');
    const match = cleaned.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/);

    if (match) {
      // Construct the formatted phone number
      const [, area, exchange, subscriber] = match;
      return `${area ? `(${area}` : ''}${exchange ? `) ${exchange}` : ''}${subscriber ? `-${subscriber}` : ''}`;
    }
    return value; // In case the regex does not match, return the original value (edge case handling)
};

const LeadForm = ({ onSubmit }) => {

    const [data, setData] = useState({});
    const [alert, setAlert] = useState(false);
    console.log("data", data)
    return <div className={`${styles.backdrop} quiz-backdrop`}>
        <form className={styles.form} onSubmit={(e) => {
            e.preventDefault();

            if(!data.consent) setAlert({ message: 'You need to consent to terms and conditions.', color: 'error' })
            else if(!validateEmail(data.email)) setAlert({ message: 'Invalid email format', color: 'error' })
            else if(!data.full_name) setAlert({ message: 'Please specify your full name', color: 'error' })
            else onSubmit(data);
        }}>
            <h1>Before we start</h1>
            <p>Please fill out the following information:</p>
            {alert && <div className={`${styles.alert} ${styles['alert-'+alert.color]}`}>{alert.message}</div>}
            <input type="text" name="full name" placeholder="Full Name" value={data.full_name || ""} onChange={(e) => setData({ ...data, full_name: e.target.value })} />
            <input type="email" name="email" placeholder="Email" value={data.email || ""} onChange={(e) => setData({ ...data, email: e.target.value })} />
            <input type="phone" name="phone" placeholder="Phone" value={data.phone || ""} onChange={(e) => setData({ ...data, phone: formatPhoneNumber(e.target.value) })} />
            <div>
                <input type="checkbox" checked={data.consent || false} onChange={(e) => setData({ consent: data.consent ? false:true, ...data})} />
                <small>I agree to receive information in my email about events, courses, and other marketing materials. We'll never share your email.</small>
            </div>
            <button>Start Quiz</button>
        </form>
    </div>

}

export default LeadForm;
