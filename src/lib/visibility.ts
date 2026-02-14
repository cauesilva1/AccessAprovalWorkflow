import type { UserProfile } from "./auth";
import type { Prisma } from "@/generated/prisma/client";

export function getRequestsWhereClause(profile: UserProfile): Prisma.RequestWhereInput {
  const level = profile.role.hierarchy_level;

  // GM: sees all
  if (level === 4) {
    return {};
  }

  // Manager: sees all in their sector
  if (level === 3) {
    return { requester: { sector_id: profile.sector_id } };
  }

  // Supervisor: own + employees in same sector
  if (level === 2) {
    return {
      OR: [
        { requester_id: profile.id },
        {
          requester: {
            sector_id: profile.sector_id,
            role: { hierarchy_level: 1 },
          },
        },
      ],
    };
  }

  // Employee: only own requests
  return { requester_id: profile.id };
}

export function canViewRequest(profile: UserProfile, request: { requester_id: string | null; requester?: { sector_id: string; role: { hierarchy_level: number } } | null }): boolean {
  const level = profile.role.hierarchy_level;

  if (level === 4) return true;

  if (!request.requester_id) return false; // legacy requests: only GM

  if (level === 1) return request.requester_id === profile.id;

  if (level === 3) return request.requester?.sector_id === profile.sector_id;

  if (level === 2) {
    return (
      request.requester_id === profile.id ||
      (request.requester?.sector_id === profile.sector_id &&
        request.requester.role?.hierarchy_level === 1)
    );
  }

  return false;
}
