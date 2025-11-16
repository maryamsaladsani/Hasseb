import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiMail, FiClock } from "react-icons/fi";
import {ROLES, STATUS, nowISO, uid, labelOf, isValidEmail, roleBadgeClass, statusBadgeClass, initialsOf,} from "../information";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,} from "recharts";

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
    setEditingId(null);
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
  }

  function submitModal(e) {
    e.preventDefault();

    if (!draft.name.trim()) {
      alert("Name is required.");
      return;
    }
    if (!isValidEmail(draft.email)) {
      alert("Enter a valid email.");
      return;
    }

    if (editingId) {
      // Edit existing user
      const emailTaken = users.some(function (u) {
        return u.id !== editingId && u.email.toLowerCase() === draft.email.toLowerCase();
      });
      if (emailTaken) {
        alert("Email must be unique.");
        return;
      }

      const nextUsers = users.map(function (u) {
        if (u.id === editingId) {
          return Object.assign({}, u, {
            name: draft.name.trim(),
            email: draft.email.trim(),
            role: draft.role,
            status: draft.status,
          });
        }
        return u;
      });

      setUsers(nextUsers);
      closeModal();
      return;
    }

    // Add new user
    const duplicate = users.some(function (u) {
      return u.email.toLowerCase() === draft.email.toLowerCase();
    });
    if (duplicate) {
      alert("Email must be unique.");
      return;
    }

    const newUser = {
      id: uid(),
      createdAt: nowISO(),
      name: draft.name.trim(),
      email: draft.email.trim(),
      role: draft.role,
      status: draft.status,
    };

    setUsers([newUser].concat(users));
    closeModal();
  }

  const total = users.length;
  const activeCount = users.filter(function (u) { return u.status === "active"; }).length;
  const inactiveCount = users.filter(function (u) { return u.status === "inactive"; }).length;
  const suspendedCount = users.filter(function (u) { return u.status === "suspended"; }).length;

  return (
    <div className="row g-3">
      <div className="col-12">
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

        <div className="toolbar d-flex flex-wrap align-items-center mb-3 p-2 rounded shadow-sm bg-light">
          <div className="flex-grow-1 me-3">
            <input
              className="form-control fs-5 py-2 shadow-sm"
              placeholder="Search users by name or email…"
              value={query}
              onChange={function (e) { setQuery(e.target.value); }}
            />
          </div>

          <div className="d-flex gap-2 align-items-center ms-auto">
            <select
              className="form-select w-auto"
              value={roleFilter}
              onChange={function (e) { setRoleFilter(e.target.value); }}
            >
              <option value="all">All Roles</option>
              {ROLES.map(function (r) {
                return (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                );
              })}
            </select>

            <select
              className="form-select w-auto"
              value={statusFilter}
              onChange={function (e) { setStatusFilter(e.target.value); }}
            >
              <option value="all">All Status</option>
              {STATUS.map(function (s) {
                return (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                );
              })}
            </select>

            <button className="btn btn-dark px-4" onClick={openAdd}>
              + Add User
            </button>
          </div>
        </div>

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
                  {filtered.map(function (u) {
                    return (
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
                              onClick={function () { openEdit(u); }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-dark"
                              onClick={function () {
                                if (window.confirm("Delete this user?")) {
                                  setUsers(users.filter(function (x) { return x.id !== u.id; }));
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <form onSubmit={submitModal}>
                    <div className="modal-body">
                      <div className="mb-2">
                        <label className="form-label small text-muted">Name</label>
                        <input
                          className="form-control"
                          value={draft.name}
                          onChange={function (e) {
                            setDraft(function (d) {
                              const copy = Object.assign({}, d);
                              copy.name = e.target.value;
                              return copy;
                            });
                          }}
                          autoFocus
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={draft.email}
                          onChange={function (e) {
                            setDraft(function (d) {
                              const copy = Object.assign({}, d);
                              copy.email = e.target.value;
                              return copy;
                            });
                          }}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted">Role</label>
                        <select
                          className="form-select"
                          value={draft.role}
                          onChange={function (e) {
                            setDraft(function (d) {
                              const copy = Object.assign({}, d);
                              copy.role = e.target.value;
                              return copy;
                            });
                          }}
                        >
                          {ROLES.map(function (r) {
                            return (
                              <option key={r.key} value={r.key}>
                                {r.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="form-label small text-muted">Status</label>
                        <select
                          className="form-select"
                          value={draft.status}
                          onChange={function (e) {
                            setDraft(function (d) {
                              const copy = Object.assign({}, d);
                              copy.status = e.target.value;
                              return copy;
                            });
                          }}
                        >
                          {STATUS.map(function (s) {
                            return (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            );
                          })}
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
export function SettingsPanel({ settings, setSettings }) {
  function makeInitial(s) {
    var out = {
      currency: s && s.currency ? s.currency : "",
      defaultMarginPct:
        s && typeof s.defaultMarginPct === "number" ? s.defaultMarginPct : 0,
      manager: {
        name: s && s.manager && s.manager.name ? s.manager.name : "",
        email: s && s.manager && s.manager.email ? s.manager.email : "",
        phone: s && s.manager && s.manager.phone ? s.manager.phone : "",
      },
      notifications: {
        emailAlerts:
          s && s.notifications && typeof s.notifications.emailAlerts === "boolean"
            ? s.notifications.emailAlerts
            : false,
        ticketBadge:
          s && s.notifications && typeof s.notifications.ticketBadge === "boolean"
            ? s.notifications.ticketBadge
            : false,
        push:
          s && s.notifications && typeof s.notifications.push === "boolean"
            ? s.notifications.push
            : false,
      },
    };
    return out;
  }

  const [draft, setDraft] = useState(makeInitial(settings));

  useEffect(function () {
    setDraft(makeInitial(settings));
  }, [settings]);

  function save() {
    var mgr = draft.manager || {};
    var pct = Number(draft.defaultMarginPct);

    if (Number.isNaN(pct) || pct < 0 || pct > 95) {
      alert("Margin must be between 0 and 95.");
      return;
    }
    if (!draft.currency || draft.currency.trim() === "") {
      alert("Currency is required.");
      return;
    }
    if (!mgr.name || mgr.name.trim() === "") {
      alert("Manager name is required.");
      return;
    }
    if (!mgr.email || mgr.email.trim() === "") {
      alert("Manager email is required.");
      return;
    }

    var clean = {
      currency: draft.currency.trim(),
      defaultMarginPct: pct,
      manager: {
        name: mgr.name.trim(),
        email: mgr.email.trim(),
        phone: (mgr.phone ? mgr.phone : "").trim(),
      },
      notifications: {
        emailAlerts: !!(draft.notifications && draft.notifications.emailAlerts),
        ticketBadge: !!(draft.notifications && draft.notifications.ticketBadge),
        push: !!(draft.notifications && draft.notifications.push),
      },
    };

    setSettings(clean);
  }

  return (
    <div className="row g-3">
      {/* LEFT COLUMN: Default settings + Notifications (stacked) */}
      <div className="col-12 col-lg-6">
        {/* Default Simulation Settings */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <h5>Default Simulation Settings</h5>
            <div className="vstack gap-2">
              <div>
                <label className="form-label">Currency</label>
                <input
                  className="form-control"
                  value={draft.currency}
                  onChange={function (e) {
                    var copy = Object.assign({}, draft);
                    copy.currency = e.target.value;
                    setDraft(copy);
                  }}
                />
              </div>
              <div>
                <label className="form-label">Default Margin (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={draft.defaultMarginPct}
                  onChange={function (e) {
                    var copy = Object.assign({}, draft);
                    copy.defaultMarginPct = Number(e.target.value);
                    setDraft(copy);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications (now directly under Default Simulation Settings) */}
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
                onChange={function (e) {
                  var copy = Object.assign({}, draft);
                  var notif = Object.assign({}, copy.notifications || {});
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
                onChange={function (e) {
                  var copy = Object.assign({}, draft);
                  var notif = Object.assign({}, copy.notifications || {});
                  notif.ticketBadge = e.target.checked;
                  copy.notifications = notif;
                  setDraft(copy);
                }}
              />
              <label htmlFor="n2" className="form-check-label">
                Ticket Badge Counter
              </label>
            </div>

            <div className="form-check">
              <input
                id="n3"
                className="form-check-input"
                type="checkbox"
                checked={
                  draft.notifications && draft.notifications.push
                    ? draft.notifications.push
                    : false
                }
                onChange={function (e) {
                  var copy = Object.assign({}, draft);
                  var notif = Object.assign({}, copy.notifications || {});
                  notif.push = e.target.checked;
                  copy.notifications = notif;
                  setDraft(copy);
                }}
              />
              <label htmlFor="n3" className="form-check-label">
                Push Notifications
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Manager Information */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5>Manager Information</h5>
            <div className="vstack gap-2">
              <div>
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={draft.manager.name}
                  onChange={function (e) {
                    var copy = Object.assign({}, draft);
                    var mgr = Object.assign({}, copy.manager || {});
                    mgr.name = e.target.value;
                    copy.manager = mgr;
                    setDraft(copy);
                  }}
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={draft.manager.email}
                  onChange={function (e) {
                    var copy = Object.assign({}, draft);
                    var mgr = Object.assign({}, copy.manager || {});
                    mgr.email = e.target.value;
                    copy.manager = mgr;
                    setDraft(copy);
                  }}
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  value={draft.manager.phone}
                  onChange={function (e) {
                    var copy = Object.assign({}, draft);
                    var mgr = Object.assign({}, copy.manager || {});
                    mgr.phone = e.target.value;
                    copy.manager = mgr;
                    setDraft(copy);
                  }}
                />
              </div>
            </div>

            <button className="btn btn-dark mt-3" onClick={save}>
              Save Settings
            </button>
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

  // Usage insights
  const mostRunKey = Object.entries(analytics.simulations || {}).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  const insights = [
    total === 0
      ? "You have no users yet. Invite your first user to get started."
      : `You have ${total} total users and ${actives} active (${ratio}%).`,
    inactive > 0 ? `${inactive} user(s) are inactive — consider onboarding emails.` : null,
    suspended > 0 ? `${suspended} user(s) are suspended — review and resolve if needed.` : null,
    mostRunKey
      ? `Most used simulator: ${mostRunKey}. Consider prioritizing improvements there.`
      : null,
  ].filter(Boolean);

  // Chart data
  const chartData = useMemo(() => {
    if (Array.isArray(analytics.activityByMonth) && analytics.activityByMonth.length) {
      return analytics.activityByMonth;
    }

    // Fallback from users[].createdAt
    const countsByMonthKey = {};
    users.forEach((u) => {
      const d = new Date(u.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      countsByMonthKey[monthKey] = (countsByMonthKey[monthKey] || 0) + 1;
    });

    const out = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      out.push({
        month: dt.toLocaleString(undefined, { month: "short" }),
        users: countsByMonthKey[monthKey] || 0,
      });
    }
    return out;
  }, [analytics.activityByMonth, users]);

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
                {analytics.lastUpdated
                  ? `Last updated: ${new Date(analytics.lastUpdated).toLocaleString()}`
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
                Break-even <span className="fw-bold">{analytics.simulations?.breakeven ?? 0}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                Pricing <span className="fw-bold">{analytics.simulations?.pricing ?? 0}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                Cash Flow <span className="fw-bold">{analytics.simulations?.cashflow ?? 0}</span>
              </li>
            </ul>
            <div className="small text-muted mt-2">
              {analytics.lastUpdated
                ? `Last updated: ${new Date(analytics.lastUpdated).toLocaleString()}`
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
              {insights.length === 0 && <li className="text-muted">No insights to show yet.</li>}
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
  const firstId = safeTickets.length > 0 ? safeTickets[0].id : null;

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reply, setReply] = useState("");
  const [activeId, setActiveId] = useState(firstId);

  // keep activeId valid if ticket list changes
  useEffect(function () {
    var hasActive = false;
    for (var i = 0; i < safeTickets.length; i++) {
      if (safeTickets[i].id === activeId) { hasActive = true; break; }
    }
    if (!hasActive) setActiveId(safeTickets.length > 0 ? safeTickets[0].id : null);
  }, [safeTickets, activeId]);

  // filter tickets
  var term = q ? q.trim().toLowerCase() : "";
  var filtered = [];
  for (var i = 0; i < safeTickets.length; i++) {
    var t = safeTickets[i];

    var matchesQ = false;
    if (term === "") {
      matchesQ = true;
    } else {
      var subj = t.subject ? t.subject.toLowerCase() : "";
      var email = t.fromEmail ? t.fromEmail.toLowerCase() : "";
      var msgHit = false;
      if (t.messages && Array.isArray(t.messages)) {
        for (var m = 0; m < t.messages.length; m++) {
          var txt = t.messages[m] && t.messages[m].text ? t.messages[m].text.toLowerCase() : "";
          if (txt.indexOf(term) !== -1) { msgHit = true; break; }
        }
      }
      matchesQ = subj.indexOf(term) !== -1 || email.indexOf(term) !== -1 || msgHit;
    }

    var matchesStatus = statusFilter === "all" || t.status === statusFilter;
    if (matchesQ && matchesStatus) filtered.push(t);
  }

  // pick active
  var active = null;
  if (filtered.length > 0) {
    for (var a = 0; a < filtered.length; a++) {
      if (filtered[a].id === activeId) { active = filtered[a]; break; }
    }
    if (!active) active = filtered[0];
  }

  // update status (also bump updatedAt)
  function updateTicketStatus(id, nextStatus) {
    var next = [];
    for (var i2 = 0; i2 < safeTickets.length; i2++) {
      var t2 = safeTickets[i2];
      if (t2.id === id) {
        var updated = {
          id: t2.id,
          subject: t2.subject,
          fromEmail: t2.fromEmail,
          messages: t2.messages ? t2.messages.slice() : [],
          status: nextStatus,
          createdAt: t2.createdAt,
          updatedAt: nowISO()
        };
        next.push(updated);
      } else {
        next.push(t2);
      }
    }
    setTickets(next);
  }

  function resolve(id) { updateTicketStatus(id, "resolved"); }

  function sendMessage() {
    if (!active) return;
    var trimmed = reply ? reply.trim() : "";
    if (trimmed === "") return;

    var next = [];
    for (var i3 = 0; i3 < safeTickets.length; i3++) {
      var t3 = safeTickets[i3];
      if (t3.id === active.id) {
        var newMessages = t3.messages && Array.isArray(t3.messages) ? t3.messages.slice() : [];
        newMessages.push({ id: uid(), sender: "pm", text: trimmed, at: nowISO() });

        var updated = {
          id: t3.id,
          subject: t3.subject,
          fromEmail: t3.fromEmail,
          messages: newMessages,
          status: t3.status,
          createdAt: t3.createdAt,
          updatedAt: nowISO()
        };
        next.push(updated);
      } else {
        next.push(t3);
      }
    }
    setTickets(next);
    setReply("");
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
              onChange={function (e) { setQ(e.target.value); }}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-select w-auto"
            value={statusFilter}
            onChange={function (e) { setStatusFilter(e.target.value); }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="inprogress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <div className="text-muted small ms-auto">{filtered.length} ticket(s)</div>
        </div>
      </div>

      {/* Ticket list */}
      <div className="col-12 col-xl-7">
        {filtered.length === 0 ? (
          <div className="card border-0 shadow-sm text-center text-muted py-5">
            No tickets match the current filters.
          </div>
        ) : (
          filtered.map(function (t) {
            var isActive = active && t.id === active.id;
            return (
              <div
                key={t.id}
                className={"card border-0 shadow-sm mb-3 " + (isActive ? "ring-2" : "")}
                style={{ borderRadius: 14 }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                    <div className="flex-grow-1">
                      <button
                        className="btn btn-link p-0 text-decoration-none text-start fw-semibold"
                        onClick={function () { setActiveId(t.id); }}
                      >
                        {t.subject ? t.subject : "(no subject)"}
                      </button>
                      <div className="mt-1 text-muted small d-flex align-items-center gap-2">
                        <FiMail size={14} /> {t.fromEmail ? t.fromEmail : "unknown"}
                      </div>
                    </div>

                    {/* REPLACED Bootstrap dropdown with a reliable select */}
                    <div>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={t.status}
                        onChange={function (e) { updateTicketStatus(t.id, e.target.value); }}
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
                      ? (t.messages[0].text.length > 200
                          ? t.messages[0].text.slice(0, 200) + "…"
                          : t.messages[0].text)
                      : "No description."}
                  </div>

                  {/* Meta info */}
                  <div className="d-flex flex-wrap gap-3 align-items-center mt-3 small text-muted">
                    <div className="d-flex align-items-center gap-1">
                      <FiClock size={14} />{" "}
                      {t.updatedAt
                        ? "Updated " + new Date(t.updatedAt).toLocaleString()
                        : (t.createdAt ? new Date(t.createdAt).toLocaleString() : "-")}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2 mt-3">
                    {t.status !== "resolved" && (
                      <button className="btn btn-sm btn-success" onClick={function () { resolve(t.id); }}>
                        Resolve
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={function () {
                        setActiveId(t.id);
                        var el = document.getElementById("ticket-reply");
                        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth" });
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
              <React.Fragment>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="mb-0">{active.subject}</h5>
                    <div className="small text-muted d-flex align-items-center gap-1">
                      <FiMail size={14} /> {active.fromEmail}
                    </div>
                  </div>
                  {active.status !== "resolved" && (
                    <button className="btn btn-success btn-sm" onClick={function () { resolve(active.id); }}>
                      Resolve
                    </button>
                  )}
                </div>

                <div className="border rounded p-2 mb-3 flex-grow-1" style={{ maxHeight: 280, overflow: "auto" }}>
                  {active.messages && active.messages.length > 0 ? (
                    active.messages.map(function (m) {
                      var isPm = m && m.sender === "pm";
                      var badgeClass = "badge text-bg-" + (isPm ? "secondary" : "info") + " me-2";
                      return (
                        <div key={m.id} className="small mb-2">
                          <span className={badgeClass}>{isPm ? "PM" : "User"}</span>
                          {m && m.text ? m.text : ""}
                          <span className="text-muted ms-2">{m && m.at ? new Date(m.at).toLocaleString() : ""}</span>
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
                      onChange={function (e) { setReply(e.target.value); }}
                    />
                    <button className="btn btn-dark" onClick={sendMessage}>
                      Send
                    </button>
                  </div>
                </div>
              </React.Fragment>
            ) : (
              <div className="text-muted text-center my-5">Select a ticket to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
