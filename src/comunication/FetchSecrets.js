/**
 * Fetch methods for secret API calls
 * @author Peter Rutschmann / Adapted for JWT
 */

// Hilfsfunktion für die URL (DRY Principle)
const getApiUrl = () => {
    const protocol = process.env.REACT_APP_API_PROTOCOL || 'http';
    const host = process.env.REACT_APP_API_HOST || 'localhost';
    const port = process.env.REACT_APP_API_PORT || '8080';
    const path = process.env.REACT_APP_API_PATH || '/api';
    const portPart = port ? `:${port}` : '';
    return `${protocol}://${host}${portPart}${path}`;
};

// 1. Secret posten (Erstellen)
export const postSecret = async ({ content, password }) => {
    const API_URL = getApiUrl();
    console.log("postSecret -> API_URL:", API_URL);

    // Token holen
    const token = localStorage.getItem("jwtToken");
    if (!token) throw new Error("Nicht eingeloggt. Bitte neu anmelden.");

    try {
        const response = await fetch(`${API_URL}/secrets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Wer bin ich?
            },
            body: JSON.stringify({
                content: content,
                encryptPassword: password // Schlüssel für den Tresor
            })
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error("Sitzung abgelaufen. Bitte neu einloggen.");
        }

        if (!response.ok) {
            let message = `Server response failed. Status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) message = errorData.message;
            } catch {}
            throw new Error(message);
        }

        const data = await response.json();
        console.log('Secret successfully posted:', data);
        return data;
    } catch (error) {
        console.error('Error posting secret:', error.message);
        throw new Error('Failed to save secret. ' + error.message);
    }
};

// 2. Alle Secrets eines Benutzers abrufen (Anzeigen)
// Wir brauchen das Passwort, um die Secrets zu entschlüsseln!
export const getSecretsforUser = async (password) => { // Passwort wird gebraucht zum Entschlüsseln
    const protocol = process.env.REACT_APP_API_PROTOCOL || 'http';
    const host = process.env.REACT_APP_API_HOST || 'localhost';
    const port = process.env.REACT_APP_API_PORT || '8080';
    const path = process.env.REACT_APP_API_PATH || '/api';
    const portPart = port ? `:${port}` : '';
    const API_URL = `${protocol}://${host}${portPart}${path}`;

    // 1. TOKEN HOLEN (Das hat wahrscheinlich gefehlt!)
    const token = localStorage.getItem("jwtToken");
    if (!token) throw new Error("Nicht eingeloggt.");

    try {
        // Wir nutzen jetzt POST auf /my-secrets (wie im neuen Controller definiert)
        const response = await fetch(`${API_URL}/secrets/my-secrets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <--- WICHTIG: Der Ausweis!
            },
            body: JSON.stringify({
                encryptPassword: password // Nur das Passwort senden (Email kommt aus Token)
            })
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error("Sitzung abgelaufen. Bitte neu einloggen.");
        }

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to get secrets:', error.message);
        throw error;
    }
};

// 3. Secret aktualisieren
export const updateSecret = async ({ id, content, password }) => {
    const API_URL = getApiUrl();

    // Token holen
    const token = localStorage.getItem("jwtToken");
    if (!token) throw new Error("Nicht eingeloggt.");

    try {
        const response = await fetch(`${API_URL}/secrets/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: content,
                encryptPassword: password // Um den neuen Content zu verschlüsseln
            })
        });

        if (!response.ok) {
            let message = `Update failed. Status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) message = errorData.message;
            } catch {}
            throw new Error(message);
        }

        const data = await response.json();
        console.log('Secret successfully updated:', data);
        return data;
    } catch (error) {
        console.error('Failed to update secret:', error.message);
        throw new Error('Failed to update secret. ' + error.message);
    }
};

// 4. Secret löschen (Habe ich zur Vollständigkeit ergänzt)
export const deleteSecret = async (id) => {
    const API_URL = getApiUrl();
    const token = localStorage.getItem("jwtToken");

    try {
        const response = await fetch(`${API_URL}/secrets/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Delete failed. Status: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error('Failed to delete secret:', error.message);
        throw error;
    }
};