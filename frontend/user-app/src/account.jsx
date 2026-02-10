import React from "react";

function Account() {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <h2>User Profile</h2>

      <p>
        <strong>Username:</strong> testuser
      </p>

      <p>
        <strong>Permissions:</strong> member
      </p>
    </div>
  );
}

export default Account;
