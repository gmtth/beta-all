type LoadingSpinnerProps = {
  label: string;
  compact?: boolean;
};

export default function LoadingSpinner({ label, compact = false }: LoadingSpinnerProps) {
  return <span className={compact ? "loading-indicator loading-indicator-compact" : "loading-indicator"} role="status">
    <span className="loading-spinner" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>;
}
