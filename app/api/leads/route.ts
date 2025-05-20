import { NextRequest, NextResponse } from "next/server";
import { Lead, LeadStatus } from "@/app/types";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/app/services/supabaseClient';

// Shared leads array that can be updated by the POST endpoint
export const mockLeads: Lead[] = [
  {
    id: "1",
    firstName: "Jorge",
    lastName: "Ruiz",
    email: "jorge.ruiz@example.com",
    linkedInProfile: "https://linkedin.com/in/jorgeruiz",
    visasOfInterest: ["H-1B", "L-1"],
    status: LeadStatus.PENDING,
    submittedAt: "2024-02-02T14:45:00Z",
    country: "Mexico",
  },
  {
    id: "2",
    firstName: "Bahar",
    lastName: "Zamir",
    email: "bahar.zamir@example.com",
    linkedInProfile: "https://linkedin.com/in/baharzamir",
    visasOfInterest: ["H-1B"],
    status: LeadStatus.PENDING,
    submittedAt: "2024-02-02T14:45:00Z",
    country: "Mexico",
  },
  {
    id: "3",
    firstName: "Mary",
    lastName: "Lopez",
    email: "mary.lopez@example.com",
    linkedInProfile: "https://linkedin.com/in/marylopez",
    visasOfInterest: ["EB-1"],
    status: LeadStatus.PENDING,
    submittedAt: "2024-02-02T14:45:00Z",
    country: "Brazil",
  },
  {
    id: "4",
    firstName: "Li",
    lastName: "Zijin",
    email: "li.zijin@example.com",
    linkedInProfile: "https://linkedin.com/in/lizijin",
    visasOfInterest: ["L-1", "O-1"],
    status: LeadStatus.PENDING,
    submittedAt: "2024-02-02T14:45:00Z",
    country: "South Korea",
  },
  {
    id: "5",
    firstName: "Mark",
    lastName: "Antonov",
    email: "mark.antonov@example.com",
    linkedInProfile: "https://linkedin.com/in/markantonov",
    visasOfInterest: ["H-1B"],
    status: LeadStatus.PENDING,
    submittedAt: "2024-02-02T14:45:00Z",
    country: "Russia",
  },
  {
    id: "6",
    firstName: "Jane",
    lastName: "Ma",
    email: "jane.ma@example.com",
    linkedInProfile: "https://linkedin.com/in/janema",
    visasOfInterest: ["EB-2 NIW", "H-1B"],
    status: LeadStatus.PENDING,
    submittedAt: "2024-02-02T14:45:00Z",
    country: "Mexico",
  },
  {
    id: "7",
    firstName: "Anand",
    lastName: "Jain",
    email: "anand.jain@example.com",
    linkedInProfile: "https://linkedin.com/in/anandjain",
    visasOfInterest: ["O-1"],
    status: LeadStatus.REACHED_OUT,
    submittedAt: "2024-02-02T14:45:00Z",
    country: "Mexico",
  },
  {
    id: "8",
    firstName: "Anna",
    lastName: "Voronova",
    email: "anna.voronova@example.com",
    linkedInProfile: "https://linkedin.com/in/annavoronova",
    visasOfInterest: ["L-1"],
    status: LeadStatus.PENDING,
    submittedAt: "2024-02-02T14:45:00Z",
    country: "France",
  },
];

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
    
    // Handle visasOfInterest which might be JSON string
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
    
    // Handle files
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
    
    // Add to our mock database
    mockLeads.unshift(newLead);
    
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
} 