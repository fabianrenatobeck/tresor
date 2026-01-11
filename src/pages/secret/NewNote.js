import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postSecret } from "../../comunication/FetchSecrets";
import '../../css/format.css';

/**
 * NewNote
 * @author Peter Rutschmann
 */
function NewNote({ loginValues }) {
    const initialState = {
        kindid: 3,
        kind: "note",
        title: "",
        content: "",
    };
    const [noteValues, setNoteValues] = useState(initialState);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            // WICHTIG: Wir müssen das Objekt in einen String umwandeln,
            // damit Titel UND Inhalt verschlüsselt gespeichert werden.
            const contentAsString = JSON.stringify(noteValues);

            // ÄNDERUNG: Wir übergeben content UND das password separat!
            await postSecret({
                content: contentAsString,
                password: loginValues.password // <--- Hier kommt der Schlüssel her!
            });

            setNoteValues(initialState);
            navigate('/secret/secrets');
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="page">
            <h2>Neue Notiz</h2>
            <form onSubmit={handleSubmit} className="card">
                <section className="formGrid">
                    <div className="field">
                        <label className="label">Titel</label>
                        <input
                            className="input"
                            type="text"
                            value={noteValues.title}
                            onChange={(e) => setNoteValues(v => ({...v, title: e.target.value}))}
                            required
                            placeholder="Titel eingeben"
                        />
                    </div>

                    <div className="field wFull">
                        <label className="label">Inhalt</label>
                        <textarea
                            className="textarea"
                            value={noteValues.content}
                            onChange={(e) => setNoteValues(v => ({...v, content: e.target.value}))}
                            required
                            placeholder="Schreibe deine Notiz"
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

export default NewNote;