/**
 * Fetch methods for secret API calls
 * @author Peter Rutschmann
 */

// Secret posten
export const postSecret = async ({ loginValues, content }) => {
    const protocol = process.env.REACT_APP_API_PROTOCOL; // z. B. "http"
    const host = process.env.REACT_APP_API_HOST;         // z. B. "localhost"
    const port = process.env.REACT_APP_API_PORT;         // z. B. "8080"
    const path = process.env.REACT_APP_API_PATH;         // z. B. "/api"
    const portPart = port ? `:${port}` : '';
    const API_URL = `${protocol}://${host}${portPart}${path}`;
    console.log("postSecret -> API_URL:", API_URL);

    try {
        const response = await fetch(`${API_URL}/secrets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: loginValues.email,
                encryptPassword: loginValues.password, // wichtig: nicht "password"
                content: content
            })
        });

        if (!response.ok) {
            let message = `Server response failed. Status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) message = errorData.message;
            } catch {
                // kein JSON im Body → ignorieren
            }
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

// Alle Secrets eines Benutzers abrufen (per Email)
export const getSecretsforUser = async (loginValues) => {
    const protocol = process.env.REACT_APP_API_PROTOCOL;
    const host = process.env.REACT_APP_API_HOST;
    const port = process.env.REACT_APP_API_PORT;
    const path = process.env.REACT_APP_API_PATH;
    const portPart = port ? `:${port}` : '';
    const API_URL = `${protocol}://${host}${portPart}${path}`;
    console.log("getSecretsforUser -> API_URL:", API_URL);

    try {
        const response = await fetch(`${API_URL}/secrets/byemail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: loginValues.email,
                encryptPassword: loginValues.password // wichtig: muss mit Backend übereinstimmen
            })
        });

        if (!response.ok) {
            let message = `Server response failed. Status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) message = errorData.message;
            } catch {
                // kein JSON im Body → ignorieren
            }
            throw new Error(message);
        }

        const data = await response.json();
        console.log('Secrets successfully received:', data);
        return data;

    } catch (error) {
        console.error('Failed to get secrets:', error.message);
        throw new Error('Failed to get secrets. ' + error.message);
    }
};
