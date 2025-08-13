import { NextResponse } from 'next/server';
import { GuidelinesService } from '@/services/guidelines.service';

const guidelinesService = new GuidelinesService();

export async function GET() {
  try {    
    // Get all guidelines
    const guidelines = await guidelinesService.getAll();
    
    return NextResponse.json({
      success: true,
      data: guidelines,
      count: guidelines.length,
      message: 'All guidelines retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching guidelines:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}