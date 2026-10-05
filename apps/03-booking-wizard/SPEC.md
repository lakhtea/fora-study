# App 03: Booking wizard (60 minutes)

**Skill:** forms. Controlled inputs, validation on blur and on submit, error messages tied to fields, a multi-step flow with state that survives Back, a pending submit, and server-side field errors mapped back onto the form.

Run `npm run app 3`. Build `App.tsx` plus components and `api/client.ts`. Backend: `api/server.ts` (readable, not changeable). When done: `npm run accept 3`.

## Spec (from the PM)

> Three steps: who's traveling, what they're booking, review and confirm. Advisors move fast, so validate as they go and never lose what they typed. If the supplier rejects something, show it next to the field.

## Acceptance behaviors

1. Step indicator (`aria-label="Steps"`) with three entries; the current one has class `active`. Steps: Traveler, Rooms, Review.
2. Traveler step: inputs labeled `Name`, `Email`, `Phone`. Required; email must look like an email; phone must be digits, spaces, dashes, and an optional leading plus. Each error renders as text inside a `role="alert"` element that follows the field, shown after the field is blurred or after Next is clicked. "Next" (button named `Next`) is blocked while invalid.
3. Rooms step: `Check-in` and `Check-out` date inputs (check-out must be after check-in; error shown on Next), a list of rooms starting with one, each with a type select (`Room N type`) populated from `/api/room-types` and a guests number input (`Room N guests`), an `Add room` button, and `Remove room N` buttons when there is more than one. A `Special requests` textarea.
4. Back (button named `Back`) returns to the previous step with everything still filled in.
5. Review step: a summary of everything (`aria-label="Review summary"`) and a `Confirm booking` button that POSTs to `/api/bookings`, shows "Confirming" and disables while pending, then shows "Booking confirmed. Reference FORA-123456" in a `role="status"`.
6. When the server answers 422 with field errors, jump back to the step that owns the first error and render each message in that field's `role="alert"`. Try an email containing "test" or more guests than the room sleeps.
7. Labels are real `<label>` elements associated with their inputs. Keyboard-only use works.

## Narrate as you build

Say where validation lives (a pure `validate(values)` function returning `{ field: message }`), why touched-state matters for blur errors, and how server errors map onto the same structure. Mention `useActionState` and form actions as the React 19 route.

## Time budget

0-5 plan and the values shape, 5-15 traveler step with validation, 15-30 rooms step, 30-40 review and submit, 40-50 server error mapping, 50-58 accessibility pass, 58-60 recap.
