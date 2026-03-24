
const wallets = {
  BTC: 'bc1qjuhwe6xxsft87kdhyx7rrk9nffz4jrrh5d4ww6',  
  LTC: 'LfFzQDdZ324nvz4YzTBKwdmSJK3gCQPYhV',       
  ETH: '0xAbFAD7cA0DbE5B750f479540C33d99f67bc358b7'  
};

let cryptoRates = { BTC: 0.000017, LTC: 0.0217, ETH: 0.00057 }; 

const emailInput = document.querySelector('input[type="email"]');
const statusBadge = document.getElementById('statusIndicator');
const dot = statusBadge.querySelector('.dot');
const statusText = statusBadge.querySelector('.status-text');
const cryptoOptions = document.querySelectorAll('.crypto-option');
const walletBox = document.getElementById('walletBox');
const copyBtn = document.getElementById('copyBtn');

// Funkcja pobierająca aktualne kursy z CoinGecko
async function fetchLiveRates() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,litecoin,ethereum&vs_currencies=eur');
    const data = await res.json();

    cryptoRates.BTC = 1 / data.bitcoin.eur;   // ile BTC za 1 €
    cryptoRates.LTC = 1 / data.litecoin.eur;
    cryptoRates.ETH = 1 / data.ethereum.eur;

    console.log('Live updated odds', cryptoRates);
  } catch (err) {
    console.error('Course error from CoinGecko:', err);
    // Fallback zostaje starymi wartościami
  }
}

// Uruchom raz przy załadowaniu strony
fetchLiveRates();

// Enable po poprawnym Gmailu
emailInput.addEventListener('input', () => {
  if (emailInput.value.trim().toLowerCase().endsWith('@gmail.com') && emailInput.checkValidity()) {
    statusBadge.classList.add('live');
    dot.classList.remove('bg-red-500', 'shadow-red-500/50');
    dot.classList.add('bg-green-400', 'shadow-green-400/50', 'animate-pulse');
    statusText.textContent = 'Ready';
    cryptoOptions.forEach(opt => opt.disabled = false);
  } else {
    statusBadge.classList.remove('live');
    dot.classList.add('bg-red-500', 'shadow-red-500/50');
    dot.classList.remove('bg-green-400', 'shadow-green-400/50', 'animate-pulse');
    statusText.textContent = 'Enter valid Gmail';
    cryptoOptions.forEach(opt => opt.disabled = true);
    walletBox.classList.add('hidden');
  }
});

// Wybór kryptowaluty + przeliczanie na żywo
cryptoOptions.forEach(opt => {
  opt.addEventListener('click', async () => {
    if (opt.disabled) return;

    cryptoOptions.forEach(o => o.classList.remove('border-[#0078D7]', 'bg-zinc-900/50'));
    opt.classList.add('border-[#0078D7]', 'bg-zinc-900/50');
    walletBox.classList.remove('hidden');

    const selectedCrypto = opt.dataset.crypto;

    // Odśwież kursy tuż przed przeliczeniem (na wszelki wypadek)
    await fetchLiveRates();

    const urlParams = new URLSearchParams(window.location.search);
    const priceStr = urlParams.get('price') || '€0';
    const priceNumber = parseFloat(priceStr.replace('€', '').replace(',', '.')) || 0;

    const rate = cryptoRates[selectedCrypto] || 0.00001; // bezpieczny fallback
    const amount = (priceNumber * rate).toFixed(8);

    document.getElementById('walletAddress').textContent = wallets[selectedCrypto] || '—';
    document.getElementById('cryptoAmount').textContent = amount;
    document.getElementById('cryptoSymbol').textContent = selectedCrypto;
    document.getElementById('eurRateTxt').textContent = `1 € ≈ ${rate.toFixed(8)} ${selectedCrypto}`;
    document.getElementById('lastUpdateTxt').textContent = new Date().toLocaleString();
  });
});

// Kopiuj adres
copyBtn?.addEventListener('click', () => {
  const addr = document.getElementById('walletAddress').textContent;
  navigator.clipboard.writeText(addr).then(() => {
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
  });
});

// Populate summary z URL
const urlParams = new URLSearchParams(window.location.search);
document.getElementById('checkoutProductName').textContent = urlParams.get('product') || 'NezAI Premium';
document.getElementById('checkoutProductPlan').textContent = urlParams.get('plan') || '—';
document.getElementById('checkoutProductPrice').textContent = urlParams.get('price') || '€0';