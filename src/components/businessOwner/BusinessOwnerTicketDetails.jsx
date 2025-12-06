// src/components/support/BusinessOwnerTicketDetails.jsx
import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiSend, FiAlertCircle } from "react-icons/fi";
import "../../SharedStyles/SharedTicketDetails.css";

const API_BASE = "http://localhost:5001/api";

export default function BusinessOwnerTicketDetails({ ticket, setTab }) {
  // Read logged user
  let loggedUser = null;
  try {
    const raw = localStorage.getItem("loggedUser");
    loggedUser = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to parse loggedUser", e);
  }

  const role = loggedUser?.role || "owner"; 

  const [currentTicket, setCurrentTicket] = useState(ticket || null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // keep in sync if parent passes a new ticket
  useEffect(() => {
    setCurrentTicket(ticket || null);
  }, [ticket]);

  if (!currentTicket) {
    return (
      <div className="ticket-not-found">
        <FiAlertCircle size={48} />
        <p>No ticket selected. Please select a ticket from the support page.</p>
      </div>
    );
  }

  async function sendReply() {
    if (!reply.trim()) return;

    try {
      setSending(true);
      setError("");

      const res = await fetch(
        `${API_BASE}/tickets/${currentTicket.id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderRole: role, 
            text: reply.trim(),
          }),
        }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Failed to send reply");
      }

      const updated = await res.json();
      // backend returns updated ticket with messages
      setCurrentTicket(updated);
      setReply("");
    } catch (err) {
      console.error("sendReply error:", err);
      setError(err.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  function getStatusClass(status) {
    if (status === "resolved") return "status-resolved";
    if (status === "inprogress" || status === "in-progress")
      return "status-progress";
    return "status-open";
  }

  function getStatusLabel(status) {
    if (status === "resolved") return "Resolved";
    if (status === "inprogress" || status === "in-progress") return "In Progress";
    return "Open";
  }

  function roleLabel(senderRole) {
    if (senderRole === "manager") return "Manager";
    if (senderRole === "owner") return "You";
    if (senderRole === "advisor") return "Advisor";
    return senderRole;
  }

  return (
    <div className="ticket-details-container">
      <button className="back-btn" onClick={() => setTab("support")}>
        <FiArrowLeft size={20} />
        Back to Tickets
      </button>

      <div className="ticket-details-card">
        <div className="ticket-header">
          <h1 className="ticket-subject">
            {currentTicket.subject || currentTicket.title}
          </h1>
          <span
            className={`ticket-status ${getStatusClass(currentTicket.status)}`}
          >
            {getStatusLabel(currentTicket.status)}
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
            currentTicket.messages.map((m, index) => {
              const isOwner = m.senderRole === "owner";
              const isManager = m.senderRole === "manager";

              return (
                <div
                  key={index}
                  className={`message ${
                    isOwner ? "message-owner" : "message-manager"
                  }`}
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
              );
            })
          ) : (
            <div className="no-messages">No messages yet for this ticket.</div>
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
            placeholder="Type a reply to the manager…"
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
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
