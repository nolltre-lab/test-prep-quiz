import { io } from "socket.io-client";

// BASE_URL is "/" locally and "/test-prep-quiz/" on Lightsail (set by Vite base config).
// Strip trailing slash to use as URL prefix for API calls.
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export const socket = io(window.location.origin, {
  path: `${basePath}/socket.io/`,
  autoConnect: true,
});
export const serverURL = basePath;