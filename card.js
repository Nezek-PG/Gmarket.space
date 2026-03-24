// card.js – wersja z EmailJS (poprawiona na luty 2026)

const modal              = document.getElementById('pscModal');
const btnMarkPaid        = document.getElementById('btnMarkPaid');
const closeModal         = document.getElementById('closeModal');
const pscCodesContainer  = document.getElementById('pscCodesContainer');
const btnApplyModal      = document.getElementById('btnApplyModal');
const errorMessage       = document.getElementById('errorMessage');
const codeCounter        = document.getElementById('codeCounter');
const emailInput         = document.getElementById('emailInput');
const statusIndicator    = document.getElementById('statusIndicator');
const statusText         = statusIndicator.querySelector('.status-text');

let codeCount = 1;
const MAX_CODES   = 6;
const MIN_LENGTH  = 15;
const MAX_LENGTH  = 20;



emailjs.init({
  publicKey: "ah9vp1IyrOdbf5Dp0"   
});

const SERVICE_ID      = "service_c2q5tcy";
const TEMPLATE_ADMIN  = "template_newpsc";    // mail DO CIEBIE
const TEMPLATE_CLIENT = "template_confirm";   // mail DO KLIENTA



function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.toLowerCase().endsWith('@gmail.com');
}

function updateEmailStatus() {
  const email = emailInput.value.trim();
  if (isValidEmail(email)) {
    statusIndicator.classList.add('active');
    statusText.textContent = 'Ready';
    btnMarkPaid.disabled = false;
  } else {
    statusIndicator.classList.remove('active');
    statusText.textContent = 'Enter Gmail';
    btnMarkPaid.disabled = true;
  }
}

function updateCodeCounter() {
  codeCounter.textContent = `${codeCount} / ${MAX_CODES} codes`;
}

function resetModal() {
  pscCodesContainer.innerHTML = `
    <div class="psc-code-row flex items-center gap-4">
      <input 
        type="text" 
        class="psc-code-input flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-5 py-3 text-white placeholder-zinc-500 focus:border-[#0078D7] outline-none transition-all"
        placeholder="Enter 15-20 digit code" 
        maxlength="20"
        data-index="0"
      />
      <button class="btn-add-code shine-btn w-12 h-12 bg-[#0078D7] rounded-xl text-2xl font-bold hover:bg-[#0066b8] transition-all hidden" data-action="add">+</button>
    </div>
  `;
  codeCount = 1;
  updateCodeCounter();
  errorMessage.classList.remove('show');
}


emailInput.addEventListener('input', updateEmailStatus);
emailInput.addEventListener('blur', updateEmailStatus);

btnMarkPaid.addEventListener('click', () => {
  if (!btnMarkPaid.disabled) {
    resetModal();
    modal.classList.add('active');
  }
});

closeModal.addEventListener('click', () => modal.classList.remove('active'));

modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.remove('active');
});

pscCodesContainer.addEventListener('input', e => {
  const input = e.target;
  if (!input.classList.contains('psc-code-input')) return;

  let value = input.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  input.value = value;

  const addBtn = input.nextElementSibling;
  if (addBtn?.classList.contains('btn-add-code')) {
    addBtn.classList.toggle('hidden', value.length < MIN_LENGTH || value.length > MAX_LENGTH);
  }
});

pscCodesContainer.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;

  if (action === 'add') {
    const row = btn.closest('.psc-code-row');
    const inp = row.querySelector('.psc-code-input');
    const val = inp.value.trim();

    if (val.length < MIN_LENGTH || val.length > MAX_LENGTH) return;

    btn.classList.add('hidden');

    const remBtn = document.createElement('button');
    remBtn.className = 'btn-remove-code shine-btn w-12 h-12 bg-red-600 rounded-xl text-2xl font-bold hover:bg-red-700 transition-all';
    remBtn.type = 'button';
    remBtn.dataset.action = 'remove';
    remBtn.textContent = '−';
    row.appendChild(remBtn);

    inp.disabled = true;
    inp.classList.add('opacity-60');

    codeCount++;
    const newRow = document.createElement('div');
    newRow.className = 'psc-code-row flex items-center gap-4';
    newRow.innerHTML = `
      <input type="text" class="psc-code-input flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-5 py-3 text-white placeholder-zinc-500 focus:border-[#0078D7] outline-none transition-all"
        placeholder="Enter 15-20 digit code" maxlength="20" data-index="${codeCount - 1}" />
      <button class="btn-add-code shine-btn w-12 h-12 bg-[#0078D7] rounded-xl text-2xl font-bold hover:bg-[#0066b8] transition-all hidden" data-action="add">+</button>
    `;
    pscCodesContainer.appendChild(newRow);
    newRow.querySelector('input').focus();
    updateCodeCounter();
  } 
  else if (action === 'remove') {
    btn.closest('.psc-code-row').remove();
    codeCount--;
    const last = pscCodesContainer.lastElementChild;
    if (last) {
      const li = last.querySelector('.psc-code-input');
      const ab = last.querySelector('.btn-add-code');
      if (li && !li.disabled && li.value.length >= MIN_LENGTH) ab.classList.remove('hidden');
    }
    updateCodeCounter();
  }
});

// ────────────────────────────────────────────────
// Wysyłanie – Apply Codes
// ────────────────────────────────────────────────

btnApplyModal.addEventListener('click', async () => {
  const inputs = pscCodesContainer.querySelectorAll('.psc-code-input');
  const codes = [];
  let error = false;

  errorMessage.classList.remove('show');

  inputs.forEach(inp => {
    const v = inp.value.trim().toUpperCase();
    if (v) {
      if (v.length < MIN_LENGTH || v.length > MAX_LENGTH) {
        inp.classList.add('border-red-500');
        error = true;
      } else {
        codes.push(v);
        inp.classList.remove('border-red-500');
      }
    }
  });

  if (error) {
    errorMessage.textContent = `Every code need to have ${MIN_LENGTH}–${MAX_LENGTH} znaków`;
    errorMessage.classList.add('show');
    return;
  }

  if (codes.length === 0) {
    errorMessage.textContent = 'Write down min 1 code';
    errorMessage.classList.add('show');
    return;
  }

  const userEmail = emailInput.value.trim();
  const orderNumber = `NZ-${Date.now().toString().slice(-8)}-${Math.floor(Math.random()*900+100)}`;

  const baseParams = {
    user_email:   userEmail,
    to_email:     userEmail,                    // ← ważne dla klienta
    reply_to:     userEmail,
    from_name:    "NezAI Checkout System",
    order_number: orderNumber,
    code_count:   codes.length,
    codes_list:   codes.join('\n'),
    product_name: document.getElementById('checkoutProductName')?.textContent || '—',
    plan_name:    document.getElementById('checkoutProductPlan')?.textContent || '—',
    price:        document.getElementById('checkoutProductPrice')?.textContent || '€0',
    timestamp:    new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }),
    discord_link: 'https://discord.gg/u3MD3yHw5w'
  };

  // Mail do Ciebie → zmień na swój email
  const adminParams = { ...baseParams, to_email: "nezekdesign@gmail.com" };

  btnApplyModal.disabled = true;
  btnApplyModal.innerHTML = '<span class="animate-pulse">Sending</span>';

  try {
    console.log("", adminParams);
    await emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, adminParams);
    console.log("");

    console.log("", baseParams);
    await emailjs.send(SERVICE_ID, TEMPLATE_CLIENT, baseParams);
    console.log("");

    alert(`Sended ${codes.length} codes!\nOrder number: ${orderNumber}\nCheck Email spam.`);

    modal.classList.remove('active');
    resetModal();

    statusIndicator.classList.add('active');
    statusText.textContent = 'Done';
    statusIndicator.querySelector('.dot').classList.replace('bg-red-500', 'bg-green-500');
    btnMarkPaid.disabled = true;

  } catch (err) {
    console.error("[Email Error]", err);
    console.log("Status:", err.status);
    console.log("Tekst error:", err.text || err.message || "No details");

    let msg = "filed to send";
    if (err.status === 401) msg = "Error/ wrong public key )'";
    if (err.status === 422) msg = "Błąd szablonu {{to_email}} / {{from_name}} / {{reply_to}} w EmailJS";
    if (err.status === 429) msg = "Wait a bit";

    alert(msg);
    errorMessage.textContent = msg;
    errorMessage.classList.add('show');
  } finally {
    btnApplyModal.disabled = false;
    btnApplyModal.innerHTML = 'Apply Codes';
  }
});

// ────────────────────────────────────────────────
// Start
// ────────────────────────────────────────────────

(function() {
  const p = new URLSearchParams(window.location.search);
  document.getElementById("checkoutProductName").textContent = p.get("product") || "—";
  document.getElementById("checkoutProductPlan").textContent = p.get("plan") || "—";
  document.getElementById("checkoutProductPrice").textContent = p.get("price") || "€0";
})();

updateEmailStatus();