import { LeadStatus } from "../types";

export const mapStatusToDisplay = (status: LeadStatus): string => {
  const statusMap: Record<LeadStatus, string> = {
    [LeadStatus.PENDING]: "Pending",
    [LeadStatus.REACHED_OUT]: "Reached Out"
  };
  
  return statusMap[status] || status;
}; 