import React from "react";
import {
  HiHome,
  HiOutlineChatAlt2,
  HiOutlineBell,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineIdentification,
  HiOutlineChartBar,
  HiOutlineCash,
  HiOutlineDocumentReport,
  HiOutlineDeviceMobile,
  HiLogout,
  HiChevronDoubleLeft,
  HiChevronDoubleRight
} from "react-icons/hi";
import {
  RiExchangeLine,
  RiShieldLine,
  RiReceiptLine,
  RiWallet3Line,
  RiMoneyDollarBoxLine
} from "react-icons/ri";
import { BiSupport, BiChevronRight, BiChevronDown } from "react-icons/bi";

const RoleSidebar = ({ ctx }) => {
  const {
    role,
    activeSection,
    userManagementTab,
    retailerTransactionTab,
    setActiveSection,
    setUserManagementTab,
    setRetailerTransactionTab,
    companyName,
    companyTagline,
    displayRole,
    handleLogout,
    isCollapsed,
    setIsCollapsed,
  } = ctx;

  const NavButton = ({ section, icon: Icon, label, onClick, isActive, isSubnav = false, hasSubnav = false }) => (
    <button
      onClick={onClick}
      className={`btn w-100 d-flex align-items-center border-0 rounded-0 text-start position-relative overflow-hidden group ${isCollapsed ? 'justify-content-center px-0' : ''}`}
      title={isCollapsed ? label : ''}
      style={{
        padding: isCollapsed ? '14px 0' : (isSubnav ? '10px 20px 10px 48px' : '14px 20px'),
        fontSize: isSubnav ? '13px' : '14px',
        fontWeight: isActive ? '700' : '500',
        color: isActive ? '#4f46e5' : '#475569',
        backgroundColor: isActive ? '#f8faff' : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <span
          className="position-absolute start-0 rounded-end"
          style={{
            width: '4px',
            height: '24px',
            backgroundColor: '#4f46e5',
            top: '50%',
            transform: 'translateY(-50%)',
            boxShadow: '0 0 10px rgba(79, 70, 229, 0.4)'
          }}
        />
      )}

      {/* Icon */}
      <div
        className={`${isCollapsed ? '' : 'me-3'} d-flex align-items-center justify-content-center`}
        style={{
          transition: 'transform 0.3s ease',
          transform: isActive ? 'scale(1.15)' : 'scale(1)',
          color: isActive ? '#4f46e5' : '#94a3b8'
        }}
      >
        <Icon size={isSubnav ? 16 : 20} />
      </div>

      {/* Label (Hidden if collapsed) */}
      {!isCollapsed && (
        <span className="text-truncate" style={{
          transition: 'opacity 0.2s ease, transform 0.3s ease',
          transform: isActive ? 'translateX(4px)' : 'translateX(0)',
          whiteSpace: 'nowrap'
        }}>
          {label}
        </span>
      )}

      {/* Right-aligned Chevron for Parents of Submenus */}
      {!isCollapsed && hasSubnav && (
        <div className="ms-auto" style={{ transition: 'transform 0.3s ease' }}>
          {isActive ? <BiChevronDown size={18} /> : <BiChevronRight size={18} />}
        </div>
      )}

      {/* Subtle indicator for the selected subnav item */}
      {!isCollapsed && isSubnav && isActive && (
        <div className="ms-auto" style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#4f46e5' }} />
      )}
    </button>
  );

  return (
    <aside
      className="d-flex flex-column vh-100 sticky-top border-end bg-white shadow-sm"
      style={{
        width: isCollapsed ? '80px' : '240px',
        zIndex: 1040,
        borderRightColor: '#f1f5f9 !important',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Brand Section */}
      <div className={`p-3 mb-2 d-flex flex-column ${isCollapsed ? 'align-items-center' : ''}`}>
        <div className="d-flex align-items-center gap-2 p-1 w-100">
          <div
            className="d-flex align-items-center justify-content-center fw-bold rounded-3 text-white shadow"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#4f46e5',
              minWidth: '40px',
              fontSize: '16px',
              backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
            }}
          >
            XT
          </div>
          {!isCollapsed && (
            <div className="d-flex flex-column overflow-hidden text-truncate ms-2">
              <strong style={{ fontSize: '14px', color: '#1e293b' }} className="text-truncate">{companyName}</strong>
              <span style={{ fontSize: '10px', color: '#94a3b8' }} className="text-truncate">{companyTagline}</span>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        {!isCollapsed && (
          <div className="mt-3 px-1 w-100 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 py-1 px-3 rounded-pill border bg-white" style={{ borderColor: '#e2e8f0' }}>
              <RiShieldLine style={{ color: '#4f46e5' }} size={10} />
              <span style={{ fontSize: '9px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase' }}>
                {role}
              </span>
            </div>
            <button
              className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center p-1 border shadow-sm"
              style={{ color: '#64748b' }}
              onClick={() => setIsCollapsed(true)}
            >
              <HiChevronDoubleLeft size={14} />
            </button>
          </div>
        )}

        {isCollapsed && (
          <button
            className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center p-1 border shadow-sm mt-3"
            style={{ color: '#4f46e5' }}
            onClick={() => setIsCollapsed(false)}
          >
            <HiChevronDoubleRight size={14} />
          </button>
        )}
      </div>

      <div className="flex-grow-1 overflow-y-auto py-2 custom-scrollbar">
        {!isCollapsed && (
          <div className="px-4 py-2 mb-1" style={{ fontSize: '10px', fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Main Menu
          </div>
        )}
        {isCollapsed && <div className="border-bottom my-2 mx-3 opacity-50" />}

        <NavButton section="dashboard" icon={HiHome} label="Dashboard" onClick={() => setActiveSection("dashboard")} isActive={activeSection === "dashboard"} />

        {/* Admin Section */}
        {role === "admin" && (
          <>
            <NavButton section="wallet-transfer" icon={RiExchangeLine} label="Wallet Transfer" onClick={() => setActiveSection("wallet-transfer")} isActive={activeSection === "wallet-transfer"} />
            <NavButton section="retailer-chat" icon={HiOutlineChatAlt2} label="Chat Room" onClick={() => setActiveSection("retailer-chat")} isActive={activeSection === "retailer-chat"} />
            <NavButton section="notifications" icon={HiOutlineBell} label="Broadcasts" onClick={() => setActiveSection("notifications")} isActive={activeSection === "notifications"} />
            <NavButton section="support" icon={BiSupport} label="Support Centre" onClick={() => setActiveSection("support")} isActive={activeSection === "support"} />
          </>
        )}

        {/* Distributor Sections */}
        {role === "distributor" && (
          <>
            <NavButton
              section="user-management"
              icon={HiOutlineUsers}
              label="Management"
              hasSubnav={true}
              onClick={() => { setActiveSection("user-management"); setUserManagementTab("users"); }}
              isActive={activeSection === "user-management"}
            />
            {activeSection === "user-management" && !isCollapsed && (
              <div style={{ backgroundColor: '#fcfdff' }} className="border-start ms-4">
                <NavButton isSubnav icon={HiOutlineUserGroup} label="Roles" onClick={() => setUserManagementTab("roles")} isActive={userManagementTab === "roles"} />
                <NavButton isSubnav icon={HiOutlineIdentification} label="Users" onClick={() => setUserManagementTab("users")} isActive={userManagementTab === "users"} />
              </div>
            )}
            <NavButton section="wallet" icon={RiWallet3Line} label="Assets" onClick={() => setActiveSection("wallet")} isActive={activeSection === "wallet"} />
            <NavButton section="performance" icon={HiOutlineChartBar} label="Performance" onClick={() => setActiveSection("performance")} isActive={activeSection === "performance"} />
            <NavButton section="withdrawals" icon={RiMoneyDollarBoxLine} label="Withdrawals" onClick={() => setActiveSection("withdrawals")} isActive={activeSection === "withdrawals"} />
            <NavButton section="support" icon={BiSupport} label="Support" onClick={() => setActiveSection("support")} isActive={activeSection === "support"} />
          </>
        )}

        {/* Master/Super Distributor */}
        {(role === "master_distributor" || role === "super_distributor") && (
          <>
            <NavButton
              section="user-management"
              icon={HiOutlineUsers}
              label="Management"
              hasSubnav={true}
              onClick={() => { setActiveSection("user-management"); setUserManagementTab("users"); }}
              isActive={activeSection === "user-management"}
            />
            {activeSection === "user-management" && !isCollapsed && (
              <div style={{ backgroundColor: '#fcfdff' }} className="border-start ms-4">
                <NavButton isSubnav icon={HiOutlineUserGroup} label="Roles" onClick={() => setUserManagementTab("roles")} isActive={userManagementTab === "roles"} />
                <NavButton isSubnav icon={HiOutlineIdentification} label="Sub-Users" onClick={() => setUserManagementTab("users")} isActive={userManagementTab === "users"} />
              </div>
            )}
            <NavButton section="wallet" icon={RiWallet3Line} label="Wallet" onClick={() => setActiveSection("wallet")} isActive={activeSection === "wallet"} />
            <NavButton section="reports" icon={HiOutlineDocumentReport} label="Reports" onClick={() => setActiveSection("reports")} isActive={activeSection === "reports"} />
            <NavButton section="notifications" icon={HiOutlineBell} label="Broadcasts" onClick={() => setActiveSection("notifications")} isActive={activeSection === "notifications"} />
            <NavButton section="support" icon={BiSupport} label="Support" onClick={() => setActiveSection("support")} isActive={activeSection === "support"} />
          </>
        )}

        {/* Retailer Section */}
        {role === "retailer" && (
          <>
            <NavButton section="wallet" icon={RiWallet3Line} label="My Wallet" onClick={() => setActiveSection("wallet")} isActive={activeSection === "wallet"} />
            <NavButton
              section="transactions"
              icon={RiReceiptLine}
              label="Logs"
              hasSubnav={true}
              onClick={() => { setActiveSection("transactions"); setRetailerTransactionTab("payouts"); }}
              isActive={activeSection === "transactions"}
            />
            {activeSection === "transactions" && !isCollapsed && (
              <div style={{ backgroundColor: '#fcfdff' }} className="border-start ms-4">
                <NavButton isSubnav icon={RiMoneyDollarBoxLine} label="Payin History" onClick={() => setRetailerTransactionTab("payin")} isActive={retailerTransactionTab === "payin"} />
                <NavButton isSubnav icon={RiReceiptLine} label="Payout History" onClick={() => setRetailerTransactionTab("payouts")} isActive={retailerTransactionTab === "payouts"} />
              </div>
            )}
            <NavButton section="reports" icon={HiOutlineDocumentReport} label="Reports" onClick={() => setActiveSection("reports")} isActive={activeSection === "reports"} />
            <NavButton section="recharge" icon={HiOutlineDeviceMobile} label="Recharge" onClick={() => setActiveSection("recharge")} isActive={activeSection === "recharge"} />
            <NavButton section="notifications" icon={HiOutlineBell} label="Alerts" onClick={() => setActiveSection("notifications")} isActive={activeSection === "notifications"} />
            <NavButton section="support" icon={BiSupport} label="Support" onClick={() => setActiveSection("support")} isActive={activeSection === "support"} />
          </>
        )}

        {role !== "retailer" && (
          <NavButton section="transactions" icon={RiReceiptLine} label="History" onClick={() => setActiveSection("transactions")} isActive={activeSection === "transactions"} />
        )}
      </div>

      <div className={`p-3 border-top ${isCollapsed ? 'd-flex justify-content-center' : ''}`}>
        <button
          className={`btn btn-outline-danger d-flex align-items-center justify-content-center border-0 fw-bold transition-all ${isCollapsed ? 'rounded-circle p-2' : 'gap-3 w-100 rounded-4'}`}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            padding: isCollapsed ? '10px' : '12px',
            fontSize: '14px',
            width: isCollapsed ? '44px' : '100%',
            height: isCollapsed ? '44px' : 'auto'
          }}
          onClick={handleLogout}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <HiLogout size={isCollapsed ? 20 : 18} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default RoleSidebar;
