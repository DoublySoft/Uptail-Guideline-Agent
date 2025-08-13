import { NextRequest, NextResponse } from 'next/server';
import { GuidelinesService } from '@/services/guidelines.service';

const guidelinesService = new GuidelinesService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Guideline ID is required' 
        },
        { status: 400 }
      );
    }
    
    const guideline = await guidelinesService.getById(id);
    
    if (!guideline) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Guideline not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: guideline
    });
    
  } catch (error) {
    console.error('Error fetching guideline:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
