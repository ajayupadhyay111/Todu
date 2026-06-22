# Feature Spec 02: Voice-to-Text Task Description (Gemini)

## Goal
Let users dictate a task's description by voice. The audio is transcribed AND
organized into clean, structured text by Google Gemini, then placed in the
editable description field — so messy spoken input becomes a tidy description.

## Design Decisions
* **Server-side only**: Gemini is called from a Convex action (`convex/voice.ts`). The `GEMINI_API_KEY` never ships to the app.
* Voice is an *enhancement* — typing the description always works. Voice needs connectivity.
* The model returns text the user reviews/edits before saving. Never auto-save the raw transcript.
* Keep audio transient — do not persist raw recordings unless a clear need appears.

## Flow
1. User taps the mic next to the description field (in QuickAdd or Task Detail).
2. App records audio (expo-av / expo-audio) with a clear recording indicator.
3. On stop, app sends the audio to the Convex action `voice.transcribe`.
4. Action calls Gemini: "Transcribe this audio and rewrite it as a clear, concise task description. Keep it factual; do not invent details." Returns organized text.
5. App fills the description field with the result (state: transcribing → filled, editable).
6. User edits if needed and saves the task (normal `createTask`/`updateTask`).

## Implementation Details
1. **Prerequisite**: read agents.md + all /context files; confirm architecture.md "Voice-to-Text (Gemini)" section.
2. **Permissions**: request microphone permission on first use; handle denial with a friendly message + link to settings.
3. **Recording**: `expo-av`/`expo-audio`; cap duration (e.g. 60s); show waveform/timer.
4. **Convex action** (`convex/voice.ts`):
   * `action` (not mutation/query) since it hits an external API.
   * Verify `ctx.auth.getUserIdentity()` — reject anonymous.
   * Read `GEMINI_API_KEY` from Convex env; call Gemini with audio + the organizing prompt.
   * Rate-limit per user (cost/abuse guard); return `{ text }` or a typed error.
5. **Client hook** (`hooks/useVoiceToText.ts`): manages states idle → recording → transcribing → done/error; returns the organized text.
6. **UI**: `VoiceInputButton` (see ui-context) wired into QuickAdd + Task Detail description field.

## Error & Edge Cases
* Offline → disable mic, show "Voice needs a connection — type instead."
* Permission denied → explain + offer settings; typing still works.
* Gemini timeout/quota → "Couldn't transcribe — try again or type it."
* Empty/garbled audio → return empty, keep field untouched, show a gentle hint.

## Security
* Key only in Convex env; never in the app bundle or git.
* Action authenticated; rate-limited; args validated with `convex/values`.

## Verification Checklist
- [ ] Mic permission flow works on Android (grant + deny paths)
- [ ] Recording → transcription returns organized text in the field
- [ ] Text is editable before save; raw transcript never auto-saved
- [ ] Gemini key is NOT present anywhere in the client bundle
- [ ] Offline / denied / timeout all degrade gracefully to typing
- [ ] Action rejects unauthenticated calls and is rate-limited
- [ ] progress-tracker.md updated after completion
