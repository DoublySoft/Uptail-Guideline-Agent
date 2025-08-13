import { PrismaClient, Message } from '@prisma/client';

export class MessagesService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all messages for a session
   */
  async getBySessionId(sessionId: string): Promise<Message[]> {
    try {
      return await this.prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        include: {
          guidelineUsages: {
            include: {
              guideline: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching messages by session ID:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  /**
   * Create a new message
   */
  async create(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    try {
      return await this.prisma.message.create({
        data: messageData
      });
    } catch (error) {
      console.error('Error creating message:', error);
      throw new Error('Failed to create message');
    }
  }

  /**
   * Get recent messages for a session
   */
  async getRecentMessages(sessionId: string, limit: number = 10): Promise<Message[]> {
    try {
      return await this.prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      throw new Error('Failed to fetch recent messages');
    }
  }
}
