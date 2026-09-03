"use strict";

/**
 * Microsoft Graph mail channel.
 *
 * Deliberately uses Graph JSON sendMail, not SMTP/MAPI/TNEF.
 * Authentication is delegated OAuth; supply a valid access token or
 * integrate the OAuth bootstrap before production use.
 */

const axios = require("axios");

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || "369ddd9a-7f5e-471a-8984-649b0ea03cd2";
const MICROSOFT_AUTHORITY = "https://login.microsoftonline.com/common";
const MICROSOFT_SCOPE = "offline_access Mail.Send";

function getOAuthConfig() {
  return { clientId: MICROSOFT_CLIENT_ID, authority: MICROSOFT_AUTHORITY, scope: MICROSOFT_SCOPE };
}

const GRAPH_SENDMAIL_URL = "https://graph.microsoft.com/v1.0/me/sendMail";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function send({ campaign, payload }) {
  const accessToken = required("MICROSOFT_GRAPH_ACCESS_TOKEN");
  const to = payload?.to || campaign?.to || campaign?.recipient;

  if (!to) {
    throw new Error("Microsoft Graph channel requires payload.to, campaign.to, or campaign.recipient");
  }

  const subject = campaign?.subject || process.env.DEFAULT_EMAIL_SUBJECT || "Spiral";
  const text = String(payload?.text ?? campaign?.content ?? "");

  if (!text.trim()) throw new Error("Email body is empty");

  const response = await axios.post(
    GRAPH_SENDMAIL_URL,
    {
      message: {
        subject,
        body: {
          contentType: "Text",
          content: text
        },
        toRecipients: [{ emailAddress: { address: to } }]
      },
      saveToSentItems: true
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      timeout: 30000,
      validateStatus: () => true
    }
  );

  if (response.status !== 202) {
    const detail = typeof response.data === "string"
      ? response.data
      : JSON.stringify(response.data);
    throw new Error(`Microsoft Graph sendMail failed (${response.status}): ${detail}`);
  }

  return {
    status: "accepted",
    network: "microsoft-graph",
    endpoint: GRAPH_SENDMAIL_URL
  };
}

module.exports = { send, getOAuthConfig };
