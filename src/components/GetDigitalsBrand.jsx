/**
 * GetDigitalsBrand — the parent-brand mark. Shown small and consistent
 * across the app (never louder than the "Topper" product identity) so
 * the app is always traceable back to GetDigitals.in.
 */
export function BrandBadge({ size = 'sm' }) {
  const dims = size === 'sm' ? 18 : 24;
  return (
    <div className="flex items-center gap-1.5">
      <svg width={dims} height={dims} viewBox="0 0 40 40">
        <rect width="40" height="40" rx="9" fill="#0B0E14" />
        <path d="M20 9 L31.5 31 H8.5 Z" fill="none" stroke="#E8650A" strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="20" cy="24" r="2.2" fill="#FFC93C" />
      </svg>
      <span className="text-[11px] font-display font-semibold text-[var(--color-muted)] tracking-wide">
        Get<span className="text-[var(--color-saffron)]">Digitals</span>
      </span>
    </div>
  );
}

export function BrandFooter() {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <BrandBadge />
      <p className="text-[10px] text-[var(--color-muted-2)] text-center">
        A GetDigitals.in product · digital learning tools for Indian students
      </p>
      <a
        href="https://wa.me/916375351903"
        target="_blank"
        rel="noreferrer"
        className="text-[11px] text-[var(--color-success)] font-medium mt-1"
      >
        💬 Chat with us on WhatsApp
      </a>
    </div>
  );
}
