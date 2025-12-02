import React from "react";
import { FiArrowLeft } from "react-icons/fi";

export default function TicketDetailsPanel({ ticket, setTab }) {
  if (!ticket) {
    return (
      <div className="alert alert-warning fw-semibold m-4">
        لا توجد تذكرة محددة — الرجاء اختيار تذكرة من صفحة الدعم.
      </div>
    );
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
        <h3 className="fw-bold mb-3">{ticket.title}</h3>

        <p><strong>Status:</strong> {ticket.status}</p>
        <p><strong>Description:</strong> {ticket.description || "No description provided."}</p>

        <p className="text-muted small mt-3">
          Created: {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>

    </div>
  );
}
