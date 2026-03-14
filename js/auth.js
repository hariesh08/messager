// ================================================
// auth.js
// Handles login, signup, logout, and session checks
// ================================================

import { supabaseClient } from './supabase-client.js';

/**
 * Sign in an existing user with email + password.
 * @returns {{ data, error }}
 */
export async function loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password,
    });
    return { data, error };
}

/**
 * Create a new user account.
 * @returns {{ data, error }}
 */
export async function signupUser(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim(),
        password,
    });
    return { data, error };
}

/**
 * Sign out the current user and redirect to login page.
 */
export async function logoutUser() {
    await supabaseClient.auth.signOut();
    window.location.href = '/login.html';
}

/**
 * Get the current session. Returns null if not logged in.
 * @returns {Promise<Session|null>}
 */
export async function getSession() {
    const { data } = await supabaseClient.auth.getSession();
    return data?.session ?? null;
}

/**
 * Guard: redirect to login if no active session.
 * Call this at the top of protected pages.
 * @returns {Promise<Session>}
 */
export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        window.location.href = '/login.html';
        throw new Error('Unauthenticated');
    }
    return session;
}
