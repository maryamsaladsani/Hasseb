import React, { useState } from "react";
import { FiArrowLeft, FiSend, FiAlertCircle } from "react-icons/fi";
import "../../SharedStyles/SharedTicketDetails.css"

export default function TicketDetailsPanel({ ticket, setTab }) {
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    const role = user?.role || "advisor";

    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    if (!ticket) {
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
                `http://localhost:5001/api/tickets/${ticket.id}/reply`,
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

            setReply("");
            alert("Reply sent to manager.");
        } catch (err) {
            console.error("sendReply error:", err);
            setError(err.message || "Failed to send reply.");
        } finally {
            setSending(false);
        }
    }

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
        <div className="ticket-details-container">
            <button className="back-btn" onClick={() => setTab("support")}>
                <FiArrowLeft size={20} />
                Back to Tickets
            </button>

            <div className="ticket-details-card">
                <div className="ticket-header">
                    <h1 className="ticket-subject">{ticket.subject || ticket.title}</h1>
                    <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
            {getStatusLabel(ticket.status)}
          </span>
                </div>

                <div className="ticket-meta">
          <span>
            Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "-"}
          </span>
                    {ticket.updatedAt && (
                        <span>
              Updated: {new Date(ticket.updatedAt).toLocaleString()}
            </span>
                    )}
                </div>

                <div className="divider"></div>

                <h3 className="conversation-title">Conversation</h3>

                <div className="messages-container">
                    {ticket.messages && ticket.messages.length > 0 ? (
                        ticket.messages.map((m, index) => {
                            const isAdvisor = m.senderRole === "advisor";
                            const isManager = m.senderRole === "manager";

                            return (
                                <div
                                    key={index}
                                    className={`message ${isAdvisor ? "message-advisor" : "message-manager"}`}
                                >
                                    <div className="message-bubble">
                                        <div className="message-sender">
                                            {isManager ? "Manager" : isAdvisor ? "You" : m.senderRole}
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
                        onKeyPress={(e) => e.key === "Enter" && !sending && reply.trim() && sendReply()}
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