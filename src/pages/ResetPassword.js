import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordRequest } from "../comunication/FetchUser";
import PasswordStrengthBar from "./PasswordStrengthBar";
import { calculatePasswordStrength } from "./passwordStrength";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Token aus der URL lesen (?token=XYZ)
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [strength, setStrength] = useState({ score: 0, label: "Too short", color: "#ccc" });

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        setStrength(calculatePasswordStrength(val));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError("Invalid link (missing token).");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (strength.score < 5) {
            setError("Password is too weak.");
            return;
        }

        try {
            const data = await resetPasswordRequest(token, password);
            setMessage(data.answer || "Password changed successfully!");
            setTimeout(() => navigate('/login'), 3000); // Nach 3 Sek zum Login
        } catch (err) {
            setError(err.message);
        }
    };

    if (!token) return <p>Invalid Password Reset Link.</p>;

    return (
        <div>
            <h2>Set New Password</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>New Password:</label>
                    <input type="password" value={password} onChange={handlePasswordChange} required />
                    <PasswordStrengthBar score={strength.score} label={strength.label} color={strength.color} />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit">Change Password</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default ResetPassword;