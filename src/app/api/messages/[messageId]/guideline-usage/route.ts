import { NextRequest, NextResponse } from 'next/server';
import { GuidelineUsageService } from '@/services/guideline-usage.service';

const guidelineUsageService = new GuidelineUsageService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    
    if (!messageId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Message ID is required' 
        },
        { status: 400 }
      );
    }
    
    const guidelineUsages = await guidelineUsageService.getByMessageId(messageId);
    
    return NextResponse.json({
      success: true,
      data: guidelineUsages,
      count: guidelineUsages.length,
      message: 'Guideline usages retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching guideline usages by message ID:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
