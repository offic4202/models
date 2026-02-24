"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  approvalStatus: string;
}

interface PendingItem {
  id: number;
  name?: string;
  stageName?: string;
  title?: string;
  email?: string;
  description?: string;
  createdAt: string;
  approvalStatus: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"approvals" | "users" | "studios" | "models">("approvals");
  const [pendingItems, setPendingItems] = useState<{
    pendingStudios: any[];
    pendingModels: any[];
    pendingContent: any[];
    pendingUsers: any[];
  } | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.user.role !== "super_admin") {
        router.push("/");
        return;
      }
      setUser(data.user);
      loadApprovals();
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  }

  async function loadApprovals() {
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/admin/approvals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingItems(data);
      }
    } catch (error) {
      console.error("Load approvals error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users);
      }
    } catch (error) {
      console.error("Load users error:", error);
    }
  }

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab]);

  async function handleApproval(type: string, id: number, action: "approve" | "reject") {
    setActionLoading(id);
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, id, action }),
      });
      if (res.ok) {
        loadApprovals();
      }
    } catch (error) {
      console.error("Approval error:", error);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const pendingCount = 
    (pendingItems?.pendingStudios?.length || 0) +
    (pendingItems?.pendingModels?.length || 0) +
    (pendingItems?.pendingContent?.length || 0) +
    (pendingItems?.pendingUsers?.length || 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Super Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, {user.name}</span>
            <button
              onClick={() => {
                document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                router.push("/");
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "approvals"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Approvals {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-xs rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "users"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("studios")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "studios"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Studios
          </button>
          <button
            onClick={() => setActiveTab("models")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "models"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Models
          </button>
        </div>

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div className="space-y-8">
            {/* Pending Studios */}
            {pendingItems?.pendingStudios && pendingItems.pendingStudios.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Pending Studios</h2>
                <div className="grid gap-4">
                  {pendingItems.pendingStudios.map((studio) => (
                    <div
                      key={studio.id}
                      className="bg-gray-800 rounded-lg p-6 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-lg font-medium">{studio.name}</h3>
                        <p className="text-gray-400 text-sm">{studio.description}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          Created: {new Date(studio.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval("studio", studio.id, "approve")}
                          disabled={actionLoading === studio.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval("studio", studio.id, "reject")}
                          disabled={actionLoading === studio.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pending Models */}
            {pendingItems?.pendingModels && pendingItems.pendingModels.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Pending Models</h2>
                <div className="grid gap-4">
                  {pendingItems.pendingModels.map((model) => (
                    <div
                      key={model.id}
                      className="bg-gray-800 rounded-lg p-6 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-lg font-medium">{model.stageName}</h3>
                        <p className="text-gray-400 text-sm">{model.bio}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          Created: {new Date(model.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval("model", model.id, "approve")}
                          disabled={actionLoading === model.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval("model", model.id, "reject")}
                          disabled={actionLoading === model.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pending Content */}
            {pendingItems?.pendingContent && pendingItems.pendingContent.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Pending Content</h2>
                <div className="grid gap-4">
                  {pendingItems.pendingContent.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-800 rounded-lg p-6 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-lg font-medium">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          Type: {item.type} | Price: ${item.price}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval("content", item.id, "approve")}
                          disabled={actionLoading === item.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval("content", item.id, "reject")}
                          disabled={actionLoading === item.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pending Users */}
            {pendingItems?.pendingUsers && pendingItems.pendingUsers.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Pending Users</h2>
                <div className="grid gap-4">
                  {pendingItems.pendingUsers.map((u) => (
                    <div
                      key={u.id}
                      className="bg-gray-800 rounded-lg p-6 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-lg font-medium">{u.name}</h3>
                        <p className="text-gray-400 text-sm">{u.email}</p>
                        <p className="text-purple-400 text-xs mt-2 uppercase">
                          Role: {u.role.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval("user", u.id, "approve")}
                          disabled={actionLoading === u.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval("user", u.id, "reject")}
                          disabled={actionLoading === u.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pendingCount === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl">No pending approvals</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4">{u.name}</td>
                      <td className="px-6 py-4 text-gray-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs uppercase ${
                          u.role === "super_admin" ? "bg-red-600" :
                          u.role === "studio_owner" ? "bg-blue-600" :
                          u.role === "model" ? "bg-purple-600" : "bg-gray-600"
                        }`}>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.isActive ? "bg-green-600" : "bg-red-600"
                        }`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Studios Tab */}
        {activeTab === "studios" && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">Studio management coming soon</p>
          </div>
        )}

        {/* Models Tab */}
        {activeTab === "models" && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">Model management coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
