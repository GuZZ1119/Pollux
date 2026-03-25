import type { StyleExample, Provider } from "@/lib/types";

// TODO: In the future, this adapter will pull real sent messages
// from Gmail/Slack to learn the user's writing style.
export interface StyleSourceAdapter {
  fetchExamples(provider: Provider, limit: number): Promise<StyleExample[]>;
}

export class MockStyleSourceAdapter implements StyleSourceAdapter {
  async fetchExamples(provider: Provider, limit: number): Promise<StyleExample[]> {
    return [
      {
        id: "ex-1",
        persona: "professional",
        sourceProvider: provider,
        text: "Thanks for the update. I'll review the documents and circle back by EOD tomorrow.",
      },
      {
        id: "ex-2",
        persona: "professional",
        sourceProvider: provider,
        text: "Great call today — I've summarized the action items in the shared doc. Let me know if anything's missing.",
      },
    ].slice(0, limit);
  }
}
