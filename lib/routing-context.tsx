"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface RoutingConfig {
  transfer: string[];
  timesheet: string[]; // secondary routing role (Transfer Time)
  incident: string[];  // primary fixed logic role (OHS Manager)
  timesheetPrimary?: string; // e.g. "LOCATION MANAGER"
  incidentPrimary?: string;  // e.g. "LOCATION MANAGER"
}

interface RoutingContextType {
  routingConfig: RoutingConfig;
  updateRouting: (formType: keyof RoutingConfig, roles: string[]) => void;
  isLoading: boolean;
}

const defaultRouting: RoutingConfig = {
  transfer: ["TRANSFER MANAGER"],
  timesheet: ["TRANSFER MANAGER"], // Routes here conditionally if transfer time > 0
  incident: ["OHS MANAGER"],      // Routes here unconditionally 
  timesheetPrimary: "LOCATION MANAGER",
  incidentPrimary: "LOCATION MANAGER"
};

const RoutingContext = createContext<RoutingContextType | undefined>(undefined);

export function RoutingProvider({ children }: { children: React.ReactNode }) {
  const [routingConfig, setRoutingConfig] = useState<RoutingConfig>(defaultRouting);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("cg_form_routing");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRoutingConfig({ ...defaultRouting, ...parsed });
      } catch (e) {
        console.error("Failed to parse stored routing", e);
      }
    }
    setIsLoading(false);
  }, []);

  const updateRouting = (formType: keyof RoutingConfig, roles: string[]) => {
    const updated = { ...routingConfig, [formType]: roles };
    setRoutingConfig(updated);
    localStorage.setItem("cg_form_routing", JSON.stringify(updated));
  };

  return (
    <RoutingContext.Provider value={{ routingConfig, updateRouting, isLoading }}>
      {children}
    </RoutingContext.Provider>
  );
}

export function useRouting() {
  const context = useContext(RoutingContext);
  if (context === undefined) {
    throw new Error("useRouting must be used within a RoutingProvider");
  }
  return context;
}
