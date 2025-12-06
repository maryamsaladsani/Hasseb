import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OwnerFeedbackPanel.css";

export default function OwnerFeedbackPanel({ ownerId }) {
    const [feedbackList, setFeedbackList] = useState([]);

    useEffect(() => {
        if (!ownerId) return;

        axios
            .get(`http://localhost:5001/api/feedback/owner/${ownerId}`)
            .then((res) => {
                if (res.data.success) {
                    setFeedbackList(res.data.feedback || []);
                }
            })
            .catch((err) => console.error("Feedback fetch error:", err));
    }, [ownerId]);

    return (
        <div className="fb-page">
            <div className="fb-card">

                {/* HEADER LIKE BEP */}
                <div className="fb-header">
                    <div className="fb-icon-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>

                    <h2 className="fb-title">Advisor Feedback</h2>
                </div>

                {/* NO FEEDBACK */}
                {feedbackList.length === 0 && (
                    <div className="fb-empty">
                        No feedback has been sent yet.
                    </div>
                )}

                {/* FEEDBACK CARDS */}
                <div className="fb-list">
                    {feedbackList.map((fb) => (
                        <div key={fb._id} className="fb-item">
                            <div className="fb-item-header">
                                <span className="fb-from">From Advisor</span>
                                <span className="fb-date">
                                    {new Date(fb.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="fb-content">
                                {fb.content}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
