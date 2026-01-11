import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {postSecret} from "../../comunication/FetchSecrets";
import '../../css/format.css';


/**
 * NewCreditCard
 * @author Peter Rutschmann
 */
function NewCreditCard({loginValues}) {
    const initialState = {
        kindid: 2,
        kind:"creditcard",
        cardtype: "",
        cardnumber: "",
        expiration: "",
        cvv: ""
    };
    const [creditCardValues, setCreditCardValues] = useState(initialState);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const content = creditCardValues;
            await postSecret({loginValues, content});
            setCreditCardValues(initialState);
            navigate('/secret/secrets');
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="page">
            <h2>Neue Karten Geheimnis</h2>
            <form onSubmit={handleSubmit} className="card">
                <section className="formGrid">
                    <div className="field">
                        <label className="label">Kartentyp</label>
                        <select
                            className="select"
                            value={creditCardValues.cardtype}
                            onChange={(e) => setCreditCardValues(v => ({...v, cardtype: e.target.value}))}
                            required
                        >
                            <option value="" disabled>Waehle den Typ</option>
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                        </select>
                    </div>

                    <div className="field">
                        <label className="label">Kartennummer</label>
                        <input
                            className="input"
                            type="text"
                            inputMode="numeric"
                            value={creditCardValues.cardnumber}
                            onChange={(e) => setCreditCardValues(v => ({...v, cardnumber: e.target.value}))}
                            required
                            placeholder="Ziffern eingeben"
                        />
                    </div>

                    <div className="field">
                        <label className="label">Gueltig bis mm jj</label>
                        <input
                            className="input"
                            type="text"
                            value={creditCardValues.expiration}
                            onChange={(e) => setCreditCardValues(v => ({...v, expiration: e.target.value}))}
                            required
                            placeholder="z. B. 04 28"
                        />
                    </div>

                    <div className="field">
                        <label className="label">Pruefziffer</label>
                        <input
                            className="input"
                            type="text"
                            inputMode="numeric"
                            value={creditCardValues.cvv}
                            onChange={(e) => setCreditCardValues(v => ({...v, cvv: e.target.value}))}
                            required
                            placeholder="CVV"
                        />
                    </div>
                </section>

                <div className="actions mt16">
                    <span className="badge" title="Wird verschluesselt">Sicher gespeichert</span>
                    <button type="submit" className="btn btnPrimary">Speichern</button>
                    {errorMessage && <p className="error">{errorMessage}</p>}
                </div>
            </form>
        </div>
    );
}

export default NewCreditCard;
