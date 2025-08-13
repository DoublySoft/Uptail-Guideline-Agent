import { NextRequest, NextResponse } from 'next/server';
import { GuidelineUsageService } from '@/services/guideline-usage.service';

const guidelineUsageService = new GuidelineUsageService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    
    const guidelineUsages = await guidelineUsageService.getBySessionId(sessionId);
    
    return NextResponse.json({
      success: true,
      data: guidelineUsages,
      count: guidelineUsages.length,
      message: 'Guideline usages retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching guideline usages:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
