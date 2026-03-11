"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface Subscription {
  id: number;
  modelId: number;
  model?: {
    stageName: string;
    user?: {
      name: string;
    };
  };
  monthlyPrice: number;
  isActive: boolean;
  startedAt: string;
  expiresAt: string;
}

interface PurchasedContent {
  id: number;
  contentId: number;
  content?: {
    title: string;
    type: string;
    thumbnail: string;
  };
  price: number;
  purchasedAt: string;
}

interface Message {
  id: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    name: string;
    role: string;
  };
}

export default function FanDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [purchasedContent, setPurchasedContent] = useState<PurchasedContent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "subscriptions" | "purchases" | "messages" | "wallet">("overview");

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
      if (data.user.role !== "fan" && data.user.role !== "super_admin") {
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
      const res = await fetch("/api/fan/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setSubscriptions(data.subscriptions);
        setPurchasedContent(data.purchasedContent);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Load dashboard error:", error);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold">Fan Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, {user.name}</span>
            <div className="px-4 py-2 bg-purple-600 rounded-lg">
              Credits: {wallet?.balance || 0}
            </div>
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
            <p className="text-gray-400 text-sm">Credits</p>
            <p className="text-3xl font-bold text-purple-400">{wallet?.balance || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Subscriptions</p>
            <p className="text-3xl font-bold">{subscriptions.filter(s => s.isActive).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Purchased Content</p>
            <p className="text-3xl font-bold">{purchasedContent.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Unread Messages</p>
            <p className="text-3xl font-bold">{messages.filter(m => !m.isRead).length}</p>
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
            onClick={() => setActiveTab("subscriptions")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "subscriptions"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "purchases"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Purchases
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "messages"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Messages {messages.filter(m => !m.isRead).length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-xs rounded-full">
                {messages.filter(m => !m.isRead).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === "wallet"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Wallet
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Active Subscriptions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
              {subscriptions.filter(s => s.isActive).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subscriptions.filter(s => s.isActive).map((sub) => (
                    <div key={sub.id} className="bg-gray-700 rounded-lg p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-bold">
                        {sub.model?.stageName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h3 className="font-semibold">{sub.model?.stageName}</h3>
                        <p className="text-sm text-gray-400">${sub.monthlyPrice}/month</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No active subscriptions</p>
              )}
            </div>

            {/* Recent Purchases */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>
              {purchasedContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {purchasedContent.slice(0, 4).map((purchase) => (
                    <div key={purchase.id} className="bg-gray-700 rounded-lg overflow-hidden">
                      <div className="h-32 bg-gray-600 flex items-center justify-center">
                        <span className="text-4xl">
                          {purchase.content?.type === "video" ? "🎬" :
                           purchase.content?.type === "audio" ? "🎵" : "🖼️"}
                        </span>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm truncate">{purchase.content?.title}</h3>
                        <p className="text-purple-400 text-sm">${purchase.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No purchases yet</p>
              )}
            </div>

            {/* Recent Messages */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.slice(0, 5).map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-lg ${msg.isRead ? "bg-gray-700" : "bg-gray-600 border-l-4 border-purple-500"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{msg.sender?.name}</p>
                          <p className="text-sm text-gray-400 truncate">{msg.content}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No messages</p>
              )}
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Subscriptions</h2>
            {subscriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">
                        {sub.model?.stageName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{sub.model?.stageName}</h3>
                        <span className={`text-sm px-2 py-1 rounded ${sub.isActive ? "bg-green-600" : "bg-gray-600"}`}>
                          {sub.isActive ? "Active" : "Expired"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>${sub.monthlyPrice}/month</span>
                      <span>Since: {new Date(sub.startedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl mb-4">No subscriptions yet</p>
                <p>Browse models to subscribe</p>
              </div>
            )}
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === "purchases" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Purchased Content</h2>
            {purchasedContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {purchasedContent.map((purchase) => (
                  <div key={purchase.id} className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-700 flex items-center justify-center">
                      <span className="text-6xl">
                        {purchase.content?.type === "video" ? "🎬" :
                         purchase.content?.type === "audio" ? "🎵" : 
                         purchase.content?.type === "gallery" ? "📸" : "🖼️"}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{purchase.content?.title || "Untitled"}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-400">${purchase.price}</span>
                        <span className="text-sm text-gray-400">
                          {new Date(purchase.purchasedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl mb-4">No purchases yet</p>
                <p>Purchase content from your favorite models</p>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Messages</h2>
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`p-4 rounded-lg ${msg.isRead ? "bg-gray-800" : "bg-gray-700 border-l-4 border-purple-500"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          {msg.sender?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold">{msg.sender?.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            msg.sender?.role === "model" ? "bg-purple-600" : "bg-blue-600"
                          }`}>
                            {msg.sender?.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300">{msg.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl mb-4">No messages yet</p>
                <p>Start following models to receive messages</p>
              </div>
            )}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === "wallet" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Wallet</h2>            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Current Balance</h3>
                <p className="text-4xl font-bold text-purple-400">{wallet?.balance || 0} credits</p>
                <button className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg w-full">
                  Add Credits
                </button>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Packages</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex justify-between items-center">
                    <span>100 credits</span>
                    <span className="text-purple-400">$10</span>
                  </button>
                  <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex justify-between items-center">
                    <span>500 credits</span>
                    <span className="text-purple-400">$45</span>
                  </button>
                  <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex justify-between items-center">
                    <span>1000 credits</span>
                    <span className="text-purple-400">$80</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
