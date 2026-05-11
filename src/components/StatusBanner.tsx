interface StatusBannerProps {
  tone: "neutral" | "error" | "success";
  message: string;
}

export default function StatusBanner({ tone, message }: StatusBannerProps) {
  return <div className={`status-banner status-${tone}`}>{message}</div>;
}
