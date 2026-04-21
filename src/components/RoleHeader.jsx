import React from "react";

const RoleHeader = ({ ctx }) => {
  const {
    role,
    isProfileMenuOpen,
    profileMenuRef,
    setIsProfileMenuOpen,
    displayName,
    displayRole,
    profileImageUrl,
    profileInitials,
    handleProfileMenuAction,
    handleLogout,
    notifications = [],
    unreadNotifications = 0,
    isNotificationMenuOpen,
    setIsNotificationMenuOpen,
    notificationMenuRef,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
  } = ctx;

  const dashboardTitle =
    role === "admin"
      ? "Admin Dashboard"
      : role === "master_distributor"
        ? "Master Distributor Dashboard"
        : role === "super_distributor"
          ? "Super Distributor Dashboard"
          : role === "distributor"
            ? "Distributor Dashboard"
            : "Retailer Dashboard";

  const showGreeting = role !== "admin";

  return (
    <header
      className="sticky-top w-100 p-3"
      style={{ zIndex: 1050, top: 0 }}
    >
      <div
        className="container-fluid d-flex align-items-center justify-content-between px-4 border shadow-sm rounded-4"
        style={{
          height: '68px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(226, 232, 240, 0.8) !important'
        }}
      >
        {/* Left Side: Title & Greeting */}
        <div className="d-flex flex-column">
          {showGreeting && (
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.12em', color: '#4f46e5', textTransform: 'uppercase' }}>
              Welcome back, {displayName}
            </span>
          )}
          <h2 className="m-0 fw-bold tracking-tight" style={{ fontSize: '1.2rem', color: '#1e293b' }}>
            {dashboardTitle}
          </h2>
        </div>

        {/* Right Side: Actions */}
        <div className="d-flex align-items-center gap-3">

          {/* Notifications Dropdown - HOVER ENABLED */}
          <div
            className="position-relative"
            ref={notificationMenuRef}
            onMouseEnter={() => {
              refreshNotifications?.();
              setIsNotificationMenuOpen(true);
            }}
            onMouseLeave={() => setIsNotificationMenuOpen(false)}
          >
            <button
              type="button"
              className="d-flex align-items-center justify-content-center border-0 rounded-circle position-relative p-0"
              style={{ width: '40px', height: '40px', backgroundColor: 'rgba(241, 245, 249, 0.5)', transition: 'all 0.2s' }}
            >
              <i className="bi bi-bell-fill fs-5" style={{ color: '#64748b' }} />
              {unreadNotifications > 0 && (
                <span className="position-absolute badge rounded-pill border border-2 border-white"
                  style={{ top: '0', right: '-2px', fontSize: '9px', backgroundColor: '#ef4444', padding: '3px 5px' }}>
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Floating Notification Dropdown */}
            {isNotificationMenuOpen && (
              <div className="position-absolute end-0 pt-3" style={{ top: '100%', width: '340px', zIndex: 1060 }}>
                <div
                  className="bg-white border border-light shadow-lg rounded-4 overflow-hidden"
                  style={{ backdropFilter: 'blur(20px)' }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-light/50">
                    <h6 className="m-0 fw-bold text-dark" style={{ fontSize: '14px' }}>Notifications</h6>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-bold"
                      style={{ fontSize: '11px', color: '#4f46e5' }}
                      onClick={(event) => {
                        event.stopPropagation();
                        markAllNotificationsRead?.();
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="custom-scrollbar">
                    {(notifications || []).length > 0 ? (
                      notifications.slice(0, 8).map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          className="btn btn-white w-100 border-bottom rounded-0 px-4 py-3 text-start d-flex flex-column gap-1 transition-all"
                          style={{ backgroundColor: item.is_read ? 'white' : '#fcfdff' }}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!item.is_read) {
                              markNotificationRead?.(item.id);
                            }
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100">
                            <strong style={{ fontSize: '12px', color: '#1e293b' }}>{item.title}</strong>
                            <small className="text-muted" style={{ fontSize: '10px' }}>
                              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </div>
                          <p className="m-0 text-muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                            {item.message}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="p-5 text-center text-muted" style={{ fontSize: '13px' }}>
                        <i className="bi bi-inbox fs-2 d-block mb-2 opacity-25"></i>
                        No new notifications.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="vr h-25 my-auto mx-1 opacity-10"></div>

          {/* User Profile Dropdown - HOVER ENABLED */}
          <div
            className="position-relative"
            ref={profileMenuRef}
            onMouseEnter={() => setIsProfileMenuOpen(true)}
            onMouseLeave={() => setIsProfileMenuOpen(false)}
          >
            <button
              className="btn btn-light d-flex align-items-center gap-2 p-1 pe-3 border rounded-pill shadow-sm"
              style={{ backgroundColor: '#fff', borderColor: '#f1f5f9' }}
              type="button"
            >
              <div className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-sm"
                style={{ width: '36px', height: '36px', backgroundColor: '#4f46e5', fontSize: '13px' }}>
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="user profile" className="w-100 h-100 object-fit-cover rounded-circle" />
                ) : (
                  <span>{profileInitials}</span>
                )}
              </div>
              <div className="d-none d-md-flex flex-column align-items-start">
                <span className="fw-bold" style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.2' }}>{displayName}</span>
                <span className="text-muted fw-medium" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{displayRole}</span>
              </div>
              <i className="bi bi-chevron-down ms-1" style={{ fontSize: '10px', color: '#94a3b8' }} />
            </button>

            {/* Floating Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="position-absolute end-0 pt-3" style={{ top: '100%', width: '200px', zIndex: 1060 }}>
                <div className="bg-white border border-light shadow-xl rounded-4 p-2"
                  style={{ backdropFilter: 'blur(20px)' }}>
                  <div className="px-3 py-2 mb-1">
                    <p className="m-0 text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '800' }}>Account</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-light w-100 text-start d-flex align-items-center gap-3 px-3 py-2 border-0 rounded-3"
                    style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}
                    onClick={() => handleProfileMenuAction("profile")}
                  >
                    <i className="bi bi-person-circle fs-6 text-primary" />
                    My Profile
                  </button>
                  <div className="border-bottom my-2 mx-2 opacity-50" />
                  <button
                    type="button"
                    className="btn btn-light w-100 text-start d-flex align-items-center gap-3 px-3 py-2 border-0 rounded-3 text-danger"
                    style={{ fontSize: '13px', fontWeight: '500' }}
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right fs-6" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default RoleHeader;
