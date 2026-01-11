import React, { useEffect, useState } from 'react';
import { getSecretsforUser, updateSecret } from '../../comunication/FetchSecrets';
import '../../css/format.css';

const Secrets = ({ loginValues }) => {
    const [secrets, setSecrets] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchSecrets = async () => {
            setErrorMessage('');
            // Wir brauchen Email (fürs UI/Logik) und Passwort (fürs Entschlüsseln)
            if (!loginValues.email || !loginValues.password) {
                setErrorMessage('Bitte logge dich erneut ein (Passwort fehlt).');
                return;
            }
            try {
                // ÄNDERUNG 1: Nur das Passwort übergeben!
                const data = await getSecretsforUser(loginValues.password);
                setSecrets(data);
            } catch (error) {
                setErrorMessage(error.message);
            }
        };
        fetchSecrets();
    }, [loginValues]);

    const handleEditClick = (secret) => {
        // Hier parsen wir den String in ein Objekt für das Formular
        let parsed = secret.content;
        if (typeof secret.content === 'string') {
            try {
                parsed = JSON.parse(secret.content);
            } catch (e) {
                parsed = {}; // Fallback
            }
        }
        setEditingId(secret.id);
        setEditValues(parsed);
    };

    const handleSaveClick = async (secretId) => {
        try {
            // ÄNDERUNG 2: Objekt wieder in String umwandeln!
            // Das Backend erwartet einen String, kein JSON-Objekt.
            const contentAsString = JSON.stringify(editValues);

            // ÄNDERUNG 3: Parameter anpassen (password separat übergeben)
            await updateSecret({
                id: secretId,
                content: contentAsString,
                password: loginValues.password
            });

            alert('Secret aktualisiert!');
            setEditingId(null);

            // Neu laden mit Passwort
            const updated = await getSecretsforUser(loginValues.password);
            setSecrets(updated);
        } catch (err) {
            alert('Fehler: ' + err.message);
        }
    };

    const handleCancelClick = () => {
        setEditingId(null);
        setEditValues({});
    };

    return (
        <div className="page">
            <h1>Meine Geheimnisse</h1>
            {errorMessage && <p className="error">{errorMessage}</p>}

            {secrets?.length > 0 ? (
                <div className="secretsContainer">
                    {secrets.map((secret) => {
                        // Inhalt für die Anzeige parsen
                        let content;
                        try {
                            content =
                                typeof secret.content === 'string'
                                    ? JSON.parse(secret.content)
                                    : secret.content;
                        } catch {
                            content = { error: 'Fehler beim Lesen', raw: secret.content };
                        }

                        const { kind } = content || {};

                        return (
                            <div key={secret.id} className="secretCard">
                                <div className="secretHeader">
                                    <h3>Secret #{secret.id}</h3>
                                    {/* User ID ist für den User meist uninteressant, aber ok */}
                                    <span className="secretMeta">ID: {secret.id}</span>
                                </div>

                                {editingId === secret.id ? (
                                    <div className="secretContent">
                                        {/* Dynamisches Formular basierend auf Keys */}
                                        {Object.keys(editValues).map((key) =>
                                            key !== 'kind' && key !== 'kindid' ? (
                                                <div className="field" key={key}>
                                                    <label className="label">{key}:</label>
                                                    <input
                                                        className="input"
                                                        value={editValues[key]}
                                                        onChange={(e) =>
                                                            setEditValues((prev) => ({
                                                                ...prev,
                                                                [key]: e.target.value
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            ) : null
                                        )}
                                        <div className="actions mt16">
                                            <button
                                                onClick={() => handleSaveClick(secret.id)}
                                                className="btn btnPrimary"
                                            >
                                                Speichern
                                            </button>
                                            <button onClick={handleCancelClick} className="btn">
                                                Abbrechen
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="secretContent">
                                        {/* Anzeige Logik */}
                                        {kind === 'credential' && (
                                            <>
                                                <p><strong>Typ:</strong> Zugangsdaten</p>
                                                <p><strong>Benutzername:</strong> {content.userName}</p>
                                                <p><strong>Passwort:</strong> {content.password}</p>
                                                <p><strong>URL:</strong> {content.url}</p>
                                            </>
                                        )}
                                        {kind === 'note' && (
                                            <>
                                                <p><strong>Typ:</strong> Notiz</p>
                                                <p><strong>Titel:</strong> {content.title}</p>
                                                <p><strong>Inhalt:</strong> {content.content}</p>
                                            </>
                                        )}
                                        {kind === 'creditcard' && (
                                            <>
                                                <p><strong>Typ:</strong> Kreditkarte</p>
                                                <p><strong>Kartentyp:</strong> {content.cardtype}</p>
                                                <p><strong>Nummer:</strong> {content.cardnumber}</p>
                                                <p><strong>Ablauf:</strong> {content.expiration}</p>
                                                <p><strong>CVV:</strong> {content.cvv}</p>
                                            </>
                                        )}
                                        {/* Fallback falls unbekannter Typ */}
                                        {!['credential', 'note', 'creditcard'].includes(kind) && (
                                            <div>
                                                <p><strong>Raw Content:</strong></p>
                                                <pre>{JSON.stringify(content, null, 2)}</pre>
                                            </div>
                                        )}

                                        <div className="actions mt16">
                                            <button
                                                onClick={() => handleEditClick(secret)}
                                                className="btn btnPrimary"
                                            >
                                                Bearbeiten
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="noSecrets">Keine Secrets vorhanden (oder Ladefehler).</p>
            )}
        </div>
    );
};

export default Secrets;