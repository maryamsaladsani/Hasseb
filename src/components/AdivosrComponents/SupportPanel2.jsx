// src/components/support/SupportPanel2.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiTag,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";
import "../../SharedStyles/SharedSupport.css";

const API_BASE = "http://localhost:5001/api";

export default function SupportPanel2({ setSelectedTicket, setTab }) {
  // --- 1) Read logged user from localStorage ---
  let loggedUser = null;
  try {
    const raw = localStorage.getItem("loggedUser");
    loggedUser = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to parse loggedUser from localStorage", e);
  }

  const userId = loggedUser?.userId || null; // from login response
  const role = loggedUser?.role || null;     // "advisor" | "owner" | "manager"

  console.log("SupportPanel2 loggedUser:", loggedUser);

  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- 2) Load tickets for this advisor ---
  async function fetchTickets() {
    if (!userId || !role) {
      // no user info -> nothing to fetch
      return;
    }

    try {
      setError("");
      const res = await axios.get(`${API_BASE}/tickets`, {
        params: { role, userId }, // matches your backend
      });
      setTickets(res.data || []);
    } catch (err) {
      console.error("fetchTickets error:", err.response?.data || err);
      setError(err.response?.data?.msg || "Failed to load tickets.");
    }
  }

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  // --- 3) Create a new ticket ---
  async function handleSubmit(e) {
    e.preventDefault();

    if (!userId || !role) {
      setError("User information missing – cannot create ticket.");
      return;
    }

    if (!subject.trim() || !description.trim()) {
      setError("Please enter both subject and description.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(`${API_BASE}/tickets`, {
        fromUserId: userId,       // <-- required by backend
        fromRole: role,           // "advisor"
        subject: subject.trim(),  // Ticket.subject
        message: description.trim(),
      });

      setSubject("");
      setDescription("");

      await fetchTickets();
    } catch (err) {
      console.error("createTicket error:", err.response?.data || err);
      setError(err.response?.data?.msg || "Failed to create ticket.");
    } finally {
      setLoading(false);
    }
  }

  // --- 4) Stats (optional) ---
  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "inprogress"
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  function getStatusClass(status) {
    if (status === "resolved") return "status-resolved";
    if (status === "inprogress") return "status-progress";
    return "status-open";
  }

  function getStatusLabel(status) {
    if (status === "resolved") return "Resolved";
    if (status === "inprogress") return "In Progress";
    return "Open";
  }

  // --- 5) Render ---
  return (
    <div className="support-container">
      <h1 className="support-title">Support &amp; Tickets</h1>

      {error && (
        <div className="support-error">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <FiTag size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Tickets</div>
            <div className="stat-value">{total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-yellow">
            <FiAlertCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Open</div>
            <div className="stat-value">{openCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-orange">
            <FiClock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{inProgressCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <FiCheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{resolvedCount}</div>
          </div>
        </div>
      </div>

      <div className="two-column-grid">
        {/* Create New Ticket */}
        <div className="support-card">
          <h2 className="card-title">Create New Ticket</h2>
          <form onSubmit={handleSubmit} className="ticket-form">
            <input
              className="ticket-input"
              placeholder="Ticket subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <div className="form-row">
              <label className="form-label">Priority (UI only)</label>
              <select
                className="ticket-select"
                disabled
                value="medium"
                onChange={() => {}}
              >
                <option value="medium">Medium</option>
              </select>
            </div>

            <textarea
              className="ticket-textarea"
              rows={4}
              placeholder="Describe your issue…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit" className="submit-btn" disabled={loading}>
              <FiSend size={18} />
              {loading ? "Sending…" : "Submit Ticket"}
            </button>
          </form>
        </div>

        {/* Ticket list */}
        <div className="tickets-section">
          <h2 className="section-title">Your Tickets</h2>
          {tickets.length === 0 ? (
            <div className="empty-state">No tickets yet.</div>
          ) : (
            <div className="tickets-list">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="ticket-item"
                  onClick={() => {
                    setSelectedTicket?.(t);
                    setTab?.("ticketDetails");
                  }}
                >
                  <div className="ticket-item-left">
                    <div className="ticket-icon">
                      <FiMessageCircle size={20} />
                    </div>
                    <div className="ticket-info">
                      <div className="ticket-title">
                        {t.subject || "(no subject)"}
                      </div>
                      <div className="ticket-date">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`ticket-status ${getStatusClass(t.status)}`}
                  >
                    {getStatusLabel(t.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Optional: if userId/role missing, hint to log in */}
      {!userId || !role ? (
        <p style={{ marginTop: 12, fontSize: 12, color: "#777" }}>
          No logged-in user found. Please log in again.
        </p>
      ) : null}
    </div>
  );
}
