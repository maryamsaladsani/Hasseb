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
import "../../SharedStyles/SharedSupport.css"; // Import shared styles

const TICKETS_API_URL = "http://localhost:5001/api/tickets";

export default function SupportPanel2({
                                        advisorId,
                                        setSelectedTicket,
                                        setTab,
                                      }) {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchTickets() {
    try {
      setError("");
      const res = await axios.get(TICKETS_API_URL, {
        params: { advisorId },
      });
      setTickets(res.data || []);
    } catch (err) {
      console.error("fetchTickets error:", err);
      setError("Failed to load tickets.");
    }
  }

  useEffect(() => {
    if (advisorId) fetchTickets();
  }, [advisorId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and description.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(TICKETS_API_URL, {
        advisorId,
        title: title.trim(),
        message: description.trim(),
        priority,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      await fetchTickets();
    } catch (err) {
      console.error("createTicket error:", err);
      setError("Server error while creating ticket.");
    } finally {
      setLoading(false);
    }
  }

  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter(
      (t) => t.status === "inprogress" || t.status === "in-progress"
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  function getStatusClass(status) {
    if (status === "resolved") return "status-resolved";
    if (status === "inprogress" || status === "in-progress") return "status-progress";
    return "status-open";
  }

  function getStatusLabel(status) {
    if (status === "resolved") return "Resolved";
    if (status === "inprogress" || status === "in-progress") return "In Progress";
    return "Open";
  }

  return (
      <div className="support-container">
        <h1 className="support-title">Support & Tickets</h1>

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
                <label className="form-label">Priority</label>
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
          </div>

          <div className="tickets-section">
            <h2 className="section-title">Your Tickets</h2>
            {tickets.length === 0 ? (
                <div className="empty-state">No tickets yet.</div>
            ) : (
                <div className="tickets-list">
                  {tickets.map((t) => (
                      <div
                          key={t._id || t.id}
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
                            <div className="ticket-title">{t.title}</div>
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