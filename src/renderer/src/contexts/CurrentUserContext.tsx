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
      // Find employee by email
      const employee = await window.electron.ipcRenderer.invoke("employees:findByEmail", email);
      if (!employee) {
        return false;
      }

      // Verify password
      const isValidPassword = await window.electron.ipcRenderer.invoke(
        "employees:verifyPassword",
        password,
        employee.password_hash
      );

      if (isValidPassword) {
        // Fetch employee with role relationships
        const employees = await window.electron.ipcRenderer.invoke("employees:findMany");
        const employeeWithRoles = employees.find((emp: Employee) => emp.id === employee.id);

        console.log("CurrentUser: Employee found by email:", employee);
        console.log("CurrentUser: Employee with roles:", employeeWithRoles);
        console.log("CurrentUser: All employees:", employees);

        setCurrentUser(employeeWithRoles || employee);
        return true;
      }

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
    // Additional logout logic can be added here
  };

  // Load user from localStorage on app start
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
