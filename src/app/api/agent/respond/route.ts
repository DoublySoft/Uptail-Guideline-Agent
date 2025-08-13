import { NextRequest, NextResponse } from 'next/server';
import { createSalesAgent } from '../../../../agents/sales';
import { AgentContext } from '../../../../types/agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Create the agent context
    const context: AgentContext = {
      sessionId: sessionId || '',
      message: message.trim()
    };

    // Create and execute the sales agent
    const salesAgent = createSalesAgent();
    const response = await salesAgent.execute(context);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Agent API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Sales Agent API',
      endpoint: '/api/agent/respond',
      method: 'POST',
      body: {
        message: 'string (required)',
        sessionId: 'string (optional)'
      }
    }
  );
}
