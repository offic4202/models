import Link from "next/link";

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/settings`, { 
      cache: "no-store" 
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch settings:", error);
  }
  return {};
}

export default async function PrivacyPage() {
  const settings = await getSettings();
  const privacyStatement = settings.privacyStatement || `PRIVACY STATEMENT

Last Updated: ${new Date().toLocaleDateString()}

We take your privacy seriously. This Privacy Statement explains how we collect, use, disclose, and safeguard your information when you use our platform.

INFORMATION WE COLLECT
- Personal information you provide (name, email, profile)
- Content you upload (photos, videos)
- Usage data and analytics
- Device and connection information

HOW WE USE YOUR INFORMATION
- To provide and maintain our services
- To process transactions and subscriptions
- To communicate with you about updates and support
- To comply with legal obligations

DATA PROTECTION
- All data is encrypted in transit and at rest
- We use industry-standard security measures
- Regular security audits and updates
- Your content is stored securely

YOUR RIGHTS
- Access your personal data
- Request correction of inaccurate data
- Request deletion of your data
- Opt-out of data collection

For models and studios:
- Your content remains your intellectual property
- You control who can view your content
- You can set content to private or public
- You can delete your content at any time

CONTACT US
If you have questions about this Privacy Statement, please contact us through our support channels.`;

  const siteName = settings.siteName || "StreamRay";

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">{siteName}</Link>
          <Link href="/" className="text-gray-400 hover:text-white">Back to Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gray-900 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Statement</h1>
          
          <div className="prose prose-invert max-w-none">
            {privacyStatement.split('\n').map((line: string, i: number) => {
              if (line.trim() === '') return <br key={i} />;
              if (line.startsWith('# ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h2>;
              if (line.startsWith('## ')) return <h3 key={i} className="text-xl font-semibold mt-6 mb-3">{line.replace('## ', '')}</h3>;
              if (line.startsWith('- ')) return <li key={i} className="ml-4 text-gray-300">{line.replace('- ', '')}</li>;
              return <p key={i} className="text-gray-300 mb-2">{line}</p>;
            })}
          </div>

          <div className="mt-12 pt-6 border-t border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Security Commitment</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-medium">Encryption</h3>
                <p className="text-gray-400 text-sm">All data encrypted</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <h3 className="font-medium">Protection</h3>
                <p className="text-gray-400 text-sm">Industry standard security</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">👁️</div>
                <h3 className="font-medium">Privacy</h3>
                <p className="text-gray-400 text-sm">Your data, your control</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>For questions about privacy, contact our support team.</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
