"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { data: session, status } = useSession();
  // const router = useRouter();

  // useEffect(() => {
  //   if (status === "loading") return;
  //   if (!session) {
  //     router.push("/login");
  //   }
  // }, [session, status, router]);

  // if (status === "loading") {
  //   return (
  //     <div className="flex h-screen w-full items-center justify-center">
  //       <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
  //     </div>
  //   );
  // }

  // return session ? <>{children}</> : null;
  return <>{children}</>;
}
