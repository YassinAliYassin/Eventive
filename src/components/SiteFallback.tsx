import type { FallbackProps } from "react-error-boundary";

/**
 * Shown only if the app fails to render. It stays deliberately plain — no data,
 * no hooks — and leads with the contact details, because a visitor who hits this
 * still needs a way to reach the business.
 */
export function SiteFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 font-sans">
      <div className="glass w-full max-w-[460px] rounded-hero p-10 text-center">
        <div className="font-serif text-2xl italic text-paper">Eventive</div>
        <span aria-hidden="true" className="mx-auto my-5 block h-px w-10 bg-clay/40" />
        <h1 className="mb-3 font-serif text-[26px] text-balance text-paper">
          This page didn&apos;t load properly.
        </h1>
        <p className="mb-7 text-[14px] text-pretty text-ink">
          Sorry — something went wrong on our side. Our Harare team is reachable directly in the
          meantime.
        </p>
        <div className="flex flex-col gap-2 font-mono text-[11px] tracking-[0.05em] text-ink">
          <a href="mailto:events@eventive.co.zw" className="text-azure hover:text-azure-bright">
            events@eventive.co.zw
          </a>
          <span>Harare, Zimbabwe</span>
        </div>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="mt-7 cursor-pointer rounded-full bg-azure px-6 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-white transition-colors hover:bg-azure-bright"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
