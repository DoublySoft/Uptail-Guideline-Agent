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
        triggers?: { hasSome: string[] };
        use_once?: boolean;
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

      if (query.triggers && query.triggers.length > 0) {
        where.triggers = {
          hasSome: query.triggers
        };
      }

      if (query.use_once !== undefined) {
        where.use_once = query.use_once;
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
}
