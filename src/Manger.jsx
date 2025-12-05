import React, { useEffect, useMemo, useState } from "react";
import { Header, Sidebar } from "./components/Mangercopnents/Layout";
import { useNavigate } from "react-router-dom";

import {
  UsersPanel,
  SettingsPanel,
  AnalyticsPanel,
  SupportPanel,
} from "./components/Mangercopnents/Panels";
import NotificationsPanel from "./components/Mangercopnents/NotificationsPanel.jsx";
import AccountPanel from "./components/Mangercopnents/AccountPanel.jsx";
import { loadState, saveState } from "./information.js";
const USERS_API_URL = "http://localhost:5001/api/users";

export default function Manger() {
  
  // Auth guard — only manager role can access
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    if (!user || user.role !== "manager") {
      window.location.href = "/";
    }
  }, []);

  const [tab, setTab] = useState("users"); 
  const [state, setState] = useState(loadState);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const themeOption =
    state.settings && state.settings.themeOption
      ? state.settings.themeOption
      : "light";

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    navigate("/");
  };
    // Load users from backend (MongoDB) once
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(USERS_API_URL);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();

        setState((s) => ({
          ...s,
          users: data, // users now come from DB
        }));
      } catch (err) {
        console.error("Error loading users:", err);
      }
    }

    fetchUsers();
  }, []);

  // Theme handling
  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

    if (themeOption === "light") {
      document.body.dataset.theme = "light";
    } else if (themeOption === "dark") {
      document.body.dataset.theme = "dark";
    } else if (themeOption === "system") {
      document.body.dataset.theme = systemTheme.matches ? "dark" : "light";

      const handleChange = function (event) {
        document.body.dataset.theme = event.matches ? "dark" : "light";
      };

      systemTheme.addEventListener("change", handleChange);
      return function cleanup() {
        systemTheme.removeEventListener("change", handleChange);
      };
    }
  }, [themeOption]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setSettings = (next) => {
    setState(function (s) {
      const newState = Object.assign({}, s);
      const currentSettings = s.settings ? Object.assign({}, s.settings) : {};
      const newSettings = Object.assign({}, currentSettings);

      for (var k in next) {
        if (Object.prototype.hasOwnProperty.call(next, k)) {
          newSettings[k] = next[k];
        }
      }

      newState.settings = newSettings;
      return newState;
    });
  };

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return state.users;

    return state.users.filter(function (u) {
      const nameMatch = u.name.toLowerCase().includes(search);
      const emailMatch = u.email.toLowerCase().includes(search);
      const roleMatch = u.role.toLowerCase().includes(search);
      return nameMatch || emailMatch || roleMatch;
    });
  }, [state.users, query]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar
        tab={tab}
        setTab={function (id) {
          setTab(id);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={function () {
          setSidebarOpen(false);
        }}
        onLogout={handleLogout}
      />

      <div className="flex-grow-1 d-flex flex-column">
        <Header
          theme={document.body.dataset.theme || "light"}
          onOpenMenu={function () {
            setSidebarOpen(true);
          }}
        />

        <main className="container-fluid py-4">
          {tab === "users" && (
            <UsersPanel
              users={state.users}
              setUsers={function (users) {
                setState(function (s) {
                  const newState = Object.assign({}, s);
                  newState.users = users;
                  return newState;
                });
              }}
              query={query}
              setQuery={setQuery}
            />
          )}
{tab === "settings" && (
  <SettingsPanel
    settings={state.settings}
    users={state.users}        
    setSettings={function (settings) {
      setState(function (s) {
        const newState = Object.assign({}, s);
        newState.settings = settings;
        return newState;
      });
    }}
  />
)}



          {tab === "analytics" && (
            <AnalyticsPanel
              analytics={state.analytics}
              users={state.users}
              refresh={function () {
                setState(function (s) {
                  const newState = Object.assign({}, s);
                  const newAnalytics = s.analytics
                    ? Object.assign({}, s.analytics)
                    : {};
                  newAnalytics.lastUpdated = new Date().toISOString();
                  newState.analytics = newAnalytics;
                  return newState;
                });
              }}
            />
          )}

          {tab === "support" && (
            <SupportPanel
              tickets={state.tickets}
              setTickets={function (tickets) {
                setState(function (s) {
                  const newState = Object.assign({}, s);
                  newState.tickets = tickets;
                  return newState;
                });
              }}
            />
          )}

          {tab === "notifications" && <NotificationsPanel />}

          {tab === "account" && (
            <AccountPanel
              settings={{
                sendNotifications:
                  state.settings &&
                  typeof state.settings.sendNotifications !== "undefined"
                    ? state.settings.sendNotifications
                    : true,
                themeOption: themeOption,
              }}
              setSettings={setSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}
