"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface Model {
  id: number;
  userId: number;
  stageName: string;
  bio: string;
  approvalStatus: string;
  isApproved: boolean;
  user?: {
    name: string;
    email: string;
    isActive: boolean;
  };
}

export default function StudioDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [studio, setStudio] = useState<any>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState({ email: "", stageName: "", bio: "" });
  const [submitting, setSubmitting] = useState(false);

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
      if (data.user.role !== "studio_owner" && data.user.role !== "super_admin") {
        router.push("/");
        return;
      }
      setUser(data.user);
      loadStudioData();
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  }

  async function loadStudioData() {
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/studio/models", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudio(data.studio);
        setModels(data.models);
      }
    } catch (error) {
      console.error("Load studio data error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddModel(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // First, find user by email or create a placeholder
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      
      // For now, just add a model with the provided info
      const res = await fetch("/api/studio/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newModel),
      });
      
      if (res.ok) {
        setShowAddModel(false);
        setNewModel({ email: "", stageName: "", bio: "" });
        loadStudioData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add model");
      }
    } catch (error) {
      console.error("Add model error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Studio Dashboard</h1>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Studio Info */}
        {studio ? (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">{studio.name}</h2>
            <p className="text-gray-400">{studio.description || "No description"}</p>
            <div className="mt-4 flex gap-4">
              <span className={`px-3 py-1 rounded ${
                studio.isApproved ? "bg-green-600" : "bg-yellow-600"
              }`}>
                {studio.isApproved ? "Approved" : "Pending Approval"}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Your Studio</h2>
            <p className="text-gray-400 mb-4">Set up your studio to start managing models.</p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
              Create Studio
            </button>
          </div>
        )}

        {/* Models Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Models</h2>
          <button
            onClick={() => setShowAddModel(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Add Model
          </button>
        </div>

        {/* Models Grid */}
        {models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <div key={model.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                    {model.stageName[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{model.stageName}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      model.isApproved ? "bg-green-600" : "bg-yellow-600"
                    }`}>
                      {model.approvalStatus}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">{model.bio || "No bio"}</p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                    View Profile
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl mb-4">No models yet</p>
            <p>Add your first model to get started</p>
          </div>
        )}

        {/* Add Model Modal */}
        {showAddModel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-6">Add New Model</h3>
              <form onSubmit={handleAddModel}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Stage Name</label>
                  <input
                    type="text"
                    value={newModel.stageName}
                    onChange={(e) => setNewModel({ ...newModel, stageName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Model Email</label>
                  <input
                    type="email"
                    value={newModel.email}
                    onChange={(e) => setNewModel({ ...newModel, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={newModel.bio}
                    onChange={(e) => setNewModel({ ...newModel, bio: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 h-24"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModel(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Model"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
