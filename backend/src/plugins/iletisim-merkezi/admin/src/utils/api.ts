/**
 * API client for iletisim-merkezi plugin endpoints.
 *
 * Uses the Strapi admin's fetch client to make authenticated requests
 * to the plugin's admin routes.
 */

import { getFetchClient } from '@strapi/strapi/admin';

const ADMIN_BASE = '/iletisim-merkezi';

async function request(path: string) {
  const url = `${ADMIN_BASE}${path}`;
  const { get } = getFetchClient();
  const { data } = await get(url);

  return data;
}

async function postRequest(path: string, body?: unknown) {
  const url = `${ADMIN_BASE}${path}`;
  const { post } = getFetchClient();
  const { data } = await post(url, body);

  return data;
}

async function putRequest(path: string, body?: unknown) {
  const url = `${ADMIN_BASE}${path}`;
  const { put } = getFetchClient();
  const { data } = await put(url, body);

  return data;
}

export function sendManualEmail(
  documentId: string,
  payload: {
    subject: string;
    htmlBody: string;
    statuses?: string[];
  }
) {
  return postRequest(`/events/${documentId}/send-manual-email`, payload);
}

export function sendTestEmail(
  documentId: string,
  payload: {
    subject: string;
    htmlBody: string;
  }
) {
  return postRequest(`/events/${documentId}/send-test-email`, payload);
}

export function getConfirmationTemplate() {
  return request('/confirmation-template');
}

export function updateConfirmationTemplate(htmlBody: string, enabled?: boolean) {
  return putRequest('/confirmation-template', { htmlBody, enabled });
}

export function resetConfirmationTemplate() {
  return postRequest('/confirmation-template/reset');
}
