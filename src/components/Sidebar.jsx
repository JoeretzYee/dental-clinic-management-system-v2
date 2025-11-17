import React, { useState } from "react";
import { Link } from "react-router-dom";
import Home from "./Home";

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div className="wrapper">
      <aside id="sidebar" className={isExpanded ? "expand" : ""}>
        <div className="d-flex">
          <button className="toggle-btn" type="button" onClick={handleToggle}>
            <i class="bi bi-grid"></i>
          </button>
          {/* <div className="sidebar-logo">
            <a href="#"></a>
          </div> */}
        </div>
        <ul className="sidebar-nav">
          <li className="sidebar-item">
            <Link to="/" className="sidebar-link">
              <i class="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/patients" className="sidebar-link">
              <i class="bi bi-people-fill"></i>
              <span>Patients</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/appointments" className="sidebar-link">
              <i class="bi bi-list-task"></i>
              <span>Appointments</span>
            </Link>
          </li>

          <li className="sidebar-item">
            <Link to="/treatments" className="sidebar-link">
              <i class="bi bi-bandaid"></i>
              <span>Treatments</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/payment" className="sidebar-link">
              <i class="bi bi-credit-card"></i>
              <span>Payment</span>
            </Link>
          </li>
        </ul>
      </aside>
      <Home />
    </div>
  );
}

export default Sidebar;
