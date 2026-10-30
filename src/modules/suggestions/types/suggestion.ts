export type SuggestionType =
  | "IMPROVEMENT"
  | "FEATURE"
  | "BUG"
  | "OTHER";

export type CreateSuggestionPayload = {
  company: string;
  branch: string | null;
  suggestion_type: SuggestionType;
  title: string;
  description: string;
};

export type SuggestionResponse = {
  id: string;
  company: string;
  branch: string | null;
  suggestion_type: SuggestionType;
  title: string;
  description: string;
  created_at: string;
};