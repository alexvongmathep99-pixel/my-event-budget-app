import React, { useState } from 'react';
import { PlusCircle, Scale, CheckCircle, Trash2, Store, Plus, Pencil, X, Wallet, AlertCircle } from 'lucide-react';

function App() {
  // 1. State ສຳລັບງົບປະມານທັງໝົດ (ເງິນກີບ)
  const [totalBudget, setTotalBudget] = useState(100000000); 

  // 2. State ສຳລັບລາຍຈ່າຍຕົວຈິງ (Actual Expenses)
  // ເພີ່ມ field: deposit (ມັດຈຳ) ຂອງແຕ່ລະບິນ
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'ຄ່າສະຖານທີ່ ແລະ ໂຮງແຮມ', originalAmount: 50000000, deposit: 20000000, currency: 'LAK', rate: 1, category: 'ສະຖານທີ່' },
    { id: 2, name: 'ຄ່າອໍແກໄນເຊີຈັດຕົບແຕ່ງງານ', originalAmount: 20000, deposit: 5000, currency: 'THB', rate: 750, category: 'ຕົບແຕ່ງ' },
  ]);

  // State ສຳລັບ Input ຟອມເພີ່ມ/ແກ້ໄຂ ລາຍຈ່າຍຕົວຈິງ
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDeposit, setNewExpenseDeposit] = useState(''); // ➕ State ໃໝ່ສຳລັບຄ່າມັດຈຳ
  const [newExpenseCurrency, setNewExpenseCurrency] = useState('LAK'); 
  const [newExpenseRate, setNewExpenseRate] = useState('750'); 
  const [newExpenseCategory, setNewExpenseCategory] = useState('ສະຖານທີ່');
  const [customCategory, setCustomCategory] = useState('');
  
  // State ເກັບ ID ລາຍຈ່າຍຕົວຈິງທີ່ກຳລັງແກ້ໄຂ
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // 3. State ສຳລັບບໍລິການທີ່ຕ້ອງການປຽບທຽບ (Comparison Groups)
  const [compareGroups, setCompareGroups] = useState([
    {
      id: 1,
      serviceName: 'ຄ່າຊຸດເຈົ້າສາວ ແລະ ເຈົ້າບ່າວ',
      options: [
        { id: 101, storeName: 'ຮ້ານ ວຽງຈັນ ເວດດິ້ງ', price: 15000000, currency: 'LAK', rate: 1, note: 'ຊຸດພິທີເຊົ້າ-ແລງ' },
        { id: 102, storeName: 'ຮ້ານ ອຸດອນ ສະຕູດિໂອ', price: 18000, currency: 'THB', rate: 755, note: 'ຊຸດນຳເຂົ້າພິເສດ' },
        { id: 103, storeName: 'ຮ້ານ ໜອງຄາຍ ເວດດິ້ງ', price: 19500, currency: 'THB', rate: 745, note: 'ແຖມຟຣີເຄື່ອງປະດັບ' },
      ]
    }
  ]);

  // ປະກາດ State ສຳລັບຟອມປຽບທຽບລາຄາຝັ່ງຂວາ
  const [newServiceGroup, setNewServiceGroup] = useState('');
  const [activeGroupId, setActiveGroupId] = useState('');
  const [optStoreName, setOptStoreName] = useState('');
  const [optPrice, setOptPrice] = useState('');
  const [optCurrency, setOptCurrency] = useState('LAK');
  const [optRate, setOptRate] = useState('750');
  const [optNote, setOptNote] = useState('');
  
  // State ເກັບ ID ຂອງຮ້ານຄ້າທີ່ກຳລັງແກ້ໄຂໃນຝັ່ງປຽບທຽບລາຄາ
  const [editingOptionId, setEditingOptionId] = useState(null);

  // --- ຟັງຊັນຈັດການລາຍຈ່າຍຕົວຈິງ ---
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;
    const amount = parseFloat(newExpenseAmount);
    const deposit = parseFloat(newExpenseDeposit) || 0; // ຖ້າບໍ່ໃສ່ ໃຫ້ເປັນ 0
    const currentRate = newExpenseCurrency === 'THB' ? parseFloat(newExpenseRate) || 1 : 1;

    let finalCategory = newExpenseCategory;
    if (newExpenseCategory === 'ອື່ນໆ') {
      finalCategory = customCategory.trim() || 'ຄ່າໃຊ້ຈ່າຍອື່ນໆ';
    }

    if (editingExpenseId) {
      // ໂໝດແກ້ໄຂ/ອັບເດດ
      setExpenses(expenses.map(item => {
        if (item.id === editingExpenseId) {
          return {
            ...item,
            name: newExpenseName,
            originalAmount: amount,
            deposit: deposit,
            currency: newExpenseCurrency,
            rate: currentRate,
            category: finalCategory
          };
        }
        return item;
      }));
      setEditingExpenseId(null);
    } else {
      // ໂໝດເພີ່ມໃໝ່
      setExpenses([...expenses, {
        id: Date.now(),
        name: newExpenseName,
        originalAmount: amount,
        deposit: deposit,
        currency: newExpenseCurrency,
        rate: currentRate,
        category: finalCategory
      }]);
    }

    // ເຄຼຍຄ່າໃນຟອມ
    clearExpenseForm();
  };

  // ຟັງຊັນເມື່ອຄລິກປຸ່ມແກ້ໄຂລາຍຈ່າຍຕົວຈິງ
  const handleEditExpenseClick = (item) => {
    setEditingExpenseId(item.id);
    setNewExpenseName(item.name);
    setNewExpenseAmount(item.originalAmount.toString());
    setNewExpenseDeposit(item.deposit ? item.deposit.toString() : '');
    setNewExpenseCurrency(item.currency);
    setNewExpenseRate(item.rate.toString());
    
    const mainCategories = ['ສະຖານທີ່', 'ອາຫານ', 'ຕົບແຕ່ງ', 'ເຄື່ອງນຸ່ງ/ແຕ່ງໜ້າ'];
    if (mainCategories.includes(item.category)) {
      setNewExpenseCategory(item.category);
      setCustomCategory('');
    } else {
      setNewExpenseCategory('ອື່ນໆ');
      setCustomCategory(item.category);
    }
  };

  const clearExpenseForm = () => {
    setNewExpenseName(''); 
    setNewExpenseAmount('');
    setNewExpenseDeposit('');
    setCustomCategory('');
    setNewExpenseCategory('ສະຖານທີ່');
    setNewExpenseCurrency('LAK');
    setNewExpenseRate('750');
    setEditingExpenseId(null);
  };

  const handleDeleteExpense = (id) => {
    if (editingExpenseId === id) clearExpenseForm();
    setExpenses(expenses.filter(item => item.id !== id));
  };

  // --- ຟັງຊັນຈັດການກຸ່ມປຽບທຽບລາຄາ ---
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newServiceGroup) return;
    setCompareGroups([...compareGroups, {
      id: Date.now(),
      serviceName: newServiceGroup,
      options: []
    }]);
    setNewServiceGroup('');
  };

  const handleDeleteGroup = (groupId) => {
    setCompareGroups(compareGroups.filter(g => g.id !== groupId));
  };

  const handleAddOption = (groupId) => {
    if (!optStoreName || !optPrice) return;
    const priceNum = parseFloat(optPrice);
    const rateNum = optCurrency === 'THB' ? parseFloat(optRate) || 1 : 1;

    setCompareGroups(compareGroups.map(group => {
      if (group.id === groupId) {
        if (editingOptionId) {
          // ໂໝດແກ້ໄຂຮ້ານຄ້າເດີມ
          return {
            ...group,
            options: group.options.map(opt => {
              if (opt.id === editingOptionId) {
                return {
                  ...opt,
                  storeName: optStoreName,
                  price: priceNum,
                  currency: optCurrency,
                  rate: rateNum,
                  note: optNote
                };
              }
              return opt;
            })
          };
        } else {
          // ໂໝດເພີ່ມຮ້ານຄ້າໃໝ່
          return {
            ...group,
            options: [...group.options, {
              id: Date.now(),
              storeName: optStoreName,
              price: priceNum,
              currency: optCurrency,
              rate: rateNum,
              note: optNote
            }]
          };
        }
      }
      return group;
    }));

    // ເຄຼຍຄ່າຟອມເພີ່ມ/ແກ້ໄຂຮ້ານ
    clearOptionForm();
  };

  const handleEditOptionClick = (groupId, opt) => {
    setActiveGroupId(groupId);
    setEditingOptionId(opt.id);
    setOptStoreName(opt.storeName);
    setOptPrice(opt.price.toString());
    setOptCurrency(opt.currency);
    setOptRate(opt.rate.toString());
    setOptNote(opt.note);
  };

  const clearOptionForm = () => {
    setOptStoreName(''); 
    setOptPrice(''); 
    setOptNote(''); 
    setOptCurrency('LAK');
    setOptRate('750');
    setActiveGroupId('');
    setEditingOptionId(null);
  };

  const handleDeleteOption = (groupId, optionId) => {
    if (editingOptionId === optionId) clearOptionForm();
    setCompareGroups(compareGroups.map(group => {
      if (group.id === groupId) {
        return { ...group, options: group.options.filter(o => o.id !== optionId) };
      }
      return group;
    }));
  };

  const getCheapestOptionId = (options) => {
    if (options.length === 0) return null;
    let cheapestId = options[0].id;
    let minLak = options[0].currency === 'THB' ? options[0].price * options[0].rate : options[0].price;

    options.forEach(o => {
      const currentLak = o.currency === 'THB' ? o.price * o.rate : o.price;
      if (currentLak < minLak) {
        minLak = currentLak;
        cheapestId = o.id;
      }
    });
    return cheapestId;
  };

  // --- ຄຳນວນຕົວເລກສະຫຼຸບ (ເງິນກີບທັງໝົດ) ---
  const totalActualExpense = expenses.reduce((sum, item) => {
    const itemLak = item.currency === 'THB' ? item.originalAmount * item.rate : item.originalAmount;
    return sum + itemLak;
  }, 0);

  const totalDepositPaid = expenses.reduce((sum, item) => {
    const depositLak = item.currency === 'THB' ? (item.deposit || 0) * item.rate : (item.deposit || 0);
    return sum + depositLak;
  }, 0);

  // ຍອດລວມສ່ວນທີ່ເຫຼືອຄ້າງຈ່າຍທັງໝົດ
  const totalRemainingToPay = totalActualExpense - totalDepositPaid;
  
  const remainingBudget = totalBudget - totalActualExpense;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans selection:bg-purple-100 antialiased">
      
      {/* Header */}
      <header className="mb-10 text-center">
        <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full border border-purple-100 tracking-wider uppercase">
          Wedding Budget Planner
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3 tracking-tight">
          ລະບົບວາງແຜນງົບປະມານງານແຕ່ງ 💍
        </h1>
        <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm leading-relaxed">
          ບໍລິຫານຄ່າໃຊ້ຈ່າຍຕົວຈິງ, ຕິດຕາມເງິນມັດຈຳ/ຍອດຄ້າງຈ່າຍ ແລະ ປຽບທຽບລາຄາຈາກຫຼາກຫຼາຍຮ້ານຄ້າ
        </p>
      </header>

      {/* 1. Summary Cards (ປ່ຽນເປັນ Grid 4 ຫ້ອງເພື່ອຮອງຮັບຍອດຄ້າງຈ່າຍ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ງົບປະມານທີ່ຕັ້ງໄວ້</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl font-bold text-slate-400">₭</span>
              <input 
                type="number" value={totalBudget} 
                onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                className="text-xl font-bold text-blue-600 w-full border-b border-dashed border-slate-200 focus:outline-none focus:border-blue-500 pb-0.5"
              />
            </div>
          </div>
          <div className="bg-blue-50/80 p-2.5 rounded-xl text-blue-600 font-bold text-md">₭</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ລາຍຈ່າຍທັງໝົດ</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">₭{totalActualExpense.toLocaleString()}</h3>
          </div>
          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600"><PlusCircle size={20} /></div>
        </div>

        {/* ➕ Card ໃໝ່: ສະແດງຍອດລວມທີ່ຄ້າງຈ່າຍ (ສ່ວນທີ່ເຫຼືອຕ້ອງຈ່າຍ) */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">ຍອດລວມຄ້າງຈ່າຍ ⚠️</p>
            <h3 className="text-xl font-bold text-orange-600 mt-1">₭{totalRemainingToPay.toLocaleString()}</h3>
            <span className="text-[10px] text-slate-400">ມັດຈຳແລ້ວ: ₭{totalDepositPaid.toLocaleString()}</span>
          </div>
          <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500"><Wallet size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ງົບປະມານຄົງເຫຼືອ</p>
            <h3 className={`text-xl font-bold mt-1 ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₭{remainingBudget.toLocaleString()}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${remainingBudget >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* 2. Main Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= ສ່ວນບັນທຶກລາຍຈ່າຍຕົວຈິງ (ຝັ່ງຊ້າຍ) ================= */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-xs border border-slate-100 h-fit">
          <h2 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
            {editingExpenseId ? '✏️ ກຳລັງແກ້ໄຂລາຍຈ່າຍ' : '📝 ບັນທຶກລາຍຈ່າຍຕົວຈິງ'}
          </h2>
          
          <form onSubmit={handleAddExpense} className={`space-y-4 mb-6 p-4 rounded-xl border ${editingExpenseId ? 'bg-orange-50/50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">ຊື່ລາຍການຄ່າໃຊ້ຈ່າຍ</label>
              <input 
                type="text" placeholder="ຕົວຢ່າງ: ຄ່າແຫວນແຕ່ງງານ" value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            
            {/* ປັບປຸງສ່ວນກາຈັດວາງ Input ຈຳນວນເງິນ ແລະ ມັດຈຳ */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">ຈຳນວນເງິນເຕັມ</label>
                <input 
                  type="number" placeholder="0.00" value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-orange-600 block mb-1">ເງິນມັດຈຳ (ຖ້າມີ)</label>
                <input 
                  type="number" placeholder="0.00" value={newExpenseDeposit}
                  onChange={(e) => setNewExpenseDeposit(e.target.value)}
                  className="w-full p-2.5 text-xs border border-orange-200 rounded-lg focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">ສະກຸນເງິນ</label>
              <select 
                value={newExpenseCurrency} onChange={(e) => setNewExpenseCurrency(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none bg-white font-semibold text-amber-800"
              >
                <option value="LAK">₭ ກີບ (LAK)</option>
                <option value="THB">฿ ບາດ (THB)</option>
              </select>
            </div>

            {newExpenseCurrency === 'THB' && (
              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                <label className="text-xs font-bold text-amber-800 block mb-1">💰 ອັດຕາແລ出 (1 ฿ = ? ₭)</label>
                <input 
                  type="number" value={newExpenseRate} onChange={(e) => setNewExpenseRate(e.target.value)}
                  className="w-full p-2 text-xs border border-amber-200 rounded-md focus:outline-none bg-white font-bold text-amber-700"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">ໝວດໝູ່ລາຍການ</label>
              <select 
                value={newExpenseCategory} onChange={(e) => setNewExpenseCategory(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none bg-white"
              >
                <option value="ສະຖານທີ່">ສະຖານທີ່ ແລະ ໂຮງແຮມ</option>
                <option value="ອາຫານ">ອາຫານ ແລະ ເຄື່ອງດື່ມ</option>
                <option value="ຕົບແຕ່ງ">ຕົບແຕ່ງ ແລະ ດອກໄມ້</option>
                <option value="ເຄື່ອງນຸ່ງ/ແຕ່ງໜ້າ">ເຄື່ອງນຸ່ງ ແລະ ແຕ່ງໜ້າ</option>
                <option value="ອື່ນໆ">ຄ່າໃຊ້ຈ່າຍອື່ນໆ</option>
              </select>
            </div>

            {newExpenseCategory === 'ອື່ນໆ' && (
              <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                <label className="text-xs font-bold text-purple-700 block mb-1">
                  ✍️ ລະບຸຄ່າໃຊ້ຈ່າຍອື່ນໆ ທີ່ຕ້ອງການ:
                </label>
                <input 
                  type="text" 
                  placeholder="ຕົວຢ່າງ: ຄ່າຊອງຜູກແຂນ..." 
                  value={customCategory} 
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full p-2 text-xs border border-purple-200 rounded-md focus:outline-none bg-white font-medium text-purple-900"
                  required
                />
              </div>
            )}

            <div className="flex gap-2">
              <button 
                type="submit" 
                className={`w-full text-white text-xs font-semibold py-2.5 rounded-lg transition duration-150 shadow-xs ${
                  editingExpenseId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {editingExpenseId ? '✓ ອັບເດດລາຍຈ່າຍ' : '+ ບັນທຶກລາຍຈ່າຍ'}
              </button>
              
              {editingExpenseId && (
                <button 
                  type="button" 
                  onClick={clearExpenseForm}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 rounded-lg transition"
                  title="ຍົກເລີກການແກ້ໄຂ"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>

          {/* ຕາຕະລາງລາຍຈ່າຍ (ເພີ່ມຊ່ອງສະແດງ ມັດຈຳ ແລະ ສ່ວນທີ່ເຫຼືອ) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium bg-slate-50/50">
                  <th className="p-2 rounded-l-lg">ລາຍການ</th>
                  <th className="p-2 text-right">ລວມ (ກີບ)</th>
                  <th className="p-2 text-right">ມັດຈຳ (ກີບ)</th>
                  <th className="p-2 text-right text-orange-600">ເຫຼືອຕ້ອງຈ່າຍ</th>
                  <th className="p-2 text-center rounded-r-lg">ຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item) => {
                  const itemLakAmount = item.currency === 'THB' ? item.originalAmount * item.rate : item.originalAmount;
                  const itemDepositLak = item.currency === 'THB' ? (item.deposit || 0) * item.rate : (item.deposit || 0);
                  const itemRemainingLak = item.originalAmount - (item.deposit || 0);
                  const itemRemainingLakConverted = item.currency === 'THB' ? itemRemainingLak * item.rate : itemRemainingLak;
                  
                  const isCurrentEditing = item.id === editingExpenseId;
                  
                  return (
                    <tr key={item.id} className={`border-b border-slate-100 transition ${isCurrentEditing ? 'bg-orange-50 font-medium' : 'hover:bg-slate-50/60'}`}>
                      <td className="p-2 text-slate-700">
                        <span className="font-semibold block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.currency === 'THB' ? `฿${item.originalAmount.toLocaleString()} (R:${item.rate})` : `₭${item.originalAmount.toLocaleString()}`}
                        </span>
                        <span className="block text-[9px] text-purple-600 font-semibold">▪ {item.category}</span>
                      </td>
                      <td className="p-2 text-right font-medium text-slate-800 font-mono">
                        ₭{itemLakAmount.toLocaleString()}
                      </td>
                      <td className="p-2 text-right text-slate-500 font-mono">
                        ₭{itemDepositLak.toLocaleString()}
                      </td>
                      <td className={`p-2 text-right font-bold font-mono ${itemRemainingLakConverted > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {itemRemainingLakConverted > 0 ? `₭${itemRemainingLakConverted.toLocaleString()}` : '✓ ຄົບແລ້ວ'}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleEditExpenseClick(item)} className={`transition ${isCurrentEditing ? 'text-orange-600' : 'text-slate-300 hover:text-blue-500'}`}>
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDeleteExpense(item.id)} className="text-slate-300 hover:text-rose-500 transition">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= ສ່ວນປຽບທຽບລາຄາແບບຫຼາຍຮ້ານ (ຝັ່ງຂວາ) ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* ສ້າງຫົວຂໍ້ບໍລິການໃໝ່ */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
            <form onSubmit={handleCreateGroup} className="flex gap-2">
              <input 
                type="text" placeholder="➕ ເພີ່ມຫົວຂໍ້ບໍລິການໃໝ່ເພື່ອປຽບທຽບ (ເຊັ່ນ: ຄ່າຊ່າງພາບ...)" 
                value={newServiceGroup} onChange={(e) => setNewServiceGroup(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 bg-white"
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 rounded-xl transition shrink-0 shadow-xs">
                + ເພີ່ມຫົວຂໍ້
              </button>
            </form>
          </div>

          {/* ສະແດງລາຍການປຽບທຽບ */}
          {compareGroups.map((group) => {
            const cheapestOptionId = getCheapestOptionId(group.options);

            return (
              <div key={group.id} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 space-y-4">
                
                {/* Header ຂອງກຸ່ມ */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Scale size={16} className="text-purple-600" /> {group.serviceName}
                  </h3>
                  <button 
                    onClick={() => handleDeleteGroup(group.id)} 
                    className="text-xs text-rose-400 hover:text-rose-600 transition font-medium"
                  >
                    🗑️ ລຶບລາຍການນີ້
                  </button>
                </div>

                {/* ຕາຕະລາງ */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-medium border-b border-slate-100 bg-slate-50/60">
                        <th className="p-2.5 rounded-l-lg">🏬 ຊື່ຮ້ານ / ຕົວເລືອກ</th>
                        <th className="p-2.5 text-right">ລາຄາເດີມ</th>
                        <th className="p-2.5 text-right">ເລດ</th>
                        <th className="p-2.5 text-right">ລວມ (ກີບ)</th>
                        <th className="p-2.5">📌 ໝາຍເຫດ</th>
                        <th className="p-2.5 text-center rounded-r-lg">ຈັດການ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.options.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center p-8 text-xs text-slate-400 italic">
                            ຍັງບໍ່ມີຂໍ້ມູນຮ້ານຄ້າ, ກົດປຸ່ມ "+ ເພີ່ມຂໍ້ມູນຮ້ານຄ້າ" ດ້ານລຸ່ມເພື່ອປຽບທຽບລາຄາ
                          </td>
                        </tr>
                      ) : (
                        group.options.map((opt) => {
                          const isCheapest = opt.id === cheapestOptionId;
                          const optLakAmount = opt.currency === 'THB' ? opt.price * opt.rate : opt.price;
                          const isOptEditing = opt.id === editingOptionId;

                          return (
                            <tr 
                              key={opt.id} 
                              className={`border-b border-slate-100 transition ${
                                isOptEditing ? 'bg-orange-50 font-medium text-slate-900' :
                                isCheapest ? 'bg-emerald-50/60 hover:bg-emerald-50 font-medium text-emerald-900' : 'hover:bg-slate-50/50 text-slate-700'
                              }`}
                            >
                              <td className="p-2.5 flex items-center gap-2">
                                <Store size={14} className={isCheapest ? 'text-emerald-600' : 'text-slate-400'} />
                                <div>
                                  <span className="font-semibold">{opt.storeName}</span>
                                  {isCheapest && <span className="ml-2 inline-block bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">✓ ປະຢັດທີ່ສຸດ</span>}
                                  {isOptEditing && <span className="ml-2 inline-block bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">⚙ ແກ້ໄຂ</span>}
                                </div>
                              </td>
                              <td className="p-2.5 text-right font-mono font-medium">
                                {opt.currency === 'THB' ? `฿${opt.price.toLocaleString()}` : `₭${opt.price.toLocaleString()}`}
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-400">
                                {opt.currency === 'THB' ? opt.rate : '-'}
                              </td>
                              <td className={`p-2.5 text-right font-mono font-bold text-sm ${isCheapest && !isOptEditing ? 'text-emerald-600' : 'text-slate-800'}`}>
                                ₭{optLakAmount.toLocaleString()}
                              </td>
                              <td className="p-2.5 text-slate-500 italic max-w-[120px] truncate" title={opt.note}>
                                {opt.note || '-'}
                              </td>
                              <td className="p-2.5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleEditOptionClick(group.id, opt)} className={`transition ${isOptEditing ? 'text-orange-600' : 'text-slate-300 hover:text-blue-500'}`}>
                                    <Pencil size={13} />
                                  </button>
                                  <button onClick={() => handleDeleteOption(group.id, opt.id)} className="text-slate-300 hover:text-rose-500 transition">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Inline Form ສຳລັບເພີ່ມ/ແກ້ໄຂ ຮ້ານ */}
                {activeGroupId === group.id ? (
                  <div className={`p-4 rounded-xl border space-y-3 ${editingOptionId ? 'bg-orange-50/40 border-orange-200' : 'bg-purple-50/40 border-purple-100'}`}>
                    <h4 className="text-xs font-bold text-purple-700">
                      {editingOptionId ? '⚙ ແກ້ໄຂຂໍ້ມູນຮ້ານຄ້າ:' : '✍ ປ້ອນຂໍ້ມູນຮ້ານຄ້າທີ່ຕ້ອງການສົມທຽບ:'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input 
                        type="text" placeholder="ຊື່ຮ້ານຄ້າ / ຜູ້ໃຫ້ບໍລິການ" value={optStoreName} onChange={(e) => setOptStoreName(e.target.value)}
                        className="p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none"
                      />
                      <div className="flex gap-1">
                        <input 
                          type="number" placeholder="ລາຄາສິນຄ້າ" value={optPrice} onChange={(e) => setOptPrice(e.target.value)}
                          className="p-2 text-xs border border-slate-200 rounded-lg bg-white w-full focus:outline-none"
                        />
                        <select value={optCurrency} onChange={(e) => setOptCurrency(e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg font-semibold text-amber-800 bg-white focus:outline-none">
                          <option value="LAK">₭ ກີບ</option>
                          <option value="THB">฿ ບາດ</option>
                        </select>
                      </div>
                      {optCurrency === 'THB' ? (
                        <input 
                          type="number" placeholder="ອັດຕາແລກປ່ຽນ (ເລດ)" value={optRate} onChange={(e) => setOptRate(e.target.value)}
                          className="p-2 text-xs border border-amber-300 bg-amber-50 text-amber-700 font-bold rounded-lg focus:outline-none"
                        />
                      ) : (
                        <div className="p-2 text-xs text-slate-400 bg-slate-100 rounded-lg flex items-center justify-center font-medium">ເລດເງິນກີບຄົງທີ່ = 1</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" placeholder="ໝາຍເຫດເພີ່ມເຕີມ..." value={optNote} onChange={(e) => setOptNote(e.target.value)}
                        className="p-2 text-xs border border-slate-200 rounded-lg bg-white w-full focus:outline-none"
                      />
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleAddOption(group.id)} className={`${editingOptionId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-600 hover:bg-purple-700'} text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs`}>
                          {editingOptionId ? 'ອັບເດດຮ້ານ' : 'ບັນທຶກຮ້ານ'}
                        </button>
                        <button onClick={clearOptionForm} className="bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs px-3 py-2 rounded-lg">
                          ຍົກເລີກ
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { clearOptionForm(); setActiveGroupId(group.id); }} 
                    className="w-full py-2.5 bg-slate-50 hover:bg-purple-50/50 text-purple-600 hover:text-purple-700 border border-dashed border-slate-200 hover:border-purple-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition"
                  >
                    <Plus size={14} /> + ເພີ່ມຂໍ້ມູນຮ້ານຄ້າເພື່ອປຽບທຽບ (ຮ້ານທີ {group.options.length + 1})
                  </button>
                )}

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}

export default App;