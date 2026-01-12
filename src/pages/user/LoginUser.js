import { useNavigate, Link } from 'react-router-dom';
import { useState } from "react";
import { postUserLogin, postGoogleLogin, verify2FAPin } from "../../comunication/FetchUser";
import { auth, googleProvider } from '../../auth/GoogleLogin';
import { signInWithPopup } from 'firebase/auth';

/**
 * LoginUser mit integrierter 2FA Logik
 */
function LoginUser({loginValues, setLoginValues}) {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    // --- NEUE STATES FÜR 2FA (Zusätzlich zum alten Code) ---
    const [show2FA, setShow2FA] = useState(false);
    const [pin, setPin] = useState('');
    const [tempEmail, setTempEmail] = useState('');

    // 1. Erweitertes Google Login Handling
    const handleGoogleLogin = async () => {
        setErrorMessage('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseToken = await result.user.getIdToken();
            const data = await postGoogleLogin(firebaseToken);

            if (data.status === "2FA_REQUIRED") {
                // Backend verlangt PIN -> UI umschalten
                setTempEmail(data.email);
                setShow2FA(true);
            } else if (data.token) {
                navigate('/');
            }
        } catch (error) {
            console.error("Google Login Fehler:", error);
            setErrorMessage("Google Login fehlgeschlagen: " + error.message);
        }
    };

    // 2. Handling für die PIN-Verifizierung
    const handle2FASubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const data = await verify2FAPin(tempEmail, pin);
            // Wenn der PIN korrekt war, erhalten wir hier das finale Token
            if (data.token) {
                navigate('/');
            }
        } catch (error) {
            setErrorMessage("Falscher PIN: " + error.message);
        }
    };

    // 3. Dein ursprünglicher Email-Login Handler (unverändert)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            await postUserLogin(loginValues);
            navigate('/');
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message);
        }
    };

    // --- BEDINGTES RENDERING: Entweder PIN-Feld ODER dein normales Login ---
    if (show2FA) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h2>Sicherheitsprüfung</h2>
                <p>Ein PIN ist für <b>{tempEmail}</b> erforderlich.</p>
                <form onSubmit={handle2FASubmit}>
                    <input
                        type="text"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="PIN eingeben"
                        maxLength="4"
                        style={{ fontSize: '20px', width: '120px', textAlign: 'center' }}
                        required
                    />
                    <br /><br />
                    <button type="submit">Einloggen</button>
                    <button type="button" onClick={() => setShow2FA(false)} style={{ marginLeft: '10px', backgroundColor: 'gray' }}>Abbrechen</button>
                </form>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
        );
    }

    // --- DEIN ORIGINALER UI-CODE (UNVERÄNDERT) ---
    return (
        <div>
            <h2>Login user</h2>
            <div style={{ marginBottom: "20px" }}>
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{ backgroundColor: '#4285F4', color: 'white', padding: '10px' }}
                >
                    Mit Google anmelden
                </button>
            </div>

            <hr />
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>Email:</label>
                            <input
                                type="text"
                                value={loginValues.email}
                                onChange={(e) =>
                                    setLoginValues(prevValues => ({...prevValues, email: e.target.value}))}
                                required
                                placeholder="Please enter your email *"
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={loginValues.password}
                                onChange={(e) =>
                                    setLoginValues(prevValues => ({...prevValues, password: e.target.value}))}
                                required
                                placeholder="Please enter your password *"
                            />
                        </div>
                    </aside>
                </section>

                <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                    <Link to="/forgot-password" style={{ color: "blue", textDecoration: "underline" }}>
                        Passwort vergessen?
                    </Link>
                </div>

                <button type="submit">Login</button>

                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
        </div>
    );
}

export default LoginUser;