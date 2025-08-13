import { NextResponse } from 'next/server';
import { SessionsService } from '@/services/sessions.service';

const sessionsService = new SessionsService();

export async function GET(request: Request) {
  try {    
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get('stats');
    
    if (stats === 'true') {
      // Get session statistics
      const statistics = await sessionsService.getStatistics();
      
      return NextResponse.json({
        success: true,
        data: statistics,
        message: 'Session statistics retrieved successfully'
      });
    }
    
    // Get all sessions
    const sessions = await sessionsService.getAll();
    
    return NextResponse.json({
      success: true,
      data: sessions,
      count: sessions.length,
      message: 'All sessions retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await sessionsService.create();

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Session created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Check if this is a bulk delete request
    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.json();
        
        if (body.ids && Array.isArray(body.ids)) {
          // Bulk delete multiple sessions
          const result = await sessionsService.deleteMany(body.ids);
          
          return NextResponse.json({
            success: true,
            data: result,
            message: `Successfully deleted ${result.count} sessions with all related messages and guideline usages`
          });
        }
      } catch{
        // If JSON parsing fails, continue with single delete
      }
    }
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session ID is required' 
        },
        { status: 400 }
      );
    }

    // Delete the session (cascade deletion will handle messages and guideline usages)
    const deletedSession = await sessionsService.delete(id);

    return NextResponse.json({
      success: true,
      data: deletedSession,
      message: 'Session deleted successfully with all related messages and guideline usages'
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Session not found' 
          },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
