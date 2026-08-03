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
  error?: boolean;
}
