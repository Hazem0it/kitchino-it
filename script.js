const API_URL = 'https://script.google.com/macros/s/AKfycbwVUyW77Hfawciw7M06j7TpHX8EGvVovlZJZqrLsDMLMvDW4NqpCglpC2E8Y8wDtd6GRA/exec';

function normalizeArabic(text) {
    if (!text) return '';
    return text.replace(/[أإآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ً|ٌ|ٍ|َ|ُ|ِ|ّ|ْ/g, '');
}

// --- نظام الحسابات وإدارة الجلسات (Session & Inactivity) ---
let usersDB = [
    { username: 'hazem', pass: '12345', role: 'Admin' },
    { username: 'admin', pass: '12345', role: 'Admin' },
    { username: 'viewer', pass: '12345', role: 'Viewer' } // أضفنا يوزر مشاهدة للتجربة
];
let currentUserRole = ''; 
let inactivityTimer;

// التحقق عند تحميل الصفحة
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

function startInactivityTimer() {
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onclick = resetTimer;
    resetTimer();
}

function resetTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logout, 10 * 60 * 1000); // 10 دقائق (600,000 ملي ثانية)
}

function handleLogin() { 
    const u = document.getElementById('login-user').value.trim().toLowerCase();
    const p = document.getElementById('login-pass').value; 
    const v = usersDB.find(x => x.username.toLowerCase() === u && x.pass === p); 
    if(v) {
        currentUserRole = v.role; 
        localStorage.setItem('kitchino_user', JSON.stringify(v)); // حفظ الجلسة
        document.getElementById('login-view').classList.add('opacity-0');
        setTimeout(() => {
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('main-dashboard').classList.remove('hidden');
            document.getElementById('display-user-name').innerText = v.username;
            document.getElementById('display-user-role').innerText = v.role;
            showToast('مرحباً بك في النظام');
            startInactivityTimer();
        }, 500);
    } else {
        showToast('خطأ في اسم المستخدم أو كلمة المرور', true);
    }
}

function logout() { 
    clearTimeout(inactivityTimer);
    localStorage.removeItem('kitchino_user');
    document.getElementById('main-dashboard').classList.add('hidden'); 
    document.getElementById('login-view').classList.remove('hidden','opacity-0'); 
    document.getElementById('login-user').value = ''; 
    document.getElementById('login-pass').value = ''; 
    currentUserRole = '';
}

function checkPermission() {
    if (currentUserRole === 'Viewer') {
        showToast('عفواً، حسابك للمشاهدة فقط. غير مصرح لك بالتعديل.', true);
        return false;
    }
    return true;
}

// --- الإعدادات ---
function renderUsersTable() { 
    const tb = document.getElementById('users-tbody'); 
    tb.innerHTML = usersDB.map((u,i) => `
        <tr class="data-row border-b border-slate-700/50">
            <td class="p-4 font-bold text-white"><i class="fa-solid fa-user-tie text-slate-500 ml-2"></i>${u.username}</td>
            <td class="p-4"><span class="px-2 py-1 rounded text-xs font-bold ${u.role==='Admin' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400'}">${u.role}</span></td>
            <td class="p-4"><div class="flex gap-2"><input type="text" id="pass-${i}" value="${u.pass}" class="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white w-32 outline-none focus:border-cyan-500"><button onclick="changePass(${i})" class="bg-slate-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow">تحديث</button></div></td>
            <td class="p-4 text-center"><button onclick="deleteUser(${i})" class="text-slate-500 hover:text-red-500 transition text-lg"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join(''); 
}
function addUser() { if(!checkPermission()) return; const u = document.getElementById('new-username').value.trim(); const p = document.getElementById('new-password').value.trim(); if(!u || !p) return showToast('يرجى كتابة البيانات', true); usersDB.push({username: u, pass: p, role: document.getElementById('new-role').value}); renderUsersTable(); document.getElementById('new-username').value = ''; document.getElementById('new-password').value = ''; showToast('تمت الإضافة بنجاح'); }
function changePass(i) { if(!checkPermission()) return; usersDB[i].pass = document.getElementById(`pass-${i}`).value; showToast('تم تحديث كلمة المرور'); }
function deleteUser(i) { if(!checkPermission()) return; if(usersDB[i].username.toLowerCase() === 'hazem') return showToast('لا يمكن حذف حساب الإدارة الأساسي', true); usersDB.splice(i,1); renderUsersTable(); showToast('تم الحذف'); }

// --- دوال مساعدة ---
function showToast(msg, err=false) { const t=document.getElementById('toast'); t.className=`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-[9999] transition-opacity duration-300 flex items-center gap-3 text-white pointer-events-none border border-white/10 ${err?'bg-red-600':'bg-green-600'}`; document.getElementById('toast-msg').innerText=msg; t.querySelector('i').className=err?'fa-solid fa-circle-exclamation text-xl':'fa-solid fa-circle-check text-xl'; t.classList.remove('opacity-0'); setTimeout(()=>t.classList.add('opacity-0'),3500); }
function openModal(id) { document.getElementById(id).classList.remove('hidden'); if(id==='settings-modal') renderUsersTable(); setTimeout(()=>document.getElementById(id).classList.remove('opacity-0'),10); }
function closeModal(id) { document.getElementById(id).classList.add('opacity-0'); setTimeout(()=>document.getElementById(id).classList.add('hidden'),300); }
function openSettingsModal() { openModal('settings-modal'); }

// --- التذاكر ---
let allTicketsData = []; let currentFilter = 'all';
function openTicketsModal() { openModal('tickets-modal'); loadTickets(); }
async function loadTickets() { document.getElementById('tickets-tbody').innerHTML='<tr><td colspan="8" class="text-center py-20"><span class="loader"></span> جاري التحميل...</td></tr>'; try{ const res=await fetch(`${API_URL}?type=tickets`); allTicketsData=await res.json(); renderTickets(); }catch(e){ document.getElementById('tickets-tbody').innerHTML='<tr><td colspan="8" class="text-center py-20 text-red-500">خطأ في الاتصال</td></tr>'; } }
function filterTickets(s) { currentFilter=s; document.querySelectorAll('.filter-tab').forEach(t=>{t.classList.remove('active','bg-cyan-600','text-white','border-cyan-500');t.classList.add('bg-slate-800','text-slate-300');}); const at=document.getElementById(s==='all'?'tab-all':(s==='مفتوحة'?'tab-open':(s==='مغلق'?'tab-closed':'tab-progress'))); at.classList.remove('bg-slate-800','text-slate-300'); at.classList.add('active','bg-cyan-600','text-white','border-cyan-500'); renderTickets(); }
function renderTickets() { const tb=document.getElementById('tickets-tbody'); let h=''; allTicketsData.filter(r=>r['رقم التيكت']&&(currentFilter==='all'||(currentFilter==='مفتوحة'&&(r['الحالة (مفتوحة/قيد العمل/مغلقة)']!=='مغلق'&&r['الحالة (مفتوحة/قيد العمل/مغلقة)']!=='قيد العمل'))||r['الحالة (مفتوحة/قيد العمل/مغلقة)']===currentFilter)).forEach(r=>{ const idx=allTicketsData.findIndex(i=>i['رقم التيكت']===r['رقم التيكت']); const s=r['الحالة (مفتوحة/قيد العمل/مغلقة)']; const sb=s==='مغلق'?'<span class="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">مغلق</span>':(s==='قيد العمل'?'<span class="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">قيد العمل</span>':'<span class="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 animate-pulse">مفتوحة</span>'); h+=`<tr class="data-row"><td class="p-4 font-black text-white text-lg">#${r['رقم التيكت']}</td><td class="p-4 text-cyan-300 font-bold">${r['اسم المستخدم']||'-'}</td><td class="p-4 max-w-[200px] truncate" title="${r['مشكله']||''}">${r['مشكله']||'-'}</td><td class="p-4 text-xs font-bold">${r['الفرع']||'-'}</td><td class="p-4 text-xs text-slate-400 font-mono">${r['تاريخ التبليغ']||'-'}</td><td class="p-4 text-xs text-slate-400 font-mono">${r['تاريخ الحل']||'-'}</td><td class="p-4">${sb}</td><td class="p-4 text-center sticky left-0 bg-slate-900 border-r border-slate-700/50 shadow-[-5px_0_10px_rgba(0,0,0,0.3)] z-10"><button onclick="openTicketForm(${idx})" class="bg-slate-700 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow">تحديث</button></td></tr>`;}); tb.innerHTML=h||'<tr><td colspan="8" class="text-center py-20 text-slate-500">لا توجد تذاكر متطابقة</td></tr>'; }
function openTicketForm(idx=-1) { if(idx===-1){ document.getElementById('ticket-form-title').innerHTML='<i class="fa-solid fa-plus text-red-500 ml-2"></i>إضافة تذكرة جديدة'; document.getElementById('t-id').value=''; document.getElementById('t-user').value=''; document.getElementById('t-problem').value=''; document.getElementById('t-status').value='مفتوحة'; document.getElementById('t-report').value=new Date().toISOString().split('T')[0]; document.getElementById('t-solve').value=''; document.getElementById('t-reason').value=''; }else{ const r=allTicketsData[idx]; document.getElementById('ticket-form-title').innerHTML='<i class="fa-solid fa-pen text-red-500 ml-2"></i>تعديل التذكرة #' + r['رقم التيكت']; document.getElementById('t-id').value=r['رقم التيكت']; document.getElementById('t-user').value=r['اسم المستخدم']||''; document.getElementById('t-problem').value=r['مشكله']||''; document.getElementById('t-branch').value=r['الفرع']||''; const s=r['الحالة (مفتوحة/قيد العمل/مغلقة)']; document.getElementById('t-status').value=(s==='مغلق'||s==='قيد العمل')?s:'مفتوحة'; const f=d=>d&&d.match(/^\d{4}-\d{2}-\d{2}/)?d.substring(0,10):''; document.getElementById('t-report').value=f(r['تاريخ التبليغ']); document.getElementById('t-solve').value=f(r['تاريخ الحل']); document.getElementById('t-reason').value=r['السبب']||''; } openModal('ticket-form-modal'); }

async function saveTicket() { 
    if(!checkPermission()) return;
    const btn=document.getElementById('save-ticket-btn'); btn.innerHTML='<span class="loader !w-5 !h-5"></span>'; btn.disabled=true; 
    const p={action:"save_ticket",is_new:document.getElementById('t-id').value==='',admin:document.getElementById('display-user-name').innerText,ticket_data:{id:document.getElementById('t-id').value,user:document.getElementById('t-user').value,problem:document.getElementById('t-problem').value,branch:document.getElementById('t-branch').value,status:document.getElementById('t-status').value,report_date:document.getElementById('t-report').value,solve_date:document.getElementById('t-solve').value,reason:document.getElementById('t-reason').value,notes:''}}; 
    try{ const res=await fetch(API_URL,{method:'POST',body:JSON.stringify(p),headers:{'Content-Type':'text/plain;charset=utf-8'}}); const j=await res.json(); if(j.success){showToast(j.message);closeModal('ticket-form-modal');loadTickets();}else showToast(j.message,true); }catch(e){showToast('خطأ بالاتصال',true);}finally{btn.innerHTML='حفظ';btn.disabled=false;} 
}

// --- الأصول وتكبير الأعمدة ---
let currentAssetsData = [];
function openAssetsModal() { openModal('assets-modal'); loadBranchData(); document.getElementById('asset-search').value = ''; document.getElementById('status-filter').value = 'all'; }

async function loadBranchData() {
    const tbody = document.getElementById('assets-tbody');
    tbody.innerHTML = '<tr><td colspan="15" class="text-center py-20"><span class="loader"></span> جاري سحب البيانات...</td></tr>';
    const branch = document.getElementById('branch-select').value;
    try {
        const res = await fetch(`${API_URL}?type=assets&branch=${encodeURIComponent(branch)}`);
        currentAssetsData = await res.json();
        updateDeptDropdown(currentAssetsData);
        renderAssetsTable();
        makeTableResizable(); 
    } catch(e) { tbody.innerHTML = '<tr><td colspan="15" class="text-center py-20 text-red-500">حدث خطأ أثناء الجلب</td></tr>'; }
}

function updateDeptDropdown(data) {
    const deptSelect = document.getElementById('dept-filter');
    const uniqueDepts = new Set();
    data.forEach(r => { const os = (r['O.S'] || '').trim(); if(os && os !== '-') uniqueDepts.add(os); });
    let html = '<option value="all">كل الأقسام</option>';
    uniqueDepts.forEach(dept => { html += `<option value="${dept}">${dept}</option>`; });
    deptSelect.innerHTML = html;
}

function renderAssetsTable() {
    const tbody = document.getElementById('assets-tbody');
    let html = ''; let count = 0;
    currentAssetsData.forEach((r, index) => {
        const serial = r['Board Serial Number'] || r['سيريال لاب توب'] || '';
        const empName = r['اسم الموظف'] || '';
        const prevEmp = r['الموظف السابق'] || '';
        
        if(!serial && !empName) return;
        count++;
        
        let empDisplay = '';
        let statusVal = 'inuse';
        if (empName === '') {
            statusVal = 'available';
            empDisplay = `<span class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">جهاز متوفر</span>`;
            if(prevEmp) empDisplay += `<br><span class="text-[10px] text-slate-400 mt-1 block font-mono">سابقاً: ${prevEmp}</span>`;
        } else {
            empDisplay = `<i class="fa-solid fa-user text-slate-500 ml-2 text-xs"></i>${empName}`;
        }

        html += `
            <tr class="data-row asset-row" data-status="${statusVal}">
                <td class="font-bold text-slate-400">${count}</td>
                <td class="font-bold text-white emp-search-val">${empDisplay}</td>
                <td class="text-xs text-slate-300">${r['Computer Name'] || '-'}</td>
                <td class="font-mono text-cyan-400 font-bold serial-search-val">${serial}</td>
                <td class="text-xs text-slate-300">${r['User Name'] || '-'}</td>
                <td class="text-xs text-slate-300 os-search-val"><span class="bg-slate-800 px-2 py-1 rounded border border-slate-700">${r['O.S'] || '-'}</span></td>
                <td class="text-xs text-slate-300 max-w-[150px] truncate" title="${r['Model'] || ''}">${r['Model'] || '-'}</td>
                <td class="text-xs text-slate-300 max-w-[200px] truncate" title="${r['Hardware'] || r['مواصفات الجهاز'] || ''}">${r['Hardware'] || r['مواصفات الجهاز'] || '-'}</td>
                <td class="text-xs text-slate-300">${r['Printer '] || r['Printer'] || '-'}</td>
                <td class="text-xs text-slate-300 max-w-[200px] truncate" title="${r['O.S. & Programes'] || ''}">${r['O.S. & Programes'] || '-'}</td>
                <td class="text-xs text-slate-300">${r['Branche \\ Location '] || r['Branche \\ Location'] || '-'}</td>
                <td class="text-xs font-mono text-yellow-400">${r['pass usb'] || '-'}</td>
                <td class="text-xs font-mono text-yellow-400">${r['pass win'] || '-'}</td>
                <td class="text-xs text-slate-300">${r['Phone and serial number'] || '-'}</td>
                <td class="text-center bg-slate-900 sticky left-0 shadow-[-5px_0_10px_rgba(0,0,0,0.3)] border-r border-slate-700/50 z-10">
                    <div class="flex justify-center gap-1">
                        ${empName !== '' ? `<button onclick="revokeAsset(${index})" title="سحب العهدة" class="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2 py-1.5 rounded shadow transition text-xs"><i class="fa-solid fa-arrow-rotate-left"></i></button>` : ''}
                        <button onclick="openAssetEdit(${index})" class="bg-slate-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded shadow transition text-xs font-bold"><i class="fa-solid fa-pen"></i></button>
                    </div>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="15" class="text-center py-20 text-slate-500">لا توجد بيانات مسجلة في هذا الفرع</td></tr>';
}

function revokeAsset(index) {
    if(!checkPermission()) return;
    if(!confirm("هل أنت متأكد أنك تريد سحب هذا الجهاز وجعله متوفر؟")) return;
    document.getElementById('a-old-serial').value = currentAssetsData[index]['Board Serial Number'] || currentAssetsData[index]['سيريال لاب توب'] || '';
    document.getElementById('a-serial').value = document.getElementById('a-old-serial').value;
    document.getElementById('a-emp').value = ""; // تفريغ الاسم
    document.getElementById('a-comp').value = currentAssetsData[index]['Computer Name'] || ''; document.getElementById('a-user').value = currentAssetsData[index]['User Name'] || ''; document.getElementById('a-os').value = currentAssetsData[index]['O.S'] || ''; document.getElementById('a-model').value = currentAssetsData[index]['Model'] || ''; document.getElementById('a-hard').value = currentAssetsData[index]['Hardware'] || currentAssetsData[index]['مواصفات الجهاز'] || ''; document.getElementById('a-print').value = currentAssetsData[index]['Printer '] || currentAssetsData[index]['Printer'] || ''; document.getElementById('a-prog').value = currentAssetsData[index]['O.S. & Programes'] || ''; document.getElementById('a-loc').value = currentAssetsData[index]['Branche \\ Location '] || currentAssetsData[index]['Branche \\ Location'] || ''; document.getElementById('a-usb').value = currentAssetsData[index]['pass usb'] || ''; document.getElementById('a-win').value = currentAssetsData[index]['pass win'] || ''; document.getElementById('a-phone').value = currentAssetsData[index]['Phone and serial number'] || '';
    saveAssetChanges();
}

function searchAssets() {
    const inputRaw = document.getElementById('asset-search').value.toLowerCase();
    const input = normalizeArabic(inputRaw);
    const deptFilter = document.getElementById('dept-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const rows = document.querySelectorAll('.asset-row');
    
    rows.forEach(row => {
        const empNameRaw = row.querySelector('.emp-search-val').textContent.toLowerCase();
        const serialRaw = row.querySelector('.serial-search-val').textContent.toLowerCase();
        const osVal = row.querySelector('.os-search-val').textContent.trim();
        const statusVal = row.getAttribute('data-status');
        
        const empName = normalizeArabic(empNameRaw);
        const serial = normalizeArabic(serialRaw);
        
        const matchesText = empName.includes(input) || serial.includes(input);
        const matchesDept = (deptFilter === 'all' || osVal === deptFilter);
        const matchesStatus = (statusFilter === 'all' || statusVal === statusFilter);
        
        row.style.display = (matchesText && matchesDept && matchesStatus) ? "" : "none";
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

// 4. سجل الحركات (Logs)
function openLogsModal() { openModal('logs-modal'); loadLogs(); }

async function loadLogs() {
    const tbody = document.getElementById('logs-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-20"><span class="loader"></span> جاري سحب السجل...</td></tr>';
    try {
        const res = await fetch(`${API_URL}?type=logs`);
        const data = await res.json();
        let html = '';
        
        // عكس الترتيب لعرض أحدث حركة في الأعلى
        data.slice().reverse().forEach(r => {
            // استخدام Object.values لجلب البيانات بالترتيب (أياً كانت أسماء الأعمدة في الإكسيل)
            // cols[0] = التاريخ، cols[1] = العملية، cols[2] = السيريال، cols[3] = الموظف، cols[4] = المنفذ
            const cols = Object.values(r); 
            
            if(!cols[0]) return; // تجاهل الصفوف الفارغة
            
            html += `
                <tr class="data-row hover:bg-slate-800/50 transition border-b border-slate-700/50">
                    <td class="p-4 font-mono text-cyan-300 text-xs">${cols[0] || '-'}</td>
                    <td class="p-4 font-bold text-white"><span class="bg-purple-500/20 text-purple-400 px-3 py-1 rounded text-xs">${cols[1] || '-'}</span></td>
                    <td class="p-4 text-slate-300 text-xs">${cols[2] || '-'}</td>
                    <td class="p-4 text-slate-300 font-bold">${cols[3] || '-'}</td>
                    <td class="p-4 text-cyan-400 font-bold text-xs"><i class="fa-solid fa-user-shield mr-1"></i>${cols[4] || 'غير معروف'}</td>
                </tr>`;
        });
        tbody.innerHTML = html || '<tr><td colspan="5" class="text-center py-20 text-slate-500">لا توجد حركات مسجلة</td></tr>';
    } catch(e) { 
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-20 text-red-500">خطأ في الاتصال بالبيانات</td></tr>'; 
    }
}
// 5. الشبكات
function openNetworksModal() { openModal('networks-modal'); loadNetworks(); }
async function loadNetworks() { document.getElementById('networks-tbody').innerHTML='<tr><td colspan="5" class="text-center py-20"><span class="loader"></span></td></tr>'; try{ const res=await fetch(`${API_URL}?type=networks`); const data=await res.json(); let h=''; data.forEach(r=>{if(!r['اسم الشبكه '])return; h+=`<tr class="data-row"><td class="p-4 font-bold text-white"><i class="fa-solid fa-location-dot text-slate-500 ml-2"></i>${r['فرع']||'-'}</td><td class="p-4 text-cyan-300 font-bold">${r['اسم الشبكه ']||'-'}</td><td class="p-4 text-green-400 font-mono">${r['قوه شبكه  db']||'-'} db</td><td class="p-4 text-xs max-w-[200px] truncate" title="${r['الاجهزه ']}">${r['الاجهزه ']}</td><td class="p-4 font-bold text-center">${r['عدد روتر ']||'-'}</td></tr>`;}); document.getElementById('networks-tbody').innerHTML=h||'<tr><td colspan="5" class="text-center py-20 text-slate-500">لا توجد بيانات</td></tr>'; }catch(e){ document.getElementById('networks-tbody').innerHTML='<tr><td colspan="5" class="text-center py-20 text-red-500">خطأ</td></tr>'; } }
