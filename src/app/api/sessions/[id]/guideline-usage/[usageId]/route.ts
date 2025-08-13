import { NextRequest, NextResponse } from 'next/server';
import { GuidelineUsageService } from '@/services/guideline-usage.service';

const guidelineUsageService = new GuidelineUsageService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; usageId: string }> }
) {
  try {
    const { usageId } = await params;
    
    if (!usageId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usage ID is required' 
        },
        { status: 400 }
      );
    }
    
    const guidelineUsage = await guidelineUsageService.getById(usageId);
    
    if (!guidelineUsage) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Guideline usage not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: guidelineUsage
    });
    
  } catch (error) {
    console.error('Error fetching guideline usage:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
