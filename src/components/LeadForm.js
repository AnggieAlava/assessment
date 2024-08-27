import { Fragment, useEffect, useState } from "react";
import styles from "@styles/leadform.module.css";
import { capitalize } from "src/util/index"
import PropTypes from 'prop-types';

const validators = {
    email: function validateEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }
}

const formatters = {
    phone: (value) => {
        // Remove all non-digits
        const cleaned = value.replace(/\D+/g, '');
        const match = cleaned.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/);
    
        if (match) {
          // Construct the formatted phone number
          const [, area, exchange, subscriber] = match;
          return `${area ? `(${area}` : ''}${exchange ? `) ${exchange}` : ''}${subscriber ? `-${subscriber}` : ''}`;
        }
        return value; // In case the regex does not match, return the original value (edge case handling)
    }
}

const LeadForm = ({ onSubmit, extraFields }) => {

    const [data, setData] = useState({});
    const [alert, setAlert] = useState(false);

    return <div className={`${styles.backdrop} quiz-backdrop`}>
        <form className={styles.form} onSubmit={(e) => {
            e.preventDefault();

            if(!data.consent) setAlert({ message: 'You need to consent to terms and conditions.', color: 'error' })
            else if(!data.full_name) setAlert({ message: 'Please specify your full name', color: 'error' })
            else if(!validators['email'](data.email)) setAlert({ message: 'Please fix your email.', color: 'error' })
            else{
                const invalid = extraFields.filter(field => {
                    if(field.required && !data[field.name]){
                        setAlert({ message: `Please specify the ${field.name}`, color: 'error' });
                        return true;
                    } 
                    else if(data[field.name] && validators[field.type] && !validators[field.type](data.email)){
                        setAlert({ message: `Invalid ${field.name}, please fix.`, color: 'error' })
                        return true;
                    } 
                })
                if(invalid.length == 0) onSubmit({ 
                    ...extraFields?.filter(field => field.type == 'hidden').map(field => ({ [field.name]: field.value })).reduce((prev, curr) => ({ ...prev, ...curr}),{}),
                    ...data,
                });
            } 
        }}>
            <h1>Before we start</h1>
            <p>Please fill out the following information:</p>
            {alert && <div className={`${styles.alert} ${styles['alert-'+alert.color]}`}>{alert.message}</div>}
            <input type="text" name="full name" placeholder="Full Name" value={data.full_name || ""} onChange={(e) => setData({ ...data, full_name: e.target.value })} />
            <input type="email" name="email" placeholder="Email" value={data.email || ""} onChange={(e) => setData({ ...data, email: e.target.value })} />
            {extraFields && extraFields.filter(field => field.type != 'hidden').map(field => 
                <input key={field.name} type="text" name={field.name} placeholder={field.placeholder || capitalize(field.name)} value={data[field.name] || ""} onChange={(e) => {
                    setData({ ...data, [field.name]:  formatters[field.type] ? formatters[field.type](e.target.value) : e.target.value })
                }} />
            )}
            <div>
                <input type="checkbox" checked={data.consent || false} onChange={(e) => setData({ ...data, consent: data.consent ? false:true })} />
                <small>I agree to receive information in my email about events, courses, and other marketing materials. We'll never share your email.</small>
            </div>
            <button>Start Quiz</button>
        </form>
    </div>

}

LeadForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    extraFields: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            type: PropTypes.string,
            placeholder: PropTypes.string,
            required: PropTypes.bool,
            value: PropTypes.string,
        })
    ),
};

LeadForm.defaultProps = {
    extraFields: [],
};

export default LeadForm;
