/**
 * FullPageSpinner — a branded, accessible loading indicator.
 *
 * Use this whenever the entire viewport should be blocked by a spinner
 * (e.g., session precheck, protected-route gate).  The spinner is hidden
 * from the accessibility tree and the visible message is announced to
 * assistive technologies via `role="status"` + `aria-live="polite"`.
 */

interface FullPageSpinnerProps {
  /** Text shown below the spinner. Defaults to "Loading…". */
  message?: string;
}

export default function FullPageSpinner({ message = 'Loading…' }: FullPageSpinnerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
        <div
          aria-hidden="true"
          className="border-primary-600 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
        />
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
