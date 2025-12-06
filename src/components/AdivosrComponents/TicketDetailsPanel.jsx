// src/components/support/TicketDetailsPanel.jsx
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiSend, FiAlertCircle } from "react-icons/fi";
import "../../SharedStyles/SharedSupport.css";

const API_BASE = "http://localhost:5001/api";

export default function TicketDetailsPanel({ ticket, setTab }) {
  // Read logged user (saved on login by HaseebAuth)
  let loggedUser = null;
  try {
    const raw = localStorage.getItem("loggedUser");
    loggedUser = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to parse loggedUser", e);
  }

  const role = loggedUser?.role || "advisor"; // "advisor" in this screen

  const [currentTicket, setCurrentTicket] = useState(ticket || null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // If parent changes the selected ticket, keep in sync
  useEffect(() => {
    setCurrentTicket(ticket || null);
  }, [ticket]);

  async function sendReply() {
    if (!currentTicket || !reply.trim()) return;

    try {
      setSending(true);
      setError("");

      const res = await fetch(
        `${API_BASE}/tickets/${currentTicket.id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderRole: role,          // "advisor"
            text: reply.trim(),
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to send reply");
      }

      const updated = await res.json();
      // backend returns updated ticket (mapTicket), including messages
      setCurrentTicket(updated);
      setReply("");
    } catch (err) {
      console.error("sendReply error:", err);
      setError(err.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  function roleLabel(senderRole) {
    if (senderRole === "manager") return "Manager";
    if (senderRole === "advisor") return "You";
    if (senderRole === "owner") return "Owner";
    return senderRole;
  }

  if (!currentTicket) {
    return (
      <div className="ticket-details-container">
        <p>No ticket selected.</p>
        <button className="back-btn" onClick={() => setTab("support")}>
          <FiArrowLeft size={18} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-details-container">
      <button className="back-btn" onClick={() => setTab("support")}>
        <FiArrowLeft size={20} />
        Back to Tickets
      </button>

      <div className="ticket-details-card">
        <div className="ticket-header">
          <h1 className="ticket-subject">{currentTicket.subject}</h1>
          <span className={`ticket-status status-${currentTicket.status}`}>
            {currentTicket.status === "resolved"
              ? "Resolved"
              : currentTicket.status === "inprogress"
              ? "In Progress"
              : "Open"}
          </span>
        </div>

        <div className="ticket-meta">
          <span>
            Created:{" "}
            {currentTicket.createdAt
              ? new Date(currentTicket.createdAt).toLocaleString()
              : "-"}
          </span>
          {currentTicket.updatedAt && (
            <span>
              Updated: {new Date(currentTicket.updatedAt).toLocaleString()}
            </span>
          )}
        </div>

        <div className="divider" />

        <h3 className="conversation-title">Conversation</h3>

        <div className="messages-container">
          {currentTicket.messages && currentTicket.messages.length > 0 ? (
            currentTicket.messages.map((m) => (
              <div
                key={m._id}
                className={
                  "message " +
                  (m.senderRole === "advisor"
                    ? "message-advisor"
                    : "message-manager")
                }
              >
                <div className="message-bubble">
                  <div className="message-sender">
                    {roleLabel(m.senderRole)}
                  </div>
                  <div className="message-text">{m.text}</div>
                  <div className="message-time">
                    {m.at ? new Date(m.at).toLocaleString() : ""}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-messages">
              No messages yet for this ticket.
            </div>
          )}
        </div>

        {error && (
          <div className="reply-error">
            <FiAlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="reply-section">
          <input
            className="reply-input"
            placeholder="Type a reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !sending && reply.trim()) {
                e.preventDefault();
                sendReply();
              }
            }}
          />
          <button
            className="reply-btn"
            onClick={sendReply}
            disabled={sending || !reply.trim()}
          >
            <FiSend size={18} />
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
