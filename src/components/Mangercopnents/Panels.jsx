import React, { useEffect, useMemo, useState } from "react";

import {
  FiSearch,
  FiMail,
  FiClock,
  FiUsers,
  FiUserCheck,
  FiAlertCircle,
} from "react-icons/fi";

import {
  ROLES,
  STATUS,
  nowISO,
  uid,
  labelOf,
  isValidEmail,
  roleBadgeClass,
  statusBadgeClass,
  initialsOf,
} from "../../information";
import axios from "axios";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const USERS_API_URL = "http://localhost:5001/api/users";
const TICKETS_API_URL = "http://localhost:5001/api/tickets";



/* USERS  */

export function UsersPanel({ users, setUsers, query, setQuery }) {
  // Filters
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [draft, setDraft] = useState({
    name: "",
    email: "",
    role: ROLES[0].key,
    status: STATUS[0].key,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filtered users
  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return users.filter(function (u) {
      const matchesQ =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesQ && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  function openAdd() {
    console.log("openAdd clicked");
    setEditingId(null);
    setErrorMessage("");
    setSuccessMessage("");
    setDraft({
      name: "",
      email: "",
      role: ROLES[0].key,
      status: STATUS[0].key,
    });
    setShowModal(true);
  }

  function openEdit(u) {
    setEditingId(u.id);
    setErrorMessage("");
    setSuccessMessage("");
    setDraft({
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function submitModal(e) {
    e.preventDefault();

    // Clear old messages
    setErrorMessage("");
    setSuccessMessage("");

    // Basic validation
    if (!draft.name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }
    if (!isValidEmail(draft.email)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    // EDIT EXISTING USER (still local)
    if (editingId) {
      try {
        const payload = {
          name: draft.name.trim(),
          email: draft.email.trim(),
          role: draft.role,
          status: draft.status,
        };

        const res = await fetch(`${USERS_API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setErrorMessage(err.message || "Failed to update user.");
          return;
        }

        const updatedUser = await res.json();

        setUsers(
          users.map((u) => (u.id === editingId ? updatedUser : u))
        );

        setSuccessMessage("User updated successfully!");
        setTimeout(closeModal, 800);
        return;
      } catch (err) {
        console.error(err);
        setErrorMessage("Cannot connect to the server.");
        return;
      }
    }


    // ➕ ADD NEW USER (POST → Backend → MongoDB)
    try {
      const payload = {
        name: draft.name.trim(),
        email: draft.email.trim(),
        role: draft.role,
        status: draft.status,
      };

      const res = await fetch(USERS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Backend error? (409 for email duplicate)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.message || "Failed to create user.");
        return;
      }

      // Success — new user created in MongoDB
      const saved = await res.json();

      const newUser = {
        id: saved._id || saved.id,
        createdAt: saved.createdAt || new Date().toISOString(),
        name: saved.name,
        email: saved.email,
        role: saved.role,
        status: saved.status,
      };

      // Update UI
      setUsers([newUser, ...users]);
      setSuccessMessage("User added successfully!");

      // Auto-close after delay
      setTimeout(() => {
        closeModal();
      }, 800);
    } catch (err) {
      console.error(err);
      setErrorMessage("Cannot connect to the server.");
    }
  }

  const total = users.length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const inactiveCount = users.filter((u) => u.status === "inactive").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;

  return (
    <div className="row g-3">
      <div className="col-12">
        {/* Stats cards */}
        <div className="row g-3 mb-2">
          <div className="col-6 col-md-3">
            <section className="card shadow-sm border-0 p-3 rounded-3">
              <p className="text-muted small mb-1">Total Users</p>
              <h3 className="m-0 fw-semibold">{total}</h3>
            </section>
          </div>
          <div className="col-6 col-md-3">
            <section className="card shadow-sm border-0 p-3 rounded-3">
              <p className="text-muted small mb-1">Active Users</p>
              <h3 className="m-0 fw-semibold text-success">{activeCount}</h3>
            </section>
          </div>
          <div className="col-6 col-md-3">
            <section className="card shadow-sm border-0 p-3 rounded-3">
              <p className="text-muted small mb-1">Inactive</p>
              <h3 className="m-0 fw-semibold text-warning">{inactiveCount}</h3>
            </section>
          </div>
          <div className="col-6 col-md-3">
            <section className="card shadow-sm border-0 p-3 rounded-3">
              <p className="text-muted small mb-1">Suspended</p>
              <h3 className="m-0 fw-semibold text-danger">{suspendedCount}</h3>
            </section>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar d-flex flex-wrap align-items-center mb-3 p-2 rounded shadow-sm bg-light">
          <div className="flex-grow-1 me-3">
            <input
              className="form-control fs-5 py-2 shadow-sm"
              placeholder="Search users by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2 align-items-center ms-auto">
            <select
              className="form-select w-auto"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              {ROLES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>

            <select
              className="form-select w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {STATUS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>

            <button className="btn btn-dark px-4" onClick={openAdd}>
              + Add User
            </button>
          </div>
        </div>

        {/* Users table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 56 }}></th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="text-center">
                        <div
                          className="rounded-circle bg-secondary-subtle text-secondary fw-bold d-inline-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }}
                          title={u.name}
                        >
                          {initialsOf(u.name)}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{u.name}</div>
                        <div className="text-muted small">{u.email}</div>
                      </td>
                      <td>
                        <span className={roleBadgeClass(u.role)}>
                          {labelOf(ROLES, u.role)}
                        </span>
                      </td>
                      <td>
                        <span className={statusBadgeClass(u.status)}>
                          {labelOf(STATUS, u.status)}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => openEdit(u)}
                          >
                            Edit
                          </button>
                         <button
                        className="btn btn-sm btn-dark"
                        onClick={async () => {
                          if (!window.confirm("Delete this user?")) return;

                          try {
                            const res = await fetch(`${USERS_API_URL}/${u.id}`, {
                              method: "DELETE",
                            });

                            if (!res.ok) {
                              const err = await res.json().catch(() => ({}));
                              alert(err.message || "Failed to delete user.");
                              return;
                            }

                            setUsers(users.filter((x) => x.id !== u.id));
                          } catch (err) {
                            console.error("Delete user error:", err);
                            alert("Cannot connect to the server.");
                          }
                        }}
                      >
                        Delete
                      </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No users match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <>
            <div className="modal-backdrop fade show" onClick={closeModal} />
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              style={{ zIndex: 1050 }}
            >
              <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h6 className="modal-title">
                      {editingId ? "Edit User" : "Add User"}
                    </h6>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeModal}
                    />
                  </div>
                  <form onSubmit={submitModal}>
                    <div className="modal-body">
                      {errorMessage && (
                        <div className="alert alert-danger py-2 small mb-2">
                          {errorMessage}
                        </div>
                      )}
                      {successMessage && (
                        <div className="alert alert-success py-2 small mb-2">
                          {successMessage}
                        </div>
                      )}

                      <div className="mb-2">
                        <label className="form-label small text-muted">
                          Name
                        </label>
                        <input
                          className="form-control"
                          value={draft.name}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, name: e.target.value }))
                          }
                          autoFocus
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={draft.email}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, email: e.target.value }))
                          }
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted">
                          Role
                        </label>
                        <select
                          className="form-select"
                          value={draft.role}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, role: e.target.value }))
                          }
                        >
                          {ROLES.map((r) => (
                            <option key={r.key} value={r.key}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label small text-muted">
                          Status
                        </label>
                        <select
                          className="form-select"
                          value={draft.status}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, status: e.target.value }))
                          }
                        >
                          {STATUS.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-dark">
                        {editingId ? "Save Changes" : "Add User"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


/* SETTINGS  */
export function SettingsPanel({ settings, setSettings, users = [] }) {
  // ========== HELPERS FOR NOTIFICATIONS ==========
  function makeInitialNotifications(base) {
    const b = base || {};
    return {
      emailAlerts:
        b.notifications && typeof b.notifications.emailAlerts === "boolean"
          ? b.notifications.emailAlerts
          : false,
      ticketBadge:
        b.notifications && typeof b.notifications.ticketBadge === "boolean"
          ? b.notifications.ticketBadge
          : false,
      push:
        b.notifications && typeof b.notifications.push === "boolean"
          ? b.notifications.push
          : false,
    };
  }

  // 🔹 assignments live in DB; we keep them in state here
  const [assignments, setAssignments] = useState([]); // [{_id, advisorId, ownerId}, ...]
  const [notifications, setNotifications] = useState(makeInitialNotifications(settings));

  // pull advisors & owners from users prop (same as before)
  const advisors = (users || []).filter((u) => u.role === "advisor");
  const owners = (users || []).filter((u) => u.role === "owner");

  // local selects for new assignment
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(advisors[0]?.id || "");
  const [selectedOwnerId, setSelectedOwnerId] = useState(owners[0]?.id || "");

  // keep selects valid when users change
  useEffect(() => {
    if (!advisors.find((a) => a.id === selectedAdvisorId)) {
      setSelectedAdvisorId(advisors[0]?.id || "");
    }
    if (!owners.find((o) => o.id === selectedOwnerId)) {
      setSelectedOwnerId(owners[0]?.id || "");
    }
  }, [advisors, owners]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========== LOAD ASSIGNMENTS FROM BACKEND ONCE ==========
  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await axios.get("http://localhost:5001/api/assignments");
        // map to simple shape
        const list = (res.data || []).map((a) => ({
          _id: a._id,
          advisorId: String(a.advisorId),
          ownerId: String(a.ownerId),
        }));
        setAssignments(list);

        // also push into parent settings so other parts can use it if needed
        setSettings({
          assignments: list,
          notifications,
        });
      } catch (err) {
        console.error("Failed to load assignments:", err);
      }
    }

    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========== ASSIGN / REMOVE ==========
  async function addAssignment(e) {
    e.preventDefault();
    if (!selectedAdvisorId || !selectedOwnerId) return;

    // prevent duplicate in UI
    const exists = assignments.some(
      (a) =>
        a.advisorId === selectedAdvisorId && a.ownerId === selectedOwnerId
    );
    if (exists) {
      alert("This advisor already has that owner assigned.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/api/assignments", {
        advisorId: selectedAdvisorId,
        ownerId: selectedOwnerId,
      });

      const saved = res.data;
      const toAdd = {
        _id: saved._id,
        advisorId: String(saved.advisorId),
        ownerId: String(saved.ownerId),
      };

      const next = [toAdd, ...assignments];
      setAssignments(next);

      setSettings({
        assignments: next,
        notifications,
      });
    } catch (err) {
      console.error("Assign owner error:", err);
      alert("Failed to assign owner. Check backend logs.");
    }
  }

  async function removeAssignment(assignmentId) {
    try {
      await axios.delete(
        `http://localhost:5001/api/assignments/${assignmentId}`
      );

      const next = assignments.filter((a) => a._id !== assignmentId);
      setAssignments(next);

      setSettings({
        assignments: next,
        notifications,
      });
    } catch (err) {
      console.error("Remove assignment error:", err);
      alert("Failed to remove assignment.");
    }
  }

  // ========== SAVE NOTIFICATIONS ONLY ==========
  function save() {
    const cleanNotifications = {
      emailAlerts: !!notifications.emailAlerts,
      ticketBadge: !!notifications.ticketBadge,
      push: !!notifications.push,
    };

    setNotifications(cleanNotifications);

    setSettings({
      assignments,
      notifications: cleanNotifications,
    });

    alert("Settings saved successfully!");
  }

  // ========== SUMMARY CALCULATIONS ==========
  const assignedOwnerIds = new Set(assignments.map((a) => a.ownerId));
  const assignedOwnersCount = assignedOwnerIds.size;

  const unassignedOwners = owners.filter((o) => !assignedOwnerIds.has(o.id));

  const advisorLoad = {};
  assignments.forEach((a) => {
    advisorLoad[a.advisorId] = (advisorLoad[a.advisorId] || 0) + 1;
  });

  const averageLoad =
    advisors.length > 0
      ? (assignedOwnersCount / advisors.length).toFixed(1)
      : 0;

  // ========== RENDER ==========
  return (
    <div className="row g-3">
      {/* LEFT COLUMN: Assignments + Notifications */}
      <div className="col-12 col-lg-6">
        {/* Advisor–Owner assignment card */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <FiUserCheck className="me-2 text-primary" size={20} />
              <h5 className="mb-0">Advisor Assignments</h5>
            </div>

            {advisors.length === 0 || owners.length === 0 ? (
              <div className="alert alert-warning small d-flex align-items-center">
                <FiAlertCircle className="me-2" />
                You need at least one advisor and one owner to create
                assignments.
              </div>
            ) : (
              <form onSubmit={addAssignment} className="vstack gap-2 mb-3">
                <div>
                  <label className="form-label small text-muted">
                    Advisor
                  </label>
                  <select
                    className="form-select"
                    value={selectedAdvisorId}
                    onChange={(e) => setSelectedAdvisorId(e.target.value)}
                  >
                    {advisors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label small text-muted">
                    Owner
                  </label>
                  <select
                    className="form-select"
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                  >
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-end">
                  <button type="submit" className="btn btn-dark">
                    Assign Owner
                  </button>
                </div>
              </form>
            )}

            {/* Existing assignments list */}
            <h6 className="fw-semibold mb-2">Current Assignments</h6>
            {assignments.length === 0 ? (
              <div className="text-muted small">
                No assignments yet. Use the form above to assign owners to
                advisors.
              </div>
            ) : (
              <ul className="list-group small">
                {assignments.map((a) => {
                  const adv = advisors.find((x) => x.id === a.advisorId);
                  const own = owners.find((x) => x.id === a.ownerId);
                  if (!adv || !own) return null;
                  return (
                    <li
                      key={a._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>
                        <strong>{adv.name}</strong> → {own.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeAssignment(a._id)}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>       
      </div>

      {/* RIGHT COLUMN: Assignment Summary */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <FiUsers className="me-2 text-primary" size={20} />
              <h5 className="mb-0">Assignment Summary</h5>
            </div>

            <div className="vstack gap-2 mb-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Total Owners</span>
                <strong>{owners.length}</strong>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Total Advisors</span>
                <strong>{advisors.length}</strong>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Assigned Owners</span>
                <strong>{assignedOwnersCount}</strong>
              </div>

              <div className="d-flex justify-content-between text-danger">
                <span>Unassigned Owners</span>
                <strong>{unassignedOwners.length}</strong>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Average Owners per Advisor</span>
                <strong>{averageLoad}</strong>
              </div>
            </div>

            <hr />

            <h6 className="fw-semibold mb-2">Unassigned Owners</h6>
            {unassignedOwners.length === 0 ? (
              <div className="text-muted small">
                All owners have an advisor assigned 🎉
              </div>
            ) : (
              <ul className="list-group small mb-3">
                {unassignedOwners.map((o) => (
                  <li
                    key={o.id}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <span>{o.name}</span>
                    <span className="text-muted">{o.email}</span>
                  </li>
                ))}
              </ul>
            )}

            <h6 className="fw-semibold mb-2">Advisor Load</h6>
            {advisors.length === 0 ? (
              <div className="text-muted small">
                No advisors in the system.
              </div>
            ) : (
              <ul className="list-group small">
                {advisors.map((a) => (
                  <li
                    key={a.id}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <span>{a.name}</span>
                    <strong>{advisorLoad[a.id] || 0} owners</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


/*  ANALYTICS  */
export function AnalyticsPanel({ analytics, users, refresh }) {
  const actives = users.filter((u) => u.status === "active").length;
  const total = users.length;
  const inactive = users.filter((u) => u.status === "inactive").length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const ratio = total ? Math.round((actives / total) * 100) : 0;

  // Helper to display a meaningful name
  const displayName = (u) =>
    u.name || u.fullName || u.username || u.email;

  /* ---------------- CHART: USAGE OVER TIME ---------------- */
  const chartData = useMemo(() => {
    const countsByMonthKey = {};
    users.forEach((u) => {
      if (u.status !== "active") return;

      const base = u.lastLoginAt || u.createdAt;
      if (!base) return;

      const d = new Date(base);
      if (Number.isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      countsByMonthKey[key] = (countsByMonthKey[key] || 0) + 1;
    });
    const out = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      out.push({
        month: dt.toLocaleString(undefined, { month: "short" }),
        users: countsByMonthKey[key] || 0,
      });
    }
    return out;
  }, [users]);

  /* ---------------- THIS MONTH’S ACTIVITY ---------------- */
  const {
    signupsThisMonth,
    loginsThisMonth,
    signupUsersThisMonth,
    loginUsersThisMonth,
  } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const signups = [];
    const logins = [];

    users.forEach((u) => {
      if (u.createdAt) {
        const d = new Date(u.createdAt);
        if (d.getFullYear() === year && d.getMonth() === month) {
          signups.push(u);
        }
      }
      if (u.lastLoginAt) {
        const d = new Date(u.lastLoginAt);
        if (d.getFullYear() === year && d.getMonth() === month) {
          logins.push(u);
        }
      }
    });

    signups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    logins.sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt));

    return {
      signupsThisMonth: signups.length,
      loginsThisMonth: logins.length,
      signupUsersThisMonth: signups,
      loginUsersThisMonth: logins,
    };
  }, [users]);

  /* ---------------- INSIGHTS ---------------- */
  const insights = [
    total === 0
      ? "You have no users yet."
      : `You have ${total} total users and ${actives} active (${ratio}%).`,
    inactive > 0
      ? `${inactive} inactive user(s). Consider onboarding support.`
      : null,
    suspended > 0
      ? `${suspended} suspended user(s). Review their accounts.`
      : null,
    `${signupsThisMonth} new signup(s) this month.`,
    `${loginsThisMonth} user(s) logged in this month.`,
  ].filter(Boolean);

  /* ======================== RENDER ======================== */

  return (
    <div className="row g-3">

      <div className="col-12">
        <div className="row g-3 mb-2">

          <div className="col-6 col-md-3">
            <section className="card shadow-sm p-3 rounded-3 border-0">
              <p className="text-muted small mb-1">Active Users</p>
              <h3 className="fw-semibold text-success">{actives}</h3>
            </section>
          </div>

          <div className="col-6 col-md-3">
            <section className="card shadow-sm p-3 rounded-3 border-0">
              <p className="text-muted small mb-1">Total Users</p>
              <h3 className="fw-semibold">{total}</h3>
            </section>
          </div>

          <div className="col-6 col-md-3">
            <section className="card shadow-sm p-3 rounded-3 border-0">
              <p className="text-muted small mb-1">Inactive</p>
              <h3 className="fw-semibold text-warning">{inactive}</h3>
            </section>
          </div>

          <div className="col-6 col-md-3">
            <section className="card shadow-sm p-3 rounded-3 border-0">
              <p className="text-muted small mb-1">Suspended</p>
              <h3 className="fw-semibold text-danger">{suspended}</h3>
            </section>
          </div>
        </div>
      </div>

      {/* ---------- USAGE OVER TIME CHART ---------- */}
      <div className="col-12">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Usage Over Time</h5>
              <small className="text-muted">
                {analytics?.lastUpdated
                  ? `Last updated: ${new Date(
                      analytics.lastUpdated
                    ).toLocaleString()}`
                  : ""}
              </small>
            </div>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <defs>
                    {/* CUSTOM BAR COLOR HERE */}
                    <linearGradient id="usageColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4facfe" />
                      <stop offset="100%" stopColor="#00f2fe" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Bar
                    dataKey="users"
                    fill="url(#usageColor)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- THIS MONTH’S ACTIVITY (SIGNUPS + LOGINS) ---------- */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>This Month&apos;s Activity</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={refresh}
              >
                Refresh
              </button>
            </div>

            <p className="small text-muted mb-3">
              <strong>{signupsThisMonth}</strong> new signup(s) this month ·{" "}
              <strong>{loginsThisMonth}</strong> user(s) logged in this month.
            </p>

            <div className="row">
              {/* New signups list */}
              <div className="col-12 col-md-6">
                <h6 className="small text-muted">New signups (latest)</h6>
                <ul className="list-group small">
                  {signupUsersThisMonth.length === 0 && (
                    <li className="list-group-item text-muted">
                      No signups this month.
                    </li>
                  )}

                  {signupUsersThisMonth.slice(0, 5).map((u) => (
                    <li key={u._id || u.userId} className="list-group-item">
                      <div className="fw-semibold">{displayName(u)}</div>
                      <div className="text-muted">
                        Joined:{" "}
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleString()
                          : "-"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent logins list */}
              <div className="col-12 col-md-6 mt-3 mt-md-0">
                <h6 className="small text-muted">Recent logins</h6>
                <ul className="list-group small">
                  {loginUsersThisMonth.length === 0 && (
                    <li className="list-group-item text-muted">
                      No logins this month.
                    </li>
                  )}

                  {loginUsersThisMonth.slice(0, 5).map((u) => (
                    <li key={u._id || u.userId} className="list-group-item">
                      <div className="fw-semibold">{displayName(u)}</div>
                      <div className="text-muted">
                        Last login:{" "}
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString()
                          : "-"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {analytics?.lastUpdated && (
              <div className="small text-muted mt-3">
                Last updated:{" "}
                {new Date(analytics.lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- USAGE INSIGHTS ---------- */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <h5>Usage Insights</h5>
            <ul className="small mb-0">
              {insights.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
              {insights.length === 0 && (
                <li className="text-muted">No insights to show yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



/*  SUPPORT  */
export function SupportPanel() {
  const [tickets, setTickets] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reply, setReply] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeTickets = Array.isArray(tickets) ? tickets : [];

  // ----- Load tickets from backend -----
  async function fetchTickets() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(TICKETS_API_URL);
      if (!res.ok) {
        throw new Error(`Failed to fetch tickets (status ${res.status})`);
      }

      const data = await res.json();
      const rawTickets = Array.isArray(data) ? data : data?.tickets || [];

      // Shape returned by TicketRoutes.mapTicket
      const normalized = rawTickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        fromEmail: t.fromEmail || "",
        fromName: t.fromName || "",
        fromRole: t.fromRole || "",
        status: t.status || "open",
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        messages: (t.messages || []).map((m, idx) => ({
          id: m._id || idx,
          senderRole: m.senderRole,
          sender: m.senderRole === "manager" ? "pm" : "user",
          text: m.text,
          at: m.at,
        })),
      }));

      setTickets(normalized);

      // If nothing is selected yet, select the first ticket
      if (!activeId && normalized.length > 0) {
        setActiveId(normalized[0].id);
      }
    } catch (err) {
      console.error("fetchTickets error:", err);
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }

  // Load once on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Keep activeId valid when tickets list changes
  useEffect(() => {
    const hasActive = safeTickets.some((t) => t.id === activeId);
    if (!hasActive) {
      setActiveId(safeTickets.length > 0 ? safeTickets[0].id : null);
    }
  }, [safeTickets, activeId]);

  // ----- Filter tickets -----
  const term = q ? q.trim().toLowerCase() : "";
  const filtered = safeTickets.filter((t) => {
    let matchesQ = false;

    if (!term) {
      matchesQ = true;
    } else {
      const subj = (t.subject || "").toLowerCase();
      const email = (t.fromEmail || "").toLowerCase();
      const msgHit =
        t.messages &&
        t.messages.some((m) =>
          (m.text || "").toLowerCase().includes(term)
        );

      matchesQ = subj.includes(term) || email.includes(term) || msgHit;
    }

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  // Pick active ticket
  let active = null;
  if (filtered.length > 0) {
    active = filtered.find((t) => t.id === activeId) || filtered[0];
  }

  // ----- Update ticket status (backend) -----
  async function updateTicketStatus(id, nextStatus) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${TICKETS_API_URL}/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update ticket status");
      }

      await fetchTickets();
    } catch (err) {
      console.error("updateTicketStatus error:", err);
      setError("Failed to update ticket status.");
    } finally {
      setLoading(false);
    }
  }

  function resolve(id) {
    updateTicketStatus(id, "resolved");
  }

  // ----- Send reply (backend) -----
  async function sendMessage() {
    if (!active) return;
    const trimmed = reply ? reply.trim() : "";
    if (!trimmed) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${TICKETS_API_URL}/${active.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderRole: "manager",
          text: trimmed,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to send reply");
      }

      setReply("");
      await fetchTickets();
    } catch (err) {
      console.error("sendMessage error:", err);
      setError(err.message || "Failed to send reply.");
    } finally {
      setLoading(false);
    }
  }

  // ----- Render -----
  return (
    <div className="row g-3">
      <div className="col-12">
        {/* Filters & Search */}
        <div className="p-3 bg-light rounded shadow-sm d-flex flex-wrap align-items-center gap-2">
          <div
            className="flex-grow-1 position-relative"
            style={{ minWidth: 300 }}
          >
            <FiSearch
              size={18}
              className="position-absolute text-muted"
              style={{ top: "50%", left: "10px", transform: "translateY(-50%)" }}
            />
            <input
              className="form-control ps-5 fs-6 py-2 shadow-sm"
              placeholder="Search tickets..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-select w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="inprogress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <div className="text-muted small ms-auto">
            {filtered.length} ticket(s)
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mt-2 py-2 small mb-0">
            {error}
          </div>
        )}
      </div>

      {/* Ticket list */}
      <div className="col-12 col-xl-7">
        {loading && filtered.length === 0 ? (
          <div className="card border-0 shadow-sm text-center text-muted py-5">
            Loading tickets...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card border-0 shadow-sm text-center text-muted py-5">
            No tickets match the current filters.
          </div>
        ) : (
          filtered.map((t) => {
            const isActive = active && t.id === active.id;
            return (
              <div
                key={t.id}
                className={
                  "card border-0 shadow-sm mb-3 " + (isActive ? "ring-2" : "")
                }
                style={{ borderRadius: 14 }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                    <div className="flex-grow-1">
                      <button
                        className="btn btn-link p-0 text-decoration-none text-start fw-semibold"
                        onClick={() => setActiveId(t.id)}
                      >
                        {t.subject || "(no subject)"}
                      </button>
                      <div className="mt-1 text-muted small d-flex align-items-center gap-2">
                        <FiMail size={14} /> {t.fromEmail || "unknown"}
                      </div>
                    </div>

                    {/* Status select */}
                    <div>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={t.status}
                        onChange={(e) =>
                          updateTicketStatus(t.id, e.target.value)
                        }
                        aria-label="Change ticket status"
                      >
                        <option value="open">Open</option>
                        <option value="inprogress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Preview of first message */}
                  <div className="text-muted mt-2 small">
                    {t.messages && t.messages[0] && t.messages[0].text
                      ? t.messages[0].text.length > 200
                        ? t.messages[0].text.slice(0, 200) + "…"
                        : t.messages[0].text
                      : "No description."}
                  </div>

                  {/* Meta info */}
                  <div className="d-flex flex-wrap gap-3 align-items-center mt-3 small text-muted">
                    <div className="d-flex align-items-center gap-1">
                      <FiClock size={14} />{" "}
                      {t.updatedAt
                        ? "Updated " + new Date(t.updatedAt).toLocaleString()
                        : t.createdAt
                        ? new Date(t.createdAt).toLocaleString()
                        : "-"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2 mt-3">
                    {t.status !== "resolved" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => resolve(t.id)}
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        setActiveId(t.id);
                        const el = document.getElementById("ticket-reply");
                        if (el && el.scrollIntoView) {
                          el.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active ticket details */}
      <div className="col-12 col-xl-5">
        <div className="card shadow-sm h-100">
          <div className="card-body d-flex flex-column">
            {active ? (
              <>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="mb-0">{active.subject}</h5>
                    <div className="small text-muted d-flex align-items-center gap-1">
                      <FiMail size={14} /> {active.fromEmail}
                    </div>
                  </div>
                  {active.status !== "resolved" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => resolve(active.id)}
                    >
                      Resolve
                    </button>
                  )}
                </div>

                <div
                  className="border rounded p-2 mb-3 flex-grow-1"
                  style={{ maxHeight: 280, overflow: "auto" }}
                >
                  {active.messages && active.messages.length > 0 ? (
                    active.messages.map((m) => {
                      const isPm = m && m.senderRole === "manager";
                      const badgeClass =
                        "badge text-bg-" +
                        (isPm ? "secondary" : "info") +
                        " me-2";
                      return (
                        <div key={m.id} className="small mb-2">
                          <span className={badgeClass}>
                            {isPm ? "PM" : "User"}
                          </span>
                          {m && m.text ? m.text : ""}
                          <span className="text-muted ms-2">
                            {m && m.at
                              ? new Date(m.at).toLocaleString()
                              : ""}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-muted small">No messages yet.</div>
                  )}
                </div>

                <div id="ticket-reply">
                  <div className="input-group">
                    <input
                      className="form-control"
                      placeholder="Type a reply…"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <button
                      className="btn btn-dark"
                      onClick={sendMessage}
                      disabled={loading}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-muted text-center my-5">
                Select a ticket to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
