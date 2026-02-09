import React, { useState } from "react";
import "./login.css";   

/*
function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // add openid login logic here

    const handleLogin = () => {
        if (username === "" || password === "") {
            alert("Please enter both username and password.");
            return;
        }

    console.log(`Logging in with username: ${username}`);
  };

  return (
    <div className="login-page">
        <div className="login-box">
            <h2>Login</h2>
            

            <input
            className="text_area"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />

            <input
            className="text_area"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />

            <button className="button" onClick={handleLogin}>
            Login
            </button>
         </div>
    </div>
  );
}
*/

function Login() {
    const handleOIDCLogin = () => {
        window.location.href = "http://localhost:3000/api/auth/login";
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
