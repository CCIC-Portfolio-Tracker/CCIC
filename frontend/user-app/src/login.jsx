import React, { useState } from "react";
import "./login.css";   

/** 
 * Generates a loin page that directs users to the OIDC authentication flow
 * @returns Login page
*/
function Login() {
    const handleOIDCLogin = () => {
        window.location.href = "/api/auth/login";
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
