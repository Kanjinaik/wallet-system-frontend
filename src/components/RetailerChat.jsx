import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const ISSUE_TYPES = [
  "Payment Failed",
  "Wallet Balance Issue",
  "Withdrawal Pending",
  "Transfer Problem",
  "Account Locked",
  "KYC Verification",
];

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  escalated: "Escalated",
  resolved: "Resolved",
};

const formatTime = (date) => {
  if (!date) return "--";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "--";
  return value.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const normalizeMessage = (msg = {}) => ({
  id: msg.id,
  sender: msg.sender || msg.sender_type || msg.senderType || "retailer",
  text: msg.text || msg.message || "",
  at: msg.at || msg.created_at || msg.updated_at || msg.createdAt || new Date().toISOString(),
});

const normalizeThread = (thread = {}) => {
  const messages = Array.isArray(thread.messages) ? thread.messages.map(normalizeMessage) : [];
  const lastMessage = thread.last_message || thread.lastMessage;
  if (!messages.length && lastMessage) {
    messages.push(normalizeMessage(lastMessage));
  }

  return {
    id: thread.id,
    issueType: thread.issueType || thread.issue_type || thread.subject || "Support",
    status: thread.status || "open",
    priority: thread.priority || "medium",
    txId: thread.txId || thread.tx_id || thread.transaction_id || "",
    retailerName: thread.user?.name || thread.retailerName || "",
    updatedAt:
      thread.updatedAt ||
      thread.updated_at ||
      thread.last_message_at ||
      messages[messages.length - 1]?.at ||
      thread.created_at ||
      new Date().toISOString(),
    messages,
  };
};

const RetailerChat = ({ ctx }) => {
  const { role, activeSection } = ctx;

  const isRetailer = role === "retailer" || role === "user";
  const isAdmin = false;
  const isManager = false;
  const shouldRender = isRetailer && activeSection === "support";

  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [newIssueType, setNewIssueType] = useState(ISSUE_TYPES[0]);
  const [newMessage, setNewMessage] = useState("");
  const [txId, setTxId] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin
        ? "/admin/support/threads"
        : isManager
          ? `/${role === "super_distributor" ? "super-distributor" : "master-distributor"}/support/threads`
          : "/retailer/support/threads";
      const res = await api.get(endpoint);
      const list = Array.isArray(res.data) ? res.data.map(normalizeThread) : [];
      setThreads(list);
      if (!selectedId && list.length) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load chat threads");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isManager, role, selectedId]);

  const fetchThreadDetail = useCallback(async (id) => {
    if (!id) return;
    try {
      setMessageLoading(true);
      const endpoint = isAdmin
        ? `/admin/support/threads/${id}`
        : isManager
          ? `/${role === "super_distributor" ? "super-distributor" : "master-distributor"}/support/threads/${id}`
          : `/retailer/support/threads/${id}`;
      const res = await api.get(endpoint);
      const normalized = normalizeThread(res.data || {});
      setThreads((prev) => {
        const others = prev.filter((t) => t.id !== id);
        return [normalized, ...others];
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load chat");
    } finally {
      setMessageLoading(false);
    }
  }, [isAdmin, isManager, role]);

  useEffect(() => {
    if (!shouldRender) return;
    fetchThreads();
  }, [fetchThreads, shouldRender]);

  useEffect(() => {
    if (!shouldRender || !selectedId) return;
    fetchThreadDetail(selectedId);
  }, [fetchThreadDetail, selectedId, shouldRender]);

  useEffect(() => {
    if (shouldRender) return;
    setThreads([]);
    setSelectedId(null);
  }, [shouldRender]);

  const visibleThreads = useMemo(() => threads, [threads]);

  const selectedThread = useMemo(
    () => visibleThreads.find((t) => t.id === selectedId) || visibleThreads[0],
    [visibleThreads, selectedId]
  );

  if (!shouldRender) return null;

  const handleCreateThread = async () => {
    if (!newMessage.trim()) return;
    try {
      const endpoint = isAdmin
        ? "/admin/support/threads"
        : isManager
          ? `/${role === "super_distributor" ? "super-distributor" : "master-distributor"}/support/threads`
          : "/retailer/support/threads";
      const res = await api.post(endpoint, {
        issue_type: newIssueType,
        priority: "medium",
        tx_id: txId || null,
        message: newMessage.trim(),
      });
      toast.success("Query sent to admin");
      const normalized = normalizeThread(res.data || {});
      setThreads((prev) => [normalized, ...prev]);
      setSelectedId(normalized.id);
      setNewMessage("");
      setTxId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create ticket");
    }
  };

  const handleSendReply = async () => {
    if (!selectedThread || !reply.trim()) return;
    try {
      await api.post(
        isAdmin
          ? `/admin/support/threads/${selectedThread.id}/reply`
          : isManager
            ? `/${role === "super_distributor" ? "super-distributor" : "master-distributor"}/support/threads/${selectedThread.id}/reply`
            : `/retailer/support/threads/${selectedThread.id}/reply`,
        {
          message: reply.trim(),
          status: isAdmin ? "in_progress" : undefined,
        }
      );
      setReply("");
      if (selectedId) {
        fetchThreadDetail(selectedThread.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reply");
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedThread) return;
    try {
      await api.post(`/admin/support/threads/${selectedThread.id}/reply`, {
        message: "Marked resolved",
        status: "resolved",
      });
      fetchThreadDetail(selectedThread.id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark resolved");
    }
  };

  return (
    <section className="chat-lite">
      <header className="chat-lite-head">
        <div>
          <p className="eyebrow">{isAdmin ? "Admin view" : isManager ? "Manager support" : "Retailer support"}</p>
          <h3>{isAdmin ? "Support Inbox" : "Contact Admin"}</h3>
          <p className="muted">
            {isAdmin
              ? "All incoming support threads arrive here automatically."
              : "Send a query to admin and track replies."}
          </p>
        </div>
      </header>

      <div className="chat-lite-grid">
        <aside className="chat-lite-list">
          <div className="chat-lite-list-head">
            <strong>Conversations</strong>
            <span className="muted">{loading ? "Loading..." : `${visibleThreads.length} open`}</span>
          </div>
          <ul>
            {visibleThreads.map((t) => (
              <li
                key={t.id}
                className={t.id === selectedThread?.id ? "active" : ""}
                onClick={() => setSelectedId(t.id)}
              >
                <div className="chat-lite-row">
                  <div>
                    <strong>{t.issueType}</strong>
                    <p className="muted">{t.txId || "No transaction id"}</p>
                    {isAdmin && <small className="muted">{t.retailerName || "Retailer"}</small>}
                  </div>
                  <div className="chat-lite-meta">
                    <span className={`status ${t.status}`}>{STATUS_LABELS[t.status] || t.status}</span>
                    <small>{formatTime(t.updatedAt)}</small>
                  </div>
                </div>
                <p className="chat-lite-last">
                  {t.messages?.[t.messages.length - 1]?.text?.slice(0, 60) || "No messages yet"}
                </p>
              </li>
            ))}
            {visibleThreads.length === 0 && <li className="muted">No conversations yet.</li>}
          </ul>
        </aside>

        <main className="chat-lite-main">
          {selectedThread ? (
            <>
              <div className="chat-lite-thread-head">
                <div>
                  <p className="eyebrow">Ticket {selectedThread.id}</p>
                  <h4>{selectedThread.issueType}</h4>
                  <div className="chat-lite-tags">
                    <span className="chip ghost">{STATUS_LABELS[selectedThread.status] || selectedThread.status}</span>
                    {selectedThread.txId && <span className="chip ghost">Txn {selectedThread.txId}</span>}
                  </div>
                </div>
                <div className="chat-lite-actions">
                  {isAdmin && (
                    <button className="btn ghost" type="button" onClick={handleMarkResolved}>
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              <div className="chat-lite-messages">
                {messageLoading && <div className="muted">Loading conversation...</div>}
                {(selectedThread?.messages || []).map((msg, idx) => (
                  <div key={idx} className={`chat-lite-msg ${msg.sender}`}>
                    <div className="bubble">
                      <p>{msg.text}</p>
                      <small>{formatTime(msg.at)}</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-lite-compose">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <button className="btn primary" type="button" onClick={handleSendReply}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="muted">Select a conversation to view.</div>
          )}
        </main>

        {isRetailer && (
          <aside className="chat-lite-form">
            <div className="chat-lite-card">
              <p className="eyebrow">Create Ticket</p>
              <label>
                Issue Type
                <select value={newIssueType} onChange={(e) => setNewIssueType(e.target.value)}>
                  {ISSUE_TYPES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Transaction / Ticket ID
                <input value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="Optional" />
              </label>
              <label>
                Message
                <textarea
                  rows="3"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe your issue"
                />
              </label>
              <button className="btn primary" type="button" onClick={handleCreateThread}>
                Send to Admin
              </button>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
};

export default RetailerChat;
