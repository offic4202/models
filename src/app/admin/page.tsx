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
  const [activeTab, setActiveTab] = useState<"approvals" | "users" | "studios" | "models" | "settings">("approvals");
  const [pendingItems, setPendingItems] = useState<{
    pendingStudios: any[];
    pendingModels: any[];
    pendingContent: any[];
    pendingUsers: any[];
  } | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allStudios, setAllStudios] = useState<any[]>([]);
  const [allModels, setAllModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Edit modal state
  const [editingItem, setEditingItem] = useState<{type: string; id: number; data: any} | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    siteName: "",
    siteDescription: "",
    googleAnalyticsId: "",
    googleAdsenseClientId: "",
    googleAdsenseAdSlot: "",
    privacyStatement: "",
    termsOfService: "",
    uploadMaxSize: "100",
    storageType: "local",
    ftpHost: "",
    ftpPort: "21",
    ftpUsername: "",
    ftpPassword: "",
    ftpPath: "/public_html/uploads",
    s3Bucket: "",
    s3Region: "us-east-1",
    s3AccessKey: "",
    s3SecretKey: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

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

  async function loadSettings() {
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error("Load settings error:", error);
    }
  }

  async function saveSettings() {
    setSavingSettings(true);
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const settingsList = Object.entries(settings).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: settingsList }),
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Save settings error:", error);
    } finally {
      setSavingSettings(false);
    }
  }

  async function loadStudios() {
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/admin/studios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllStudios(data.studios);
      }
    } catch (error) {
      console.error("Load studios error:", error);
    }
  }

  async function loadModels() {
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/admin/models", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllModels(data.models);
      }
    } catch (error) {
      console.error("Load models error:", error);
    }
  }

  function openEdit(type: string, item: any) {
    setEditingItem({ type, id: item.id, data: item });
    if (type === "user") {
      setEditForm({ name: item.name, email: item.email, isActive: item.isActive, isVerified: item.isVerified });
    } else if (type === "studio") {
      setEditForm({ name: item.name, description: item.description, isApproved: item.isApproved, approvalStatus: item.approvalStatus });
    } else if (type === "model") {
      setEditForm({ stageName: item.stageName, bio: item.bio, isApproved: item.isApproved, approvalStatus: item.approvalStatus });
    }
  }

  async function saveEdit() {
    setSavingEdit(true);
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/admin/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: editingItem?.type, id: editingItem?.id, data: editForm }),
      });
      if (res.ok) {
        setEditingItem(null);
        if (editingItem?.type === "user") loadUsers();
        else if (editingItem?.type === "studio") loadStudios();
        else if (editingItem?.type === "model") loadModels();
      }
    } catch (error) {
      console.error("Save edit error:", error);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(type: string, id: number) {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    setActionLoading(id);
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/admin/edit", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, id }),
      });
      if (res.ok) {
        if (type === "user") loadUsers();
        else if (type === "studio") loadStudios();
        else if (type === "model") loadModels();
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setActionLoading(null);
    }
  }

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    }
    if (activeTab === "studios") {
      loadStudios();
    }
    if (activeTab === "models") {
      loadModels();
    }
    if (activeTab === "settings") {
      loadSettings();
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
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "settings"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Settings
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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Studios</h2>
            {allStudios.length === 0 ? (
              <p className="text-gray-400">No studios found</p>
            ) : (
              <div className="grid gap-4">
                {allStudios.map((studio) => (
                  <div key={studio.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{studio.name}</h3>
                        <p className="text-gray-400 text-sm">{studio.description}</p>
                        <div className="mt-2 flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            studio.approvalStatus === 'approved' ? 'bg-green-600' : 
                            studio.approvalStatus === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'
                          }`}>
                            {studio.approvalStatus}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${studio.isApproved ? 'bg-green-600' : 'bg-red-600'}`}>
                            {studio.isApproved ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          Created: {new Date(studio.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit("studio", studio)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("studio", studio.id)}
                          disabled={actionLoading === studio.id}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Models Tab */}
        {activeTab === "models" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Models</h2>
            {allModels.length === 0 ? (
              <p className="text-gray-400">No models found</p>
            ) : (
              <div className="grid gap-4">
                {allModels.map((model) => (
                  <div key={model.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{model.stageName}</h3>
                        <p className="text-gray-400 text-sm">{model.bio}</p>
                        {model.user && (
                          <p className="text-gray-500 text-sm">Email: {model.user.email}</p>
                        )}
                        <div className="mt-2 flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            model.approvalStatus === 'approved' ? 'bg-green-600' : 
                            model.approvalStatus === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'
                          }`}>
                            {model.approvalStatus}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${model.isApproved ? 'bg-green-600' : 'bg-red-600'}`}>
                            {model.isApproved ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          Created: {new Date(model.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit("model", model)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("model", model.id)}
                          disabled={actionLoading === model.id}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            {/* Site Settings */}
            <section className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Site Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Upload Size (MB)</label>
                  <input
                    type="number"
                    value={settings.uploadMaxSize}
                    onChange={(e) => setSettings({ ...settings, uploadMaxSize: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Site Description</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
            </section>

            {/* Analytics & Monetization */}
            <section className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Analytics & Monetization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Google AdSense Client ID</label>
                  <input
                    type="text"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    value={settings.googleAdsenseClientId}
                    onChange={(e) => setSettings({ ...settings, googleAdsenseClientId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Google AdSense Ad Slot</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={settings.googleAdsenseAdSlot}
                    onChange={(e) => setSettings({ ...settings, googleAdsenseAdSlot: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
            </section>

            {/* External Storage */}
            <section className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">External Storage Configuration</h2>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Storage Type</label>
                <select
                  value={settings.storageType}
                  onChange={(e) => setSettings({ ...settings, storageType: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="local">Local Storage (Default)</option>
                  <option value="ftp">FTP Server</option>
                  <option value="s3">Amazon S3</option>
                </select>
              </div>
              
              {settings.storageType === "ftp" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">FTP Host</label>
                    <input
                      type="text"
                      value={settings.ftpHost}
                      onChange={(e) => setSettings({ ...settings, ftpHost: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">FTP Port</label>
                    <input
                      type="text"
                      value={settings.ftpPort}
                      onChange={(e) => setSettings({ ...settings, ftpPort: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">FTP Username</label>
                    <input
                      type="text"
                      value={settings.ftpUsername}
                      onChange={(e) => setSettings({ ...settings, ftpUsername: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">FTP Password</label>
                    <input
                      type="password"
                      value={settings.ftpPassword}
                      onChange={(e) => setSettings({ ...settings, ftpPassword: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">FTP Path</label>
                    <input
                      type="text"
                      value={settings.ftpPath}
                      onChange={(e) => setSettings({ ...settings, ftpPath: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              {settings.storageType === "s3" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">S3 Bucket Name</label>
                    <input
                      type="text"
                      value={settings.s3Bucket}
                      onChange={(e) => setSettings({ ...settings, s3Bucket: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">S3 Region</label>
                    <input
                      type="text"
                      value={settings.s3Region}
                      onChange={(e) => setSettings({ ...settings, s3Region: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">S3 Access Key</label>
                    <input
                      type="text"
                      value={settings.s3AccessKey}
                      onChange={(e) => setSettings({ ...settings, s3AccessKey: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">S3 Secret Key</label>
                    <input
                      type="password"
                      value={settings.s3SecretKey}
                      onChange={(e) => setSettings({ ...settings, s3SecretKey: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Privacy & Legal */}
            <section className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Privacy & Legal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Privacy Statement</label>
                  <textarea
                    value={settings.privacyStatement}
                    onChange={(e) => setSettings({ ...settings, privacyStatement: e.target.value })}
                    rows={6}
                    placeholder="Enter your privacy statement here..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Terms of Service</label>
                  <textarea
                    value={settings.termsOfService}
                    onChange={(e) => setSettings({ ...settings, termsOfService: e.target.value })}
                    rows={6}
                    placeholder="Enter your terms of service here..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
            </section>

            <button
              onClick={saveSettings}
              disabled={savingSettings}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg"
            >
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}
              </h2>
              
              {editingItem.type === "user" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.isVerified}
                        onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Verified</span>
                    </label>
                  </div>
                </div>
              )}

              {editingItem.type === "studio" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Studio Name</label>
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                    <select
                      value={editForm.approvalStatus}
                      onChange={(e) => setEditForm({ ...editForm, approvalStatus: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.isApproved}
                      onChange={(e) => setEditForm({ ...editForm, isApproved: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Approved</span>
                  </label>
                </div>
              )}

              {editingItem.type === "model" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Stage Name</label>
                    <input
                      type="text"
                      value={editForm.stageName || ""}
                      onChange={(e) => setEditForm({ ...editForm, stageName: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Bio</label>
                    <textarea
                      value={editForm.bio || ""}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                    <select
                      value={editForm.approvalStatus}
                      onChange={(e) => setEditForm({ ...editForm, approvalStatus: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.isApproved}
                      onChange={(e) => setEditForm({ ...editForm, isApproved: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Approved</span>
                  </label>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
