import React, { useEffect, useState } from "react";
import "./admin.css";

/**
This function performs an update to the user's role in the UI
 * and then sends a request to the backend to persist the change. If the
 * backend request fails, the UI is rolled back to its previous state.
 * @returns Admin page for managing users and their permissions. Only accessible to admins.
 */
function Admin() {

    // Local state for loading, users list, and error message
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    // pull user data from the render backend
    useEffect(() => {
        let cancelled = false;

        async function loadUsers() {
        try {
            setLoading(true);
            setError("");

            const res = await fetch("https://ccic.onrender.com/api/admin/users", {
            credentials: "include",
            });

            if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
            }

        const json = await res.json();
        if (!cancelled) setUsers(json || []);
        } catch (e) {
            if (!cancelled) setError(e.message || "Failed to load users");
        } finally {
            if (!cancelled) setLoading(false);
        }
        }

        loadUsers();

        return () => {
        cancelled = true;
        };
    }, []);

    // update users role
    const updateUserRole = async (user_pk, newRole) => {

        // backup previous state in case of error
        const prevUsers = users.map((u) => ({ ...u }));

        setUsers((list) =>
            list.map((u) =>
            u.user_pk === user_pk ? { ...u, user_role: newRole } : u
            )
        );

        try {
            const res = await fetch(
                `https://ccic.onrender.com/api/admin/users/${user_pk}/role`,
                {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: newRole }),
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to update role");
            }
            } catch (e) {
            // rollback on error
            setUsers(prevUsers);
            alert(e.message || "Failed to update user role");
            }
    };

    // Note: This only removes the user from the UI. The backend API for deleting users is not implemented, so this does not complete the deletion
    const removeUser = (user_pk) => {
        const ok = window.confirm("Are you sure you want to delete this user?");
        if (!ok) return;

        setUsers((prev) => prev.filter((u) => u.user_pk !== user_pk));
    };

    // Loading and authorization states
    if (loading) return <div>Loading…</div>;
    if (error) return <div className="admin-error">{error}</div>;


    // return admin page
    return (
        <div className="admin-page">
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
                    <td>
                    <select
                        value={u.user_role}
                        onChange={(e) =>
                        updateUserRole(u.user_pk, e.target.value)
                        }
                    >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                    </select>
                    </td>
                    <td className="admin-delete">
                    <button
                        type="button"
                        className="admin-delete-btn"
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