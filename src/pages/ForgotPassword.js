import React, { useState } from 'react';
import { forgotPasswordRequest } from "../comunication/FetchUser";

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("Sending request...");
        try {
            const data = await forgotPasswordRequest(email);
            // Backend liefert immer "answer": "Falls diese E-Mail existiert..."
            setMessage(data.answer);
        } catch (error) {
            setMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <p>Please enter your email address to receive a reset link.</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                />
                <button type="submit">Send Link</button>
            </form>
            {message && <p style={{ marginTop: '10px', color: 'blue' }}>{message}</p>}
        </div>
    );
}

export default ForgotPassword;