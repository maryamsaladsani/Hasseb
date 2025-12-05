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


const TICKETS_API_URL = "http://localhost:5001/api/tickets";

export default function SupportPanel2({
  advisorId,
  setSelectedTicket,
  setTab,
}) {
  // tickets for this advisor
  const [tickets, setTickets] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /** -------- Fetch tickets for this advisor ---------- */
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

  /** -------- Create ticket ---------- */
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

  /** -------- Stats ---------- */
  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "inprogress" || t.status === "in-progress"
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  /** -------- Helpers ---------- */
  function statusBadgeClass(status) {
    switch (status) {
      case "resolved":
        return "badge bg-success-subtle text-success";
      case "inprogress":
      case "in-progress":
        return "badge bg-warning-subtle text-warning";
      default:
        return "badge bg-secondary-subtle text-secondary";
    }
  }

  function statusLabel(status) {
    if (status === "resolved") return "Resolved";
    if (status === "inprogress" || status === "in-progress")
      return "In Progress";
    return "Open";
  }

  return (
    <div className="container-fluid py-4">
      <h3 className="mb-3 fw-semibold">Support & Tickets</h3>

      {/* Error banner */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center py-2">
          <FiAlertCircle className="me-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3 rounded-circle bg-primary-subtle p-2">
                <FiTag size={22} className="text-primary" />
              </div>
              <div>
                <div className="text-muted small">Total Tickets</div>
                <div className="fs-4 fw-semibold">{total}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3 rounded-circle bg-warning-subtle p-2">
                <FiAlertCircle size={22} className="text-warning" />
              </div>
              <div>
                <div className="text-muted small">Open</div>
                <div className="fs-4 fw-semibold">{openCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3 rounded-circle bg-info-subtle p-2">
                <FiClock size={22} className="text-info" />
              </div>
              <div>
                <div className="text-muted small">In Progress</div>
                <div className="fs-4 fw-semibold">{inProgressCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3 rounded-circle bg-success-subtle p-2">
                <FiCheckCircle size={22} className="text-success" />
              </div>
              <div>
                <div className="text-muted small">Resolved</div>
                <div className="fs-4 fw-semibold">{resolvedCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create ticket form */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-3">Create New Ticket</h5>
          <form onSubmit={handleSubmit} className="vstack gap-3">
            <input
              className="form-control"
              placeholder="Ticket Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe your issue…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="d-flex flex-wrap align-items-center gap-2">
              <select
                className="form-select w-auto"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>

              <button
                type="submit"
                className="btn btn-info text-white ms-auto d-flex align-items-center gap-2 px-4"
                disabled={loading}
              >
                <FiSend />
                {loading ? "Sending…" : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Ticket list */}
      <h5 className="mb-2">Your Tickets</h5>
      {tickets.length === 0 ? (
        <div className="text-muted small">No tickets yet.</div>
      ) : (
        <div className="card shadow-sm border-0">
          <ul className="list-group list-group-flush">
            {tickets.map((t) => (
              <li
                key={t._id || t.id}
                className="list-group-item d-flex align-items-center justify-content-between"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (setSelectedTicket && setTab) {
                    setSelectedTicket(t);
                    setTab("ticketDetails");
                  }
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-secondary-subtle p-2">
                    <FiMessageCircle className="text-secondary" />
                  </div>
                  <div>
                    <div className="fw-semibold">{t.title}</div>
                    <div className="text-muted small">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                </div>

                <span className={statusBadgeClass(t.status)}>
                  {statusLabel(t.status)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}