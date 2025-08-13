import { NextRequest, NextResponse } from 'next/server';
import { MessagesService } from '@/services/messages.service';

const messagesService = new MessagesService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    
    const messages = await messagesService.getBySessionId(sessionId);
    
    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length,
      message: 'Messages retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { role, content } = body;

    // Validate required fields
    if (!role || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: role and content are required' 
        },
        { status: 400 }
      );
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid role: must be either "user" or "assistant"' 
        },
        { status: 400 }
      );
    }

    const message = await messagesService.create({
      sessionId,
      role,
      content
    });

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
