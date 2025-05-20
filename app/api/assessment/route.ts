import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Lead, LeadStatus } from '@/app/types';
import { supabase } from '@/app/services/supabaseClient';
import { uploadFileToSupabase } from '@/app/services/uploadFileToSupabase';

export async function POST(req: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return NextResponse.json(
        { success: false, message: 'Database connection not available' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    
    // Extract form data
    const first_name = formData.get('firstName') as string;
    const last_name = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const country = formData.get('country') as string || '';
    const linked_in_profile = formData.get('linkedInProfile') as string;
    const additional_information = formData.get('additionalInformation') as string || '';
    const education = formData.get('education') as string || '';
    const work_experience = formData.get('workExperience') ? parseInt(formData.get('workExperience') as string) : null;
    const current_employer = formData.get('currentEmployer') as string || '';
    
    // Log all extracted fields
    console.log({ first_name, last_name, email, country, linked_in_profile, additional_information, education, work_experience, current_employer });

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields', debug: { first_name, last_name, email } },
        { status: 400 }
      );
    }
    
    // Handle visa types
    let visasOfInterest: string[] = [];
    const visasOfInterestJson = formData.get('visasOfInterest') as string;
    if (visasOfInterestJson) {
      try {
        visasOfInterest = JSON.parse(visasOfInterestJson || '[]');
      } catch (e) {
        console.error('Error parsing visasOfInterest:', e);
      }
    }
    
    // Process files
    const files = [];
    let fileCount = 0;
    
    while (formData.has(`file${fileCount}`)) {
      const file = formData.get(`file${fileCount}`) as File;
      
      if (file) {
        // In a real application, you would upload this to a storage service
        // and get back a URL. For now, we'll just store the metadata
        files.push({
          name: file.name,
          type: file.type,
          size: file.size,
          // url would be set here in production
        });
      }
      
      fileCount++;
    }
    
    // Create new lead
    const newLead = {
      id: uuidv4(),
      first_name,
      last_name,
      email,
      country,
      linked_in_profile,
      additional_information,
      education,
      work_experience,
      current_employer,
      visas_of_interest: visasOfInterest,
      files: files.length > 0 ? files : null,
      status: LeadStatus.PENDING,
      submitted_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase.from('leads').insert([newLead]).select().single();
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Assessment submitted successfully',
      lead: data
    });
    
  } catch (error) {
    console.error('Error processing assessment submission:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process submission' 
      },
      { status: 500 }
    );
  }
} 