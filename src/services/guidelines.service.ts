import { PrismaClient, Guideline, GuidelineStrength } from '@prisma/client';
import { GuidelineQuery } from '../types/guideline';

export class GuidelinesService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all guidelines
   */
  async getAll(): Promise<Guideline[]> {
    try {
      return await this.prisma.guideline.findMany({
        orderBy: { priority: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching guidelines:', error);
      throw new Error('Failed to fetch guidelines');
    }
  }

  /**
   * Get guidelines by ID
   */
  async getById(id: string): Promise<Guideline | null> {
    try {
      return await this.prisma.guideline.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error('Error fetching guideline by ID:', error);
      throw new Error('Failed to fetch guideline');
    }
  }

  /**
   * Search guidelines with multiple criteria
   */
  async search(query: GuidelineQuery): Promise<Guideline[]> {
    try {
      const where: {
        strength?: GuidelineStrength;
        priority?: { gte?: number; lte?: number };
        active?: boolean;
        singleUse?: boolean;
      } = {};

      if (query.strength) {
        where.strength = query.strength;
      }

      if (query.priority_min || query.priority_max) {
        where.priority = {
          ...where.priority,
          ...(query.priority_min && { gte: query.priority_min }),
          ...(query.priority_max && { lte: query.priority_max })
        };
      }

      if (query.active !== undefined) {
        where.active = query.active;
      }

      if (query.singleUse !== undefined) {
        where.singleUse = query.singleUse;
      }

      const guidelines = await this.prisma.guideline.findMany({
        where,
        orderBy: { priority: 'desc' },
        take: query.limit || undefined
      });

      return guidelines;
    } catch (error) {
      console.error('Error searching guidelines:', error);
      throw new Error('Failed to search guidelines');
    }
  }

  /**
   * Get guidelines that haven't been used in a session
   */
  async getUnusedInSession(sessionId: string, strength: GuidelineStrength): Promise<Guideline[]> {
    try {
      const usedGuidelineIds = await this.prisma.guidelineUsage.findMany({
        where: { sessionId },
        select: { guidelineId: true }
      });

      const usedIds = usedGuidelineIds.map(usage => usage.guidelineId);

      return await this.prisma.guideline.findMany({
        where: {
          strength,
          active: true,
          id: { notIn: usedIds }
        },
        orderBy: { priority: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching unused guidelines in session:', error);
      throw new Error('Failed to fetch unused guidelines');
    }
  }

  /**
   * Evaluate if a guideline applies based on triggers
   */
  evaluateTriggers(guideline: Guideline, message: string): boolean {
    try {
      // If no triggers, always apply
      if (!guideline.triggers || guideline.triggers.length === 0) {
        return true;
      }

      // Check if message contains any of the trigger words
      const messageLower = message.toLowerCase();
      return guideline.triggers.some(trigger => 
        messageLower.includes(trigger.toLowerCase())
      );
    } catch (error) {
      console.error('Error evaluating guideline triggers:', error);
      return false;
    }
  }

  /**
   * Get applicable guidelines for a given context
   */
  async getApplicableGuidelines(
    sessionId: string,
    message: string,
    hardCount: number = 2,
    softCount: number = 2
  ): Promise<{ hard: Guideline[]; soft: Guideline[] }> {
    try {
      // Get unused guidelines by strength
      const [unusedHard, unusedSoft] = await Promise.all([
        this.getUnusedInSession(sessionId, 'hard'),
        this.getUnusedInSession(sessionId, 'soft')
      ]);

      // Filter by trigger evaluation
      const applicableHard = unusedHard
        .filter(guideline => this.evaluateTriggers(guideline, message))
        .slice(0, hardCount);

      const applicableSoft = unusedSoft
        .filter(guideline => this.evaluateTriggers(guideline, message))
        .slice(0, softCount);

      return {
        hard: applicableHard,
        soft: applicableSoft
      };
    } catch (error) {
      console.error('Error getting applicable guidelines:', error);
      throw new Error('Failed to get applicable guidelines');
    }
  }
}
