// make a list of users and a list of their permissions
// be able to edit permissions and remove users
// makes a log of edits users have given to the portfolio

import React, { useEffect, useState } from "react";

function Admin() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const isAdmin = true; // hardcoded for now

  useEffect(() => {
    const load = async () => {
      try {
        // fetch users list (admin-only endpoint)
        const usersRes = await fetch(
          "https://ccic.onrender.com/api/admin/users",
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

