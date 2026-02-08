export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const STATUS_OPTIONS = [
  { value: "all", label: "All Tasks" },
  { value: "completed", label: "Completed" },
  { value: "incomplete", label: "Incomplete" },
];

export const PAGE_SIZES = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
];

export const DEFAULT_PAGE_SIZE = 10;

export const DATE_FORMATS = {
  SHORT: "MM/dd/yyyy",
  LONG: "MMMM d, yyyy",
  DATETIME: "MM/dd/yyyy hh:mm a",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  TASKS: "/tasks",
  NEW_TASK: "/tasks/new",
  TASK_DETAIL: "/tasks/[id]",
  PROFILE: "/profile",
};