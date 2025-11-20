"use client";

type AuthCookieData = {
  value: string;
  expires: string;
};

type AuthStorage = {
  "better-auth.state"?: AuthCookieData;
  "better-auth.session_token"?: AuthCookieData;
  "better-auth.convex_jwt"?: AuthCookieData;
};

function setCookie(name: string, value: string, expires?: string): void {
  if (typeof document === "undefined") return;

  let cookieString = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;

  if (expires) {
    const expiresDate = new Date(expires);
    cookieString += `; expires=${expiresDate.toUTCString()}`;
  }

  document.cookie = cookieString;
}

function removeCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
}

export function syncAuthCookiesFromLocalStorage(): void {
  if (typeof window === "undefined") return;

  try {
    const storageData = localStorage.getItem("better-auth_cookie");
    if (!storageData) return;

    const authData: AuthStorage = JSON.parse(storageData);

    if (authData["better-auth.state"]?.value) {
      setCookie(
        "better-auth.state",
        authData["better-auth.state"].value,
        authData["better-auth.state"].expires
      );
    }

    if (authData["better-auth.session_token"]?.value) {
      setCookie(
        "better-auth.session_token",
        authData["better-auth.session_token"].value,
        authData["better-auth.session_token"].expires
      );
    }

    if (authData["better-auth.convex_jwt"]?.value) {
      setCookie(
        "better-auth.convex_jwt",
        authData["better-auth.convex_jwt"].value,
        authData["better-auth.convex_jwt"].expires
      );
    }
  } catch (error) {
    console.error("Failed to sync auth cookies from localStorage:", error);
  }
}

export function removeAuthCookies(): void {
  removeCookie("better-auth.state");
  removeCookie("better-auth.session_token");
  removeCookie("better-auth.convex_jwt");
}

export function removeAuthCookie(
  name: "state" | "session_token" | "convex_jwt"
): void {
  removeCookie(`better-auth.${name}`);
}

export default function SyncAuthCookies() {
  if (typeof window === "undefined") return null;

  syncAuthCookiesFromLocalStorage();

  return null;
}
