# ElevenLabs API Integration Setup

This guide explains how to set up the ElevenLabs API integration for fetching call conversations.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Required: Your ElevenLabs API key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here

# Optional: Override the base URL if needed
NEXT_PUBLIC_ELEVENLABS_API_BASE_URL=https://api.elevenlabs.io/v1

# Optional: Fallback calls URL (used if ElevenLabs API fails)
NEXT_PUBLIC_CALLS_URL=api/calls.json
```

## Getting Your API Key

1. Go to [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)
2. Create a new API key or copy an existing one
3. Paste it into `.env.local` as `NEXT_PUBLIC_ELEVENLABS_API_KEY`

## How It Works

1. **Primary Source**: The dashboard fetches conversations from ElevenLabs API using `GET /v1/convai/conversations`
2. **Fallback**: If the API key is missing or the API fails, it falls back to the static `public/api/calls.json` file
3. **Polling**: The dashboard polls the ElevenLabs API every 2.5 seconds for new conversations

## API Response Mapping

The ElevenLabs API response is automatically mapped to the `CallRecord` type:

- `conversation_id` → `id`
- `metadata.start_time_unix_secs` → `time` (converted to ISO string)
- `transcript[]` → `transcript[]` (with role mapping: "user" → "customer", "assistant" → "agent")
- `metadata.call_duration_secs` → `durationSeconds`
- `status` → `status` ("done" → "completed", "processing" → "in_progress")
- Outcome is determined from transcript content using keyword matching

## Troubleshooting

- **No calls showing**: Check that your API key is correct and has access to conversations
- **API errors**: Check the browser console for detailed error messages
- **Fallback to static JSON**: If you see "falling back to static JSON" in console, the API call failed - check your API key and network connection

## Note

Since this is a static export (GitHub Pages), the API key will be exposed in the client-side bundle. This is acceptable for ElevenLabs API keys, but be aware that anyone can view your API key in the browser's developer tools. Consider using a proxy service if you need to keep the key secret.

