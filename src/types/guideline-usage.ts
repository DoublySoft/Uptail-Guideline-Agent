import { Guideline } from "./guideline";

export interface GuidelineUsage {
    id: string;
    sessionId: string;
    messageId: string;
    guidelineId: string;
    usedAt: Date;
    guideline?: Guideline;
}