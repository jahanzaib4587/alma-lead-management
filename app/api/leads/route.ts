import { NextRequest, NextResponse } from "next/server";
import { Lead, LeadStatus } from "@/app/types";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/app/services/supabaseClient';

export async function GET(req: NextRequest) {
  const { data, error } = await supabase.from('leads').select('*').order('submitted_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const linkedInProfile = formData.get("linkedInProfile") as string;
    let visasOfInterest: string[] = [];
    const visasData = formData.get("visasOfInterest");
    if (visasData) {
      try {
        visasOfInterest = JSON.parse(visasData.toString());
      } catch (e) {
        console.error("Error parsing visasOfInterest:", e);
      }
    }
    const additionalInformation = formData.get("additionalInformation") as string || "";
    const country = formData.get("country") as string || "Unknown";
    const files = [];
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`file${i}`) as File;
      if (file) {
        files.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: `/uploads/${file.name}`
        });
      }
    }
    const newLead: Lead = {
      id: uuidv4(),
      firstName,
      lastName,
      email,
      linkedInProfile,
      visasOfInterest,
      status: LeadStatus.PENDING,
      submittedAt: new Date().toISOString(),
      country,
      additionalInformation,
      files: files.length > 0 ? files : undefined
    };
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
} 