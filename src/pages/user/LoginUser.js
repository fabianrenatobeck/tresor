import { useNavigate, Link } from 'react-router-dom'; // <--- Link importieren
import { useState } from "react";
import { postUserLogin, postGoogleLogin } from "../../comunication/FetchUser";
import { auth, googleProvider } from '../../auth/GoogleLogin';
import { signInWithPopup } from 'firebase/auth';

/**
 * LoginUser
 * @author Peter Rutschmann
 */
function LoginUser({loginValues, setLoginValues}) {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseToken = await result.user.getIdToken();

            // JETZT: Ab zum Backend damit
            await postGoogleLogin(firebaseToken);

            navigate('/'); // Login erfolgreich -> Startseite
        } catch (error) {
            setErrorMessage("Google Login fehlgeschlagen: " + error.message);
        }
    };

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

    return (
        <div>
            <h2>Login user</h2>
            {/* --- NEU: DER BUTTON --- */}
            <div style={{ marginBottom: "20px" }}>
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{ backgroundColor: '#4285F4', color: 'white', padding: '10px' }}
                >
                    Mit Google anmelden
                </button>
            </div>

            <hr /> {/* Trennung zwischen Google und normalem Login */}
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
                                type="password" // <--- Tipp: Typ 'password' ist besser als 'text'
                                value={loginValues.password}
                                onChange={(e) =>
                                    setLoginValues(prevValues => ({...prevValues, password: e.target.value}))}
                                required
                                placeholder="Please enter your password *"
                            />
                        </div>
                    </aside>
                </section>

                {/* --- NEU: PASSWORT VERGESSEN LINK --- */}
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