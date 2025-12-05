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
  // --------- Helpers ---------
  function makeInitial(s) {
    const base = s || {};

    return {
      // advisor-owner pairs
      assignments: Array.isArray(base.assignments) ? base.assignments : [],

      // notification switches
      notifications: {
        emailAlerts:
          base.notifications && typeof base.notifications.emailAlerts === "boolean"
            ? base.notifications.emailAlerts
            : false,
        ticketBadge:
          base.notifications && typeof base.notifications.ticketBadge === "boolean"
            ? base.notifications.ticketBadge
            : false,
        push:
          base.notifications && typeof base.notifications.push === "boolean"
            ? base.notifications.push
            : false,
      },
    };
  }

  const [draft, setDraft] = useState(makeInitial(settings));

  // when parent settings change
  useEffect(() => {
    setDraft(makeInitial(settings));
  }, [settings]);

  // pull advisors & owners from users prop
  const advisors = (users || []).filter((u) => u.role === "advisor");
  const owners = (users || []).filter((u) => u.role === "owner");

  // local selects for new assignment
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(
    advisors[0]?.id || ""
  );
  const [selectedOwnerId, setSelectedOwnerId] = useState(
    owners[0]?.id || ""
  );

  // ensure selects stay valid when users change
  useEffect(() => {
    if (!advisors.find((a) => a.id === selectedAdvisorId)) {
      setSelectedAdvisorId(advisors[0]?.id || "");
    }
    if (!owners.find((o) => o.id === selectedOwnerId)) {
      setSelectedOwnerId(owners[0]?.id || "");
    }
  }, [advisors, owners]); // eslint-disable-line react-hooks/exhaustive-deps

  // --------- Assignment actions ---------
  function addAssignment(e) {
    e.preventDefault();
    if (!selectedAdvisorId || !selectedOwnerId) return;

    // prevent duplicates
    const exists = (draft.assignments || []).some(
      (a) =>
        a.advisorId === selectedAdvisorId && a.ownerId === selectedOwnerId
    );
    if (exists) {
      alert("This advisor already has that owner assigned.");
      return;
    }

    const nextAssignments = [
      ...(draft.assignments || []),
      { advisorId: selectedAdvisorId, ownerId: selectedOwnerId },
    ];

    const nextDraft = { ...draft, assignments: nextAssignments };
    setDraft(nextDraft);

    // 👇 IMPORTANT: your setSettings expects a plain object
    setSettings({
      assignments: nextAssignments,
      notifications: nextDraft.notifications,
    });
  }

  function removeAssignment(advisorId, ownerId) {
    const nextAssignments = (draft.assignments || []).filter(
      (a) => !(a.advisorId === advisorId && a.ownerId === ownerId)
    );

    const nextDraft = { ...draft, assignments: nextAssignments };
    setDraft(nextDraft);

    setSettings({
      assignments: nextAssignments,
      notifications: nextDraft.notifications,
    });
  }

  // --------- Save notifications only ---------
  function save() {
    const clean = {
      assignments: draft.assignments || [],
      notifications: {
        emailAlerts: !!(draft.notifications && draft.notifications.emailAlerts),
        ticketBadge: !!(draft.notifications && draft.notifications.ticketBadge),
        push: !!(draft.notifications && draft.notifications.push),
      },
    };

    // again: plain object, not callback
    setSettings(clean);
    alert("Settings saved successfully!");
  }

  // --------- SUMMARY CALCULATIONS ---------
  const assignments = draft.assignments || [];

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
                {assignments.map((a, idx) => {
                  const adv = advisors.find((x) => x.id === a.advisorId);
                  const own = owners.find((x) => x.id === a.ownerId);
                  if (!adv || !own) return null;
                  return (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>
                        <strong>{adv.name}</strong> → {own.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          removeAssignment(a.advisorId, a.ownerId)
                        }
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

        {/* Notifications card */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5>Notifications</h5>

            <div className="form-check">
              <input
                id="n1"
                className="form-check-input"
                type="checkbox"
                checked={
                  draft.notifications && draft.notifications.emailAlerts
                    ? draft.notifications.emailAlerts
                    : false
                }
                onChange={(e) => {
                  const copy = { ...draft };
                  const notif = { ...(copy.notifications || {}) };
                  notif.emailAlerts = e.target.checked;
                  copy.notifications = notif;
                  setDraft(copy);
                }}
              />
              <label htmlFor="n1" className="form-check-label">
                Email Alerts
              </label>
            </div>

            <div className="form-check">
              <input
                id="n2"
                className="form-check-input"
                type="checkbox"
                checked={
                  draft.notifications && draft.notifications.ticketBadge
                    ? draft.notifications.ticketBadge
                    : false
                }
                onChange={(e) => {
                  const copy = { ...draft };
                  const notif = { ...(copy.notifications || {}) };
                  notif.ticketBadge = e.target.checked;
                  copy.notifications = notif;
                  setDraft(copy);
                }}
              />
              <label htmlFor="n2" className="form-check-label">
                Ticket Badge Counter
              </label>
            </div>

            <div className="form-check mb-3">
              <input
                id="n3"
                className="form-check-input"
                type="checkbox"
                checked={
                  draft.notifications && draft.notifications.push
                    ? draft.notifications.push
                    : false
                }
                onChange={(e) => {
                  const copy = { ...draft };
                  const notif = { ...(copy.notifications || {}) };
                  notif.push = e.target.checked;
                  copy.notifications = notif;
                  setDraft(copy);
                }}
              />
              <label htmlFor="n3" className="form-check-label">
                Push Notifications
              </label>
            </div>

            <button className="btn btn-dark mt-1" onClick={save}>
              Save Settings
            </button>
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
  // Summary counts from real users coming from the backend
  const actives = users.filter((u) => u.status === "active").length;
  const total = users.length;
  const inactive = users.filter((u) => u.status === "inactive").length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const ratio = total ? Math.round((actives / total) * 100) : 0;

  // Which simulator is used most – still using analytics.simulations
  const mostRunKey = Object.entries(analytics?.simulations || {}).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  const insights = [
    total === 0
      ? "You have no users yet. Invite your first user to get started."
      : `You have ${total} total users and ${actives} active (${ratio}%).`,
    inactive > 0
      ? `${inactive} user(s) are inactive — consider onboarding emails.`
      : null,
    suspended > 0
      ? `${suspended} user(s) are suspended — review and resolve if needed.`
      : null,
    mostRunKey
      ? `Most used simulator: ${mostRunKey}. Consider prioritizing improvements there.`
      : null,
  ].filter(Boolean);

  // 🔥 Usage Over Time chart data: ONLY from users[]
  const chartData = useMemo(() => {
    const countsByMonthKey = {};

    // Count ONLY active users, grouped by last activity month
    users.forEach((u) => {
      if (u.status !== "active") return;

      const baseDate = u.lastLoginAt || u.createdAt;
      if (!baseDate) return;

      const d = new Date(baseDate);
      if (Number.isNaN(d.getTime())) return;

      const monthKey = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;

      countsByMonthKey[monthKey] = (countsByMonthKey[monthKey] || 0) + 1;
    });

    // Build last 6 months timeline
    const out = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${dt.getFullYear()}-${String(
        dt.getMonth() + 1
      ).padStart(2, "0")}`;
      out.push({
        month: dt.toLocaleString(undefined, { month: "short" }),
        users: countsByMonthKey[monthKey] || 0,
      });
    }
    return out;
  }, [users]);

  return (
    <div className="row g-3">
      {/* Top summary cards */}
      <div className="col-12">
        <div className="row g-3 mb-2">
          <div className="col-6 col-md-3">
            <section className="card shadow-sm border-0 p-3 rounded-3">
              <p className="text-muted small mb-1">Active Users</p>
              <h3 className="m-0 fw-semibold text-success">{actives}</h3>
            </section>
          </div>
          <div className="col-6 col-md-3">
            <section className="card shadow-sm border-0 p-3 rounded-3">
              <p className="text-muted small mb-1">Total Users</p>
              <h3 className="m-0 fw-semibold">{total}</h3>
            </section>
          </div>
          <div className="col-6 col-md-3">
            <section className="card shadow-sm border-0 p-3 rounded-3">
              <p className="text-muted small mb-1">Inactive</p>
              <h3 className="m-0 fw-semibold text-warning">{inactive}</h3>
            </section>
          </div>
          <div className="col-6 col-md-3">
            <section className="card shadow-sm border-0 p-3 rounded-3">
              <p className="text-muted small mb-1">Suspended</p>
              <h3 className="m-0 fw-semibold text-danger">{suspended}</h3>
            </section>
          </div>
        </div>
      </div>

      {/* Usage Over Time (Bar Chart) */}
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Usage Over Time</h5>
              <small className="text-muted">
                {analytics?.lastUpdated
                  ? `Last updated: ${new Date(
                      analytics.lastUpdated
                    ).toLocaleString()}`
                  : null}
              </small>
            </div>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#0d6efd" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Simulations */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h5>Simulations Run</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={refresh}>
                Refresh
              </button>
            </div>
            <ul className="list-group mt-2">
              <li className="list-group-item d-flex justify-content-between">
                Break-even{" "}
                <span className="fw-bold">
                  {analytics?.simulations?.breakeven ?? 0}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                Pricing{" "}
                <span className="fw-bold">
                  {analytics?.simulations?.pricing ?? 0}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                Cash Flow{" "}
                <span className="fw-bold">
                  {analytics?.simulations?.cashflow ?? 0}
                </span>
              </li>
            </ul>
            <div className="small text-muted mt-2">
              {analytics?.lastUpdated
                ? `Last updated: ${new Date(
                    analytics.lastUpdated
                  ).toLocaleString()}`
                : null}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Insights */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm h-100">
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
export function SupportPanel({ tickets, setTickets }) {
  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reply, setReply] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----- Load tickets from backend -----
  async function fetchTickets() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(TICKETS_API_URL);
      if (!res.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await res.json(); // backend array

      // Normalize into shape SupportPanel expects
      const normalized = (data || []).map((t) => ({
        id: t.id,
        subject: t.subject,
        fromEmail: t.fromEmail || "",
        fromName: t.fromName || "",
        status: t.status || "open",
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        messages: (t.messages || []).map((m, idx) => ({
          id: m._id || idx, // we just need a stable key
          sender: m.senderRole === "manager" ? "pm" : "user",
          text: m.text,
          at: m.at,
        })),
      }));

      setTickets(normalized);

      // If no active ticket yet, pick first
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

  // Load tickets on first mount
  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep activeId valid if tickets change
  useEffect(
    function () {
      const hasActive = safeTickets.some((t) => t.id === activeId);
      if (!hasActive) {
        setActiveId(safeTickets.length > 0 ? safeTickets[0].id : null);
      }
    },
    [safeTickets, activeId]
  );

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
        t.messages.some((m) => (m.text || "").toLowerCase().includes(term));

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

      // Reload from backend to keep in sync
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
        throw new Error("Failed to send reply");
      }

      setReply("");
      // Reload tickets including updated messages
      await fetchTickets();
    } catch (err) {
      console.error("sendMessage error:", err);
      setError("Failed to send reply.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row g-3">
      <div className="col-12">
        {/* Filters & Search */}
        <div className="p-3 bg-light rounded shadow-sm d-flex flex-wrap align-items-center gap-2">
          <div className="flex-grow-1 position-relative" style={{ minWidth: 300 }}>
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
          <div className="alert alert-danger mt-2 py-2 small mb-0">{error}</div>
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

                  {/* Preview */}
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
                        if (el && el.scrollIntoView)
                          el.scrollIntoView({ behavior: "smooth" });
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
                      const isPm = m && m.sender === "pm";
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
