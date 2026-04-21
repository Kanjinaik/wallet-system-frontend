import React from "react";

const RoleNotificationsSection = ({ ctx }) => {
  const {
    role,
    activeSection,
    notifications,
    markNotificationRead,
  } = ctx;

  const enabled = ["retailer", "super_distributor", "master_distributor", "distributor", "admin"].includes(role);
  if (!(enabled && activeSection === "notifications")) {
    return null;
  }

  return (
    <section className="role-panel">
      <h4>Notification Center</h4>
      <table className="role-table">
        <thead><tr><th>Date</th><th>Type</th><th>Message</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {notifications.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td>{item.title}</td>
              <td>{item.message}</td>
              <td>{item.is_read ? "Read" : "Unread"}</td>
              <td>{item.is_read ? "-" : <button type="button" onClick={() => markNotificationRead(item.id)}>Mark Read</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default RoleNotificationsSection;
