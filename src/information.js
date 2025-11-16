//information 
export const ROLES = [
  { key: "owner", label: "Owner" },
  { key: "manager", label: "Manager" },
  { key: "advisor", label: "Advisor" }
];

export const STATUS = [
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "suspended", label: "Suspended" },
];

export const labelOf = (arr, key) => arr.find((x) => x.key === key)?.label ?? key;
export const uid = () => Math.random().toString(36).slice(2, 10);
export const nowISO = () => new Date().toISOString();
export const isValidEmail = (e) => /\S+@\S+\.\S+/.test(e);

const STORAGE_KEY = "pm_state_v1";

export const defaultState = {
  users: [
    { id: uid(), name: "Maryam Sami", email: "maryam@example.com", role: "owner",   status: "active",    createdAt: nowISO() },
    { id: uid(), name: "Norah Fraih",  email: "norah@example.com",  role: "advisor", status: "active",    createdAt: nowISO() },
  ],
  tickets: [
    {
      id: uid(),
      subject: "Cannot export report",
      fromEmail: "client@example.com",
      status: "open",
      messages: [{ id: uid(), sender: "user", text: "Export button doesn’t work", at: nowISO() }],
    },
  ],
  analytics: {
    lastUpdated: nowISO(),
    simulations: { breakeven: 15, pricing: 9, cashflow: 6 },
  },
  settings: {
    theme: "light",
    currency: "USD",
    defaultMarginPct: 15,
    manager: { name: "Haseeb", email: "haseeb@example.com", phone: "+966" },
    notifications: { emailAlerts: true, ticketBadge: true, push: false },
  },
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
}
export function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}


export function roleBadgeClass(role) {
  switch (role) {
    case "owner":    return "badge rounded-pill text-bg-secondary";
    case "manager":  return "badge rounded-pill text-bg-info";
    case "advisor":  return "badge rounded-pill text-bg-primary";
    case "viewer":   return "badge rounded-pill text-bg-light text-dark";
    default:         return "badge rounded-pill text-bg-light text-dark";
  }
}
export function statusBadgeClass(status) {
  switch (status) {
    case "active":     return "badge rounded-pill text-bg-dark";
    case "inactive":   return "badge rounded-pill text-bg-secondary";
    case "suspended":  return "badge rounded-pill text-bg-danger";
    default:           return "badge rounded-pill text-bg-secondary";
  }
}
export function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export const analyticsData = {
  users: 52,
  activeUsers: 39,
  simulationsRun: {
    breakeven: 14,
    pricing: 8,
    cashflow: 17,
  },
  activityByMonth: [
    { month: "Jan", users: 12 },
    { month: "Feb", users: 19 },
    { month: "Mar", users: 9 },
  ],
};
