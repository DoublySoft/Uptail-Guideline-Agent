import { PrismaClient, Session } from '@prisma/client';

export class SessionsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all sessions
   */
  async getAll(): Promise<Session[]> {
    try {
      return await this.prisma.session.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: {
              messages: true,
              guidelineUsages: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch sessions');
    }
  }

  /**
   * Get session by ID
   */
  async getById(id: string): Promise<Session | null> {
    try {
      return await this.prisma.session.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error('Error fetching session by ID:', error);
      throw new Error('Failed to fetch session');
    }
  }

  /**
   * Create a new session
   */
  async create(): Promise<Session> {
    try {
      return await this.prisma.session.create({
        data: {}
      });
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Update session summary
   */
  async updateSummary(id: string, summary: string): Promise<Session> {
    try {
      return await this.prisma.session.update({
        where: { id },
        data: { summary }
      });
    } catch (error) {
      console.error('Error updating session summary:', error);
      throw new Error('Failed to update session summary');
    }
  }

  /**
   * Delete a session
   */
  async delete(id: string): Promise<Session> {
    try {
      return await this.prisma.session.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  }

  /**
   * Delete multiple sessions by IDs
   */
  async deleteMany(ids: string[]): Promise<{ count: number }> {
    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });
      
      return { count: result.count };
    } catch (error) {
      console.error('Error deleting multiple sessions:', error);
      throw new Error('Failed to delete sessions');
    }
  }

  /**
   * Get session statistics
   */
  async getStatistics(): Promise<{
    totalSessions: number;
    totalMessages: number;
    totalGuidelineUsages: number;
    sessionsByDate: { date: string; count: number }[];
  }> {
    try {
      const [
        totalSessions,
        totalMessages,
        totalGuidelineUsages,
        sessionsByDate
      ] = await Promise.all([
        this.prisma.session.count(),
        this.prisma.message.count(),
        this.prisma.guidelineUsage.count(),
        this.prisma.session.groupBy({
          by: ['createdAt'],
          _count: true,
          orderBy: {
            createdAt: 'desc'
          },
          take: 30 // Last 30 days
        })
      ]);

      return {
        totalSessions,
        totalMessages,
        totalGuidelineUsages,
        sessionsByDate: sessionsByDate.map(item => ({
          date: item.createdAt.toISOString().split('T')[0],
          count: item._count
        }))
      };
    } catch (error) {
      console.error('Error fetching session statistics:', error);
      throw new Error('Failed to fetch session statistics');
    }
  }
}
