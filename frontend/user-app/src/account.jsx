import React, { use } from "react";

function Account({userName, isAdmin, isMember, logout}) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >

      <p>
        <strong>Username:</strong> {userName}
      </p>

      <p>
        <strong>Permissions:</strong> {isAdmin ? "Admin" : isMember ? "Member" : "User"}
      </p>

      <button style ={{marginTop: "10px"}} onClick={logout} type="button">
        Logout

      </button>
    </div>
  );
}

export default Account;
