import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  senderName: string | null;
  isOwn: boolean;
  timestamp: string;
}

export function MessageBubble({
  content,
  senderName,
  isOwn,
  timestamp,
}: MessageBubbleProps) {
  return (
    <div
      className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}
    >
      {!isOwn && (
        <span className="text-xs font-medium text-text-muted">
          {senderName ?? "Unknown"}
        </span>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
          isOwn
            ? "bg-blurple text-white rounded-br-md"
            : "bg-surface text-text-primary rounded-bl-md"
        )}
      >
        {content}
      </div>
      <span className="text-[10px] text-text-muted">
        {new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
