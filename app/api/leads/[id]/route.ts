import { NextRequest, NextResponse } from "next/server";
import { Lead, LeadStatus } from '@/app/types';
import { supabase } from '@/app/services/supabaseClient';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const leadId = params.id;
  
  // Check if Supabase client is available
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return NextResponse.json(
      { error: 'Database connection not available' },
      { status: 503 }
    );
  }
  
  // Find the lead by ID from Supabase
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    );
  }
  
  return NextResponse.json(lead);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }
    
    const { status } = await request.json();
    
    if (!Object.values(LeadStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update the lead status in Supabase
    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("Error updating lead status:", error);
    return NextResponse.json(
      { error: "Failed to update lead status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const leadId = params.id;
  
  // Check if Supabase client is available
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return NextResponse.json(
      { error: 'Database connection not available' },
      { status: 503 }
    );
  }
  
  // Delete the lead from Supabase
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);
  
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { success: true, message: "Lead successfully deleted" },
    { status: 200 }
  );
}