export type ContentType = "article" | "tweet" | "youtube" | "pdf" | "text";

export interface ContentItem {
  _id: string;
  title: string;
  link: string;
  type: ContentType;
  tags: string[];
  status: string;
  embeddingStatus: string;
  createdAt: string;
  chunkCount?: number;
}

export interface SharedBrain {
  username: string;
  content: ContentItem[];
}

export interface ChatSource {
  title: string;
  link?: string;
  type?: string;
  relevance?: string;
  excerpt?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  loading?: boolean;
}

export const TYPE_LABELS: Record<string, string> = {
  article: "ARTICLE",
  tweet: "TWEET",
  youtube: "VIDEO",
  pdf: "PDF",
  text: "NOTE",
};

export const TYPE_ICONS: Record<string, string> = {
  article: "◎",
  tweet: "↗",
  youtube: "▶",
  pdf: "▤",
  text: "≡",
};

