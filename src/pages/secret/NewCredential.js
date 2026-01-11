import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {postSecret} from "../../comunication/FetchSecrets";
import '../../css/format.css';

/**
 * NewCredential
 * @author Peter Rutschmann
 */
function NewCredential({loginValues}) {
    const initialState = {
        kindid: 1,
        kind:"credential",
        userName: "",
        password: "",
        url: ""
    };
    const [credentialValues, setCredentialValues] = useState(initialState);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        console.log(loginValues)
        try {
            const content = credentialValues;
            await postSecret({loginValues, content});
            setCredentialValues(initialState);
            navigate('/secret/secrets');
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="page">
            <h2>Neues Zugangsdaten Geheimnis</h2>
            <form onSubmit={handleSubmit} className="card">
                <section className="formGrid">
                    <div className="field">
                        <label className="label">Benutzername</label>
                        <input
                            className="input"
                            type="text"
                            value={credentialValues.userName}
                            onChange={(e) =>
                                setCredentialValues(v => ({...v, userName: e.target.value}))}
                            required
                            placeholder="Gib den Benutzernamen ein"
                        />
                    </div>

                    <div className="field">
                        <label className="label">Passwort</label>
                        <input
                            className="input"
                            type="password"
                            value={credentialValues.password}
                            onChange={(e) =>
                                setCredentialValues(v => ({...v, password: e.target.value}))}
                            required
                            placeholder="Gib das Passwort ein"
                        />
                    </div>

                    <div className="field wFull">
                        <label className="label">Adresse</label>
                        <input
                            className="input"
                            type="url"
                            value={credentialValues.url}
                            onChange={(e) =>
                                setCredentialValues(v => ({...v, url: e.target.value}))}
                            required
                            placeholder="https://beispiel.ch"
                        />
                    </div>
                </section>

                <div className="actions mt16">
                    <button type="submit" className="btn btnPrimary">Speichern</button>
                    {errorMessage && <p className="error">{errorMessage}</p>}
                </div>
            </form>
        </div>
    );
}

export default NewCredential;
