/**
 * Fetch methodes for user api calls
 * @author Peter Rutschmann (modified)
 */

// Helper function to build the API URL from environment variables
const getApiUrl = () => {
    const protocol = process.env.REACT_APP_API_PROTOCOL || "http";
    const host = process.env.REACT_APP_API_HOST || "localhost";
    const port = process.env.REACT_APP_API_PORT || "8080";
    const path = process.env.REACT_APP_API_PATH || "/api";
    const portPart = port ? `:${port}` : '';
    return `${protocol}://${host}${portPart}${path}`;
};

export const getUsers = async () => {
    const API_URL = getApiUrl();

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server response failed.');
        }

        const data = await response.json();
        console.log('User successfully got:', data);
        return data;
    } catch (error) {
        console.error('Failed to get user:', error.message);
        throw new Error(error.message || 'Failed to get user.');
    }
}

// Updated: Accepts captchaToken
export const postUser = async (content, captchaToken) => {
    const API_URL = getApiUrl();

    // Captcha Token is sent as Query Parameter (?captchaToken=...)
    // because Backend uses @RequestParam
    let url = `${API_URL}/users`;
    if (captchaToken) {
        url += `?captchaToken=${captchaToken}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: `${content.firstName}`,
                lastName: `${content.lastName}`,
                email: `${content.email}`,
                password: `${content.password}`,
                passwordConfirmation: `${content.passwordConfirmation}`
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            // Backend sends { message: "..." } or { message: ["...", "..."] }
            let errorMessage = errorData.message || 'Server response failed.';
            if(Array.isArray(errorMessage)) {
                errorMessage = errorMessage.join(", ");
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('User successfully posted:', data);
        return data;
    } catch (error) {
        console.error('Failed to post user:', error.message);
        throw error; // Re-throw so frontend can display the message
    }
};

export const postUserLogin = async (content) => {
    const API_URL = getApiUrl();

    // WICHTIG: Das ist jetzt der neue Endpoint für Tokens
    // (Achte darauf, dass dein API_URL auf "http://localhost:8080/api" zeigt)
    const url = `${API_URL}/auth/token`;

    // Wir bauen den Basic Auth String: "Basic " + Base64(email:passwort)
    const basicAuthHeader = 'Basic ' + btoa(content.email + ':' + content.password);
    // In FetchUser.js
    console.log("Login Header:", basicAuthHeader); // <--- DEBUG
    console.log("Decoded:", atob(basicAuthHeader.split(' ')[1])); // <--- Check, ob da wirklich email:pw steht

    try {
        const response = await fetch(url, {
            method: 'GET', // <-- Wir nutzen jetzt GET, nicht mehr POST!
            headers: {
                'Authorization': basicAuthHeader // <-- Anmeldedaten im Header
            }
        });

        if (!response.ok) {
            // Falls Login fehlschlägt (z.B. 401 Unauthorized)
            throw new Error('Login fehlgeschlagen. E-Mail oder Passwort falsch.');
        }

        const data = await response.json();
        console.log('Login erfolgreich, Token erhalten:', data);

        // --- WICHTIG: TOKEN SPEICHERN ---
        // Damit wir es bei späteren Requests (z.B. Secrets speichern) nutzen können
        if (data.token) {
            localStorage.setItem("jwtToken", data.token);
            // Optional: Rolle speichern, falls du Buttons verstecken willst
            if (data.role) localStorage.setItem("userRole", data.role);
        }
        // --------------------------------

        return data;

    } catch (error) {
        console.error('Fehler beim Login:', error.message);
        throw error;
    }
};

// --- NEW METHODS FOR PASSWORD RESET ---

/**
 * Sends the email to request a password reset link
 */
export const forgotPasswordRequest = async (email) => {
    const API_URL = getApiUrl();

    try {
        const response = await fetch(`${API_URL}/users/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email }) // Matches EmailAdress DTO
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed.');
        }

        return data;
    } catch (error) {
        console.error('Forgot password request failed:', error.message);
        throw error;
    }
};

/**
 * Resets the password using the token and the new password
 */
export const resetPasswordRequest = async (token, newPassword) => {
    const API_URL = getApiUrl();

    try {
        const response = await fetch(`${API_URL}/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                newPassword: newPassword
            }) // Matches NewPasswordRequest DTO
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Reset failed.');
        }

        return data;
    } catch (error) {
        console.error('Reset password failed:', error.message);
        throw error;
    }
};
export const postGoogleLogin = async (firebaseToken) => {
    const API_URL = getApiUrl();
    const url = `${API_URL}/users/google-login`; // Neuer Endpoint im Backend

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${firebaseToken}`, // Das Token als Bearer schicken
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Backend Login mit Google fehlgeschlagen');
        }

        const data = await response.json();

        // Token und Rolle wie beim normalen Login speichern
        if (data.token) {
            localStorage.setItem("jwtToken", data.token);
            if (data.role) localStorage.setItem("userRole", data.role);
        }

        return data;
    } catch (error) {
        console.error('Fehler beim Google-Login:', error.message);
        throw error;
    }

};
/**
 * Verifiziert den 2FA-PIN beim Backend
 */
export const verify2FAPin = async (email, pin) => {
    const API_URL = getApiUrl();
    const response = await fetch(`${API_URL}/users/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin })
    });

    const data = await response.json();

    if (response.ok && data.token) {
        // DAS HIER IST ENTSCHEIDEND:
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("userRole", data.role);
        return data;
    } else {
        throw new Error(data.message || "PIN falsch");
    }
};