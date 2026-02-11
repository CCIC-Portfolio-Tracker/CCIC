import React from "react";

/**
 * Creates an acount page and displays the user's name and permissions. Also has a logout button that calls the onLogout function passed in as a prop.
 * @returns account page
 */
function Account({userName, isAdmin, isMember, onLogout}) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <p> <strong>Username:</strong> {userName}
      </p>
      <p>  <strong>Permissions:</strong> {isAdmin ? "Admin" : isMember ? "Member" : "User"}
      </p>
      <button style ={{marginTop: "10px"}} onClick={onLogout} type="button">
        Logout

      </button>
    </div>
  );
}

export default Account;
