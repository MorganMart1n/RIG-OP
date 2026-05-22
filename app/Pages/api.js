/**
 * api.js  –  Central fetch wrapper for Rig-Op
 *
 * Usage:
 *   import { apiGet, apiPost, apiPatch, saveToken, clearToken } from './api';
 *
 *   // After login:
 *   await saveToken(data.token);
 *
 *   // Any authenticated request:
 *   const data = await apiPost('/profile');
 *   const data = await apiGet('/reports/list');
 *   const data = await apiPatch(`/support/${id}/status`, { status: 'Resolved' });
 *
 *   // On logout:
 *   await clearToken();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const BASE_URL = 'http://192.168.4.74:8082';

// ── Token helpers ─────────────────────────────────────────────────────────
const TOKEN_KEY = '@rig_op_token';

export const saveToken  = (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken   = ()      => AsyncStorage.getItem(TOKEN_KEY);
export const clearToken = ()      => AsyncStorage.removeItem(TOKEN_KEY);

// ── Core fetch wrapper ────────────────────────────────────────────────────
async function request(method, path, body = null) {
  const token = await getToken();

  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    const cleanToken = token
      .replace(/^Bearer\s+/i, '')
      .replace(/"/g, '')
      .trim();

    if (cleanToken && cleanToken.split('.').length === 3) {
      headers['Authorization'] = `Bearer ${cleanToken}`;
    }
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res  = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data   = data;
    throw err;
  }

  return data;
}

// ── Convenience methods ───────────────────────────────────────────────────
export const apiGet   = (path)              => request('GET',   path);
export const apiPost  = (path, body = null) => request('POST',  path, body);
export const apiPatch = (path, body)        => request('PATCH', path, body);
