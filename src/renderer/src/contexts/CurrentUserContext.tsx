import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  role: string;
  email: string;
  employeeRoles?: {
    role: {
      id: string;
      name: string;
      description?: string;
      isSystem: boolean;
    };
  }[];
}

interface CurrentUserContextType {
  currentUser: Employee | null;
  setCurrentUser: (user: Employee | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

export const useCurrentUser = (): CurrentUserContextType => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
};

interface CurrentUserProviderProps {
  children: ReactNode;
}

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = currentUser !== null;

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Multi-tenant login flow:
      // 1. Check if email exists in public.tenant_users
      // 2. Get tenant schema from public.tenants
      // 3. Connect to tenant schema and verify employee credentials

      // Step 1: Find tenant user by email in public schema
      const tenantUser = await window.electron.ipcRenderer.invoke("tenantUsers:findByEmail", email);
      if (!tenantUser) {
        console.log("No tenant user found for email:", email);
        return false;
      }

      console.log("Found tenant user:", tenantUser);

      // Step 2: Get tenant schema name
      const schemaName = tenantUser.schema_name;
      if (!schemaName) {
        console.error("No schema name found for tenant user");
        return false;
      }

      console.log("Using schema:", schemaName);

      // Step 3: Find employee by email in tenant schema
      const employee = await window.electron.ipcRenderer.invoke("employees:findByEmail", email, schemaName);
      if (!employee) {
        console.log("No employee found in tenant schema for email:", email);
        return false;
      }

      console.log("Found employee in tenant schema:", employee);

      // Step 4: Verify password
      const isValidPassword = await window.electron.ipcRenderer.invoke(
        "employees:verifyPassword",
        password,
        employee.password_hash,
        schemaName
      );

      if (isValidPassword) {
        // Step 5: Get employee with roles from tenant schema
        const employees = await window.electron.ipcRenderer.invoke("employees:findMany", schemaName);
        const employeeWithRoles = employees.find((emp: Employee) => emp.id === employee.id);

        // Add tenant information to the user object
        const userWithTenant = {
          ...(employeeWithRoles || employee),
          tenantId: tenantUser.tenantId,
          schemaName: schemaName,
          companyName: tenantUser.companyName
        };

        console.log("Login successful for user:", userWithTenant);
        setCurrentUser(userWithTenant);
        return true;
      }

      console.log("Invalid password for email:", email);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  useEffect(() => {
    const loadStoredUser = async () => {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);

          // Validate that the user still exists in the database
          try {
            const employee = await window.electron.ipcRenderer.invoke(
              "employees:findByEmail",
              user.email
            );

            if (employee && employee.id === user.id) {
              // User still exists, use the stored data
              setCurrentUser(user);
              console.log("CurrentUser: Loaded from localStorage:", user.email);
            } else {
              // User no longer exists or ID mismatch, clear localStorage
              console.log("CurrentUser: Stored user no longer valid, clearing localStorage");
              localStorage.removeItem("currentUser");
              setCurrentUser(null);
            }
          } catch (error) {
            console.error("Error validating stored user:", error);
            localStorage.removeItem("currentUser");
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("currentUser");
        }
      }
    };

    loadStoredUser();
  }, []);

  // Save user to localStorage when currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const value: CurrentUserContextType = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
};
