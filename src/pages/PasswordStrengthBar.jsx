import React from "react";

const PasswordStrengthBar = ({ score, label, color }) => {
    const percentage = Math.min((score / 8) * 100, 100);

    return (
        <div style={{ marginTop: "10px" }}>
            <div
                style={{
                    height: "10px",
                    width: "100%",
                    background: "#ddd",
                    borderRadius: "6px"
                }}
            >
                <div
                    style={{
                        height: "10px",
                        width: `${percentage}%`,
                        background: color,
                        borderRadius: "6px",
                        transition: "width 0.3s ease, background 0.3s ease"
                    }}
                />
            </div>
            <p style={{ marginTop: "5px" }}>
                Stärke: <strong>{label}</strong>
            </p>
        </div>
    );
};

export default PasswordStrengthBar;
