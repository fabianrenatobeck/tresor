export function calculatePasswordStrength(password) {
    let score = 8;

    if (!password) return { score: 0, label: "Sehr schwach", color: "#ff0000" };

    // Länge
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Zeichengruppen
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Bonus: keine 3 gleichen nacheinander
    if (!/(.)\1{2,}/.test(password)) score++;

    let label = "Sehr schwach";
    if (score >= 3) label = "Schwach";
    if (score >= 5) label = "Mittel";
    if (score >= 7) label = "Stark";
    if (score >= 8) label = "Sehr stark";

    const colors = ["#ff0000", "#ff3b3b", "#ffa500", "#ffe600", "#9acd32", "#00cc00"];
    const color = colors[Math.min(score, colors.length - 1)];

    return { score, label, color };
}
