// src/data/http.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HttpOptions = Omit<RequestInit, "headers" | "body"> & {
  headers?: Record<string, string>;
};

const BASE_URL = "http://192.168.0.3:8000/api";

function joinUrl(base: string, path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function request<T>(path: string, options: HttpOptions & { body?: any } = {}): Promise<T> {
  const url = joinUrl(BASE_URL, path);

  const token = await AsyncStorage.getItem("token");

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg = (data && (data.error || data.detail)) || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export const http = {
  get<T>(path: string, options?: HttpOptions) {
    return request<T>(path, { ...(options ?? {}), method: "GET" });
  },
  post<T>(path: string, body: any, options?: HttpOptions) {
    return request<T>(path, { ...(options ?? {}), method: "POST", body });
  },
  put<T>(path: string, body: any, options?: HttpOptions) {
    return request<T>(path, { ...(options ?? {}), method: "PUT", body });
  },
  patch<T>(path: string, body: any, options?: HttpOptions) {
    return request<T>(path, { ...(options ?? {}), method: "PATCH", body });
  },
  delete<T>(path: string, options?: HttpOptions) {
    return request<T>(path, { ...(options ?? {}), method: "DELETE" });
  },
};
