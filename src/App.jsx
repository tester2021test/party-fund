import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; // <--- UNCOMMENT THIS FOR GITHUB PAGES
import { 
  Plus, 
  Users, 
  Wallet, 
  Receipt, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Home, 
  BarChart3, 
  Copy, 
  Lock, 
  Unlock, 
  Eye, 
  PieChart, 
  Tag, 
  Check, 
  Pencil, 
  AlertTriangle, 
  Printer,
  LogOut,
  Loader2,
  X as XIcon
} from 'lucide-react';

/* ==========================================================================
   🚀 DEPLOYMENT CONFIGURATION
   
   1. Run: npm install @supabase/supabase-js
   2. Uncomment the import above (Line 2).
   3. Uncomment the configuration below.
   4. Set USE_SUPABASE = true;
   ==========================================================================
*/

const supabaseUrl = 'https://aongscjdpnotrktldado.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbmdzY2pkcG5vdHJrdGxkYWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODIyMTIsImV4cCI6MjA4MTM1ODIxMn0.W5ATBqFIgMCPD80E4nwgLwTr9z5TqIbYY0oMRLYl9rY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Toggle this to TRUE after setting up Supabase locally
const USE_SUPABASE = true; 

// --- CONSTANTS ---
const EXPENSE_CATEGORIES = ['Food', 'Hotel', 'Drinks', 'Travel', 'Misc'];
const INCOME_CATEGORIES = ['Cash', 'Online', 'UPI'];
const COLORS = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#9CA3AF', '#F472B6', '#818CF8'];

// --- DATABASE HELPERS ---

const localDb = {
  generateId: () => Math.random().toString(36).substr(2, 9),
  get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
  set: (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('db-update'));
  },
  add: (key, item) => {
    const data = localDb.get(key);
    const newItem = { id: localDb.generateId(), ...item };
    localDb.set(key, [...data, newItem]);
    return newItem;
  },
  update: (key, id, updates) => {
    const data = localDb.get(key);
    localDb.set(key, data.map(i => i.id === id ? { ...i, ...updates } : i));
  },
  delete: (key, id) => {
    const data = localDb.get(key);
    localDb.set(key, data.filter(i => i.id !== id));
  }
};

const useData = (tableName, filterCol, filterVal) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (USE_SUPABASE && typeof supabase !== 'undefined') {
        let q = supabase.from(tableName).select('*');
        if (filterCol && filterVal) q = q.eq(filterCol, filterVal);
        const { data: res, error } = await q;
        if (!error) setData(res || []);
      } else {
        const all = localDb.get(`party_fund_${tableName}`);
        setData(filterCol ? all.filter(x => x[filterCol] === filterVal) : all);
      }
      setLoading(false);
    };

    fetchData();

    // Subscriptions
    let channel;
    const localHandler = () => fetchData();

    if (USE_SUPABASE && typeof supabase !== 'undefined') {
      channel = supabase.channel(`public:${tableName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, fetchData)
        .subscribe();
    } else {
      window.addEventListener('db-update', localHandler);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('db-update', localHandler);
    };
  }, [tableName, filterCol, filterVal]);

  return { data, loading };
};

// --- AUTH COMPONENT ---
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (USE_SUPABASE && typeof supabase !== 'undefined') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        // Success handled by Auth State Listener in App
      }
    } else {
      // Local Simulation
      if (email === 'admin' && password === 'admin') {
        localStorage.setItem('party_fund_user_id', 'local_admin');
        onLogin({ uid: 'local_admin', email: 'admin@local.com' });
      } else {
        setError('Offline Mode: Use admin / admin');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Sign in to access your Party Fund</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
            <input 
              type="text" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium text-center">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Sign In'}
          </button>
        </form>
        {!USE_SUPABASE && <p className="mt-6 text-center text-xs text-slate-400">Offline Mode: admin / admin</p>}
      </div>
    </div>
  );
}

// --- MAIN APP ---
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); 
  const [selectedParty, setSelectedParty] = useState(null);

  // --- AUTO-FIX STYLING ---
  useEffect(() => {
    const existingScript = document.getElementById('tailwind-cdn');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Check Active Session
    if (USE_SUPABASE && typeof supabase !== 'undefined') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      return () => subscription.unsubscribe();
    } else {
      // Local Check
      const localId = localStorage.getItem('party_fund_user_id');
      if (localId) setSession({ user: { id: localId, email: 'admin@local.com' } });
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    if (USE_SUPABASE && typeof supabase !== 'undefined') {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('party_fund_user_id');
      setSession(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading...</div>;

  if (!session) return <LoginScreen onLogin={(sess) => setSession({ user: { id: sess.uid, email: sess.email } })} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col max-w-lg mx-auto shadow-2xl border-x border-slate-200">
      
      {/* Top Bar */}
      {view !== 'detail' && (
        <header className="bg-white p-6 sticky top-0 z-10 border-b border-slate-100 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Wallet size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black leading-none text-slate-800">PartyFund</h1>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{session.user.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition-colors">
            <LogOut size={20} />
          </button>
        </header>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb- safe-bottom">
        {view === 'list' && (
          <PartyList 
            user={session.user} 
            onCreate={() => setView('create')} 
            onSelect={(p) => { setSelectedParty(p); setView('detail'); }} 
          />
        )}
        
        {view === 'create' && (
          <CreatePartyForm 
            user={session.user} 
            onCancel={() => setView('list')} 
            onSuccess={() => setView('list')} 
          />
        )}

        {view === 'detail' && selectedParty && (
          <PartyDashboard 
            user={session.user}
            party={selectedParty} 
            onBack={() => { setSelectedParty(null); setView('list'); }} 
          />
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function PartyList({ user, onCreate, onSelect }) {
  const { data: parties, loading } = useData('parties', 'adminId', user.id);
  const sorted = useMemo(() => [...parties].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)), [parties]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading your parties...</div>;

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">My Events</h2>
          <p className="text-indigo-200 mb-6 font-medium">Manage expenses with friends.</p>
          <button onClick={onCreate} className="w-full py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
            <Plus size={20} /> New Event
          </button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-lg px-2">Recent List</h3>
        {sorted.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">No events yet.</div>
        ) : (
          sorted.map(p => (
            <div key={p.id} onClick={() => onSelect(p)} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all flex justify-between items-center cursor-pointer group">
              <div>
                <h4 className="font-bold text-lg text-slate-800">{p.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-md tracking-wider">CODE: {p.shareCode}</span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ArrowLeft size={18} className="rotate-180" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CreatePartyForm({ user, onCancel, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!name.trim()) return;
    setLoading(true);
    const code = Math.random().toString(36).substring(2,8).toUpperCase();
    
    const payload = { 
      name, 
      adminId: user.id, 
      adminName: user.email.split('@')[0], 
      shareCode: code, 
      created_at: new Date().toISOString() 
    };
    
    if(USE_SUPABASE && typeof supabase !== 'undefined') {
      const { error } = await supabase.from('parties').insert([payload]);
      if (error) {
        console.error("Supabase Error:", error);
        alert("Error: " + error.message);
      }
    } else {
      localDb.add('party_fund_parties', payload);
    }
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="p-6 h-full flex flex-col justify-center animate-in zoom-in-95 duration-300">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6"><TrendingUp size={24}/></div>
        <h2 className="text-2xl font-black text-slate-800 mb-6">Create New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Event Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} autoFocus className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xl text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Goa Trip"/>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <button disabled={loading || !name} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50">{loading ? 'Creating...' : 'Create'}</button>
            <button type="button" onClick={onCancel} className="w-full py-4 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PartyDashboard({ user, party, onBack }) {
  // Data Fetching
  const { data: membersRaw } = useData('members', 'partyId', party.id);
  const { data: txs } = useData('transactions', 'partyId', party.id);
  
  const members = useMemo(() => [...membersRaw].sort((a,b) => new Date(a.created_at) - new Date(b.created_at)), [membersRaw]);
  const transactions = useMemo(() => [...txs].sort((a,b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)), [txs]);
  
  const stats = useMemo(() => {
    const spent = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + Number(t.amount), 0);
    const collected = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + Number(t.amount), 0);
    const adminPaid = transactions.filter(t => t.type === 'out' && (!t.payerId || t.payerId === 'admin')).reduce((sum, t) => sum + Number(t.amount), 0);
    return { spent, collected, balance: collected - adminPaid };
  }, [transactions]);

  const [tab, setTab] = useState('home'); // home | friends | report
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState('out');
  const [printMode, setPrintMode] = useState(false);
  
  // EDIT STATE
  const [editingTx, setEditingTx] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const isAdmin = party.adminId === user.id;

  // Settlement Logic
  const reportData = useMemo(() => {
    if(!members.length) return null;
    const balances = {}; 
    members.forEach(m => balances[m.id] = { paid: 0, share: 0, name: m.name });
    const cats = {};

    transactions.forEach(t => {
      if(t.type === 'out') {
        const amt = Number(t.amount);
        cats[t.category || 'Misc'] = (cats[t.category || 'Misc'] || 0) + amt;
        
        if(t.payerId && t.payerId !== 'admin' && balances[t.payerId]) balances[t.payerId].paid += amt;
        
        const splitIds = (t.involvedMemberIds && t.involvedMemberIds.length) ? t.involvedMemberIds : members.map(m => m.id);
        const splitAmt = amt / splitIds.length;
        splitIds.forEach(id => { if(balances[id]) balances[id].share += splitAmt; });
      } else {
        if(t.memberId && balances[t.memberId]) balances[t.memberId].paid += Number(t.amount);
      }
    });

    return {
      settlements: Object.entries(balances).map(([id, d]) => ({ id, ...d, net: d.paid - d.share })),
      categories: cats
    };
  }, [members, transactions]);

  const handleSaveTx = async (txData) => {
    // If editing
    if (editingTx) {
      if(USE_SUPABASE && typeof supabase !== 'undefined') {
        await supabase.from('transactions').update(txData).eq('id', editingTx.id);
      } else {
        localDb.update('party_fund_transactions', editingTx.id, txData);
      }
    } 
    // If creating
    else {
      const payload = { ...txData, partyId: party.id, date: new Date().toISOString(), created_at: new Date().toISOString() };
      if(USE_SUPABASE && typeof supabase !== 'undefined') await supabase.from('transactions').insert([payload]);
      else localDb.add('party_fund_transactions', payload);
    }
    setShowTxModal(false);
    setEditingTx(null);
  };

  const confirmDeleteTx = async () => {
    if (!deleteId) return;
    if(USE_SUPABASE && typeof supabase !== 'undefined') await supabase.from('transactions').delete().eq('id', deleteId);
    else localDb.delete('party_fund_transactions', deleteId);
    setDeleteId(null);
  };

  if(printMode) return <PrintView party={party} stats={stats} report={reportData} onClose={()=>setPrintMode(false)}/>;

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Transaction Delete Modal */}
      {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95">
                  <div className="flex items-center text-rose-600 mb-3"><AlertTriangle className="w-8 h-8 mr-2"/><h3 className="text-xl font-bold">Delete?</h3></div>
                  <p className="text-gray-600 mb-6">Are you sure you want to remove this transaction?</p>
                  <div className="flex gap-3">
                      <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-700">Cancel</button>
                      <button onClick={confirmDeleteTx} className="flex-1 py-3 bg-rose-600 rounded-xl font-bold text-white shadow-lg">Delete</button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="bg-slate-800 text-white p-6 rounded-b-[2.5rem] shadow-xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="p-2 bg-white/10 rounded-xl hover:bg-white/20"><ArrowLeft size={20}/></button>
          <div onClick={()=>setPrintMode(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20">
            <Printer size={14}/> <span className="text-xs font-bold">PDF Report</span>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-3xl font-black mb-1">{party.name}</h2>
          <div className="inline-block bg-emerald-500/20 px-3 py-1 rounded-full text-emerald-300 text-xs font-bold tracking-wide border border-emerald-500/30">CODE: {party.shareCode}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Total Spent</div>
            <div className="text-xl font-bold">₹{stats.spent}</div>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Cash in Hand</div>
            <div className="text-xl font-bold">₹{stats.balance}</div>
          </div>
        </div>
      </div>

      {/* Main Scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-28">
        {tab === 'home' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Action Buttons (Only for Admin) */}
            {isAdmin ? (
              <div className="grid grid-cols-2 gap-4 mb-2">
                <button onClick={()=>{setEditingTx(null); setTxType('in');setShowTxModal(true)}} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-all">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><TrendingUp size={20}/></div>
                  <span className="font-bold text-slate-700 text-sm">Income</span>
                </button>
                <button onClick={()=>{setEditingTx(null); setTxType('out');setShowTxModal(true)}} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-all">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center"><TrendingDown size={20}/></div>
                  <span className="font-bold text-slate-700 text-sm">Expense</span>
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm font-bold flex items-center gap-2 mb-4">
                <Lock size={16}/> View Only Mode
              </div>
            )}

            <div className="flex justify-between items-end px-1">
              <h3 className="font-bold text-slate-800">Transactions</h3>
              <span className="text-xs font-bold text-slate-400">{transactions.length} total</span>
            </div>

            {transactions.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type==='in'?'bg-emerald-100 text-emerald-600':'bg-rose-100 text-rose-600'}`}>
                    {t.type==='in'?<TrendingUp size={18}/>:<Receipt size={18}/>}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{t.description}</div>
                    <div className="text-xs text-slate-400">
                      {t.type==='in' ? `From: ${t.memberName}` : `Paid by: ${t.payerName || 'Fund'}`}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`font-bold ${t.type==='in'?'text-emerald-600':'text-slate-800'}`}>
                    {t.type==='in'?'+':'-'}₹{t.amount}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingTx(t); setTxType(t.type); setShowTxModal(true); }} className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600"><Pencil size={14}/></button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600"><Trash2 size={14}/></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {transactions.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No transactions yet</div>}
          </div>
        )}

        {tab === 'friends' && (
          <MembersManager user={user} partyId={party.id} members={members} isAdmin={isAdmin} USE_SUPABASE={USE_SUPABASE} />
        )}

        {tab === 'report' && reportData && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart size={18}/> Categories</h3>
              <div className="space-y-3">
                {Object.entries(reportData.categories).map(([cat, val], i) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs font-bold mb-1 text-slate-600"><span>{cat}</span><span>₹{val}</span></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width: `${(val/stats.spent)*100}%`, background: COLORS[i%COLORS.length]}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 px-1">Settlement</h3>
              {reportData.settlements.map(s => (
                <div key={s.id} className={`p-4 rounded-2xl border-l-4 shadow-sm bg-white ${s.net >= 0 ? 'border-emerald-500' : 'border-rose-500'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{s.name}</span>
                    <span className={`font-black ${s.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {s.net >= 0 ? '+' : ''}{Math.round(s.net)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-wide">
                    <span>Paid: {Math.round(s.paid)}</span>
                    <span>Share: {Math.round(s.share)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="fixed bottom-0 w-full max-w-lg bg-white border-t border-slate-200 p-2 flex justify-around pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {['home', 'friends', 'report'].map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`p-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${tab===t ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}>
            {t==='home' && <Home size={24} strokeWidth={tab===t?3:2}/>}
            {t==='friends' && <Users size={24} strokeWidth={tab===t?3:2}/>}
            {t==='report' && <PieChart size={24} strokeWidth={tab===t?3:2}/>}
            <span className="text-[10px] font-bold uppercase tracking-wider">{t}</span>
          </button>
        ))}
      </div>

      {/* Tx Modal */}
      {showTxModal && (
        <TransactionModal 
          type={txType} 
          members={members} 
          initialData={editingTx}
          onClose={()=>{setShowTxModal(false); setEditingTx(null);}} 
          onSave={handleSaveTx} 
        />
      )}
    </div>
  );
}

function TransactionModal({ type, members, onClose, onSave, initialData }) {
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('');
  const [who, setWho] = useState(''); // MemberID
  
  // Custom Category State
  const [customCat, setCustomCat] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);

  // Split Logic State
  const [splitMode, setSplitMode] = useState('all'); // 'all' | 'select'
  const [selectedSplitIds, setSelectedSplitIds] = useState(new Set());

  // Load data if editing
  useEffect(() => {
    if (initialData) {
      setAmt(initialData.amount);
      setCat(initialData.category);
      if (initialData.type === 'in') {
        setWho(initialData.memberId);
      } else {
        // Expense is always Fund now
        // Load split data
        if (initialData.involvedMemberIds && initialData.involvedMemberIds.length > 0) {
           if (initialData.involvedMemberIds.length !== members.length) {
             setSplitMode('select');
             setSelectedSplitIds(new Set(initialData.involvedMemberIds));
           } else {
             setSplitMode('all');
             setSelectedSplitIds(new Set(members.map(m=>m.id)));
           }
        }
      }
    } else {
      setCat(type==='in'?'Cash':'Food');
      setWho('');
      setSplitMode('all');
      setSelectedSplitIds(new Set(members.map(m=>m.id)));
    }
  }, [initialData, type, members]);

  const toggleSplitId = (id) => {
    const next = new Set(selectedSplitIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSplitIds(next);
  };

  const handleSave = () => {
    if(!amt) return;
    const finalCat = isCustomCat ? customCat : cat;
    if (!finalCat) return alert("Please select or enter a category");

    const payload = { type, amount: parseFloat(amt), category: finalCat, description: finalCat };
    
    if(type === 'in') {
      if(!who) return alert("Select who gave money");
      const mem = members.find(m => m.id === who);
      payload.memberId = who;
      payload.memberName = mem.name;
    } else {
      // Expense: Always paid by Admin/Fund
      payload.payerId = 'admin';
      payload.payerName = 'Fund';
      
      // Handle Split
      if (splitMode === 'select') {
        if (selectedSplitIds.size === 0) return alert("Please select at least one person to split with");
        payload.involvedMemberIds = Array.from(selectedSplitIds);
      } else {
        payload.involvedMemberIds = members.map(m => m.id);
      }
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <h3 className={`text-xl font-black mb-6 ${type==='in'?'text-emerald-600':'text-rose-600'}`}>
          {initialData ? 'Edit Transaction' : (type==='in' ? 'Add Income' : 'Add Expense')}
        </h3>
        
        <div className="space-y-5">
          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Amount</label>
            <input type="number" autoFocus value={amt} onChange={e=>setAmt(e.target.value)} className="w-full text-3xl font-black text-slate-800 border-b-2 border-slate-100 focus:border-slate-800 outline-none py-2" placeholder="0"/>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
            {isCustomCat ? (
              <div className="flex gap-2 mt-2">
                <input value={customCat} onChange={e=>setCustomCat(e.target.value)} className="flex-1 border-b-2 border-indigo-500 py-1 font-bold outline-none" placeholder="Type category..." autoFocus/>
                <button onClick={()=>setIsCustomCat(false)} className="p-2 bg-slate-100 rounded-full text-slate-500"><XIcon size={16}/></button>
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 mt-2 no-scrollbar">
                {(type==='in'?INCOME_CATEGORIES:EXPENSE_CATEGORIES).map(c => (
                  <button key={c} onClick={()=>setCat(c)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${cat===c ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500'}`}>{c}</button>
                ))}
                {type === 'out' && (
                  <button onClick={()=>setIsCustomCat(true)} className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border border-indigo-100 bg-indigo-50 text-indigo-600">+ New</button>
                )}
              </div>
            )}
          </div>

          {/* Income Source */}
          {type === 'in' && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">From Whom?</label>
              <select value={who} onChange={e=>setWho(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none">
                <option value="">Select Friend...</option>
                {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}

          {/* Expense Logic - SIMPLIFIED: No Payer Selection, Only Split */}
          {type === 'out' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Split With</label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                  <button onClick={()=>setSplitMode('all')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${splitMode==='all'?'bg-white shadow text-slate-800':'text-slate-400'}`}>Everyone</button>
                  <button onClick={()=>setSplitMode('select')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${splitMode==='select'?'bg-white shadow text-slate-800':'text-slate-400'}`}>Select</button>
                </div>
              </div>
              
              {splitMode === 'select' && (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-100 p-2 rounded-xl">
                  {members.map(m => {
                    const isSel = selectedSplitIds.has(m.id);
                    return (
                      <div key={m.id} onClick={()=>toggleSplitId(m.id)} className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${isSel ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'}`}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSel?'bg-indigo-500 border-indigo-500':'border-slate-300'}`}>
                          {isSel && <Check size={10} className="text-white"/>}
                        </div>
                        {m.name}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={onClose} className="py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} className={`py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all ${type==='in'?'bg-emerald-500 shadow-emerald-200':'bg-rose-500 shadow-rose-200'}`}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersManager({ user, partyId, members, isAdmin, USE_SUPABASE }) {
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [deleteMemberId, setDeleteMemberId] = useState(null);
  const [editName, setEditName] = useState('');

  const addMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const payload = { partyId, name: newMemberName, created_at: new Date().toISOString() };
    if (USE_SUPABASE && typeof supabase !== 'undefined') await supabase.from('members').insert([payload]);
    else localDb.add('party_fund_members', payload);
    setNewMemberName('');
  };

  const startEdit = (member) => { setEditingMember(member); setEditName(member.name); };
  const saveEdit = async () => {
    if (!editingMember || !editName.trim()) return;
    if (USE_SUPABASE && typeof supabase !== 'undefined') await supabase.from('members').update({ name: editName.trim() }).eq('id', editingMember.id);
    else localDb.update('party_fund_members', editingMember.id, { name: editName.trim() });
    setEditingMember(null); setEditName('');
  };

  const confirmDeleteMember = async () => {
    if (!deleteMemberId) return;
    if (USE_SUPABASE && typeof supabase !== 'undefined') await supabase.from('members').delete().eq('id', deleteMemberId);
    else localDb.delete('party_fund_members', deleteMemberId);
    setDeleteMemberId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Edit Friend</h3>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4 focus:border-indigo-500 outline-none" autoFocus/>
            <div className="flex gap-3">
              <button onClick={() => setEditingMember(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-700">Cancel</button>
              <button onClick={saveEdit} className="flex-1 py-3 bg-indigo-600 rounded-xl font-bold text-white">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteMemberId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <div className="flex items-center text-rose-600 mb-3"><AlertTriangle className="w-8 h-8 mr-2"/><h3 className="text-xl font-bold">Remove Friend?</h3></div>
            <p className="text-gray-600 mb-6">Are you sure?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteMemberId(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-700">Cancel</button>
              <button onClick={confirmDeleteMember} className="flex-1 py-3 bg-rose-600 rounded-xl font-bold text-white">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-3">Add Friend</h3>
          <form onSubmit={addMember} className="flex gap-2">
            <input value={newMemberName} onChange={(e)=>setNewMemberName(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none" placeholder="Name..."/>
            <button className="bg-indigo-600 text-white px-4 rounded-xl"><Plus/></button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {members.map(m => (
          <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                {m.name.substring(0,2).toUpperCase()}
              </div>
              <span className="font-bold text-slate-700">{m.name}</span>
            </div>
            {isAdmin && (
              <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(m)} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg"><Pencil size={16}/></button>
                <button onClick={() => setDeleteMemberId(m.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 size={16}/></button>
              </div>
            )}
          </div>
        ))}
        {members.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No friends added yet.</div>}
      </div>
    </div>
  );
}

function PrintView({ party, stats, report, onClose }) {
  if(!report) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden sticky top-0">
        <button onClick={onClose} className="font-bold">Close</button>
        <button onClick={()=>window.print()} className="bg-blue-600 px-4 py-2 rounded-lg font-bold">Print</button>
      </div>
      <div className="p-10 max-w-3xl mx-auto text-slate-900">
        <h1 className="text-4xl font-black mb-2">{party.name}</h1>
        <p className="text-slate-500 mb-8 border-b pb-8">Generated: {new Date().toLocaleDateString()}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center"><div className="text-xs font-bold uppercase text-slate-400">Collected</div><div className="text-3xl font-black text-emerald-600">₹{stats.collected}</div></div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center"><div className="text-xs font-bold uppercase text-slate-400">Spent</div><div className="text-3xl font-black text-rose-600">₹{stats.spent}</div></div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center"><div className="text-xs font-bold uppercase text-slate-400">Balance</div><div className="text-3xl font-black text-blue-600">₹{stats.balance}</div></div>
        </div>

        <h3 className="font-bold text-xl border-b pb-2 mb-4">Final Settlement</h3>
        <table className="w-full text-sm text-left">
          <thead><tr className="text-slate-400"><th className="pb-2">Friend</th><th className="pb-2 text-right">Contribution</th><th className="pb-2 text-right">Cost Share</th><th className="pb-2 text-right">Net Balance</th></tr></thead>
          <tbody className="divide-y">
            {report.settlements.map(s => (
              <tr key={s.id}>
                <td className="py-3 font-bold">{s.name}</td>
                <td className="py-3 text-right">₹{s.paid}</td>
                <td className="py-3 text-right">₹{Math.round(s.share)}</td>
                <td className={`py-3 text-right font-black ${s.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {s.net >= 0 ? '+' : ''}{Math.round(s.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
