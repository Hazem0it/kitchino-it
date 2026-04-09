const API_URL = 'https://script.google.com/macros/s/AKfycbzix4wbgRr7phVjFdwZ1H9ml35tidBIH1HNe-srpCMoF7t8vHU9NgU0w2bqCGW_Fyegxg/exec';

function normalizeArabic(text) {
    if (!text) return '';
    return text.replace(/[أإآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ً|ٌ|ٍ|َ|ُ|ِ|ّ|ْ/g, '');
}

function colorizeText(text) {
    if (!text) return '-';
    const colors = ['text-cyan-300', 'text-green-400', 'text-purple-300', 'text-yellow-400', 'text-pink-300'];
    const parts = text.split('/');
    if (parts.length === 1) return text;
    return parts.map((part, index) => {
        return `<span class="${colors[index % colors.length]} font-semibold">${part.trim()}</span>`;
    }).join('<span class="text-slate-600 font-black mx-2">/</span>');
}

let usersDB = [
    { username: 'hazem', pass: '12345', role: 'Admin' },
    { username: 'admin', pass: '12345', role: 'Admin' },
    { username: 'viewer', pass: '12345', role: 'Viewer' }
];
let currentUserRole = ''; 
let inactivityTimer;

window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('kitchino_user');
    if(savedUser) {
        const userObj = JSON.parse(savedUser);
        currentUserRole = userObj.role;
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('main-dashboard').classList.remove('hidden');
        document.getElementById('display-user-name').innerText = userObj.username;
        document.getElementById('display-user-role').innerText = userObj.role;
        startInactivityTimer();
    }
});

function startInactivityTimer() { window.onload = resetTimer; document.onmousemove = resetTimer; document.onkeypress = resetTimer; document.onclick = resetTimer; resetTimer(); }
function resetTimer() { clearTimeout(inactivityTimer); inactivityTimer = setTimeout(logout, 10 * 60 * 1000); }

function handleLogin() { 
    const u = document.getElementById('login-user').value.trim().toLowerCase();
    const p = document.getElementById('login-pass').value.trim(); 
    const v = usersDB.find(x => x.username.toLowerCase() === u && x.pass === p); 
    if(v) {
        currentUserRole = v.role; 
        localStorage.setItem('kitchino_user', JSON.stringify(v)); 
        document.getElementById('login-view').classList.add('opacity-0');
        setTimeout(() => {
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('main-dashboard').classList.remove('hidden');
            document.getElementById('display-user-name').innerText = v.username;
            document.getElementById('display-user-role').innerText = v.role;
            showToast('مرحباً بك في النظام');
            startInactivityTimer();
        }, 500);
    } else { showToast('خطأ في اسم المستخدم أو كلمة المرور', true); }
}

function logout() { 
    clearTimeout(inactivityTimer); localStorage.removeItem('kitchino_user');
    document.getElementById('main-dashboard').classList.add('hidden'); 
    document.getElementById('login-view').classList.remove('hidden','opacity-0'); 
    document.getElementById('login-user').value = ''; document.getElementById('login-pass').value = ''; currentUserRole = '';
}

function checkPermission() {
    if (currentUserRole === 'Viewer') { showToast('عفواً، حسابك للمشاهدة فقط. غير مصرح لك بالتعديل.', true); return false; }
    return true;
}

function renderUsersTable() { 
    const tb = document.getElementById('users-tbody'); 
    tb.innerHTML = usersDB.map((u,i) => `
        <tr class="data-row border-b border-slate-700/50">
            <td class="p-4 font-bold text-white text-center"><i class="fa-solid fa-user-tie text-slate-500 ml-2"></i>${u.username}</td>
            <td class="p-4 text-center"><span class="px-2 py-1 rounded text-xs font-bold ${u.role==='Admin' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400'}">${u.role}</span></td>
            <td class="p-4 text-center"><div class="flex justify-center gap-2"><input type="text" id="pass-${i}" value="${u.pass}" class="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white w-32 outline-none focus:border-cyan-500"><button onclick="changePass(${i})" class="bg-slate-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow">تحديث</button></div></td>
            <td class="p-4 text-center"><button onclick="deleteUser(${i})" class="text-slate-500 hover:text-red-500 transition text-lg"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join(''); 
}
function addUser() { if(!checkPermission()) return; const u = document.getElementById('new-username').value.trim(); const p = document.getElementById('new-password').value.trim(); if(!u || !p) return showToast('يرجى كتابة البيانات', true); usersDB.push({username: u, pass: p, role: document.getElementById('new-role').value}); renderUsersTable(); document.getElementById('new-username').value = ''; document.getElementById('new-password').value = ''; showToast('تمت الإضافة بنجاح'); }
function changePass(i) { if(!checkPermission()) return; usersDB[i].pass = document.getElementById(`pass-${i}`).value; showToast('تم تحديث كلمة المرور'); }
function deleteUser(i) { if(!checkPermission()) return; if(usersDB[i].username.toLowerCase() === 'hazem') return showToast('لا يمكن حذف حساب الإدارة الأساسي', true); usersDB.splice(i,1); renderUsersTable(); showToast('تم الحذف'); }

function showToast(msg, err=false) { const t=document.getElementById('toast'); t.className=`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-[9999] transition-opacity duration-300 flex items-center gap-3 text-white pointer-events-none border border-white/10 ${err?'bg-red-600':'bg-green-600'}`; document.getElementById('toast-msg').innerText=msg; t.querySelector('i').className=err?'fa-solid fa-circle-exclamation text-xl':'fa-solid fa-circle-check text-xl'; t.classList.remove('opacity-0'); setTimeout(()=>t.classList.add('opacity-0'),3500); }
function openModal(id) { document.getElementById(id).classList.remove('hidden'); if(id==='settings-modal') renderUsersTable(); setTimeout(()=>document.getElementById(id).classList.remove('opacity-0'),10); }
function closeModal(id) { document.getElementById(id).classList.add('opacity-0'); setTimeout(()=>document.getElementById(id).classList.add('hidden'),300); }
function openSettingsModal() { openModal('settings-modal'); }

// ==========================================
// 🚀 قسم التذاكر
// ==========================================
let allTicketsData = []; let currentFilter = 'all';
let currentTicketAssets = []; 

function openTicketsModal() { openModal('tickets-modal'); loadTickets(); }

async function loadTickets() { 
    document.getElementById('tickets-tbody').innerHTML='<tr><td colspan="8" class="text-center py-20"><span class="loader"></span> جاري التحميل...</td></tr>'; 
    try{ 
        const res=await fetch(`${API_URL}?type=tickets`); 
        allTicketsData=await res.json(); 
        renderTickets(); 
    } catch(e){ 
        document.getElementById('tickets-tbody').innerHTML='<tr><td colspan="8" class="text-center py-20 text-red-500">خطأ في الاتصال</td></tr>'; 
    } 
}

function filterTickets(s) { 
    currentFilter=s; 
    document.querySelectorAll('.filter-tab').forEach(t=>{t.classList.remove('active','bg-cyan-600','text-white','border-cyan-500');t.classList.add('bg-slate-800','text-slate-300');}); 
    const at=document.getElementById(s==='all'?'tab-all':(s==='مفتوحة'?'tab-open':(s==='مغلق'?'tab-closed':'tab-progress'))); 
    at.classList.remove('bg-slate-800','text-slate-300'); 
    at.classList.add('active','bg-cyan-600','text-white','border-cyan-500'); 
    renderTickets(); 
}

function renderTickets() { 
    const tb=document.getElementById('tickets-tbody'); 
    let h=''; 
    allTicketsData.filter(r => {
        let hasData = false;
        for (const key in r) {
            if (key !== 'رقم التيكت' && key !== 'الحالة (مفتوحة/قيد العمل/مغلقة)' && key !== 'الحالة') {
                if (String(r[key]).trim() !== '') { hasData = true; break; }
            }
        }
        if (!r['رقم التيكت'] || !hasData) return false; 
        
        const s=r['الحالة (مفتوحة/قيد العمل/مغلقة)'] || 'مفتوحة';
        if (currentFilter === 'all') return true;
        if (currentFilter === 'مفتوحة') return s !== 'مغلق' && s !== 'قيد العمل';
        return s === currentFilter;
    }).forEach(r=>{ 
        const idx=allTicketsData.findIndex(i=>i['رقم التيكت']===r['رقم التيكت']); 
        const s=r['الحالة (مفتوحة/قيد العمل/مغلقة)'] || 'مفتوحة'; 
        const sb=s==='مغلق'?'<span class="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">مغلق</span>':(s==='قيد العمل'?'<span class="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">قيد العمل</span>':'<span class="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 animate-pulse">مفتوحة</span>'); 
        
        h+=`<tr class="data-row">
            <td class="p-4 font-black text-white text-lg text-center">#${r['رقم التيكت']}</td>
            <td class="p-4 text-cyan-300 font-bold text-center">${r['اسم المستخدم']||'-'}</td>
            <td class="p-4 max-w-[200px] truncate text-center" title="${r['مشكله']||''}">${r['مشكله']||'-'}</td>
            <td class="p-4 text-xs font-bold text-center">${r['الفرع']||'-'}</td>
            <td class="p-4 text-xs text-slate-400 font-mono text-center">${r['تاريخ التبليغ']||'-'}</td>
            <td class="p-4 text-xs text-slate-400 font-mono text-center">${r['تاريخ الحل']||'-'}</td>
            <td class="p-4 text-center">${sb}</td>
            <td class="p-4 text-center sticky left-0 bg-slate-900 border-r border-slate-700/50 shadow-[-5px_0_10px_rgba(0,0,0,0.3)] z-10"><button onclick="openTicketForm(${idx})" class="bg-slate-700 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow">تحديث</button></td>
        </tr>`;
    }); 
    tb.innerHTML=h||'<tr><td colspan="8" class="text-center py-20 text-slate-500">لا توجد تذاكر متطابقة</td></tr>'; 
}

async function loadCompanyDataForTicket(selectedLoc = '', selectedUser = '') {
    const company = document.getElementById('t-company').value;
    const locSelect = document.getElementById('t-location');
    const userSelect = document.getElementById('t-user');
    
    if (!company) {
        locSelect.innerHTML = '<option value="">اختر الشركة أولاً...</option>';
        userSelect.innerHTML = '<option value="">اختر الشركة أولاً...</option>';
        currentTicketAssets = [];
        return;
    }

    locSelect.innerHTML = '<option value="">جاري التحميل...</option>';
    userSelect.innerHTML = '<option value="">جاري التحميل...</option>';

    try {
        const res = await fetch(`${API_URL}?type=assets&branch=${encodeURIComponent(company)}`);
        currentTicketAssets = await res.json();
        
        const uniqueLocs = new Set();
        currentTicketAssets.forEach(r => {
            const loc = (r['Branche \\ Location '] || r['Branche \\ Location'] || '').trim();
            if (loc && loc !== '-') uniqueLocs.add(loc);
        });
        
        let locHtml = '<option value="">-- كل الفروع --</option>';
        Array.from(uniqueLocs).sort().forEach(loc => { locHtml += `<option value="${loc}">${loc}</option>`; });
        locSelect.innerHTML = locHtml;

        if (selectedLoc && uniqueLocs.has(selectedLoc)) locSelect.value = selectedLoc;
        else if (selectedLoc) { locSelect.innerHTML += `<option value="${selectedLoc}">${selectedLoc}</option>`; locSelect.value = selectedLoc; }

        filterUsersByLocation(selectedUser);

    } catch (e) {
        locSelect.innerHTML = '<option value="">خطأ بالتحميل</option>';
        userSelect.innerHTML = '<option value="">خطأ بالتحميل</option>';
    }
}

function filterUsersByLocation(selectedUser = '') {
    const locSelect = document.getElementById('t-location').value;
    const userSelect = document.getElementById('t-user');
    
    const uniqueUsers = new Set();
    currentTicketAssets.forEach(r => {
        const rLoc = (r['Branche \\ Location '] || r['Branche \\ Location'] || '').trim();
        const empName = (r['اسم الموظف'] || '').trim();
        if (empName) {
            if (!locSelect || locSelect === rLoc) { uniqueUsers.add(empName); }
        }
    });

    let userHtml = '<option value="">-- اختر الموظف --</option>';
    Array.from(uniqueUsers).sort().forEach(user => { userHtml += `<option value="${user}">${user}</option>`; });
    userSelect.innerHTML = userHtml;

    if (selectedUser && uniqueUsers.has(selectedUser)) userSelect.value = selectedUser;
    else if (selectedUser) { userSelect.innerHTML += `<option value="${selectedUser}">${selectedUser}</option>`; userSelect.value = selectedUser; }
}

async function addNewUserFromTicket() {
    if(!checkPermission()) return;
    const company = document.getElementById('t-company').value;
    if (!company) return showToast('يرجى اختيار الشركة أولاً', true);

    const newName = prompt('أدخل اسم الموظف الجديد:');
    if (!newName || newName.trim() === '') return;
    
    let currentLoc = document.getElementById('t-location').value;
    const newLocation = prompt(`أدخل الفرع الخاص بـ ${newName}:`, currentLoc || 'الفرع الرئيسي');
    if(newLocation === null) return; 
    
    const userSelect = document.getElementById('t-user');
    userSelect.innerHTML += `<option value="${newName}" selected>جاري التسجيل...</option>`;
    userSelect.value = newName;

    const payload = {
        action: "add_asset",
        branch: company,
        admin: document.getElementById('display-user-name').innerText,
        updates: {
            "Board Serial Number": "PENDING-" + Math.floor(Math.random() * 100000),
            "اسم الموظف": newName,
            "Branche \\ Location": newLocation
        }
    };

    try {
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type': 'text/plain;charset=utf-8'} });
        const json = await res.json();
        if(json.success) { showToast(`تم إضافة ${newName} لفرع ${newLocation}!`); await loadCompanyDataForTicket(newLocation, newName); } 
        else { showToast(json.message, true); await loadCompanyDataForTicket(); }
    } catch(e) { showToast('خطأ بالاتصال', true); }
}

async function openTicketForm(idx=-1) { 
    openModal('ticket-form-modal');
    
    if(idx===-1){ 
        document.getElementById('ticket-form-title').innerHTML='<i class="fa-solid fa-plus text-red-500 ml-2"></i>إضافة تذكرة جديدة'; 
        document.getElementById('t-id').value=''; 
        document.getElementById('t-company').value=''; 
        document.getElementById('t-location').innerHTML='<option value="">اختر الشركة أولاً...</option>'; 
        document.getElementById('t-user').innerHTML='<option value="">اختر الشركة أولاً...</option>'; 
        document.getElementById('t-problem').value=''; 
        document.getElementById('t-status').value='مفتوحة'; 
        document.getElementById('t-report').value=new Date().toISOString().split('T')[0]; 
        document.getElementById('t-solve').value=''; 
        document.getElementById('t-reason').value=''; 
        currentTicketAssets = [];
    }else{ 
        const r=allTicketsData[idx]; 
        document.getElementById('ticket-form-title').innerHTML='<i class="fa-solid fa-pen text-red-500 ml-2"></i>تعديل التذكرة #' + r['رقم التيكت']; 
        document.getElementById('t-id').value=r['رقم التيكت']; 
        
        let savedBranch = r['الفرع'] || '';
        let comp = '', loc = '';
        if(savedBranch.includes(' - ')) {
            const parts = savedBranch.split(' - ');
            comp = parts[0];
            loc = parts.slice(1).join(' - ');
        } else {
            comp = savedBranch;
        }

        document.getElementById('t-company').value = comp; 
        
        if (comp) { await loadCompanyDataForTicket(loc, r['اسم المستخدم']); } 
        else {
            document.getElementById('t-location').innerHTML = `<option value="">--</option>`;
            document.getElementById('t-user').innerHTML = `<option value="${r['اسم المستخدم']}">${r['اسم المستخدم']}</option>`;
            document.getElementById('t-user').value = r['اسم المستخدم'] || '';
        }

        document.getElementById('t-problem').value=r['مشكله']||''; 
        const s=r['الحالة (مفتوحة/قيد العمل/مغلقة)']; 
        document.getElementById('t-status').value=(s==='مغلق'||s==='قيد العمل')?s:'مفتوحة'; 
        const f=d=>d&&d.match(/^\d{4}-\d{2}-\d{2}/)?d.substring(0,10):''; 
        document.getElementById('t-report').value=f(r['تاريخ التبليغ']); 
        document.getElementById('t-solve').value=f(r['تاريخ الحل']); 
        document.getElementById('t-reason').value=r['السبب']||''; 
    } 
}

async function saveTicket() { 
    if(!checkPermission()) return;
    const btn=document.getElementById('save-ticket-btn'); btn.innerHTML='<span class="loader !w-5 !h-5"></span>'; btn.disabled=true; 
    
    const comp = document.getElementById('t-company').value;
    const loc = document.getElementById('t-location').value;
    const fullBranch = loc ? `${comp} - ${loc}` : comp;

    const p={action:"save_ticket",is_new:document.getElementById('t-id').value==='',admin:document.getElementById('display-user-name').innerText,ticket_data:{id:document.getElementById('t-id').value,user:document.getElementById('t-user').value,problem:document.getElementById('t-problem').value,branch:fullBranch,status:document.getElementById('t-status').value,report_date:document.getElementById('t-report').value,solve_date:document.getElementById('t-solve').value,reason:document.getElementById('t-reason').value,notes:''}}; 
    
    try{ const res=await fetch(API_URL,{method:'POST',body:JSON.stringify(p),headers:{'Content-Type':'text/plain;charset=utf-8'}}); const j=await res.json(); if(j.success){showToast(j.message);closeModal('ticket-form-modal');loadTickets();}else showToast(j.message,true); }catch(e){showToast('خطأ بالاتصال',true);}finally{btn.innerHTML='حفظ التذكرة';btn.disabled=false;} 
}

// ==========================================
// 🚀 قسم الأصول (مضاف له التحديد والطباعة المجمعة)
// ==========================================
let currentAssetsData = [];
// الذاكرة المؤقتة لحفظ الموظفين اللي بتعلم عليهم للطباعة
let selectedEmployeesForPrint = [];

function openAssetsModal() { 
    openModal('assets-modal'); 
    loadBranchData(); 
    document.getElementById('asset-search').value = ''; 
    document.getElementById('status-filter').value = 'all'; 
    document.getElementById('location-filter').value = 'all';
}

async function loadBranchData() {
    const tbody = document.getElementById('assets-tbody');
    tbody.innerHTML = '<tr><td colspan="17" class="text-center py-20"><span class="loader"></span> جاري سحب البيانات...</td></tr>';
    const branch = document.getElementById('branch-select').value;
    try {
        const res = await fetch(`${API_URL}?type=assets&branch=${encodeURIComponent(branch)}`);
        currentAssetsData = await res.json();
        updateDeptDropdown(currentAssetsData);
        updateLocationDropdown(currentAssetsData);
        renderAssetsTable();
        makeTableResizable(); 
        searchAssets(); 
    } catch(e) { tbody.innerHTML = '<tr><td colspan="17" class="text-center py-20 text-red-500">حدث خطأ أثناء الجلب</td></tr>'; }
}

function updateDeptDropdown(data) {
    const deptSelect = document.getElementById('dept-filter');
    const uniqueDepts = new Set();
    data.forEach(r => { const os = (r['O.S'] || '').trim(); if(os && os !== '-') uniqueDepts.add(os); });
    let html = '<option value="all">كل الأقسام</option>';
    uniqueDepts.forEach(dept => { html += `<option value="${dept}">${dept}</option>`; });
    deptSelect.innerHTML = html;
}

function updateLocationDropdown(data) {
    const locSelect = document.getElementById('location-filter');
    const uniqueLocs = new Set();
    data.forEach(r => { 
        const loc = (r['Branche \\ Location '] || r['Branche \\ Location'] || '').trim(); 
        if(loc && loc !== '-') uniqueLocs.add(loc); 
    });
    let html = '<option value="all">كل المواقع</option>';
    uniqueLocs.forEach(loc => { html += `<option value="${loc}">${loc}</option>`; });
    locSelect.innerHTML = html;
}

function renderAssetsTable() {
    const tbody = document.getElementById('assets-tbody');
    const currentCompany = document.getElementById('branch-select').value;
    const prefix = currentCompany.substring(0,3).toUpperCase(); 

    let html = ''; let count = 0;
    currentAssetsData.forEach((r, index) => {
        const serialRaw = r['Board Serial Number'] || r['سيريال لاب توب'] || '';
        const empName = r['اسم الموظف'] || '';
        const prevEmp = r['الموظف السابق'] || '';
        
        if(!serialRaw && !empName) return;
        count++;
        
        const barcodeID = `${prefix}-${String(count).padStart(3, '0')}`;

        let empDisplay = '';
        let statusVal = 'inuse';
        let printTitle = empName;

        if (empName === '') {
            statusVal = 'available';
            printTitle = 'جهاز متوفر';
            empDisplay = `<span class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">جهاز متوفر</span>`;
            if(prevEmp) empDisplay += `<br><span class="text-[10px] text-slate-400 mt-1 block font-mono">سابقاً: ${prevEmp}</span>`;
        } else {
            empDisplay = `<i class="fa-solid fa-user text-slate-500 ml-2 text-xs"></i>${empName}`;
        }

        const coloredSerial = colorizeText(serialRaw);
        const hwRaw = r['Hardware'] || r['مواصفات الجهاز'] || '';
        const coloredHardware = colorizeText(hwRaw);

        // 🚀 تحديد إذا كان الموظف متعلم عليه من قبل ولا لأ
        const isChecked = selectedEmployeesForPrint.some(e => e.name === empName && e.company === currentCompany);
        // زرار التحديد يظهر فقط لو في موظف
        const checkboxHtml = empName ? `<input type="checkbox" class="w-4 h-4 cursor-pointer accent-blue-500 rounded border-slate-600" data-emp="${empName}" data-title="${r['O.S'] || ''}" data-company="${currentCompany}" onchange="togglePrintSelection(this)" ${isChecked ? 'checked' : ''}>` : '-';

        html += `
            <tr class="data-row asset-row" data-status="${statusVal}">
                <td class="p-4 font-bold text-slate-400 text-center">${count}</td>
                <td class="p-4 text-center">${checkboxHtml}</td>
                <td class="p-4 font-mono text-purple-400 text-center font-bold asset-search-val tracking-widest">${barcodeID}</td>
                <td class="p-4 font-bold text-white asset-search-val text-right whitespace-nowrap">${empDisplay}</td>
                <td class="p-4 text-xs text-slate-300 text-center">${r['Computer Name'] || '-'}</td>
                <td class="p-4 font-mono text-sm asset-search-val text-center" dir="ltr">${coloredSerial}</td>
                <td class="p-4 text-xs text-slate-300 text-center">${r['User Name'] || '-'}</td>
                <td class="p-4 text-xs text-slate-300 os-search-val text-center"><span class="bg-slate-800 px-2 py-1 rounded border border-slate-700">${r['O.S'] || '-'}</span></td>
                <td class="p-4 text-xs text-slate-300 max-w-[150px] truncate text-center" title="${r['Model'] || ''}">${r['Model'] || '-'}</td>
                <td class="p-4 text-xs text-slate-300 max-w-[350px] truncate text-center" title="${hwRaw}" dir="ltr">${coloredHardware}</td>
                <td class="p-4 text-xs text-slate-300 text-center">${r['Printer '] || r['Printer'] || '-'}</td>
                <td class="p-4 text-xs text-slate-300 max-w-[200px] truncate text-center" title="${r['O.S. & Programes'] || ''}">${r['O.S. & Programes'] || '-'}</td>
                <td class="p-4 text-xs text-slate-300 loc-search-val text-center">${r['Branche \\ Location '] || r['Branche \\ Location'] || '-'}</td>
                <td class="p-4 text-xs font-mono text-yellow-400 text-center">${r['pass usb'] || '-'}</td>
                <td class="p-4 text-xs font-mono text-yellow-400 text-center">${r['pass win'] || '-'}</td>
                <td class="p-4 text-xs text-slate-300 text-center">${r['Phone and serial number'] || '-'}</td>
                <td class="p-4 text-center bg-slate-900 sticky left-0 shadow-[-5px_0_10px_rgba(0,0,0,0.3)] border-r border-slate-700/50 z-10">
                    <div class="flex justify-center gap-1">
                        <button onclick="openTransferModal(${index})" title="نقل إلى شركة أخرى" class="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-500 hover:text-white px-2 py-1.5 rounded shadow transition text-xs"><i class="fa-solid fa-truck-fast"></i></button>
                        <button onclick="printSingleBarcode('${barcodeID}', '${printTitle}')" title="طباعة الباركود" class="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-2 py-1.5 rounded shadow transition text-xs"><i class="fa-solid fa-print"></i></button>
                        ${empName !== '' ? `<button onclick="revokeAsset(${index})" title="سحب العهدة" class="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2 py-1.5 rounded shadow transition text-xs"><i class="fa-solid fa-arrow-rotate-left"></i></button>` : ''}
                        <button onclick="openAssetEdit(${index})" class="bg-slate-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded shadow transition text-xs font-bold"><i class="fa-solid fa-pen"></i></button>
                    </div>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="17" class="text-center py-20 text-slate-500">لا توجد بيانات مسجلة في هذا الفرع</td></tr>';
}

// 🚀 دالة إضافة وإزالة الموظف من قائمة الطباعة
function togglePrintSelection(checkbox) {
    const empData = {
        company: checkbox.dataset.company,
        name: checkbox.dataset.emp,
        title: checkbox.dataset.title
    };
    
    if (checkbox.checked) {
        if (!selectedEmployeesForPrint.some(e => e.name === empData.name && e.company === empData.company)) {
            selectedEmployeesForPrint.push(empData);
        }
    } else {
        selectedEmployeesForPrint = selectedEmployeesForPrint.filter(e => !(e.name === empData.name && e.company === empData.company));
    }
    document.getElementById('print-count').innerText = selectedEmployeesForPrint.length;
}

// 🚀 دالة طباعة كشف A4 مجمع وشيك
function printSelectedEmployees() {
    if (selectedEmployeesForPrint.length === 0) {
        showToast('برجاء تحديد موظف واحد على الأقل من الجدول أولاً', true);
        return;
    }

    // تجميع الموظفين حسب الشركة
    const grouped = selectedEmployeesForPrint.reduce((acc, curr) => {
        if (!acc[curr.company]) acc[curr.company] = [];
        acc[curr.company].push(curr);
        return acc;
    }, {});

    let win = window.open('', '', 'width=900,height=700');
    let html = `
        <html dir="rtl" lang="ar">
        <head>
            <title>كشف تسليم/تسكين عُهد الموظفين</title>
            <style>
                @page { size: A4; margin: 20mm; }
                body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #333; background: #fff; margin: 0; padding: 20px; }
                h1 { text-align: center; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 30px; font-size: 26px;}
                .company-box { margin-bottom: 40px; page-break-inside: avoid; }
                .company-header { background-color: #1e293b; color: #fff; padding: 12px 20px; border-radius: 8px 8px 0 0; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;}
                .emp-count { background: #38bdf8; color: #0f172a; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; border-top: none; }
                th, td { border: 1px solid #e2e8f0; padding: 12px 15px; text-align: right; }
                th { background-color: #f8fafc; font-weight: bold; color: #475569; width: 50%; font-size: 16px;}
                td { font-size: 15px; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            </style>
        </head>
        <body>
            <h1>تقرير العُهد المُجمّع للموظفين</h1>
    `;

    for (const [company, emps] of Object.entries(grouped)) {
        html += `
            <div class="company-box">
                <div class="company-header">
                    <span>شركة / فرع: <span style="color:#38bdf8">${company.toUpperCase()}</span></span>
                    <span class="emp-count">العدد المرفق: ${emps.length}</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>اسم الموظف</th>
                            <th>القسم / الوظيفة</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        emps.forEach(emp => {
            html += `
                <tr>
                    <td><strong>${emp.name}</strong></td>
                    <td>${emp.title || 'غير محدد'}</td>
                </tr>
            `;
        });
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    html += `
            <div class="footer">تم إنشاء هذا التقرير تلقائياً من نظام Kitchino IT Operations Center &copy; ${new Date().getFullYear()}</div>
            <script>
                setTimeout(() => { window.print(); }, 800);
            <\/script>
        </body>
        </html>
    `;

    win.document.write(html);
    win.document.close();
}

function printSingleBarcode(code, textLine) {
    let win = window.open('', '', 'width=600,height=400');
    win.document.write(`
        <html><head><title>Print Barcode</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
        </head><body onload="JsBarcode('#bc', '${code}', {displayValue:true, height: 80, fontSize: 18}); setTimeout(()=>window.print(), 500);">
        <div style="text-align:center; margin-top:50px; border:2px dashed #000; padding:20px; display:inline-block; border-radius:10px;">
        <h3 style="font-family:sans-serif;">${textLine}</h3><svg id="bc"></svg></div>
        </body></html>
    `);
    win.document.close();
}

function printAllBarcodes() {
    let win = window.open('', '', 'width=800,height=600');
    const currentCompany = document.getElementById('branch-select').value;
    const prefix = currentCompany.substring(0,3).toUpperCase();
    
    let html = `<html><head><title>Print All Barcodes</title><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script><style>.grid{display:grid; grid-template-columns: repeat(2, 1fr); gap: 20px; font-family:sans-serif;} .card{text-align:center; border:2px dashed #000; padding:15px; border-radius:10px; break-inside: avoid;}</style></head><body><div class="grid">`;

    let count = 0;
    currentAssetsData.forEach(r => {
         const empName = r['اسم الموظف'] || '';
         const serialRaw = r['Board Serial Number'] || r['سيريال لاب توب'] || '';
         if(!serialRaw && !empName) return;
         count++;
         let title = empName || 'جهاز متوفر';
         html += `<div class="card"><h4>${title}</h4><svg id="bc-${count}"></svg></div>`;
    });

    html += `</div><script>`;
    count = 0;
    currentAssetsData.forEach(r => {
         const empName = r['اسم الموظف'] || '';
         const serialRaw = r['Board Serial Number'] || r['سيريال لاب توب'] || '';
         if(!serialRaw && !empName) return;
         count++;
         let code = `${prefix}-${String(count).padStart(3, '0')}`;
         html += `JsBarcode("#bc-${count}", "${code}", {displayValue:true, height: 60, fontSize: 16});\n`;
    });
    html += `setTimeout(()=>window.print(), 1000);<\/script></body></html>`;
    
    win.document.write(html);
    win.document.close();
}

function openTransferModal(index) {
    if(!checkPermission()) return;
    const r = currentAssetsData[index];
    const serial = r['Board Serial Number'] || r['سيريال لاب توب'] || '';
    const empName = r['اسم الموظف'] || '';
    const currentCompany = document.getElementById('branch-select').value;

    document.getElementById('tr-display-name').innerText = empName ? `الموظف: ${empName}` : `سيريال: ${serial}`;
    document.getElementById('tr-serial').value = serial;
    document.getElementById('tr-emp').value = empName;
    document.getElementById('tr-old-branch').value = currentCompany;
    document.getElementById('tr-new-branch').value = currentCompany; 
    
    openModal('transfer-modal');
}

async function confirmTransfer() {
    if(!checkPermission()) return;
    const btn = document.getElementById('save-transfer-btn'); 
    
    const oldBranch = document.getElementById('tr-old-branch').value;
    const newBranch = document.getElementById('tr-new-branch').value;
    const serial = document.getElementById('tr-serial').value;
    const empName = document.getElementById('tr-emp').value;

    if(oldBranch === newBranch) { showToast('يرجى اختيار شركة مختلفة للنقل!', true); return; }

    btn.innerHTML = '<span class="loader !w-5 !h-5"></span>'; btn.disabled = true;

    const payload = {
        action: "transfer_asset",
        old_branch: oldBranch,
        new_branch: newBranch,
        serial: serial,
        emp_name: empName,
        admin: document.getElementById('display-user-name').innerText
    };

    try { 
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } }); 
        const json = await res.json(); 
        if(json.success) { showToast(json.message); closeModal('transfer-modal'); loadBranchData(); } 
        else { showToast(json.message, true); } 
    } catch(e) { showToast('خطأ بالاتصال بالخادم', true); } 
    finally { btn.innerHTML = 'تأكيد النقل'; btn.disabled = false; }
}

function searchAssets() {
    const inputRaw = document.getElementById('asset-search').value.toLowerCase();
    const input = normalizeArabic(inputRaw);
    const deptFilter = document.getElementById('dept-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const locFilter = document.getElementById('location-filter').value;
    const rows = document.querySelectorAll('.asset-row');
    
    rows.forEach(row => {
        let textToSearch = '';
        row.querySelectorAll('.asset-search-val').forEach(c => textToSearch += c.textContent.toLowerCase() + ' ');
        const osVal = row.querySelector('.os-search-val').textContent.trim();
        const locVal = row.querySelector('.loc-search-val').textContent.trim();
        const statusVal = row.getAttribute('data-status');
        
        const matchesText = normalizeArabic(textToSearch).includes(input);
        const matchesDept = (deptFilter === 'all' || osVal === deptFilter);
        const matchesStatus = (statusFilter === 'all' || statusVal === statusFilter);
        const matchesLoc = (locFilter === 'all' || locVal === locFilter);
        
        row.style.display = (matchesText && matchesDept && matchesStatus && matchesLoc) ? "" : "none";
    });
}

function makeTableResizable() {
    const table = document.getElementById("assets-table");
    const cols = table.querySelectorAll("th");
    [].forEach.call(cols, function (col) {
        if(col.querySelector('.resizer')) return; 
        const resizer = document.createElement("div"); resizer.classList.add("resizer"); col.appendChild(resizer);
        let x = 0, w = 0;
        const mouseDownHandler = function (e) { x = e.clientX; const styles = window.getComputedStyle(col); w = parseInt(styles.width, 10); document.addEventListener('mousemove', mouseMoveHandler); document.addEventListener('mouseup', mouseUpHandler); resizer.classList.add('resizing'); };
        const mouseMoveHandler = function (e) { const dx = x - e.clientX; const newWidth = Math.max(50, w + dx); col.style.width = `${newWidth}px`; col.style.minWidth = `${newWidth}px`; col.style.maxWidth = `${newWidth}px`; };
        const mouseUpHandler = function () { resizer.classList.remove('resizing'); document.removeEventListener('mousemove', mouseMoveHandler); document.removeEventListener('mouseup', mouseUpHandler); };
        resizer.addEventListener('mousedown', mouseDownHandler);
    });
}

function openAssetEdit(index = -1) {
    if(index === -1) {
        document.getElementById('asset-form-title').innerHTML = '<i class="fa-solid fa-user-plus text-cyan-500 ml-2"></i>إضافة جهاز جديد';
        document.getElementById('a-old-serial').value = ''; document.getElementById('a-serial').value = ''; document.getElementById('a-emp').value = ''; document.getElementById('a-comp').value = ''; document.getElementById('a-user').value = ''; document.getElementById('a-os').value = ''; document.getElementById('a-model').value = ''; document.getElementById('a-hard').value = ''; document.getElementById('a-print').value = ''; document.getElementById('a-prog').value = ''; document.getElementById('a-loc').value = ''; document.getElementById('a-usb').value = ''; document.getElementById('a-win').value = ''; document.getElementById('a-phone').value = '';
    } else {
        document.getElementById('asset-form-title').innerHTML = '<i class="fa-solid fa-pen text-cyan-500 ml-2"></i>تعديل بيانات الجهاز';
        const r = currentAssetsData[index]; const serial = r['Board Serial Number'] || r['سيريال لاب توب'] || '';
        document.getElementById('a-old-serial').value = serial; document.getElementById('a-serial').value = serial; document.getElementById('a-emp').value = r['اسم الموظف'] || ''; document.getElementById('a-comp').value = r['Computer Name'] || ''; document.getElementById('a-user').value = r['User Name'] || ''; document.getElementById('a-os').value = r['O.S'] || ''; document.getElementById('a-model').value = r['Model'] || ''; document.getElementById('a-hard').value = r['Hardware'] || r['مواصفات الجهاز'] || ''; document.getElementById('a-print').value = r['Printer '] || r['Printer'] || ''; document.getElementById('a-prog').value = r['O.S. & Programes'] || ''; document.getElementById('a-loc').value = r['Branche \\ Location '] || r['Branche \\ Location'] || ''; document.getElementById('a-usb').value = r['pass usb'] || ''; document.getElementById('a-win').value = r['pass win'] || ''; document.getElementById('a-phone').value = r['Phone and serial number'] || '';
    }
    openModal('asset-edit-modal');
}

async function saveAssetChanges() {
    if(!checkPermission()) return;
    const newEmpName = document.getElementById('a-emp').value.trim(); const currentSerial = document.getElementById('a-old-serial').value;
    if (newEmpName !== '') {
        const isDup = currentAssetsData.some(r => { const s = r['Board Serial Number'] || r['سيريال لاب توب'] || ''; const e = (r['اسم الموظف'] || '').trim(); return e === newEmpName && s !== currentSerial; });
        if (isDup && !confirm(`تنبيه ⚠️ الموظف "${newEmpName}" مسجل له جهاز بالفعل!\nهل أنت متأكد أنك تريد إضافة عهدة أخرى؟`)) return; 
    }
    const btn = document.getElementById('save-asset-btn'); btn.innerHTML = '<span class="loader !w-5 !h-5"></span>'; btn.disabled = true;
    const actionType = currentSerial === '' ? "add_asset" : "update_asset";
    const payload = { action: actionType, branch: document.getElementById('branch-select').value, old_serial: currentSerial, admin: document.getElementById('display-user-name').innerText, updates: { "Board Serial Number": document.getElementById('a-serial').value, "اسم الموظف": newEmpName, "Computer Name": document.getElementById('a-comp').value, "User Name": document.getElementById('a-user').value, "O.S": document.getElementById('a-os').value, "Model": document.getElementById('a-model').value, "Hardware": document.getElementById('a-hard').value, "Printer": document.getElementById('a-print').value, "O.S. & Programes": document.getElementById('a-prog').value, "Branche \\ Location": document.getElementById('a-loc').value, "pass usb": document.getElementById('a-usb').value, "pass win": document.getElementById('a-win').value, "Phone and serial number": document.getElementById('a-phone').value } };
    try { const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } }); const json = await res.json(); if(json.success) { showToast('تم الحفظ بنجاح!'); closeModal('asset-edit-modal'); loadBranchData(); } else showToast(json.message, true); } catch(e) { showToast('خطأ بالاتصال', true); } finally { btn.innerHTML = 'حفظ البيانات'; btn.disabled = false; }
}

// --- سجل الحركات (Logs) ---
function openLogsModal() { openModal('logs-modal'); loadLogs(); }

async function loadLogs() {
    const tbody = document.getElementById('logs-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-20"><span class="loader"></span> جاري سحب السجل...</td></tr>';
    try {
        const res = await fetch(`${API_URL}?type=logs`);
        const data = await res.json();
        let html = '';
        data.slice().reverse().forEach(r => {
            const cols = Object.values(r); 
            if(!cols[0]) return; 
            html += `
                <tr class="data-row hover:bg-slate-800/50 transition border-b border-slate-700/50">
                    <td class="p-4 font-mono text-cyan-300 text-xs text-center">${cols[0] || '-'}</td>
                    <td class="p-4 font-bold text-white text-center"><span class="bg-purple-500/20 text-purple-400 px-3 py-1 rounded text-xs">${cols[1] || '-'}</span></td>
                    <td class="p-4 text-slate-300 text-xs text-center">${cols[2] || '-'}</td>
                    <td class="p-4 text-slate-300 font-bold text-center">${cols[3] || '-'}</td>
                    <td class="p-4 text-cyan-400 font-bold text-xs text-center"><i class="fa-solid fa-user-shield mr-1"></i>${cols[4] || 'غير معروف'}</td>
                </tr>`;
        });
        tbody.innerHTML = html || '<tr><td colspan="5" class="text-center py-20 text-slate-500">لا توجد حركات مسجلة</td></tr>';
    } catch(e) { tbody.innerHTML = '<tr><td colspan="5" class="text-center py-20 text-red-500">خطأ في الاتصال بالبيانات</td></tr>'; }
}

// ==========================================
// 🚀 نظام إدارة الشبكات والروترات
// ==========================================
let allNetworksData = [];

function openNetworksModal() { 
    openModal('networks-modal'); 
    loadNetworks(); 
    document.getElementById('network-search').value = '';
}

async function loadNetworks() { 
    document.getElementById('networks-tbody').innerHTML='<tr><td colspan="12" class="text-center py-20"><span class="loader"></span> جاري سحب بيانات الشبكات...</td></tr>'; 
    try { 
        const res = await fetch(`${API_URL}?type=networks`); 
        allNetworksData = await res.json(); 

        const keys = Object.keys(allNetworksData[0] || {});
        const deviceKeyIndex = keys.indexOf("اسم الاجهزه");
        const branchKey = deviceKeyIndex > 1 ? keys[deviceKeyIndex - 1] : (keys.find(k => k === "" || k === "الفرع") || keys[1]);
        
        let lastBranch = '';
        allNetworksData = allNetworksData.map(r => {
            let currentVal = r[branchKey] !== undefined ? String(r[branchKey]).trim() : '';
            if (currentVal !== '') {
                lastBranch = currentVal;
                r.isChild = false;
            } else {
                r.isChild = true;
            }
            r.displayBranch = lastBranch;
            return r;
        });
        
        renderNetworksTable(); 
    } catch(e) { 
        document.getElementById('networks-tbody').innerHTML='<tr><td colspan="12" class="text-center py-20 text-red-500">خطأ في الاتصال بقاعدة بيانات الشبكات</td></tr>'; 
    } 
}

function renderNetworksTable() {
    const tbody = document.getElementById('networks-tbody');
    let html = ''; 

    allNetworksData.forEach((r, index) => {
        if(!r['ارقام التلفون الارضي'] && !r['ip router'] && !r['name wifi'] && !r['اسم الاجهزه']) return;

        const branch = r.displayBranch || '-';
        const displayBranchHtml = r.isChild ? `<i class="fa-solid fa-turn-up fa-rotate-90 mr-2 text-slate-600"></i><span class="text-slate-500">${branch}</span>` : `<span class="font-bold text-white">${branch}</span>`;
        
        const deviceName = r['اسم الاجهزه'] || '-';
        const phone = r['ارقام التلفون الارضي'] || '-';
        const task = r['المهمه'] || '-';
        const date = r['تاريخ التجديد'] || '-';
        const ip = r['ip router'] || '-';
        const passR = r['pass router'] || '-';
        const wifiN = r['name wifi'] || '-';
        const wifiP = r['pass wifi'] || '-';
        const weApp = r['pass we apps'] || '-';
        const db = r['قوه شبكه db'] || r['db'] || '-';

        html += `
            <tr class="data-row net-row hover:bg-slate-800/50 transition">
                <td class="p-4 text-center net-search-val">${displayBranchHtml}</td>
                <td class="p-4 text-blue-300 font-bold text-center net-search-val">${deviceName}</td>
                <td class="p-4 text-cyan-300 font-mono font-bold text-center net-search-val">${phone}</td>
                <td class="p-4 text-slate-300 text-xs text-center">${task}</td>
                <td class="p-4 text-yellow-400 font-mono text-xs text-center">${date}</td>
                <td class="p-4 text-green-400 font-mono font-bold text-center net-search-val" dir="ltr">${ip}</td>
                <td class="p-4 text-slate-300 font-mono text-xs text-center">${passR}</td>
                <td class="p-4 text-purple-400 font-bold text-center">${wifiN}</td>
                <td class="p-4 text-yellow-300 font-mono text-xs text-center">${wifiP}</td>
                <td class="p-4 text-pink-300 font-mono text-xs text-center">${weApp}</td>
                <td class="p-4 text-slate-400 font-mono text-xs text-center">${db}</td>
                <td class="p-4 text-center sticky left-0 bg-slate-900 border-r border-slate-700/50 shadow-[-5px_0_10px_rgba(0,0,0,0.3)] z-10">
                    <button onclick="openNetworkForm(${index})" class="bg-slate-700 hover:bg-green-600 text-white px-3 py-1.5 rounded shadow transition text-xs font-bold"><i class="fa-solid fa-pen"></i></button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="12" class="text-center py-20 text-slate-500">لا توجد شبكات مسجلة</td></tr>';
}

function searchNetworks() {
    const input = document.getElementById('network-search').value.toLowerCase();
    const rows = document.querySelectorAll('.net-row');
    rows.forEach(row => {
        let text = '';
        row.querySelectorAll('.net-search-val').forEach(cell => text += cell.textContent.toLowerCase() + ' ');
        row.style.display = text.includes(input) ? "" : "none";
    });
}

function openNetworkForm(idx = -1) {
    openModal('network-form-modal');
    if (idx === -1) {
        document.getElementById('network-form-title').innerHTML = '<i class="fa-solid fa-network-wired text-green-500 ml-2"></i>إضافة شبكة/جهاز جديد';
        document.getElementById('n-row-num').value = '';
        document.getElementById('n-branch').value = '';
        document.getElementById('n-device').value = '';
        document.getElementById('n-phone').value = '';
        document.getElementById('n-task').value = '';
        document.getElementById('n-date').value = '';
        document.getElementById('n-ip').value = '';
        document.getElementById('n-passrouter').value = '';
        document.getElementById('n-wifiname').value = '';
        document.getElementById('n-wifipass').value = '';
        document.getElementById('n-weapps').value = '';
        document.getElementById('n-db').value = '';
    } else {
        const r = allNetworksData[idx];
        document.getElementById('network-form-title').innerHTML = '<i class="fa-solid fa-pen text-green-500 ml-2"></i>تعديل بيانات الشبكة/الجهاز';
        
        document.getElementById('n-row-num').value = r['_rowNum'] || '';
        
        const keys = Object.keys(r);
        const deviceKeyIndex = keys.indexOf("اسم الاجهزه");
        const branchColKey = deviceKeyIndex > 1 ? keys[deviceKeyIndex - 1] : (keys.find(k => k === "" || k === "الفرع") || keys[1]);
        
        document.getElementById('n-branch').value = r.displayBranch || '';
        document.getElementById('n-device').value = r['اسم الاجهزه'] || '';
        document.getElementById('n-phone').value = r['ارقام التلفون الارضي'] || '';
        document.getElementById('n-task').value = r['المهمه'] || '';
        document.getElementById('n-date').value = r['تاريخ التجديد'] || '';
        document.getElementById('n-ip').value = r['ip router'] || '';
        document.getElementById('n-passrouter').value = r['pass router'] || '';
        document.getElementById('n-wifiname').value = r['name wifi'] || '';
        document.getElementById('n-wifipass').value = r['pass wifi'] || '';
        document.getElementById('n-weapps').value = r['pass we apps'] || '';
        document.getElementById('n-db').value = r['قوه شبكه db'] || r['db'] || '';
    }
}

async function saveNetwork() {
    if(!checkPermission()) return;
    const btn = document.getElementById('save-network-btn'); 
    btn.innerHTML = '<span class="loader !w-5 !h-5"></span>'; 
    btn.disabled = true;

    const rowNum = document.getElementById('n-row-num').value;
    const isNew = (rowNum === '');

    const keys = Object.keys(allNetworksData[0] || {});
    const deviceKeyIndex = keys.indexOf("اسم الاجهزه");
    const branchColKey = deviceKeyIndex > 1 ? keys[deviceKeyIndex - 1] : (keys.find(k => k === "" || k === "الفرع") || keys[1]);

    const updates = {
        [branchColKey]: document.getElementById('n-branch').value,
        "اسم الاجهزه": document.getElementById('n-device').value,
        "ارقام التلفون الارضي": document.getElementById('n-phone').value,
        "المهمه": document.getElementById('n-task').value,
        "تاريخ التجديد": document.getElementById('n-date').value,
        "ip router": document.getElementById('n-ip').value,
        "pass router": document.getElementById('n-passrouter').value,
        "name wifi": document.getElementById('n-wifiname').value,
        "pass wifi": document.getElementById('n-wifipass').value,
        "pass we apps": document.getElementById('n-weapps').value,
        "قوه شبكه db": document.getElementById('n-db').value
    };

    const payload = {
        action: "save_network",
        is_new: isNew,
        row_num: rowNum,
        admin: document.getElementById('display-user-name').innerText,
        updates: updates
    };

    try { 
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } }); 
        const json = await res.json(); 
        if(json.success) { 
            showToast(json.message); 
            closeModal('network-form-modal'); 
            loadNetworks(); 
        } else { 
            showToast(json.message, true); 
        } 
    } catch(e) { 
        showToast('خطأ بالاتصال بالخادم', true); 
    } finally { 
        btn.innerHTML = 'حفظ الشبكة'; 
        btn.disabled = false; 
    }
}
