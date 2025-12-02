import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiEye,
  FiTrash2,
  FiDownload,
  FiArrowLeft,
  FiEdit2,
} from "react-icons/fi";

export default function FeedbackPanel({ feedback = [], owners = [], advisorId }) {
  const [items, setItems] = useState([]);
  const [ownerId, setOwnerId] = useState("");
  const [content, setContent] = useState("");

  const [active, setActive] = useState(null);
  const [editText, setEditText] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  // Load feedback from props
  useEffect(() => {
    setItems(feedback);
  }, [feedback]);

  /* -------------------------------------
        ADD FEEDBACK
  ------------------------------------- */
  const addFeedback = async () => {
    if (!ownerId?.trim()) {
      alert("Please select an owner");
      return;
    }
    if (!content.trim()) {
      alert("Please enter feedback");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/api/advisor/feedback", {
        advisorId,
        ownerId,
        content,
      });

      setItems([res.data, ...items]);
      setContent("");
      setOwnerId("");
    } catch (err) {
      console.error("Add feedback error:", err);
      alert("Error adding feedback");
    }
  };

  /* -------------------------------------
        DELETE
  ------------------------------------- */
  const deleteOne = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/advisor/feedback/${id}`);

      setItems(items.filter((i) => i._id !== id));
      setActive(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------------------------
        EDIT
  ------------------------------------- */
  const saveEdit = async () => {
    if (!editText.trim()) return;

    try {
      const res = await axios.put(
        `http://localhost:5001/api/advisor/feedback/${active._id}`,
        { content: editText }
      );

      setItems(items.map((i) => (i._id === active._id ? res.data : i)));
      setActive(res.data);
      setShowEdit(false);
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------------------------
        EXPORT ALL
  ------------------------------------- */
  const exportAll = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* -------------------------------------
        VIEW MODE
  ------------------------------------- */
  if (active) {
    const owner = owners.find((o) => o._id === active.ownerId);

    return (
      <div className="container-xxl">
        <button className="btn btn-light mb-3 border" onClick={() => setActive(null)}>
          <FiArrowLeft /> Back
        </button>

        <div className="card-neo p-4">
          <h4 className="fw-bold">Feedback Details</h4>

          <p className="text-muted small">
            {new Date(active.createdAt).toLocaleString()}
          </p>

          {owner && (
            <p className="fw-semibold">
              For: {owner.fullName}
            </p>
          )}

          <p>{active.content}</p>

          <div className="d-flex gap-3 mt-4">
            <button
              className="btn btn-dark"
              onClick={() => {
                setShowEdit(true);
                setEditText(active.content);
              }}
            >
              <FiEdit2 /> Edit
            </button>

            <button className="btn btn-danger" onClick={() => deleteOne(active._id)}>
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>

        {/* Edit Modal */}
        {showEdit && (
          <>
            <div className="modal-backdrop fade show" />
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-sm modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h6>Edit Feedback</h6>
                    <button className="btn-close" onClick={() => setShowEdit(false)} />
                  </div>

                  <div className="modal-body">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setShowEdit(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-dark" onClick={saveEdit}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  /* -------------------------------------
        MAIN VIEW
  ------------------------------------- */
  return (
    <div className="container-xxl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Feedback</h4>

        <button className="btn btn-outline-dark" onClick={exportAll}>
          <FiDownload /> Export All
        </button>
      </div>

      {/* ADD FEEDBACK */}
      <div className="card-neo p-3 mb-4">
        <select
          className="form-select mb-2"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
        >
          <option value="">Select owner</option>
          {owners.map((o) => (
            <option key={o._id} value={o._id}>
              {o.fullName}
            </option>
          ))}
        </select>

        <textarea
          className="form-control"
          rows={2}
          placeholder="Add a comment…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <button className="btn btn-dark mt-2" onClick={addFeedback}>
          Add Comment
        </button>
      </div>

      {/* LIST */}
      <div className="d-flex flex-column gap-3">
        {items.map((fb) => {
          const owner = owners.find((o) => o._id === fb.ownerId);

          return (
            <div key={fb._id} className="card-neo p-3 d-flex justify-content-between">
              <div>
                {/* التاريخ */}
                <div className="text-muted small">
                  {new Date(fb.createdAt).toLocaleString()}
                </div>

                {/* الفيدباك لمين */}
                {owner && (
                  <div className="fw-semibold small">
                    Feedback for: {owner.fullName}
                  </div>
                )}

                {/* نص الفيدباك */}
                <div>{fb.content}</div>
              </div>

              <button className="btn btn-outline-dark" onClick={() => setActive(fb)}>
                <FiEye /> View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

