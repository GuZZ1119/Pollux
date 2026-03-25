import type { UserProfile } from "@/lib/types";

// TODO: Replace with Auth0-authenticated user profile
export const mockUser: UserProfile = {
  id: "user-1",
  name: "Demo User",
  email: "demo@pollux.dev",
  defaultPersona: "professional",
  automationLevel: "DRAFT_ONLY",
};
