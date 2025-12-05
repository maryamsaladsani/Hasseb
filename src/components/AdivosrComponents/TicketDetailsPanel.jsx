import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";


export default function TicketDetailsPanel({ ticket, setTab }) {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const role = user?.role || "advisor"; 

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (!ticket) {
    return (
      <div className="alert alert-warning fw-semibold m-4">
        لا توجد تذكرة محددة — الرجاء اختيار تذكرة من صفحة الدعم.
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
            senderRole: role, // "advisor"
            text: reply.trim(),
          }),
        }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Failed to send reply");
      }

      setReply("");
      // Option 1: just reload page / go back
      // Option 2: you can add a callback to refetch selected ticket
      alert("Reply sent to manager.");
    } catch (err) {
      console.error("sendReply error:", err);
      setError(err.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-xxl">
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => setTab("support")}
      >
        <FiArrowLeft /> Back
      </button>

      <div className="card p-4 shadow-sm">
        <h3 className="fw-bold mb-3">{ticket.subject}</h3>

        <p>
          <strong>Status:</strong> {ticket.status}
        </p>

        <p className="text-muted small">
          Created:{" "}
          {ticket.createdAt
            ? new Date(ticket.createdAt).toLocaleString()
            : "-"}
          {ticket.updatedAt && (
            <>
              {" | "}Updated:{" "}
              {new Date(ticket.updatedAt).toLocaleString()}
            </>
          )}
        </p>

        <hr />

        <h5 className="mb-3">Conversation</h5>

        <div
          className="border rounded p-2 mb-3"
          style={{ maxHeight: 300, overflow: "auto" }}
        >
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((m, index) => {
              const isAdvisor = m.senderRole === "advisor";
              const isManager = m.senderRole === "manager";

              return (
                <div
                  key={index}
                  className="small mb-2 d-flex"
                  style={{
                    justifyContent: isAdvisor ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    className={
                      "p-2 rounded " +
                      (isAdvisor
                        ? "bg-primary text-white"
                        : isManager
                        ? "bg-light"
                        : "bg-secondary text-white")
                    }
                    style={{ maxWidth: "80%" }}
                  >
                    <div className="fw-semibold mb-1">
                      {isManager
                        ? "Manager"
                        : isAdvisor
                        ? "You"
                        : m.senderRole}
                    </div>
                    <div>{m.text}</div>
                    <div className="text-muted mt-1">
                      {m.at
                        ? new Date(m.at).toLocaleString()
                        : ""}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-muted small">
              No messages yet for this ticket.
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-2">
            {error}
          </div>
        )}

        <div className="input-group">
          <input
            className="form-control"
            placeholder="Type a reply to the manager…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <button
            className="btn btn-dark"
            onClick={sendReply}
            disabled={sending || !reply.trim()}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

