import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha"; // <--- NEU
import { postUser } from "../../comunication/FetchUser";
import PasswordStrengthBar from "../PasswordStrengthBar";
import { calculatePasswordStrength } from "../passwordStrength";

/**
 * RegisterUser - Updated with Captcha
 */
function RegisterUser({ loginValues, setLoginValues }) {
    const navigate = useNavigate();
    const recaptchaRef = useRef(); // Referenz für Reset bei Fehler

    const initialState = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: ""
    };

    const [credentials, setCredentials] = useState(initialState);
    const [errorMessage, setErrorMessage] = useState('');
    const [captchaToken, setCaptchaToken] = useState(null); // <--- NEU: State für Token
    const [strength, setStrength] = useState({ score: 0, label: "Sehr schwach", color: "#ff0000" });

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setCredentials(prev => ({ ...prev, password: value }));
        setStrength(calculatePasswordStrength(value));
    };

    const onCaptchaChange = (token) => {
        console.log("Captcha Token:", token);
        setCaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (credentials.password !== credentials.passwordConfirmation) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        // Mindestanforderung
        if (strength.score < 5) {
            setErrorMessage("Password is too weak. Please choose a stronger one.");
            return;
        }

        // <--- NEU: Captcha Check
        if (!captchaToken) {
            setErrorMessage("Please confirm that you are not a robot.");
            return;
        }

        try {
            // Token wird jetzt mitgegeben
            await postUser(credentials, captchaToken);

            // Login Values setzen für UX
            setLoginValues({ email: credentials.email, password: credentials.password }); // Achtung: in LoginUser heisst es 'email', in deinem State evtl 'userName'? Prüfen!
            setCredentials(initialState);
            navigate('/'); // Oder zur Login Seite
        } catch (error) {
            console.error('Failed to fetch:', error.message);
            setErrorMessage(error.message);

            // Captcha resetten bei Fehler, damit User neu klicken muss
            if(recaptchaRef.current) {
                recaptchaRef.current.reset();
                setCaptchaToken(null);
            }
        }
    };

    return (
        <div>
            <h2>Register user</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    {/* ... (Deine existierenden Input Felder: Firstname, Lastname, Email) ... */}
                    <aside>
                        <div>
                            <label>Firstname:</label>
                            <input type="text" value={credentials.firstName} onChange={(e) => setCredentials(prev => ({ ...prev, firstName: e.target.value }))} required />
                        </div>
                        <div>
                            <label>Lastname:</label>
                            <input type="text" value={credentials.lastName} onChange={(e) => setCredentials(prev => ({ ...prev, lastName: e.target.value }))} required />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input type="email" value={credentials.email} onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))} required />
                        </div>
                    </aside>

                    <aside>
                        <div>
                            <label>Password:</label>
                            <input type="password" value={credentials.password} onChange={handlePasswordChange} required />
                            <PasswordStrengthBar score={strength.score} label={strength.label} color={strength.color} />
                        </div>

                        <div>
                            <label>Password confirmation:</label>
                            <input type="password" value={credentials.passwordConfirmation} onChange={(e) => setCredentials(prev => ({ ...prev, passwordConfirmation: e.target.value }))} required />
                        </div>
                    </aside>
                </section>

                {/* <--- NEU: Captcha Widget */}
                <div style={{ margin: "20px 0" }}>
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6LcprR0sAAAAAJh0E9TzvDPuJfri5wDzsIOVgVYR"
                        onChange={onCaptchaChange}
                    />
                </div>

                <button type="submit">Register</button>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
        </div>
    );
}
export default RegisterUser;