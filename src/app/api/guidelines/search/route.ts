import { NextRequest, NextResponse } from 'next/server';
import { GuidelinesService } from '@/services/guidelines.service';
import { GuidelineQuery } from '@/types/guideline';

const guidelinesService = new GuidelinesService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query: GuidelineQuery = {};
    
    const strength = searchParams.get('strength');
    if (strength && (strength === 'hard' || strength === 'soft')) {
      query.strength = strength;
    }
    
    const priorityMin = searchParams.get('priority_min');
    if (priorityMin) {
      const priority = parseInt(priorityMin);
      if (!isNaN(priority)) {
        query.priority_min = priority;
      }
    }
    
    const priorityMax = searchParams.get('priority_max');
    if (priorityMax) {
      const priority = parseInt(priorityMax);
      if (!isNaN(priority)) {
        query.priority_max = priority;
      }
    }
    
    const triggers = searchParams.get('triggers');
    if (triggers) {
      query.triggers = triggers.split(',').map(t => t.trim());
    }
    
    const singleUse = searchParams.get('singleUse');
    if (singleUse) {
      query.singleUse = singleUse === 'true';
    }
    
    const limit = searchParams.get('limit');
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        query.limit = limitNum;
      }
    }
    
    // Get guidelines based on query
    const guidelines = await guidelinesService.search(query);
    
    return NextResponse.json({
      success: true,
      data: guidelines,
      count: guidelines.length,
      query,
      message: 'Guidelines filtered successfully'
    });
    
  } catch (error) {
    console.error('Error searching guidelines:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
