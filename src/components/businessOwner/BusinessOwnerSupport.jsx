// src/components/owner/BusinessOwnerSupport.jsx
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

const TICKETS_API_URL = "http://localhost:5001/api/tickets";

export default function BusinessOwnerSupport({ setSelectedTicket, setTab }) {
  // Read the logged-in user that you saved on login
  const storedUser = JSON.parse(localStorage.getItem("loggedUser"));

  // This should be the User._id that comes from your /login response
  const ownerId =
    storedUser?.userId || storedUser?._id || storedUser?.id || null;
  const role = "owner"; // owners always create tickets as "owner"

  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- Load tickets (only this owner) ---------- */
  async function fetchTickets() {
    try {
      setError("");

      if (!ownerId) {
        setError("User information missing – cannot load tickets.");
        return;
      }

      const res = await axios.get(TICKETS_API_URL, {
        params: { role, userId: ownerId },
      });

      const raw = res.data || [];

      // Ensure every ticket has an `id`
      const normalized = raw.map((t) => ({
        ...t,
        id: t.id || t._id,
      }));

      setTickets(normalized);
    } catch (err) {
      console.error("fetchTickets error:", err.response?.data || err);
      setError(
        err.response?.data?.message || "Failed to load tickets."
      );
    }
  }

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  /* ---------- Create new ticket ---------- */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!ownerId) {
      setError("User information missing – cannot create ticket.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and description.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // This matches your new TicketRoutes POST:
      // { fromUserId, fromRole, subject, message }
      await axios.post(TICKETS_API_URL, {
        fromUserId: ownerId,
        fromRole: role,
        subject: title.trim(),
        message: description.trim(),
        // `priority` not stored in the new schema, but we keep it in the UI
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      await fetchTickets();
    } catch (err) {
      console.error("createTicket error:", err.response?.data || err);
      setError(
        err.response?.data?.message || "Failed to create ticket."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Stats ---------- */
  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "inprogress" || t.status === "in-progress"
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  function getStatusClass(status) {
    if (status === "resolved") return "status-resolved";
    if (status === "inprogress" || status === "in-progress")
      return "status-progress";
    return "status-open";
  }

  function getStatusLabel(status) {
    if (status === "resolved") return "Resolved";
    if (status === "inprogress" || status === "in-progress")
      return "In Progress";
    return "Open";
  }

  /* ---------- Render ---------- */
  return (
    <div className="support-container" style={{ padding: "1rem" }}>
      <h1 className="support-title">Support & Tickets</h1>

      {error && (
        <div className="support-error">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
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

      {/* Two columns: create + list */}
      <div className="two-column-grid">
        {/* Create ticket */}
        <div className="support-card">
          <h2 className="card-title">Create New Ticket</h2>
          <form onSubmit={handleSubmit} className="ticket-form">
            <input
              className="ticket-input"
              placeholder="Ticket Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="form-row">
              <label className="form-label">Priority (UI only)</label>
              <select
                className="ticket-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
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

          {!ownerId && (
            <p className="small text-muted mt-2">
              (No user ID found in <code>loggedUser</code>. Make sure your
              login stores <code>userId</code> or <code>_id</code>.)
            </p>
          )}
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
                    if (setSelectedTicket && setTab) {
                      setSelectedTicket(t);
                      setTab("ticketDetails");
                    }
                  }}
                >
                  <div className="ticket-item-left">
                    <div className="ticket-icon">
                      <FiMessageCircle size={20} />
                    </div>
                    <div className="ticket-info">
                      <div className="ticket-title">
                        {t.subject || t.title || "(no title)"}
                      </div>
                      <div className="ticket-date">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </div>
                  <span className={`ticket-status ${getStatusClass(t.status)}`}>
                    {getStatusLabel(t.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
