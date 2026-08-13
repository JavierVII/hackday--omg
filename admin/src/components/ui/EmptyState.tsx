import { Inbox } from "lucide-react";
export function EmptyState({ title = "暂无内容", description = "相关内容将在这里展示" }: { title?: string; description?: string }) {
  return <div className="empty-state"><Inbox/><strong>{title}</strong><span>{description}</span></div>;
}
