"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. Get the token from localStorage
    const token = localStorage.getItem("token");
    
    // 2. Define which pages don't need a token
    const publicPaths = ["/login", "/register"];

    // 3. Logic: If no token and not on a public page, redirect to login
    if (!token && !publicPaths.includes(pathname)) {
      router.push("/login");
    } else {
      // 4. If everything is fine, stop showing the loading state
      setIsChecking(false);
    }
  }, [pathname, router]);

  // While checking, return a blank screen or spinner to prevent "flickering"
  // of protected content before the redirect happens.
  if (isChecking && !["/login", "/register"].includes(pathname)) {
    return null; 
  }

  return <>{children}</>;
}