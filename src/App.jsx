import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Scale, CheckCircle, Trash2, Pencil, X, Wallet, Share2, Calendar, MessageSquare, AlertTriangle, Users, DollarSign, ArrowDownRight, ArrowUpRight, Upload, ChevronLeft, ChevronRight, Download, RefreshCw, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DEFAULT_BUDGET = 100000000;
const DEFAULT_EXPENSES = [
  { id: 1, name: 'ຄ່າສະຖານທີ່ ແລະ ໂຮງແຮມ', originalAmount: 50000000, deposit: 20000000, currency: 'LAK', rate: 1, category: 'ສະຖານທີ່', dueDate: '2026-06-15' },
  { id: 2, name: 'ຄ່າອໍແກໄນເຊີຈັດຕົບແຕ່ງງານ', originalAmount: 20000, deposit: 5000, currency: 'THB', rate: 750, category: 'ຕົບແຕ່ງ', dueDate: '2026-06-25' },
];
const DEFAULT_COMPARE_GROUPS = [
  {
    id: 1,
    serviceName: 'ຄ່າຊຸດເຈົ້າສາວ ແລະ ເຈົ້າບ່າວ',
    options: [
      { id: 101, storeName: 'ຮ້ານ ວຽງຈັນ ເວດດິ້ງ', price: 13000000, currency: 'LAK', rate: 1, note: 'ມີຄ່າມັດຈຳ 50%' },
      { id: 102, storeName: 'ຮ້ານ ອາເລັກ', price: 12500000, currency: 'LAK', rate: 1, note: 'ລວມເຄື່ອງປະດັບ' },
    ]
  }
];
const DEFAULT_TIMELINE = [
  { id: 'manual_1', date: '2026-06-05', activity: 'ໄປລອງຊຸດແຕ່ງງານ ແລະ ເລືອກແບບທີ່ຊອບ', responsible: 'ເຈົ້າສາວ-ເຈົ້າບ່າວ', comment: 'ຮ້ານວຽງຈັນເວດດິ້ງນัด 10 ໂມງເຊົ້າ', isDone: true, isAuto: false }
];
const DEFAULT_GUESTS = [
  { id: 1, name: 'ທ່ານ ສົມພອນ ພອນປະເສີດ', amount: 500000, relation: 'ໝູ່ຝັ່ງເຈົ້າບ່າວ', note: 'ມາງານໄດ້' },
  { id: 2, name: 'ນາງ ລັດດາ ກອນສິນ', amount: 300000, relation: 'ໝູ່ຝັ່ງເຈົ້າສາວ', note: 'ຝາກຊອງມາ' },
  { id: 3, name: 'ທ້າວ ຄອນສະຫວັນ', amount: 200000, relation: 'ໝູ່ຝັ່ງເຈົ້າບ່າວ', note: 'ມາງານໄດ້' }
];

const CATEGORY_COLORS = {
  'ສະຖານທີ່': '#6366f1',
  'ອາຫານ': '#f59e0b',
  'ຕົບແຕ່ງ': '#ec4899',
  'ເຄື່ອງນຸ່ງ/ແຕ່ງໜ້າ': '#8b5cf6',
  'ອື່ນໆ': '#64748b',
};

function App() {
  const getInitialData = (key, defaultValue) => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedData = params.get('data');
      if (sharedData) {
        const decoded = JSON.parse(decodeURIComponent(atob(sharedData)));
        if (decoded[key] !== undefined) {
          localStorage.setItem(`wedding_${key}`, JSON.stringify(decoded[key]));
          return decoded[key];
        }
      }
      const saved = localStorage.getItem(`wedding_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const [totalBudget, setTotalBudget] = useState(() => getInitialData('total_budget', DEFAULT_BUDGET));
  const [expenses, setExpenses] = useState(() => getInitialData('expenses', DEFAULT_EXPENSES));
  const [compareGroups, setCompareGroups] = useState(() => getInitialData('compare_groups', DEFAULT_COMPARE_GROUPS));
  const [timeline, setTimeline] = useState(() => getInitialData('timeline', DEFAULT_TIMELINE));
  const [guests, setGuests] = useState(() => getInitialData('guests', DEFAULT_GUESTS));

  // Currency rate state
  const [thbRate, setThbRate] = useState(() => {
    const saved = localStorage.getItem('wedding_thb_rate');
    return saved ? parseFloat(saved) : 750;
  });
  const [rateLoading, setRateLoading] = useState(false);
  const [rateLastUpdated, setRateLastUpdated] = useState(() => localStorage.getItem('wedding_rate_updated') || null);

  useEffect(() => { localStorage.setItem('wedding_total_budget', JSON.stringify(totalBudget)); }, [totalBudget]);
  useEffect(() => { localStorage.setItem('wedding_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('wedding_compare_groups', JSON.stringify(compareGroups)); }, [compareGroups]);
  useEffect(() => { localStorage.setItem('wedding_timeline', JSON.stringify(timeline)); }, [timeline]);
  useEffect(() => { localStorage.setItem('wedding_guests', JSON.stringify(guests)); }, [guests]);

  // -------------------------------------------------------------------------
  // 💱 Phase 3: Currency Fetcher (ExchangeRate-API)
  // -------------------------------------------------------------------------
  const fetchThbRate = useCallback(async () => {
    setRateLoading(true);
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/THB');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      const lakPerThb = data.rates?.LAK;
      if (lakPerThb && lakPerThb > 0) {
        setThbRate(Math.round(lakPerThb));
        const now = new Date().toLocaleString('lo-LA');
        setRateLastUpdated(now);
        localStorage.setItem('wedding_thb_rate', Math.round(lakPerThb).toString());
        localStorage.setItem('wedding_rate_updated', now);
      } else {
        alert('⚠️ ບໍ່ສາມາດດຶງ Rate ໄດ້, ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.');
      }
    } catch (e) {
      alert('❌ ເຊື່ອມຕໍ່ API ບໍ່ສຳເລັດ. ກວດສອບອິນເຕີເນັດ ຫຼືລອງໃໝ່.');
    } finally {
      setRateLoading(false);
    }
  }, []);

  const handleShareLink = () => {
    try {
      const dataToShare = { total_budget: totalBudget, expenses, compare_groups: compareGroups, timeline, guests };
      const base64Data = btoa(encodeURIComponent(JSON.stringify(dataToShare)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${base64Data}`;
      navigator.clipboard.writeText(shareUrl);
      alert("💍 ກັອບປີ້ລິ້ງຂໍ້ມູນສຳເລັດແລ້ວ!");
    } catch (e) {
      alert("ບໍ່ສາມາດສ້າງລິ້ງໄດ້");
    }
  };

  // -------------------------------------------------------------------------
  // 📥 Phase 3: Export Data (JSON & CSV)
  // -------------------------------------------------------------------------
  const handleExportJSON = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      totalBudget,
      expenses,
      compareGroups,
      timeline,
      guests,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding-budget-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const safeExp = Array.isArray(expenses) ? expenses : [];
    const rows = [
      ['ລາຍການ', 'ໝວດໝູ່', 'ຈຳນວນ (ເດີມ)', 'ສະກຸນ', 'Rate', 'ລວມ (ກີບ)', 'ມັດຈຳ (ກີບ)', 'ຄ້າງຈ່າຍ (ກີບ)', 'ກຳນົດຈ່າຍ'],
      ...safeExp.map(item => {
        const lak = item.currency === 'THB' ? item.originalAmount * item.rate : item.originalAmount;
        const dep = item.currency === 'THB' ? (item.deposit || 0) * item.rate : (item.deposit || 0);
        return [item.name, item.category, item.originalAmount, item.currency, item.rate, lak, dep, lak - dep, item.dueDate || ''];
      })
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------------------
  // 📅 Timeline Logic
  // -------------------------------------------------------------------------
  const [tlDate, setTlDate] = useState('');
  const [tlActivity, setTlActivity] = useState('');
  const [tlResponsible, setTlResponsible] = useState('');
  const [tlComment, setTlComment] = useState('');
  const [editingTimelineId, setEditingTimelineId] = useState(null);

  const handleAddTimeline = (e) => {
    e.preventDefault(); if (!tlDate || !tlActivity) return;
    if (editingTimelineId) {
      setTimeline(timeline.map(item => item.id === editingTimelineId ? { ...item, date: tlDate, activity: tlActivity, responsible: tlResponsible || 'ບໍ່ລະບຸ', comment: tlComment } : item));
      setEditingTimelineId(null);
    } else {
      setTimeline([...timeline, { id: 'manual_' + Date.now(), date: tlDate, activity: tlActivity, responsible: tlResponsible || 'ບໍ່ລະບຸ', comment: tlComment, isDone: false, isAuto: false }]);
    }
    clearTimelineForm();
  };

  const clearTimelineForm = () => { setTlDate(''); setTlActivity(''); setTlResponsible(''); setTlComment(''); setEditingTimelineId(null); };
  const handleEditTimelineClick = (item) => {
    if (item.isAuto) { alert("💡 ແຜນງານນີ້ຖືກສ້າງອັດຕະໂນມັດ."); return; }
    setEditingTimelineId(item.id); setTlDate(item.date || ''); setTlActivity(item.activity || ''); setTlResponsible(item.responsible === 'ບໍ່ລະບຸ' ? '' : item.responsible || ''); setTlComment(item.comment || '');
  };
  const handleDeleteTimeline = (id, isAuto) => {
    if (isAuto) { alert("💡 ແຜນງານນີ້ຜູກໄວ້ກັບລາຍຈ່າຍ."); return; }
    if (editingTimelineId === id) clearTimelineForm();
    setTimeline(timeline.filter(item => item.id !== id));
  };
  const toggleTimelineDone = (id) => { setTimeline(timeline.map(item => item.id === id ? { ...item, isDone: !item.isDone } : item)); };
  const checkUrgencyStatus = (targetDateStr, isDone) => {
    if (isDone || !targetDateStr) return { shouldAlert: false, text: '' };
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const targetDate = new Date(targetDateStr); targetDate.setHours(0, 0, 0, 0);
      if (isNaN(targetDate.getTime())) return { shouldAlert: false, text: '' };
      const diffTime = targetDate - today; const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return { shouldAlert: true, isOverdue: true, text: `⚠️ ກາຍກຳນົດ ${Math.abs(diffDays)} ມື້!` };
      if (diffDays <= 2) return { shouldAlert: true, isOverdue: false, text: `⏰ ເຫຼືອ ${diffDays} ມື້!` };
      return { shouldAlert: false, text: '' };
    } catch (err) { return { shouldAlert: false, text: '' }; }
  };

  // -------------------------------------------------------------------------
  // ⚙️ Expense Logic
  // -------------------------------------------------------------------------
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDeposit, setNewExpenseDeposit] = useState('');
  const [newExpenseCurrency, setNewExpenseCurrency] = useState('LAK');
  const [newExpenseRate, setNewExpenseRate] = useState('750');
  const [newExpenseCategory, setNewExpenseCategory] = useState('ສະຖານທີ່');
  const [newExpenseDueDate, setNewExpenseDueDate] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const handleAddExpense = (e) => {
    e.preventDefault(); if (!newExpenseName || !newExpenseAmount) return;
    const expenseId = editingExpenseId || Date.now();
    const amount = parseFloat(newExpenseAmount); const deposit = parseFloat(newExpenseDeposit) || 0;
    const currentRate = newExpenseCurrency === 'THB' ? parseFloat(newExpenseRate) || thbRate : 1;
    let finalCategory = newExpenseCategory; if (newExpenseCategory === 'ອື່ນໆ') finalCategory = customCategory.trim() || 'ຄ່າໃຊ້ຈ່າຍອື່ນໆ';
    const updatedExpenseItem = { id: expenseId, name: newExpenseName, originalAmount: amount, deposit: deposit, currency: newExpenseCurrency, rate: currentRate, category: finalCategory, dueDate: newExpenseDueDate };
    let nextExpenses = [];
    if (editingExpenseId) { nextExpenses = expenses.map(item => item.id === editingExpenseId ? updatedExpenseItem : item); }
    else { nextExpenses = [...expenses, updatedExpenseItem]; }
    setExpenses(nextExpenses);
    if (newExpenseDueDate) {
      const autoTimelineId = `auto_${expenseId}`; const remingPay = amount - deposit; const currencySymbol = newExpenseCurrency === 'THB' ? '฿' : '₭';
      const autoTimelineItem = { id: autoTimelineId, date: newExpenseDueDate, activity: `💰 [ລາຍຈ່າຍ] ຈ່າຍສ່ວນເຫຼືອ: ${newExpenseName}`, responsible: 'ຝ່າຍການເງິນ', comment: `ມັດຈຳແລ້ວ: ${currencySymbol}${deposit.toLocaleString()} | ຄ້າງຈ່າຍ: ${currencySymbol}${remingPay.toLocaleString()}`, isDone: remingPay <= 0, isAuto: true };
      if (timeline.some(t => t.id === autoTimelineId)) { setTimeline(timeline.map(t => t.id === autoTimelineId ? { ...autoTimelineItem, isDone: remingPay <= 0 ? true : t.isDone } : t)); }
      else { setTimeline([...timeline, autoTimelineItem]); }
    } else { setTimeline(timeline.filter(t => t.id !== `auto_${expenseId}`)); }
    clearExpenseForm();
  };

  const handleEditExpenseClick = (item) => {
    setEditingExpenseId(item.id); setNewExpenseName(item.name || ''); setNewExpenseAmount(item.originalAmount ? item.originalAmount.toString() : '');
    setNewExpenseDeposit(item.deposit ? item.deposit.toString() : ''); setNewExpenseCurrency(item.currency || 'LAK'); setNewExpenseRate(item.rate ? item.rate.toString() : thbRate.toString());
    setNewExpenseDueDate(item.dueDate || ''); if (['ສະຖານທີ່', 'ອາຫານ', 'ຕົບແຕ່ງ', 'ເຄື່ອງນຸ່ງ/ແຕ່ງໜ້າ'].includes(item.category)) { setNewExpenseCategory(item.category); setCustomCategory(''); } else { setNewExpenseCategory('ອື່ນໆ'); setCustomCategory(item.category || ''); }
  };
  const clearExpenseForm = () => { setNewExpenseName(''); setNewExpenseAmount(''); setNewExpenseDeposit(''); setCustomCategory(''); setNewExpenseCategory('ສະຖານທີ່'); setNewExpenseCurrency('LAK'); setNewExpenseRate(thbRate.toString()); setNewExpenseDueDate(''); setEditingExpenseId(null); };
  const handleDeleteExpense = (id) => { if (editingExpenseId === id) clearExpenseForm(); setExpenses(expenses.filter(item => item.id !== id)); setTimeline(timeline.filter(t => t.id !== `auto_${id}`)); };

  // -------------------------------------------------------------------------
  // 👥 Guest Logic
  // -------------------------------------------------------------------------
  const [guestName, setGuestName] = useState('');
  const [guestAmount, setGuestAmount] = useState('');
  const [guestRelation, setGuestRelation] = useState('ໝູ່ຝັ່ງເຈົ້າບ່າວ');
  const [guestNote, setGuestNote] = useState('');
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const handleAddGuest = (e) => {
    e.preventDefault(); if (!guestName) return;
    const amountNum = parseFloat(guestAmount) || 0;
    if (editingGuestId) { setGuests(guests.map(g => g.id === editingGuestId ? { ...g, name: guestName, amount: amountNum, relation: guestRelation, note: guestNote } : g)); setEditingGuestId(null); }
    else { setGuests([...guests, { id: Date.now(), name: guestName, amount: amountNum, relation: guestRelation, note: guestNote }]); }
    clearGuestForm();
  };
  const handleEditGuestClick = (item) => { setEditingGuestId(item.id); setGuestName(item.name || ''); setGuestAmount(item.amount ? item.amount.toString() : ''); setGuestRelation(item.relation || 'ໝູ່ຝັ່ງເຈົ້າບ່າວ'); setGuestNote(item.note || ''); };
  const clearGuestForm = () => { setGuestName(''); setGuestAmount(''); setGuestRelation('ໝູ່ຝັ່ງເຈົ້າບ່າວ'); setGuestNote(''); setEditingGuestId(null); };
  const handleDeleteGuest = (id) => { if (editingGuestId === id) clearGuestForm(); setGuests(guests.filter(g => g.id !== id)); };

  const handleExcelImport = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result; const wb = XLSX.read(bstr, { type: 'binary' }); const wsname = wb.SheetNames[0]; const ws = wb.Sheets[wsname]; const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const importedGuests = [];
        for (let i = 1; i < data.length; i++) { const row = data[i]; if (!row[0]) continue; importedGuests.push({ id: Date.now() + i, name: row[0]?.toString().trim(), amount: parseFloat(row[1]) || 0, relation: row[2]?.toString().trim() || 'ໝູ່ຝັ່ງເຈົ້າບ່າວ', note: row[3]?.toString().trim() || '' }); }
        if (importedGuests.length > 0) { setGuests([...guests, ...importedGuests]); setCurrentPage(1); alert(`🎉 ນຳເຂົ້າສຳເລັດ ${importedGuests.length} ຄົນ!`); }
        else { alert("⚠️ ບໍ່ພົບຂໍ້ມູນ."); }
      } catch (error) { alert("❌ ບໍ່ສາມາດອ່ານໄຟລ໌ Excel ໄດ້."); }
    };
    reader.readAsBinaryString(file); e.target.value = '';
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const safeGuests = Array.isArray(guests) ? guests : [];
  const currentGuests = safeGuests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeGuests.length / itemsPerPage);

  // -------------------------------------------------------------------------
  // ⚖️ Compare Groups Logic
  // -------------------------------------------------------------------------
  const [newServiceGroup, setNewServiceGroup] = useState('');
  const [activeGroupId, setActiveGroupId] = useState('');
  const [optStoreName, setOptStoreName] = useState('');
  const [optPrice, setOptPrice] = useState('');
  const [optCurrency, setOptCurrency] = useState('LAK');
  const [optRate, setOptRate] = useState(thbRate.toString());
  const [optNote, setOptNote] = useState('');
  const [editingOptionId, setEditingOptionId] = useState(null);

  const handleCreateGroup = (e) => { e.preventDefault(); if (!newServiceGroup) return; setCompareGroups([...compareGroups, { id: Date.now(), serviceName: newServiceGroup, options: [] }]); setNewServiceGroup(''); };
  const handleDeleteGroup = (groupId) => { if (activeGroupId === groupId) clearOptionForm(); setCompareGroups(compareGroups.filter(g => g.id !== groupId)); };
  const handleAddOption = (groupId) => {
    if (!optStoreName || !optPrice) return;
    const priceNum = parseFloat(optPrice); const rateNum = optCurrency === 'THB' ? parseFloat(optRate) || thbRate : 1;
    setCompareGroups(compareGroups.map(group => {
      if (group.id === groupId) {
        const currentOptions = group.options || [];
        if (editingOptionId) { return { ...group, options: currentOptions.map(opt => opt.id === editingOptionId ? { ...opt, storeName: optStoreName, price: priceNum, currency: optCurrency, rate: rateNum, note: optNote } : opt) }; }
        else { return { ...group, options: [...currentOptions, { id: Date.now(), storeName: optStoreName, price: priceNum, currency: optCurrency, rate: rateNum, note: optNote }] }; }
      } return group;
    })); clearOptionForm();
  };
  const handleEditOptionClick = (groupId, opt) => { setActiveGroupId(groupId); setEditingOptionId(opt.id); setOptStoreName(opt.storeName || ''); setOptPrice(opt.price ? opt.price.toString() : ''); setOptCurrency(opt.currency || 'LAK'); setOptRate(opt.rate ? opt.rate.toString() : thbRate.toString()); setOptNote(opt.note || ''); };
  const clearOptionForm = () => { setOptStoreName(''); setOptPrice(''); setOptNote(''); setOptCurrency('LAK'); setOptRate(thbRate.toString()); setActiveGroupId(''); setEditingOptionId(null); };
  const handleDeleteOption = (groupId, optionId) => { if (editingOptionId === optionId) clearOptionForm(); setCompareGroups(compareGroups.map(group => group.id === groupId ? { ...group, options: (group.options || []).filter(o => o.id !== optionId) } : group)); };
  const getBestOptionId = (options) => {
    if (!options || options.length === 0) return null;
    let bestOption = options[0]; let bestLak = options[0].currency === 'THB' ? options[0].price * options[0].rate : options[0].price;
    for (let i = 1; i < options.length; i++) { const current = options[i]; const currentLak = current.currency === 'THB' ? current.price * current.rate : current.price; if (currentLak < bestLak) { bestOption = current; bestLak = currentLak; } } return bestOption.id;
  };

  // -------------------------------------------------------------------------
  // 📊 Calculations
  // -------------------------------------------------------------------------
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const sortedTimeline = [...(Array.isArray(timeline) ? timeline : [])].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const totalFullContractAmount = safeExpenses.reduce((sum, item) => sum + (item.currency === 'THB' ? item.originalAmount * item.rate : item.originalAmount), 0);
  const totalPaidSoFar = safeExpenses.reduce((sum, item) => sum + ((item.deposit || 0) * (item.currency === 'THB' ? item.rate : 1)), 0);
  const totalRemainingToPay = totalFullContractAmount - totalPaidSoFar;
  const totalGiftIncome = safeGuests.reduce((sum, guest) => sum + guest.amount, 0);
  const netWeddingBalance = (totalBudget + totalGiftIncome) - totalFullContractAmount;
  const budgetUsedPercent = totalBudget > 0 ? Math.min(100, Math.round((totalFullContractAmount / totalBudget) * 100)) : 0;

  // Phase 2: Pie Chart Data by category
  const categoryTotals = safeExpenses.reduce((acc, item) => {
    const lak = item.currency === 'THB' ? item.originalAmount * item.rate : item.originalAmount;
    const cat = item.category || 'ອື່ນໆ';
    acc[cat] = (acc[cat] || 0) + lak;
    return acc;
  }, {});
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  const CHART_COLORS = ['#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#64748b', '#ef4444', '#06b6d4'];

  return (
    <div className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] p-4 md:p-8 font-sans antialiased">

      {/* Top Action Bar */}
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2 mb-4">
        {/* Phase 3: Currency Fetcher */}
        <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2 shadow-sm">
          <span className="text-xs font-bold text-amber-700">฿ THB =</span>
          <span className="text-sm font-extrabold text-amber-800 font-mono">₭{thbRate.toLocaleString()}</span>
          <button
            type="button"
            onClick={fetchThbRate}
            disabled={rateLoading}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition"
          >
            <RefreshCw size={10} className={rateLoading ? 'animate-spin' : ''} />
            {rateLoading ? 'ກຳລັງດຶງ...' : 'ອັບເດດ Rate'}
          </button>
          {rateLastUpdated && <span className="text-[9px] text-slate-400 hidden sm:block">ອັບເດດ: {rateLastUpdated}</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Phase 3: Export Buttons */}
          <button type="button" onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"><Download size={13} /> CSV</button>
          <button type="button" onClick={handleExportJSON} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"><Download size={13} /> JSON</button>
          <button type="button" onClick={handleShareLink} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-2"><Share2 size={14} /> ແຊຣ໌ລິ້ງ</button>
        </div>
      </div>

      {/* Header */}
      <header className="mb-8 text-center">
        <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full border border-purple-100 tracking-wider">Smart Wedding Ledger & Guest Income Sync</span>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">ລະບົບງົບປະມານ, ແຜນງານ & ບັນທຶກເງິນຊອງແຂກ 📊💍</h1>
      </header>

      {/* 📊 Summary Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ງົບປະມານທຶນຕັ້ງຕົ້ນ</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl font-bold text-slate-400">₭</span>
              <input type="number" value={totalBudget} onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)} className="text-xl font-bold text-blue-600 w-full border-b border-dashed border-slate-200 focus:outline-none focus:border-blue-500 pb-0.5" />
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">ລາຄາສັນຍາເຕັມ: ₭{totalFullContractAmount.toLocaleString()}</span>
          </div>
          <div className="bg-blue-50/80 p-2.5 rounded-xl text-blue-600 font-bold text-md">₭</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">💵 ຍອດລວມເງິນຊອງແຂກ</p>
            <h3 className="text-xl font-bold text-emerald-700 mt-1">₭{totalGiftIncome.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-500 font-medium block mt-0.5">👥 ແຂກທັງໝົດ: {safeGuests.length} ຄົນ</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600"><Users size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">ຍອດລວມຄ້າງຈ່າຍໜ້າງານ ⚠️</p>
            <h3 className="text-xl font-bold text-orange-600 mt-1">₭{totalRemainingToPay.toLocaleString()}</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5">ມັດຈຳແລ້ວ: ₭{totalPaidSoFar.toLocaleString()}</span>
          </div>
          <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500"><Wallet size={20} /></div>
        </div>

        <div className={`p-5 rounded-2xl shadow-sm border flex items-center justify-between ${netWeddingBalance >= 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'}`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{netWeddingBalance >= 0 ? '💰 ເງິນເຫຼືອ (ກຳໄລ)' : '🚨 ງົບຕິດລົບ (ຂາດທຶນ)'}</p>
            <h3 className={`text-xl font-extrabold mt-1 flex items-center gap-1 ${netWeddingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netWeddingBalance >= 0 ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
              ₭{Math.abs(netWeddingBalance).toLocaleString()}
            </h3>
            <span className="text-[10px] text-slate-400 block mt-0.5">ສູດ: (ທຶນ + ຊອງ) - ລາຍຈ່າຍ</span>
          </div>
          <div className={`p-2.5 rounded-xl ${netWeddingBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}><DollarSign size={20} /></div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           PHASE 2: DASHBOARD — Budget Overview + Pie Chart
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Budget Overview Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-500" /> ພາບລວມງົບປະມານ
          </h2>

          <div className="space-y-4">
            {/* Budget Used Progress */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600">ໃຊ້ງົບໄປແລ້ວ</span>
                <span className={`font-bold ${budgetUsedPercent >= 90 ? 'text-rose-600' : budgetUsedPercent >= 70 ? 'text-amber-600' : 'text-indigo-600'}`}>{budgetUsedPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${budgetUsedPercent >= 90 ? 'bg-rose-500' : budgetUsedPercent >= 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  style={{ width: `${budgetUsedPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₭0</span>
                <span>₭{totalBudget.toLocaleString()}</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {[
                { label: 'ງົບທຶນຕັ້ງຕົ້ນ', value: `₭${totalBudget.toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'ລາຍຈ່າຍທັງໝົດ', value: `₭${totalFullContractAmount.toLocaleString()}`, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'ເງິນຊອງທີ່ໄດ້ຮັບ', value: `₭${totalGiftIncome.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'ມັດຈຳຈ່າຍໄປແລ້ວ', value: `₭${totalPaidSoFar.toLocaleString()}`, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'ຄ້າງຈ່າຍຍັງເຫຼືອ', value: `₭${totalRemainingToPay.toLocaleString()}`, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`flex justify-between items-center p-2.5 rounded-xl ${bg}`}>
                  <span className="text-xs text-slate-600 font-medium">{label}</span>
                  <span className={`text-xs font-bold font-mono ${color}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Net Balance Highlight */}
            <div className={`p-4 rounded-2xl border-2 text-center ${netWeddingBalance >= 0 ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">ຍອດສຸດທິ (ກຳໄລ/ຂາດທຶນ)</p>
              <p className={`text-2xl font-extrabold font-mono ${netWeddingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {netWeddingBalance >= 0 ? '+' : '-'}₭{Math.abs(netWeddingBalance).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">= ທຶນ {totalBudget > 0 ? '+' : ''} ຊອງ - ລາຍຈ່າຍ</p>
            </div>
          </div>
        </div>

        {/* Pie Chart Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-pink-500" /> ສັດສ່ວນລາຍຈ່າຍຕາມໝວດໝູ່ (Expense Distribution)
          </h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              <div className="text-center">
                <PieChart size={40} className="mx-auto mb-3 opacity-20" />
                <p>ຍັງບໍ່ມີຂໍ້ມູນລາຍຈ່າຍ</p>
                <p className="text-xs mt-1">ເພີ່ມລາຍຈ່າຍດ້ານລຸ່ມເພື່ອເຫັນ Chart</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`₭${value.toLocaleString()}`, 'ຈຳນວນ']}
                      contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: '11px', color: '#475569' }}>{value}</span>}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              {/* Category breakdown */}
              <div className="w-full sm:w-48 shrink-0 space-y-2">
                {pieData.map((entry, index) => {
                  const pct = totalFullContractAmount > 0 ? ((entry.value / totalFullContractAmount) * 100).toFixed(1) : 0;
                  return (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-700 truncate">{entry.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono">₭{entry.value.toLocaleString()} ({pct}%)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📅 Timeline Section */}
      <div className="max-w-7xl mx-auto mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-purple-600" /> 📅 ຕາຕະລາງແຜນງານ & ກຳນົດການທັງໝົດ (Milestones)</h2>
        <form onSubmit={handleAddTimeline} className={`grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl border mb-6 ${editingTimelineId ? 'bg-orange-50/50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-500 block mb-1">ວັນທີ/ເດືອນ/ປີ</label>
            <input type="date" value={tlDate} onChange={(e) => setTlDate(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white font-semibold" required />
          </div>
          <div className="sm:col-span-4">
            <label className="text-[11px] font-medium text-slate-500 block mb-1">ຫົວຂໍ້ວຽກ</label>
            <input type="text" placeholder="ຕົວຢ່າງ: ແຈກຊອງການກາດ..." value={tlActivity} onChange={(e) => setTlActivity(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white" required />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-500 block mb-1">ຜູ້ຮັບຜິດຊອບ</label>
            <input type="text" placeholder="ໃຜຮັບຜິດຊອບ" value={tlResponsible} onChange={(e) => setTlResponsible(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white" />
          </div>
          <div className="sm:col-span-3">
            <label className="text-[11px] font-medium text-slate-500 block mb-1">💬 ຄອມເມັ້ນ</label>
            <input type="text" placeholder="ລາຍລະອຽດ..." value={tlComment} onChange={(e) => setTlComment(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white" />
          </div>
          <div className="sm:col-span-1 flex items-end gap-1">
            <button type="submit" className={`w-full text-white text-xs font-bold py-2 rounded-lg ${editingTimelineId ? 'bg-orange-500' : 'bg-purple-600'}`}>{editingTimelineId ? '✓' : '+ ເພີ່ມ'}</button>
            {editingTimelineId && <button type="button" onClick={clearTimelineForm} className="bg-slate-200 text-slate-600 p-2 rounded-lg"><X size={14} /></button>}
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium bg-slate-50/50">
                <th className="p-3 text-center w-12">ສະຖານະ</th>
                <th className="p-3 w-28">ວັນທີ</th>
                <th className="p-3 w-40">ສະຖານະເຕືອນ</th>
                <th className="p-3 font-semibold">ສິ່ງທີ່ຕ້ອງກຽມ</th>
                <th className="p-3 w-32">ຜູ້ຮັບຜິດຊອບ</th>
                <th className="p-3 w-56">💬 ຄອມເມັ້ນ</th>
                <th className="p-3 text-center w-20">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              {sortedTimeline.map((item) => {
                const urgency = checkUrgencyStatus(item.date, item.isDone);
                return (
                  <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition ${item.isDone ? 'bg-slate-50/70 opacity-60 line-through text-slate-400' : 'text-slate-700'}`}>
                    <td className="p-3 text-center"><input type="checkbox" checked={!!item.isDone} onChange={() => toggleTimelineDone(item.id)} className="w-4 h-4 rounded border-slate-300 text-purple-600" /></td>
                    <td className="p-3 font-bold font-mono text-slate-900 text-sm">{item.date}</td>
                    <td className="p-3">
                      {urgency.shouldAlert ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${urgency.isOverdue ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}><AlertTriangle size={10} /> {urgency.text}</span>
                      ) : item.isDone ? (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ ສຳເລັດ</span>
                      ) : (<span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">⏳ ປົກກະຕິ</span>)}
                    </td>
                    <td className="p-3 font-semibold text-xs max-w-[200px] whitespace-pre-wrap">{item.activity}</td>
                    <td className="p-3 text-slate-500 font-medium">{item.responsible}</td>
                    <td className="p-3 italic text-slate-600 max-w-[240px] whitespace-pre-wrap bg-slate-50/40">{item.comment}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => handleEditTimelineClick(item)} className="text-slate-300 hover:text-blue-500"><Pencil size={12} /></button>
                        <button type="button" onClick={() => handleDeleteTimeline(item.id, item.isAuto)} className="text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Expense Tracker */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">📝 ບັນທຶກລາຍຈ່າຍຕົວຈິງ</h2>
          <form onSubmit={handleAddExpense} className="space-y-4 mb-6 p-4 rounded-xl border bg-slate-50 border-slate-100">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">ຊື່ລາຍການ</label>
              <input type="text" placeholder="ຕົວຢ່າງ: ຄ່າສະຖານທີ່..." value={newExpenseName} onChange={(e) => setNewExpenseName(e.target.value)} className="w-full p-2.5 text-xs border border-slate-200 rounded-lg bg-white" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">ຈຳນວນເຕັມສັນຍາ</label>
                <input type="number" placeholder="0" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} className="w-full p-2.5 text-xs border border-slate-200 rounded-lg bg-white" required />
              </div>
              <div>
                <label className="text-xs font-medium text-emerald-600 block mb-1">💵 ເງິນມັດຈຳ</label>
                <input type="number" placeholder="0" value={newExpenseDeposit} onChange={(e) => setNewExpenseDeposit(e.target.value)} className="w-full p-2.5 text-xs border border-emerald-200 rounded-lg bg-white" />
              </div>
            </div>
            <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
              <label className="text-xs font-bold text-purple-800 block mb-1">📅 ກຳນົດຈ່າຍສ່ວນເຫຼືອ</label>
              <input type="date" value={newExpenseDueDate} onChange={(e) => setNewExpenseDueDate(e.target.value)} className="w-full p-2 text-xs border border-purple-200 rounded-lg bg-white font-semibold" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">ສະກຸນເງິນ</label>
                <select value={newExpenseCurrency} onChange={(e) => setNewExpenseCurrency(e.target.value)} className="w-full p-2.5 text-xs border border-slate-200 rounded-lg bg-white font-semibold text-amber-800">
                  <option value="LAK">₭ ກີບ (LAK)</option>
                  <option value="THB">฿ ບາດ (THB)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">ໝວດໝູ່</label>
                <select value={newExpenseCategory} onChange={(e) => setNewExpenseCategory(e.target.value)} className="w-full p-2.5 text-xs border border-slate-200 rounded-lg bg-white">
                  <option value="ສະຖານທີ່">ສະຖານທີ່ ແລະ ໂຮງແຮມ</option>
                  <option value="ອາຫານ">ອາຫານ ແລະ ເຄື່ອງດື່ມ</option>
                  <option value="ຕົບແຕ່ງ">ຕົບແຕ່ງ ແລະ ດອກໄມ້</option>
                  <option value="ເຄື່ອງນຸ່ງ/ແຕ່ງໜ້າ">ເຄື່ອງນຸ່ງ ແລະ ແຕ່ງໜ້າ</option>
                  <option value="ອື່ນໆ">ຄ່າໃຊ້ຈ່າຍອື່ນໆ</option>
                </select>
              </div>
            </div>
            {newExpenseCurrency === 'THB' && (
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <label className="text-[10px] font-bold text-amber-700 block mb-1">อัตราแลกเปลี่ยน ฿1 = ₭ (Rate)</label>
                <div className="flex gap-2 items-center">
                  <input type="number" value={newExpenseRate} onChange={(e) => setNewExpenseRate(e.target.value)} className="w-full p-2 text-xs border border-amber-200 rounded-md bg-white font-bold text-amber-700" />
                  <button type="button" onClick={() => setNewExpenseRate(thbRate.toString())} className="text-[10px] bg-amber-500 text-white px-2 py-1.5 rounded-lg font-bold whitespace-nowrap">ໃຊ້ Rate ລ່າສຸດ</button>
                </div>
              </div>
            )}
            {newExpenseCategory === 'ອື່ນໆ' && (
              <input type="text" placeholder="ລະບຸໝວດໝູ່ເອງ..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full p-2.5 text-xs border border-slate-200 rounded-lg bg-white" />
            )}
            <div className="flex gap-2">
              <button type="submit" className="w-full text-white text-xs font-semibold py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700">{editingExpenseId ? '✓ ອັບເດດລາຍຈ່າຍ' : '+ ບັນທຶກລາຍຈ່າຍ'}</button>
              {editingExpenseId && <button type="button" onClick={clearExpenseForm} className="bg-slate-200 px-3 rounded-lg"><X size={16} /></button>}
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium bg-slate-50/50">
                  <th className="p-2">ລາຍການ</th>
                  <th className="p-2 text-right">ລວມ (ກີບ)</th>
                  <th className="p-2 text-right text-emerald-600">ມັດຈຳ</th>
                  <th className="p-2 text-right text-orange-600">ຄ້າງຈ່າຍ</th>
                  <th className="p-2 text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                {safeExpenses.map((item) => {
                  const itemLakAmount = item.currency === 'THB' ? item.originalAmount * item.rate : item.originalAmount;
                  const itemDepositLak = item.currency === 'THB' ? (item.deposit || 0) * item.rate : (item.deposit || 0);
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/60 text-slate-700">
                      <td className="p-2">
                        <span className="font-semibold block">{item.name}</span>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${CHART_COLORS[Object.keys(categoryTotals).indexOf(item.category) % CHART_COLORS.length]}20`, color: CHART_COLORS[Object.keys(categoryTotals).indexOf(item.category) % CHART_COLORS.length] }}>{item.category}</span>
                        {item.dueDate && <span className="text-[10px] text-purple-600 bg-purple-50 px-1 rounded ml-1">📅 {item.dueDate}</span>}
                      </td>
                      <td className="p-2 text-right font-mono">₭{itemLakAmount.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono text-emerald-600">₭{itemDepositLak.toLocaleString()}</td>
                      <td className="p-2 text-right font-bold font-mono text-orange-600">₭{(itemLakAmount - itemDepositLak).toLocaleString()}</td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={() => handleEditExpenseClick(item)} className="text-slate-300 hover:text-blue-500"><Pencil size={12} /></button>
                          <button type="button" onClick={() => handleDeleteExpense(item.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guest List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
            <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" /> 👥 ບັນທຶກລາຍຊື່ແຂກ & ເງິນຊອງ ({safeGuests.length} ຄົນ)
            </h2>
            <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
              <Upload size={14} /> Import Excel
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelImport} className="hidden" />
            </label>
          </div>

          <form onSubmit={handleAddGuest} className="p-4 rounded-xl border space-y-3 mb-4 bg-emerald-50/20 border-emerald-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">✍️ ຊື່ ແລະ ນາມສະກຸນ</label>
                <input type="text" placeholder="ທ່ານ ຄຳສິງ..." value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white" required />
              </div>
              <div>
                <label className="text-[11px] font-medium text-emerald-700 block mb-1">💰 ຈຳນວນເງິນຊອງ (ກີບ)</label>
                <input type="number" placeholder="500000" value={guestAmount} onChange={(e) => setGuestAmount(e.target.value)} className="w-full p-2 text-xs border border-emerald-200 rounded-lg bg-white font-bold text-emerald-800" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">🤝 ຄວາມສຳພັນ</label>
                <select value={guestRelation} onChange={(e) => setGuestRelation(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white">
                  <option value="ໝູ່ຝັ່ງເຈົ້າບ່າວ">ໝູ່ຝັ່ງເຈົ້າບ່າວ</option>
                  <option value="ໝູ່ຝັ່ງເຈົ້າສາວ">ໝູ່ຝັ່ງເຈົ້າສາວ</option>
                  <option value="ຍາດພີ່ນ້ອງຝ່າຍເຈົ້າບ່າວ">ຍາດພີ່ນ້ອງຝ່າຍເຈົ້າບ່າວ</option>
                  <option value="ຍາດພີ່ນ້ອງຝ່າຍເຈົ້າສາວ">ຍາດພີ່ນ້ອງຝ່າຍເຈົ້າສາວ</option>
                  <option value="ແຂກຜູ້ໃຫຍ່ / ເພື່ອນຮ່ວມງານ">ແຂກຜູ້ໃຫຍ່ / ເພື່ອນຮ່ວມງານ</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">📌 ໝາຍເຫດ</label>
                <input type="text" placeholder="ໝາຍເຫດ..." value={guestNote} onChange={(e) => setGuestNote(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editingGuestId && <button type="button" onClick={clearGuestForm} className="bg-slate-200 text-slate-600 text-xs px-3 rounded-lg">ຍົກເລີກ</button>}
              <button type="submit" className="text-white text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600">{editingGuestId ? '✓ ອັບເດດ' : '+ ບັນທຶກ'}</button>
            </div>
          </form>

          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>ສະແດງໜ້າລະ:</span>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }} className="border rounded px-1 py-0.5 bg-white font-medium text-slate-700">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="p-1 rounded border bg-white disabled:opacity-40"><ChevronLeft size={14} /></button>
                <span className="text-slate-600 font-medium">ໜ້າ {currentPage} / {totalPages}</span>
                <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="p-1 rounded border bg-white disabled:opacity-40"><ChevronRight size={14} /></button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-500 font-medium">
                <tr>
                  <th className="p-2.5">ຊື່ແຂກ</th>
                  <th className="p-2.5">ຝັ່ງແຂກ</th>
                  <th className="p-2.5 text-right text-emerald-700">ເງິນຊອງ (ກີບ)</th>
                  <th className="p-2.5">ໝາຍເຫດ</th>
                  <th className="p-2.5 text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                {currentGuests.length === 0 ? (
                  <tr><td colSpan="5" className="text-center p-6 text-slate-400 italic">ຍັງບໍ່ມີການບັນທຶກ</td></tr>
                ) : (
                  currentGuests.map((guest) => (
                    <tr key={guest.id} className="border-b border-slate-50 hover:bg-slate-50 transition text-slate-700">
                      <td className="p-2.5 font-semibold text-slate-800">{guest.name}</td>
                      <td className="p-2.5 text-slate-500"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{guest.relation}</span></td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-600">₭{guest.amount.toLocaleString()}</td>
                      <td className="p-2.5 italic text-slate-400 max-w-[120px] truncate" title={guest.note}>{guest.note || '-'}</td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={() => handleEditGuestClick(guest)} className="text-slate-300 hover:text-blue-500"><Pencil size={11} /></button>
                          <button type="button" onClick={() => handleDeleteGuest(guest.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           SECTION: Compare Prices — Phase 1 Redesign (Spec Grid)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto mt-10 space-y-4">
        <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">🔍 ລະບົບປຽບທຽບລາຄາຮ້ານຄ້າ (Options)</h2>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleCreateGroup} className="flex gap-2">
            <input type="text" placeholder="➕ ເພີ່ມຫົວຂໍ້ບໍລິການໃໝ່..." value={newServiceGroup} onChange={(e) => setNewServiceGroup(e.target.value)} className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white" />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 rounded-xl transition shrink-0">+ ເພີ່ມ</button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(compareGroups || []).map((group) => {
            const optionsList = group.options || [];
            const bestOptionId = getBestOptionId(optionsList);
            const bestOption = optionsList.find(opt => opt.id === bestOptionId);
            const worstLak = optionsList.length > 0 ? Math.max(...optionsList.map(o => o.currency === 'THB' ? o.price * o.rate : o.price)) : 0;

            return (
              <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Group Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Scale size={15} className="text-purple-500" />{group.serviceName}</h3>
                  <button type="button" onClick={() => handleDeleteGroup(group.id)} className="text-xs text-rose-400 hover:text-rose-600">🗑️</button>
                </div>

                {/* Phase 1: Spec-style grid table */}
                {optionsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">ບໍ່ມີຮ້ານຄ້າ, ເພີ່ມດ້ານລຸ່ມ</div>
                ) : (
                  <div className="overflow-x-auto">
                    {/* Spec Header Row — store names */}
                    <div className={`grid border-b border-slate-100 bg-white`} style={{ gridTemplateColumns: `140px repeat(${optionsList.length}, 1fr)` }}>
                      <div className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100 flex items-center">Spec / ຮ້ານ</div>
                      {optionsList.map(opt => {
                        const isBest = opt.id === bestOptionId;
                        return (
                          <div key={opt.id} className={`p-3 text-center border-r border-slate-100 last:border-r-0 ${isBest ? 'bg-emerald-50' : ''}`}>
                            <div className={`text-xs font-bold ${isBest ? 'text-emerald-700' : 'text-slate-700'}`}>
                              {isBest && <span className="mr-1">👑</span>}{opt.storeName}
                            </div>
                            {isBest && <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">ຄຸ້ມສຸດ</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Row: ລາຄາເດີມ */}
                    <div className="grid border-b border-slate-50 hover:bg-slate-50/40" style={{ gridTemplateColumns: `140px repeat(${optionsList.length}, 1fr)` }}>
                      <div className="p-3 text-[10px] font-semibold text-slate-500 border-r border-slate-100 bg-slate-50/40 flex items-center">ລາຄາເດີມ</div>
                      {optionsList.map(opt => (
                        <div key={opt.id} className={`p-3 text-center border-r border-slate-50 last:border-r-0 text-xs font-mono text-slate-600 ${opt.id === bestOptionId ? 'bg-emerald-50/50' : ''}`}>
                          {opt.currency === 'THB' ? `฿${opt.price.toLocaleString()}` : `₭${opt.price.toLocaleString()}`}
                        </div>
                      ))}
                    </div>

                    {/* Row: ລວມ (ກີບ) */}
                    <div className="grid border-b border-slate-50" style={{ gridTemplateColumns: `140px repeat(${optionsList.length}, 1fr)` }}>
                      <div className="p-3 text-[10px] font-semibold text-slate-500 border-r border-slate-100 bg-slate-50/40 flex items-center">ລວມ (ກີບ)</div>
                      {optionsList.map(opt => {
                        const lak = opt.currency === 'THB' ? opt.price * opt.rate : opt.price;
                        const isBest = opt.id === bestOptionId;
                        const savings = worstLak - lak;
                        return (
                          <div key={opt.id} className={`p-3 text-center border-r border-slate-50 last:border-r-0 ${isBest ? 'bg-emerald-50/50' : ''}`}>
                            <span className={`text-xs font-extrabold font-mono ${isBest ? 'text-emerald-700' : 'text-slate-700'}`}>₭{lak.toLocaleString()}</span>
                            {isBest && savings > 0 && <div className="text-[9px] text-emerald-500 font-semibold">ປະຢັດ ₭{savings.toLocaleString()}</div>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Row: ໝາຍເຫດ */}
                    <div className="grid border-b border-slate-50" style={{ gridTemplateColumns: `140px repeat(${optionsList.length}, 1fr)` }}>
                      <div className="p-3 text-[10px] font-semibold text-slate-500 border-r border-slate-100 bg-slate-50/40 flex items-center">ໝາຍເຫດ</div>
                      {optionsList.map(opt => (
                        <div key={opt.id} className={`p-3 text-center border-r border-slate-50 last:border-r-0 text-[10px] italic text-slate-500 ${opt.id === bestOptionId ? 'bg-emerald-50/50' : ''}`}>
                          {opt.note || '-'}
                        </div>
                      ))}
                    </div>

                    {/* Row: Actions */}
                    <div className="grid" style={{ gridTemplateColumns: `140px repeat(${optionsList.length}, 1fr)` }}>
                      <div className="p-3 text-[10px] font-semibold text-slate-500 border-r border-slate-100 bg-slate-50/40 flex items-center">ຈັດການ</div>
                      {optionsList.map(opt => (
                        <div key={opt.id} className={`p-3 text-center border-r border-slate-50 last:border-r-0 ${opt.id === bestOptionId ? 'bg-emerald-50/30' : ''}`}>
                          <div className="flex justify-center gap-3">
                            <button type="button" onClick={() => handleEditOptionClick(group.id, opt)} className="text-slate-300 hover:text-blue-500"><Pencil size={12} /></button>
                            <button type="button" onClick={() => handleDeleteOption(group.id, opt.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Winner Banner */}
                {bestOption && optionsList.length > 1 && (
                  <div className="mx-4 mb-4 mt-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <div>
                      <span className="font-bold">ແນະນຳ: "{bestOption.storeName}"</span>
                      <span className="text-emerald-600 ml-1">— ຄຸ້ມຄ່າທີ່ສຸດ <b className="font-mono">₭{(bestOption.currency === 'THB' ? bestOption.price * bestOption.rate : bestOption.price).toLocaleString()}</b></span>
                    </div>
                  </div>
                )}

                {/* Add Option Form */}
                {activeGroupId === group.id ? (
                  <div className="mx-4 mb-4 p-4 bg-purple-50/40 border border-purple-100 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" placeholder="ຊື່ຮ້ານຄ້າ" value={optStoreName} onChange={(e) => setOptStoreName(e.target.value)} className="p-2 text-xs border border-slate-200 rounded-lg bg-white" />
                      <div className="flex gap-1">
                        <input type="number" placeholder="ລາຄາ" value={optPrice} onChange={(e) => setOptPrice(e.target.value)} className="p-2 text-xs border border-slate-200 rounded-lg bg-white w-full" />
                        <select value={optCurrency} onChange={(e) => setOptCurrency(e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg font-semibold bg-white">
                          <option value="LAK">₭ ກີບ</option>
                          <option value="THB">฿ ບາດ</option>
                        </select>
                      </div>
                    </div>
                    {optCurrency === 'THB' && (
                      <div className="flex gap-2 items-center">
                        <input type="number" value={optRate} onChange={(e) => setOptRate(e.target.value)} className="w-full p-1.5 text-xs border border-amber-200 rounded-md bg-white font-bold text-amber-700" />
                        <button type="button" onClick={() => setOptRate(thbRate.toString())} className="text-[10px] bg-amber-500 text-white px-2 py-1.5 rounded-lg font-bold whitespace-nowrap">Rate ລ່າສຸດ</button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="ໝາຍເຫດ..." value={optNote} onChange={(e) => setOptNote(e.target.value)} className="p-2 text-xs border border-slate-200 rounded-lg bg-white w-full" />
                      <button type="button" onClick={() => handleAddOption(group.id)} className="bg-purple-600 text-white text-xs font-bold px-4 rounded-lg">ບັນທຶກ</button>
                      <button type="button" onClick={clearOptionForm} className="bg-slate-200 text-slate-600 text-xs px-3 rounded-lg">ຍົກເລີກ</button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 pb-4">
                    <button type="button" onClick={() => { clearOptionForm(); setActiveGroupId(group.id); }} className="w-full py-2 bg-slate-50 hover:bg-purple-50 text-purple-600 border border-dashed border-slate-200 text-xs font-semibold rounded-xl transition">+ ເພີ່ມຮ້ານຄ້າ</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 text-center text-[10px] text-slate-400 pb-8">
        Smart Wedding Ledger 💍 — ສ້າງດ້ວຍ React + Recharts + XLSX
      </div>
    </div>
  );
}

export default App;
