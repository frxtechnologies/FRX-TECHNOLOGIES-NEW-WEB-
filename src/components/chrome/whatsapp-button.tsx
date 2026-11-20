/**
 * Floating WhatsApp button. The number is editable in admin → Settings (default
 * Pakistan WhatsApp 923004703005). It sits above the Quick Assistant button, is
 * a real link (works without JavaScript), and on hover the label slides out and
 * the glyph tilts. Touch targets are 56px.
 */
export function WhatsAppButton({ number }: { number: string }) {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return (
    <a
      className="fxwa"
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with FRX Technologies on WhatsApp (opens in a new tab)"
    >
      <span className="fxwa-label" aria-hidden="true">
        Chat on WhatsApp
      </span>
      <span className="fxwa-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4C9.4 4 4 9.3 4 15.8c0 2.3.7 4.5 1.9 6.3L4.4 28l6.1-1.6c1.7.9 3.6 1.4 5.5 1.4 6.6 0 12-5.3 12-11.8S22.6 4 16 4Z" />
          <path d="M12 11.5c.4-.8 1-.9 1.5-.9.3 0 .5 0 .7.5l.9 2c.1.3 0 .6-.2.8l-.7.8c.9 1.7 2.2 2.9 3.9 3.8l.8-.9c.2-.2.5-.3.8-.2l2 1c.4.2.5.4.4.8-.2 1.1-1.4 1.8-2.4 1.7-3.8-.4-7.4-4.1-7.7-7.9 0-.6.1-1.1.2-1.5Z" fill="currentColor" stroke="none" />
        </svg>
      </span>
    </a>
  );
}
