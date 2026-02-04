import React, { useState } from "react";


function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const handleLogin = () => {
        // import login logic here
        // when the user clicks sign in.. redirect to open ID
        if (username === "" || password === "") {
            alert("Please enter both username and password.");
            return;
        }

        console.log(`Logging in with username: ${username} and password: ${password}`);
    };
    
    return (
        <div>
        <h2>Login</h2>
        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        </div>
    );

    
}
    export default Login;