# Microsoft Graph mail transport

This channel sends through the official Microsoft Graph `POST /me/sendMail` API using a delegated OAuth access token.

## Required environment

```
MICROSOFT_GRAPH_ACCESS_TOKEN=...
```

The token must belong to the Microsoft account that should send the message and have delegated `Mail.Send` permission.

## Campaign shape

```json
{
  "name": "campaign-name",
  "subject": "Subject",
  "targets": ["microsoft"],
  "content": "Plain-text message",
  "recipient": "test@example.com"
}
```

For multi-recipient campaigns, call the channel once per recipient through the existing publisher rather than putting an undisclosed bulk list into a single message.

## Safety

- The channel uses JSON `body.contentType: "Text"`.
- It does not construct MIME, SMTP, MAPI or TNEF.
- A Graph `202 Accepted` means Microsoft accepted the request; it does not prove final delivery.
- Do not use this channel to bypass Microsoft's anti-spam controls. If Graph returns an outbound policy rejection, stop and investigate the account/provider status.
- The existing Ledger records DISPATCHED, EXECUTED and FAILED states around the provider call.

## Next authentication step

Register a Microsoft identity application for the Spiral engine and obtain delegated `Mail.Send` consent for the sending mailbox. Do not commit tokens, refresh tokens, client secrets or other credentials to GitHub.

