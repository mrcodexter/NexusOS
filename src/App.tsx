import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Cpu, 
  Globe, 
  Zap, 
  Lock, 
  Database, 
  Users, 
  Activity, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  Terminal,
  Layers,
  Code,
  Network,
  Fingerprint,
  Wallet,
  Coins,
  ArrowUpRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface Proposal {
  id: number;
  title: string;
  votes: number;
  status: string;
}

interface ADNStats {
  users: number;
  totalValueLocked: number;
  activeAgents: number;
  governanceProposals: Proposal[];
}

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const StatItem = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) => (
  <div className="flex items-center gap-4 p-4">
    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full ${
      active 
        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<ADNStats | null>(null);
  const [whitepaper, setWhitepaper] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchWhitepaper();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  const fetchWhitepaper = async () => {
    try {
      const res = await fetch('/src/whitepaper.md');
      const text = await res.text();
      setWhitepaper(text);
    } catch (e) {
      console.error("Failed to fetch whitepaper", e);
    }
  };

  const handleVote = async (id: number) => {
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: id })
      });
      if (res.ok) fetchStats();
    } catch (e) {
      console.error("Vote failed", e);
    }
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userMsg = aiMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiMessage('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "You are the NexusOS Core AI Agent. You manage user memory and financial workflows for the Autonomous Digital Nation. Be professional, technical, and helpful. Reference the 19-in-1 integration when relevant."
        }
      });
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "I'm processing your request." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Error connecting to Nexus Core." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      {/* Sidebar / Navigation */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-black/50 backdrop-blur-2xl border-r border-white/5 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Layers size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">NexusOS</h1>
          </div>

          <nav className="space-y-2">
            <NavItem icon={Activity} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={Globe} label="Architecture" active={activeTab === 'architecture'} onClick={() => setActiveTab('architecture')} />
            <NavItem icon={Cpu} label="AI Agent" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
            <NavItem icon={Shield} label="Security Vault" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
            <NavItem icon={Users} label="Governance" active={activeTab === 'governance'} onClick={() => setActiveTab('governance')} />
            <NavItem icon={FileText} label="Whitepaper" active={activeTab === 'whitepaper'} onClick={() => setActiveTab('whitepaper')} />
            <NavItem icon={Code} label="Contracts" active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} />
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Sovereign User</p>
              <p className="text-xs text-zinc-500 truncate">0x71C...4f2a</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen p-6 lg:p-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight capitalize">{activeTab}</h2>
            <p className="text-zinc-500 mt-1">Autonomous Digital Nation Control Center</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-zinc-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Network Online
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <GlassCard className="col-span-full lg:col-span-2 p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-white">ADN Network Status</h3>
                      <p className="text-zinc-500">Real-time metrics from the Sovereign Hub</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">FLOW</div>
                      <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">NEAR</div>
                      <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">EVM</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatItem label="Total Citizens" value={stats?.users || 0} icon={Users} />
                    <StatItem label="TVL (USD)" value={`$${(stats?.totalValueLocked || 0).toLocaleString()}`} icon={Coins} />
                    <StatItem label="Active Agents" value={stats?.activeAgents || 0} icon={Cpu} />
                  </div>

                  <div className="mt-10 pt-10 border-t border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-semibold text-white">Recent Activity</h4>
                      <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        View Ledger <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <Zap size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Cross-Chain Sync Executed</p>
                            <p className="text-xs text-zinc-500">Chain ID: 101 • Root: 0x82...f91a</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-mono text-emerald-400">+0.002s</p>
                            <p className="text-[10px] text-zinc-600 uppercase">Finalized</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                <div className="space-y-6">
                  <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="text-indigo-400" />
                      <h3 className="font-bold text-white">Security Protocol</h3>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Zero-Trust architecture active. All data vaults are encrypted with post-quantum algorithms.
                    </p>
                    <button className="mt-6 w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors">
                      Audit Vaults
                    </button>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <h3 className="font-bold text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Wallet, label: 'Bridge' },
                        { icon: Fingerprint, label: 'Identity' },
                        { icon: Network, label: 'VPN' },
                        { icon: Database, label: 'Storage' }
                      ].map((action, i) => (
                        <button key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <action.icon size={20} className="text-zinc-400" />
                          <span className="text-xs font-medium">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {activeTab === 'architecture' && (
              <div className="space-y-8">
                <GlassCard className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">The 19-in-1 Integration Map</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Consumer DeFi", chain: "Flow", desc: "Savings & Subscriptions" },
                      { title: "AI Intelligence", chain: "NEAR", desc: "Agent-driven workflows" },
                      { title: "Cross-Chain", chain: "EVM", desc: "Settlement & Liquidity" },
                      { title: "Governance", chain: "DAO", desc: "Quadratic Funding" },
                      { title: "Identity", chain: "DID", desc: "Self-Sovereign ID" },
                      { title: "Privacy", chain: "ZKP", desc: "Zero-Knowledge Vaults" },
                      { title: "Storage", chain: "IPFS", desc: "Encrypted User Files" },
                      { title: "Networking", chain: "P2P", desc: "Decentralized VPN" },
                      { title: "Social Graph", chain: "ADN", desc: "Relationship Mapping" }
                    ].map((item, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase">{item.chain}</span>
                          <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-zinc-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="max-w-4xl mx-auto">
                <GlassCard className="h-[600px] flex flex-col">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Cpu size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Nexus Core AI</h3>
                        <p className="text-xs text-emerald-400">Active • NEAR Protocol</p>
                      </div>
                    </div>
                    <button className="p-2 text-zinc-500 hover:text-white"><Terminal size={20} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatHistory.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 mb-4">
                          <MessageSquare size={32} />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Welcome to Nexus Core</h4>
                        <p className="text-sm text-zinc-500 max-w-xs">
                          I am your sovereign AI agent. I manage your memory, automate your DeFi workflows, and secure your digital assets.
                        </p>
                      </div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === 'user' 
                            ? 'bg-indigo-500 text-white rounded-tr-none' 
                            : 'bg-white/10 text-zinc-200 rounded-tl-none border border-white/5'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/5">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAiChat} className="p-6 border-t border-white/10 flex gap-4">
                    <input 
                      type="text" 
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      placeholder="Ask your agent to manage workflows..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button type="submit" className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors">
                      Send
                    </button>
                  </form>
                </GlassCard>
              </div>
            )}

            {activeTab === 'governance' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-xl font-bold text-white mb-4">Active Proposals</h3>
                  {stats?.governanceProposals.map(proposal => (
                    <GlassCard key={proposal.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              proposal.status === 'Active' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {proposal.status}
                            </span>
                            <span className="text-xs text-zinc-500">Proposal #{proposal.id}</span>
                          </div>
                          <h4 className="text-lg font-bold text-white">{proposal.title}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{proposal.votes}</p>
                          <p className="text-xs text-zinc-500 uppercase tracking-widest">Votes</p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((proposal.votes / 1500) * 100, 100)}%` }}
                          className="h-full bg-indigo-500" 
                        />
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleVote(proposal.id)}
                          className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-colors"
                        >
                          Vote For
                        </button>
                        <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors">
                          Abstain
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>

                <div className="space-y-6">
                  <GlassCard className="p-6">
                    <h3 className="font-bold text-white mb-4">Quadratic Funding</h3>
                    <p className="text-sm text-zinc-400 mb-6">
                      NexusOS uses quadratic funding to ensure fair resource allocation for public goods within the ADN.
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-zinc-500">Matching Pool</span>
                          <span className="text-white font-mono">50,000 FLOW</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full">
                          <div className="w-3/4 h-full bg-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <h3 className="font-bold text-white mb-4">Delegation Market</h3>
                    <p className="text-sm text-zinc-400 mb-4">Delegate your voting power to specialized AI agents or expert citizens.</p>
                    <button className="w-full py-3 rounded-xl border border-indigo-500/30 text-indigo-400 font-bold text-sm hover:bg-indigo-500/10 transition-colors">
                      Browse Delegates
                    </button>
                  </GlassCard>
                </div>
              </div>
            )}

            {activeTab === 'whitepaper' && (
              <div className="max-w-4xl mx-auto">
                <GlassCard className="p-10 prose prose-invert prose-indigo max-w-none">
                  <ReactMarkdown>{whitepaper}</ReactMarkdown>
                </GlassCard>
              </div>
            )}

            {activeTab === 'contracts' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['NexusSettlement.sol', 'NexusDeFi.cdc', 'NexusAI.rs'].map(file => (
                    <button key={file} className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:border-indigo-500 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Code size={16} className="text-indigo-400" />
                        <span className="text-sm font-medium text-white">{file}</span>
                      </div>
                      <p className="text-xs text-zinc-500">Master Smart Contract</p>
                    </button>
                  ))}
                </div>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Source Code Preview</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-xl p-6 font-mono text-xs overflow-x-auto text-indigo-300 leading-relaxed">
                    <pre>{`// NexusOS Core Initializer
async function initializeADN() {
  const flow = await Flow.connect(CONFIG.FLOW_ENDPOINT);
  const near = await Near.connect(CONFIG.NEAR_ENDPOINT);
  const evm = await EVM.connect(CONFIG.EVM_ENDPOINT);

  console.log("NexusOS: Sovereign Hub Online");
  console.log("Integrating 19 Challenge Categories...");
  
  await Promise.all([
    flow.deploy(NexusDeFi),
    near.deploy(NexusAI),
    evm.deploy(NexusSettlement)
  ]);

  return { status: "Sovereign" };
}`}</pre>
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                    <Lock size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Decentralized Data Vaults</h3>
                  <p className="text-zinc-400 leading-relaxed mb-8">
                    Your data is sharded and encrypted using AES-256-GCM before being distributed across the IPFS/Filecoin network. Only your sovereign key can reconstruct the shards.
                  </p>
                  <div className="space-y-4">
                    {[
                      { label: "Identity Vault", status: "Locked", icon: Fingerprint },
                      { label: "Financial Records", status: "Locked", icon: Coins },
                      { label: "AI Memory Shards", status: "Locked", icon: Database }
                    ].map((vault, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <vault.icon size={20} className="text-zinc-500" />
                          <span className="font-medium text-white">{vault.label}</span>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">{vault.status}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                    <Network size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">P2P VPN Infrastructure</h3>
                  <p className="text-zinc-400 leading-relaxed mb-8">
                    NexusOS routes your traffic through a decentralized mesh of sovereign nodes. No central server, no logs, total privacy.
                  </p>
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center py-6">
                      <div className="text-4xl font-bold text-white mb-2">1,240</div>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest">Active Mesh Nodes</div>
                      <button className="mt-8 px-8 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-colors">
                        Connect to Mesh
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
