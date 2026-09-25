"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User } from "../lib/types";
import { api } from "../lib/api";
import { useToast } from "./ToastContext";

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  switchUser: (user: User) => void;
  becomeHost: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  // Load all mock users and initialize current user from localStorage
  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await api.users.getAll();
        setAllUsers(users);

        const savedUserId = localStorage.getItem("airbnb_user_id");
        if (savedUserId) {
          const match = users.find((u) => u.id === Number(savedUserId));
          if (match) {
            setCurrentUser(match);
            setIsLoading(false);
            return;
          }
        }

        // Default to Sarah Jenkins (id=7, active guest)
        const defaultUser = users.find((u) => u.id === 7) || users[0];
        if (defaultUser) {
          setCurrentUser(defaultUser);
          localStorage.setItem("airbnb_user_id", String(defaultUser.id));
        }
      } catch (err) {
        console.error("Failed to load mock users:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  const switchUser = useCallback(
    (user: User) => {
      setCurrentUser(user);
      localStorage.setItem("airbnb_user_id", String(user.id));
      success(`Switched role to ${user.name} (${user.is_host ? "Host" : "Guest"})`);
    },
    [success]
  );

  const becomeHost = useCallback(async () => {
    try {
      const updated = await api.users.becomeHost();
      setCurrentUser(updated);
      setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      success("Congratulations! Your account is now upgraded to Host.");
    } catch (err: any) {
      error(err.message || "Failed to upgrade account to host.");
    }
  }, [success, error]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        becomeHost,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
