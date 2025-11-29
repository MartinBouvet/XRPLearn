"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminDashboardComponent from "../../components/AdminDashboard";

export default function AdminDashboard() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Basic protection: if not logged in as admin
        const username = localStorage.getItem("xrpl_username");
        if (username?.toLowerCase() !== "admin") {
            router.push("/");
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) return null;

    return <AdminDashboardComponent />;
}
