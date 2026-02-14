export interface RequestItem {
  id: string;
  title: string;
  description: string;
  ai_summary: string;
  status: string;
  created_at: string;
  requester?: {
    id: string;
    email: string;
    name: string | null;
    role: { name: string };
    sector: { name: string };
  };
}
