"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseConfig } from "./config";

/**
 * Supabase client for the browser. Used by the login form and the image
 * uploader (uploads go straight from the browser to Storage, so a large
 * photograph never travels through a serverless function).
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!cached) {
    const { url, anonKey } = requireSupabaseConfig();
    cached = createBrowserClient(url, anonKey);
  }
  return cached;
}
