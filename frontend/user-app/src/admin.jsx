// make a list of users and a list of their permissions
// be able to edit permissions and remove users
// makes a log of edits users have given to the portfolio

import React, { useEffect, useState } from "react";
import "./admin.css";

function Admin() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const isAdmin = true; // hardcoded for now

  useEffect(() => {
    // fake users (no backend)
    const fakeUsers = [
      { user_pk: 1, user_name: "noe", user_role: "admin" },
      { user_pk: 2, user_name: "james", user_role: "admin" },
      { user_pk: 3, user_name: "testuser", user_role: "viewer" },
    ];

    setUsers(fakeUsers);
    setLoading(false);
  }, []);

  const removeUser = (user_pk) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    setUsers((prev) => prev.filter((u) => u.user_pk !== user_pk));
  };

  if (loading) {
    return <div>Loading…</div>;
  }

  if (!isAdmin) {
    return <div>Unauthorized.</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Admin</h1>

      <h2 className="admin-section-title">Users</h2>
      {users.length === 0 ? (
        <div className="admin-empty">No users found.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th className="admin-delete">Remove</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_pk}>
                <td>{u.user_name}</td>
                <td>{u.user_role}</td>
                <td className="admin-delete">
                  <button
                    type="button"
                    className="admin-delete-btn"
                    aria-label={`Remove ${u.user_name}`}
                    title="Remove user"
                    onClick={() => removeUser(u.user_pk)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Admin;




      /*// make a list of users and a list of their permissions
// be able to edit permissions and remove users
// makes a log of edits users have given to the portfolio

import React, { useEffect, useState } from "react";

function Admin() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // from backend

  useEffect(() => {
    const load = async () => {
      try {
        // confirm admin
        const statusRes = await fetch(
          "https://ccic.onrender.com/api/auth/status",
          { credentials: "include" }
        );

        const status = await statusRes.json();

        if (!status.loggedIn || !status.isAdmin) {
          setIsAdmin(false);
          setUsers([]);
          return;
        }

        setIsAdmin(true);

        // fetch users list (admin-only endpoint)
        const usersRes = await fetch(
          "https://ccic.onrender.com/api/admin/users",
          { credentials: "include" }
        );

        if (!usersRes.ok) {
          const text = await usersRes.text();
          throw new Error(text || `HTTP ${usersRes.status}`);
        }

        const usersJson = await usersRes.json();
        setUsers(usersJson || []);
      } catch (e) {
        console.error("Admin load failed:", e);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div>Loading…</div>;
  }

  if (!isAdmin) {
    return <div>Unauthorized.</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Admin</h1>

      <h2>Users</h2>
      {users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.user_pk}>
              <strong>{u.user_name}</strong> — {u.user_role}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Admin;

*/

