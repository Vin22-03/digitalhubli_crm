import { createContext, useContext } from "react";
import { BRAND } from "../config/branding";

// Workspace is just digitalhubli branding — no DB call needed.
// All advisors use digitalhubli CRM. No white-labelling.
const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const workspace = {
    businessName: BRAND.companyName,
    tagline:      BRAND.tagline,
    supportPhone: BRAND.supportPhone,
    logoUrl:      null, // uses local logo asset
  };

  return (
    <WorkspaceContext.Provider value={{ workspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
