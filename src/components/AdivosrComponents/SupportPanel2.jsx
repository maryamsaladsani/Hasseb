import React, { useState } from "react";
import axios from "axios";

export default function SupportPanel2({
  tickets = [],
  setSelectedTicket,
  setTab,
  fetchTickets,
}) {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const advisorId = user?.userId;

  // FORM STATES
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");

  /* ==========================================================
        CREATE TICKET (No Refresh)
  ========================================================== */
  const createTicket = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post("http://localhost:5001/api/advisor/tickets", {
        advisorId,
        title,
        message,
        priority,
      });

      alert("Ticket created successfully!");

      // Reset form
      setTitle("");
      setMessage("");
      setPriority("medium");

      if (fetchTickets) fetchTickets();
    } catch (err) {
      console.error("Ticket creation error:", err.response?.data || err);
      alert("Error creating ticket");
    }
  };

  return (
    <div className="container-xxl">
      <h3 className="fw-bold mb-4">Support & Tickets</h3>

      {/* ==========================================================
            TICKET STATS CARDS (Top Section)
      ========================================================== */}
      <div className="row g-3 mb-4">

        {/* Total Tickets */}
        <div className="col-md-3">
          <div className="p-3 rounded-3 border shadow-sm d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
              🎟️
            </div>
            <div>
              <div className="text-muted small">Total Tickets</div>
              <div className="fw-bold fs-5">{tickets.length}</div>
            </div>
          </div>
        </div>

        {/* Open */}
        <div className="col-md-3">
          <div className="p-3 rounded-3 border shadow-sm d-flex align-items-center gap-3">
            <div className="bg-warning bg-opacity-25 p-3 rounded-circle">⏱️</div>
            <div>
              <div className="text-muted small">Open</div>
              <div className="fw-bold fs-5">
                {tickets.filter((t) => t.status === "open").length}
              </div>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="col-md-3">
          <div
            className="p-3 rounded-3 border shadow-sm d-flex align-items-center gap-3"
            style={{ background: "#fff5e9" }}
          >
            <div className="p-3 rounded-circle">📈</div>
            <div>
              <div className="text-muted small">In Progress</div>
              <div className="fw-bold fs-5">
                {tickets.filter((t) => t.status === "in-progress").length}
              </div>
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="col-md-3">
          <div className="p-3 rounded-3 border shadow-sm d-flex align-items-center gap-3">
            <div className="bg-success bg-opacity-25 p-3 rounded-circle">
              ✅
            </div>
            <div>
              <div className="text-muted small">Resolved</div>
              <div className="fw-bold fs-5">
                {tickets.filter((t) => t.status === "resolved").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================================
            CREATE NEW TICKET FORM
      ========================================================== */}
      <div className="card p-4 mb-4 shadow-sm">
        <h5 className="fw-bold mb-3">Create New Ticket</h5>

        <input
          className="form-control mb-3"
          placeholder="Ticket Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="fw-semibold mb-1">Priority</label>
        <select
          className="form-control mb-3"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <textarea
          className="form-control mb-3"
          placeholder="Describe your issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />

        <button className="btn btn-primary w-100" onClick={createTicket}>
          Submit Ticket
        </button>
      </div>

      {/* ==========================================================
            TICKET LIST
      ========================================================== */}
      <h4 className="fw-bold mb-3">Your Tickets</h4>

      {tickets.length === 0 ? (
        <div className="text-muted">No tickets yet</div>
      ) : (
        <ul className="list-group">
          {tickets.map((t) => (
            <li
              key={t._id}
              className="list-group-item d-flex justify-content-between align-items-center"
              onClick={() => {
                setSelectedTicket(t);
                setTab("ticket-details");
              }}
              style={{ cursor: "pointer" }}
            >
              <div>
                <strong>{t.title}</strong>
                <div className="small text-muted">
                  Priority: {t.priority?.toUpperCase()}
                </div>
              </div>

              <span
                className={`badge px-3 py-2 text-capitalize ${
                  t.status === "resolved"
                    ? "bg-success"
                    : t.status === "in-progress"
                    ? "bg-warning text-dark"
                    : "bg-secondary"
                }`}
              >
                {t.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
