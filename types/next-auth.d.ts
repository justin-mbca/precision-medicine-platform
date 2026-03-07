import "next-auth";

declare module "next-auth" {
  type ClinicianRole = "oncologist" | "cardiologist" | "admin";

  interface User {
    role?: ClinicianRole;
  }

  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: ClinicianRole;
    };
  }
}

