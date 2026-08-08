export interface ChatCard {
  type: "challenge" | "mentor" | "startup" | "resource";
  id: string;
  reason: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
}

export interface ChatUiMessage {
  role: "user" | "assistant";
  content: string;
  cards?: ChatCard[];
  /** Titles of the uploaded documents this answer drew on, if any. */
  sources?: string[];
  /** Suggested next questions, offered as tappable chips under the answer. */
  followUps?: string[];
  error?: boolean;
  /** False for errors where retrying now can't help (e.g. daily budget spent). */
  retryable?: boolean;
}
