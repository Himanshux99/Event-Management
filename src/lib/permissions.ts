import type { Role } from "@/context/authContext";

/**
 * Check if user has permission based on their role.
 * Roles: "student" (including event volunteers), "organizer"
 * Note: Students can be assigned as event volunteers by organizers.
 */
export const hasPermission = (userRole: Role | undefined | null, allowedRoles?: Role[] | undefined): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true; // no restriction
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

export default hasPermission;
