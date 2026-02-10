import React, { useState } from "react";
import "./login.css";   

// Handles the login page and OIDC authentication flow
function Login() {
    const handleOIDCLogin = () => {
        window.location.href = "https://ccic.onrender.com/api/auth/login";
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h2>Colorado College Login</h2>
                <button className="button" onClick={handleOIDCLogin}>
                    Sign in with School ID
                </button>
            </div>
        </div>
    );
}

export default Login;
