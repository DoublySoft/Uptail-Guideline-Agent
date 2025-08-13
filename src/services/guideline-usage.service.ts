import { PrismaClient, GuidelineUsage } from '@prisma/client';

export class GuidelineUsageService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all guideline usages for a session
   */
  async getBySessionId(sessionId: string): Promise<GuidelineUsage[]> {
    try {
      return await this.prisma.guidelineUsage.findMany({
        where: { sessionId },
        orderBy: { usedAt: 'desc' },
        include: {
          guideline: true,
          message: true
        }
      });
    } catch (error) {
      console.error('Error fetching guideline usages by session ID:', error);
      throw new Error('Failed to fetch guideline usages');
    }
  }

  /**
   * Get all guideline usages for a message
   */
  async getByMessageId(messageId: string): Promise<GuidelineUsage[]> {
    try {
      return await this.prisma.guidelineUsage.findMany({
        where: { messageId },
        orderBy: { usedAt: 'desc' },
        include: {
          guideline: true
        }
      });
    } catch (error) {
      console.error('Error fetching guideline usages by message ID:', error);
      throw new Error('Failed to fetch guideline usages');
    }
  }

  /**
   * Get guideline usage by ID
   */
  async getById(id: string): Promise<GuidelineUsage | null> {
    try {
      return await this.prisma.guidelineUsage.findUnique({
        where: { id },
        include: {
          guideline: true,
          message: true,
          session: true
        }
      });
    } catch (error) {
      console.error('Error fetching guideline usage by ID:', error);
      throw new Error('Failed to fetch guideline usage');
    }
  }

  /**
   * Create a new guideline usage
   */
  async create(usageData: Omit<GuidelineUsage, 'id' | 'usedAt'>): Promise<GuidelineUsage> {
    try {
      return await this.prisma.guidelineUsage.create({
        data: usageData
      });
    } catch (error) {
      console.error('Error creating guideline usage:', error);
      throw new Error('Failed to create guideline usage');
    }
  }
}
