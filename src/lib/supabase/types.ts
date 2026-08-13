/** Hand-written to match supabase/schema.sql — there is no linked project to
 * generate these from. Keep the two in sync when the schema changes. */

export type InquiryStatus = "new" | "read" | "archived";

export type Inquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  goal: string;
  project_type: string;
  message: string | null;
  status: InquiryStatus;
  replied_at: string | null;
  reply_subject: string | null;
  reply_message: string | null;
};

export type AssistantAction = {
  kind: "route" | "link";
  label: string;
  href: string;
  external?: boolean;
};

export type AssistantEntryRow = {
  id: string;
  created_at: string;
  updated_at: string;
  position: number;
  question: string;
  chip: string;
  answer: string;
  actions: AssistantAction[];
  published: boolean;
};

export type FounderRow = {
  id: string;
  updated_at: string;
  position: number;
  name: string;
  role: string;
  image_path: string | null;
};

// postgrest-js requires every table to carry `Relationships` (even if empty)
// and the schema to carry `Views` / `Functions` — omitting them is what made
// every insert()/update() call infer as `never` instead of the real type.
export type Database = {
  public: {
    Tables: {
      inquiries: {
        Row: Inquiry;
        Insert: Omit<
          Inquiry,
          "id" | "created_at" | "status" | "replied_at" | "reply_subject" | "reply_message"
        > & {
          status?: InquiryStatus;
        };
        Update: Partial<Inquiry>;
        Relationships: [];
      };
      assistant_entries: {
        Row: AssistantEntryRow;
        Insert: Partial<AssistantEntryRow> &
          Pick<AssistantEntryRow, "question" | "chip" | "answer">;
        Update: Partial<AssistantEntryRow>;
        Relationships: [];
      };
      founders: {
        Row: FounderRow;
        Insert: Partial<FounderRow> & Pick<FounderRow, "name" | "role">;
        Update: Partial<FounderRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
