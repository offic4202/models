"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface Content {
  id: number;
  title: string;
  description: string;
  type: string;
  url: string;
  price: number;
  isPublic: boolean;
  isApproved: boolean;
  approvalStatus: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
}

export default function ModelDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [recentFollowers, setRecentFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "fans" | "earnings">("overview");
  const [showCreateContent, setShowCreateContent] = useState(false);
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    type: "image",
    url: "",
    price: 0,
    isPublic: false,
  });
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
      if (data.user.role !== "model" && data.user.role !== "super_admin") {
        router.push("/");
        return;
      }
      setUser(data.user);
      loadDashboard();
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  }

  async function loadDashboard() {
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/model/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setContent(data.content);
        setStats(data.stats);
        setRecentFollowers(data.recentFollowers);
      }
    } catch (error) {
      console.error("Load dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateContent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
      const res = await fetch("/api/model/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newContent),
      });
      
      if (res.ok) {
        setShowCreateContent(false);
        setNewContent({
          title: "",
          description: "",
          type: "image",
          url: "",
          price: 0,
          isPublic: false,
        });
        loadDashboard();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create content");
      }
    } catch (error) {
      console.error("Create content error:", error);
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
          <h1 className="text-2xl font-bold">Model Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, {profile?.stageName || user.name}</span>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Followers</p>
            <p className="text-3xl font-bold">{stats?.followers || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Subscribers</p>
            <p className="text-3xl font-bold">{stats?.subscribers || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total Earnings</p>
            <p className="text-3xl font-bold text-green-400">${stats?.totalEarnings || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Wallet Balance</p>
            <p className="text-3xl font-bold text-purple-400">${stats?.walletBalance || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "overview"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "content"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab("fans")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "fans"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Fans
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "earnings"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Earnings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold">
                  {profile?.stageName?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{profile?.stageName}</h2>
                  <p className="text-gray-400">{profile?.bio || "No bio yet"}</p>
                  <div className="mt-2 flex gap-2">
                    <span className={`px-3 py-1 rounded text-sm ${
                      profile?.isApproved ? "bg-green-600" : "bg-yellow-600"
                    }`}>
                      {profile?.approvalStatus || "pending"}
                    </span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Recent Followers */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Followers</h3>
              {recentFollowers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {recentFollowers.map((follow: any) => (
                    <div key={follow.id} className="text-center">
                      <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                        {follow.fan?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <p className="text-sm truncate">{follow.fan?.name || "Anonymous"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No followers yet</p>
              )}
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Content</h2>
              <button
                onClick={() => setShowCreateContent(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                Create Content
              </button>
            </div>

            {content.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-700 flex items-center justify-center">
                      {item.type === "image" && (
                        <span className="text-4xl">🖼️</span>
                      )}
                      {item.type === "video" && (
                        <span className="text-4xl">🎬</span>
                      )}
                      {item.type === "text" && (
                        <span className="text-4xl">📝</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{item.title || "Untitled"}</h3>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{item.viewCount} views</span>
                        <span>{item.likeCount} likes</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.isPublic ? "bg-green-600" : "bg-gray-600"
                        }`}>
                          {item.isPublic ? "Public" : "Private"}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.isApproved ? "bg-green-600" : "bg-yellow-600"
                        }`}>
                          {item.approvalStatus}
                        </span>
                        {item.price > 0 && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-600">
                            ${item.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl mb-4">No content yet</p>
                <p>Create your first post to engage with fans</p>
              </div>
            )}
          </div>
        )}

        {/* Fans Tab */}
        {activeTab === "fans" && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">Fan management coming soon</p>
            <p className="mt-2">View and interact with your fans</p>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">Earnings tracking coming soon</p>
            <p className="mt-2">Track your revenue and withdrawals</p>
          </div>
        )}

        {/* Create Content Modal */}
        {showCreateContent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-6">Create New Content</h3>
              <form onSubmit={handleCreateContent}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newContent.description}
                    onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 h-24"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Content URL</label>
                  <input
                    type="url"
                    value={newContent.url}
                    onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="https://..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Price (credits)</label>
                  <input
                    type="number"
                    value={newContent.price}
                    onChange={(e) => setNewContent({ ...newContent, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newContent.isPublic}
                      onChange={(e) => setNewContent({ ...newContent, isPublic: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>Make public (free content)</span>
                  </label>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateContent(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Content"}
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
