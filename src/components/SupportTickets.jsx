import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import {
  RiTicket2Line,
  RiAddLine,
  RiRefreshLine,
  RiSearchLine,
  RiFilter2Line,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiFlag2Line,
  RiMessage3Line,
  RiFolderLine,
  RiUser3Line,
  RiAdminLine,
  RiAttachment2,
  RiSendPlane2Fill,
  RiArrowRightSLine
} from "react-icons/ri";

const CATEGORY_OPTIONS = [
  "Wallet Issue",
  "Deposit Issue",
  "Withdrawal Issue",
  "Distributor Issue",
  "Technical Issue",
];

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_COLORS = {
  high: "danger",
  medium: "pending",
  low: "success",
};

const statusClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "resolved") return "bg-success-subtle text-success";
  if (s === "in_progress" || s === "open") return "bg-warning-subtle text-warning-emphasis";
  if (s === "closed") return "bg-light text-muted";
  return "bg-light text-muted";
};

const PriorityBadge = ({ priority }) => {
  const p = String(priority || "").toLowerCase();
  let color = "bg-primary-subtle text-primary";
  if (p === "high") color = "bg-danger-subtle text-danger";
  if (p === "medium") color = "bg-warning-subtle text-warning-emphasis";

  return (
    <span className={`badge ${color} border-0 rounded-pill px-2 py-1 fw-bold text-uppercase`} style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
      {p}
    </span>
  );
};

const SupportTickets = ({ role, activeSection }) => {
  const isAdmin = role === "admin";
  const isSupported = isAdmin || role === "super_distributor" || role === "master_distributor" || role === "distributor";
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState({ total: 0, open: 0, resolved: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [messageFile, setMessageFile] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: CATEGORY_OPTIONS[0],
    priority: "medium",
    message: "",
    attachment: null,
  });

  const fetchTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/support/tickets", { params: filters });
      const list = res.data?.threads || [];
      setTickets(list);
      setSummary(res.data?.summary || { total: 0, open: 0, resolved: 0 });
      if (!selectedId && list.length) {
        setSelectedId(list[0].id);
      }
    } catch (error) {
      if (!silent) {
        toast.error(error.response?.data?.message || "Failed to load tickets");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters, selectedId]);

  const fetchMessages = useCallback(async (ticketId, silent = false) => {
    try {
      const res = await api.get(`/support/messages/${ticketId}`);
      setMessages(res.data?.messages || []);
    } catch (error) {
      if (!silent) {
        toast.error(error.response?.data?.message || "Failed to load messages");
      }
    }
  }, []);

  useEffect(() => {
    if (isSupported && activeSection === "support") {
      fetchTickets();
    }
  }, [activeSection, fetchTickets, isSupported]);

  useEffect(() => {
    if (!isSupported || activeSection !== "support") return undefined;
    const interval = window.setInterval(() => fetchTickets(true), 15000);
    return () => window.clearInterval(interval);
  }, [activeSection, fetchTickets, isSupported]);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    }
  }, [fetchMessages, selectedId]);

  useEffect(() => {
    if (!selectedId || activeSection !== "support" || !isSupported) return undefined;
    const interval = window.setInterval(() => fetchMessages(selectedId, true), 5000);
    return () => window.clearInterval(interval);
  }, [selectedId, activeSection, isSupported, fetchMessages]);

  const selectedTicket = useMemo(() => tickets.find((t) => t.id === selectedId), [tickets, selectedId]);

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast.error("Subject and message are required");
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(newTicket).forEach(([key, value]) => {
        if (value) formData.append(key === "attachment" ? "attachment" : key, value);
      });
      await api.post("/support/ticket", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Ticket created");
      setShowCreate(false);
      setNewTicket({
        subject: "",
        category: CATEGORY_OPTIONS[0],
        priority: "medium",
        message: "",
        attachment: null,
      });
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create ticket");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket) return;
    if (!messageText && !messageFile) {
      toast.error("Type a message or attach a file");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("ticket_id", selectedTicket.id);
      if (messageText) formData.append("message", messageText);
      if (messageFile) formData.append("attachment", messageFile);
      await api.post("/support/message", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setMessageText("");
      setMessageFile(null);
      fetchMessages(selectedTicket.id);
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedTicket) return;
    try {
      await api.post("/support/status", { ticket_id: selectedTicket.id, status });
      toast.success("Status updated");
      fetchTickets();
      fetchMessages(selectedTicket.id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  if (!isSupported || activeSection !== "support") return null;

  return (
    <div className="container-fluid px-4 pt-2 pb-5 bg-white">
      {/* Header Section */}
      <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
        <div>
          <h4 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <RiTicket2Line className="text-primary" /> Support Center
          </h4>
          <p className="text-muted small m-0 mt-1">Raise queries, track replies, and stay updated on resolution status.</p>
        </div>
        <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm px-3 fw-bold rounded-2 d-flex align-items-center gap-2 border-secondary-subtle" onClick={fetchTickets}>
              <RiRefreshLine /> Refresh
            </button>
          {!isAdmin && (
            <button className="btn btn-primary btn-sm px-4 fw-bold rounded-2 shadow-sm d-flex align-items-center gap-2 border-0" onClick={() => setShowCreate(true)} style={{ backgroundColor: '#4f46e5' }}>
              <RiAddLine /> New Ticket
            </button>
          )}
        </div>
      </div>

      {/* Simple Professional Metric Cards */}
      <div className="row g-4 mb-5">
        <div className="col-lg-3">
          <div className="card border border-secondary-subtle shadow-sm rounded-3 h-100 bg-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>Total Tickets</span>
                <RiTicket2Line className="text-primary opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-0">{summary.total || 0}</h2>
              <p className="text-muted small m-0 fw-medium">All your support conversations</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card border border-secondary-subtle shadow-sm rounded-3 h-100 bg-white border-start border-4 border-warning">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>Open Tickets</span>
                <RiTimeLine className="text-warning opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-0">{summary.open || 0}</h2>
              <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill fw-bold" style={{ fontSize: '10px' }}>Awaiting Action</span>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card border border-secondary-subtle shadow-sm rounded-3 h-100 bg-white border-start border-4 border-success">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>Resolved</span>
                <RiCheckboxCircleLine className="text-success opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-0">{summary.resolved || 0}</h2>
              <span className="text-success small fw-medium">Marked as resolved</span>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card border border-secondary-subtle shadow-sm rounded-3 h-100 bg-white border-start border-4 border-danger">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>High Priority</span>
                <RiFlag2Line className="text-danger opacity-50" size={20} />
              </div>
              <h2 className="fw-bold text-dark mb-0">{tickets.filter((t) => t.priority === "high").length}</h2>
              <span className="text-danger small fw-medium">Needs quick attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <div className="card border border-secondary-subtle shadow-sm rounded-3 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0 text-muted"><RiSearchLine /></span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 shadow-none ps-0 fw-medium text-black"
                  placeholder="Search by subject or category..."
                  style={{ color: '#000' }}
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm bg-light border-secondary-subtle fw-bold text-black" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} style={{ color: '#000' }}>
                <option value="" style={{ color: '#000' }}>Any Status</option>
                <option value="open" style={{ color: '#000' }}>Open Tickets</option>
                <option value="in_progress" style={{ color: '#000' }}>In Progress</option>
                <option value="resolved" style={{ color: '#000' }}>Resolved</option>
                <option value="closed" style={{ color: '#000' }}>Closed</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm bg-light border-secondary-subtle fw-bold text-black" value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))} style={{ color: '#000' }}>
                <option value="" style={{ color: '#000' }}>Any Priority</option>
                <option value="high" style={{ color: '#000' }}>High Level</option>
                <option value="medium" style={{ color: '#000' }}>Medium Level</option>
                <option value="low" style={{ color: '#000' }}>Low Level</option>
              </select>
            </div>
            <div className="col-md-1 d-flex">
              <button className="btn btn-light btn-sm w-100 border fw-bold text-muted" onClick={fetchTickets}>
                <RiFilter2Line />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Workspace: Ticket Registry Sidebar */}
        <div className="col-xl-4 col-lg-5">
          <div className="card border border-secondary-subtle shadow-sm rounded-3 overflow-hidden bg-white">
            <div className="card-header bg-light border-0 py-3 px-4">
              <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <RiFolderLine className="text-secondary" /> Ticket List
              </h6>
            </div>
            <div className="list-group list-group-flush overflow-auto scrollbar-thin" style={{ maxHeight: '600px' }}>
              {loading && <div className="p-4 text-center text-muted small fw-medium">Loading tickets...</div>}
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  className={`list-group-item list-group-item-action border-0 border-bottom border-secondary-subtle p-4 transition-all ${ticket.id === selectedId ? "bg-primary bg-opacity-10 border-start border-4 border-primary" : "bg-white"}`}
                  onClick={() => setSelectedId(ticket.id)}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className={`fw-bold m-0 text-truncate pe-3 ${ticket.id === selectedId ? "text-primary" : "text-dark"}`} style={{ fontSize: '14px' }}>{ticket.subject}</h6>
                    <span className={`badge rounded-pill px-2 py-1 fw-bold text-uppercase ${statusClass(ticket.status)}`} style={{ fontSize: '8px' }}>
                      {STATUS_LABELS[ticket.status] || ticket.status}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <PriorityBadge priority={ticket.priority} />
                    <span className="text-muted extra-small fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>{ticket.category}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted small fw-bold" style={{ fontSize: '10px' }}>#{ticket.id.toString().slice(-6).toUpperCase()}</span>
                    <span className="text-muted small" style={{ fontSize: '11px' }}>{new Date(ticket.updated_at || ticket.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
                  </div>
                </button>
              ))}
              {!tickets.length && !loading && (
                <div className="p-5 text-center text-muted">
                  <RiFolderLine size={32} className="opacity-25 mb-2" />
                  <p className="extra-small fw-bold text-uppercase">No Tickets Found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Hub: Chat Detail */}
        <div className="col-xl-8 col-lg-7">
          {selectedTicket ? (
            <div className="card border border-secondary-subtle shadow-sm rounded-3 h-100 d-flex flex-column bg-white overflow-hidden">
              <div className="card-header bg-white border-bottom border-secondary-subtle p-4">
                <div className="d-flex justify-content-between align-items-start gap-4">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="text-primary fw-bold small text-uppercase ls-wide" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>Ticket #{selectedTicket.id}</span>
                      <PriorityBadge priority={selectedTicket.priority} />
                    </div>
                    <h4 className="fw-bold text-dark m-0">{selectedTicket.subject}</h4>
                    <div className="d-flex align-items-center gap-3 mt-2 text-muted small">
                      <span><RiFolderLine className="me-1" /> {selectedTicket.category}</span>
                      <span><RiTimeLine className="me-1" /> Updated {new Date(selectedTicket.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="d-flex gap-2 shrink-0">
                    {isAdmin && selectedTicket.status !== "closed" && (
                      <>
                        <button className="btn btn-outline-success btn-sm fw-bold px-3 rounded-pill border-success-subtle" onClick={() => handleStatusChange("resolved")}>
                          <RiCheckboxCircleLine className="me-1" /> Resolve
                        </button>
                        <button className="btn btn-outline-danger btn-sm fw-bold px-3 rounded-pill border-danger-subtle" onClick={() => handleStatusChange("closed")}>
                          Close
                        </button>
                      </>
                    )}
                    {!isAdmin && selectedTicket.status === "resolved" && (
                      <button className="btn btn-light btn-sm fw-bold px-3 rounded-pill border" onClick={() => handleStatusChange("closed")}>
                        Close Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-body p-4 overflow-auto scrollbar-thin d-flex flex-column gap-4 bg-light bg-opacity-50" style={{ maxHeight: '500px', minHeight: '400px' }}>
                {messages.map((msg, idx) => {
                  const isSystem = msg.sender_type === "admin";
                  return (
                    <div key={msg.id || idx} className={`d-flex ${isSystem ? 'justify-content-start' : 'justify-content-end'}`}>
                      <div className={`d-flex gap-3 max-w-75 ${isSystem ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`rounded-circle shadow-sm d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: '32px', height: '32px', backgroundColor: isSystem ? '#4f46e5' : '#f1f5f9', color: isSystem ? '#fff' : '#475569' }}>
                          {isSystem ? <RiAdminLine size={16} /> : <RiUser3Line size={16} />}
                        </div>
                        <div>
                          <div className={`p-3 rounded-3 shadow-sm ${isSystem ? 'bg-white border border-secondary-subtle text-dark text-start' : 'bg-primary text-white text-start'}`} style={{ borderTopLeftRadius: isSystem ? '0' : '1.5rem', borderTopRightRadius: isSystem ? '1.5rem' : '0' }}>
                            <p className="m-0" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>{msg.message}</p>
                            {msg.file_url && (
                              <a href={msg.file_url} target="_blank" rel="noreferrer" className={`mt-2 d-inline-flex align-items-center gap-2 p-2 rounded ${isSystem ? 'bg-light text-primary' : 'bg-white bg-opacity-20 text-white'} text-decoration-none fw-bold`} style={{ fontSize: '10px' }}>
                                <RiAttachment2 /> View Attachment
                              </a>
                            )}
                          </div>
                          <small className={`text-muted mt-1 d-block fw-bold ${isSystem ? 'text-start' : 'text-end'}`} style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
                            {isSystem ? 'Admin' : 'You'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card-footer bg-white border-top border-secondary-subtle p-3">
                <div className="position-relative">
                  <textarea
                    className="form-control border-secondary-subtle shadow-none ps-3 pt-3 pb-5 bg-light text-black fs-6"
                    rows="2"
                    placeholder="Type your message..."
                    style={{ borderRadius: '0.75rem', resize: 'none', borderStyle: 'dashed', color: '#000' }}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <div className="position-absolute bottom-0 start-0 end-0 p-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2 ms-2">
                      <label className="btn btn-link text-secondary p-0 hover-primary transition-all">
                        <RiAttachment2 size={18} />
                        <input type="file" className="d-none" onChange={(e) => setMessageFile(e.target.files?.[0] || null)} />
                      </label>
                      {messageFile && <span className="badge bg-primary rounded-pill small" style={{ fontSize: '9px' }}>File attached</span>}
                    </div>
                    <button className="btn btn-primary px-4 py-1 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2 border-0" style={{ backgroundColor: '#4f46e5' }} onClick={handleSendMessage} disabled={!messageText && !messageFile}>
                      Submit <RiSendPlane2Fill />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted border border-secondary-subtle border-dashed rounded-3 p-5 bg-light bg-opacity-25">
              <RiMessage3Line size={48} className="opacity-10 mb-3" />
              <p className="fw-bold text-uppercase small" style={{ letterSpacing: '0.1em' }}>Select Thread for Resolution Details</p>
            </div>
          )}
        </div>
      </div>

      {/* Corporate Styled Create Ticket Modal */}
      {showCreate && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border border-secondary-subtle shadow-lg" style={{ borderRadius: '1rem' }}>
              <div className="modal-header border-bottom border-secondary-subtle p-4 bg-light rounded-top">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <RiAddLine className="text-primary" /> Create Support Ticket
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowCreate(false)}></button>
              </div>
              <div className="modal-body p-4 bg-white">
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase" style={{ fontSize: '10px' }}>Subject</label>
                  <input className="form-control border-secondary-subtle fw-bold text-dark no-shadow" placeholder="Briefly describe the issue..." value={newTicket.subject} onChange={(e) => setNewTicket((p) => ({ ...p, subject: e.target.value }))} style={{ color: '#000' }} />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold text-uppercase" style={{ fontSize: '10px' }}>Category</label>
                    <select className="form-select border-secondary-subtle fw-bold text-black" value={newTicket.category} onChange={(e) => setNewTicket((p) => ({ ...p, category: e.target.value }))} style={{ color: '#000' }}>
                      {CATEGORY_OPTIONS.map((opt) => (<option key={opt} style={{ color: '#000' }}>{opt}</option>))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold text-uppercase" style={{ fontSize: '10px' }}>Priority</label>
                    <select className="form-select border-secondary-subtle fw-bold text-black" value={newTicket.priority} onChange={(e) => setNewTicket((p) => ({ ...p, priority: e.target.value }))} style={{ color: '#000' }}>
                      <option value="low" style={{ color: '#000' }}>Low</option>
                      <option value="medium" style={{ color: '#000' }}>Medium</option>
                      <option value="high" style={{ color: '#000' }}>High</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold text-uppercase" style={{ fontSize: '10px' }}>Message</label>
                  <textarea className="form-control border-secondary-subtle fw-bold text-dark no-shadow" rows="3" placeholder="Write your issue in detail..." value={newTicket.message} onChange={(e) => setNewTicket((p) => ({ ...p, message: e.target.value }))} style={{ resize: 'none', color: '#000' }} />
                </div>
                <div className="mb-0">
                  <label className="form-label text-muted small fw-bold text-uppercase" style={{ fontSize: '10px' }}>Attachment</label>
                  <input type="file" className="form-control form-control-sm border-secondary-subtle bg-light no-shadow" onChange={(e) => setNewTicket((p) => ({ ...p, attachment: e.target.files?.[0] || null }))} />
                </div>
              </div>
              <div className="modal-footer border-top border-secondary-subtle p-4 bg-light rounded-bottom">
                <button type="button" className="btn btn-link text-muted fw-bold text-decoration-none me-auto" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="button" className="btn btn-primary px-5 fw-bold rounded-pill border-0 shadow-sm" style={{ backgroundColor: '#4f46e5' }} onClick={handleCreateTicket}>Create Ticket</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Layout CSS */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
        .no-shadow:focus {
          box-shadow: none !important;
        }
        .list-group-item:hover {
          background-color: #f8fafc !important;
        }
        .ls-wide {
          letter-spacing: 0.1em;
        }
        select, input, textarea, option {
          color: #000 !important;
        }
        .form-select, .form-control {
          color: #000 !important;
        }
      `}</style>
    </div>
  );
};

export default SupportTickets;
