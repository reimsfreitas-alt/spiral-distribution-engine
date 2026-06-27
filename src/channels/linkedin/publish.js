"use strict";

const axios = require("axios");

const UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";

/**
 * Publish a text share via the proven UGC Posts endpoint.
 * Returns { urn, status, data }. (Endpoint/headers kept exactly as validated: HTTP 201.)
 */
async function publishText({ accessToken, author, text }) {
    if (!accessToken) {
        throw new Error("accessToken ausente.");
    }
    if (!author) {
        throw new Error("author (URN) ausente.");
    }
    if (!text || !text.trim()) {
        throw new Error("Texto vazio.");
    }

    const payload = {
        author,
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text },
                shareMediaCategory: "NONE"
            }
        },
        visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    };

    const response = await axios.post(UGC_POSTS_URL, payload, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }
    });

    const urn =
        (response.data && response.data.id) ||
        response.headers["x-restli-id"] ||
        null;

    return { urn, status: response.status, data: response.data };
}

module.exports = {
    publishText
};
