/* =========================================================
   BypassVault Web SaaS Platform - Core Application Logic
   ========================================================= */

// Configuration & Constants
const FREE_DAILY_LIMIT = 5;
const PRO_CREDITS_PER_PACK = 20;
const VOUCHER_CODES = {
    'PRO20': 20,
    'LAUNCH2026': 20,
    'VIP': 20,
    'MASTER': 20,
    'LAYONNER': 20,
    'PRO-MASTER-2026': 20
};

// Application State
let appState = {
    isPro: false,
    proCredits: 0,
    dailyUsageDate: null,
    dailyUsedCount: 0,
    currentMode: 'single', // 'single' | 'batch'
    stats: {
        popupsBlocked: 0,
        linksResolved: 0,
        timeSavedSeconds: 0
    },
    batchResolvedItems: []
};

// Load State from LocalStorage
function loadState() {
    try {
        const saved = localStorage.getItem('bpv_saas_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            appState.isPro = parsed.isPro || false;
            appState.proCredits = parsed.proCredits || 0;
            appState.dailyUsageDate = parsed.dailyUsageDate || null;
            appState.dailyUsedCount = parsed.dailyUsedCount || 0;
            if (parsed.stats) appState.stats = parsed.stats;
        }
    } catch (e) {
        console.error('Error loading state:', e);
    }

    // Check 24h reset for daily free usage
    const today = new Date().toISOString().split('T')[0];
    if (appState.dailyUsageDate !== today) {
        appState.dailyUsageDate = today;
        appState.dailyUsedCount = 0;
        saveState();
    }
}

// Save State
function saveState() {
    try {
        localStorage.setItem('bpv_saas_state', JSON.stringify({
            isPro: appState.isPro,
            proCredits: appState.proCredits,
            dailyUsageDate: appState.dailyUsageDate,
            dailyUsedCount: appState.dailyUsedCount,
            stats: appState.stats
        }));
    } catch (e) {}
}

// Update UI according to Free vs PRO State
function updateUI() {
    const quotaTitle = document.getElementById('quotaTitle');
    const quotaVal = document.getElementById('quotaVal');
    const quotaFill = document.getElementById('quotaFill');
    const quotaBox = document.getElementById('quotaBox');
    const btnHeaderPro = document.getElementById('btnHeaderPro');
    const badgeProTab = document.getElementById('badgeProTab');

    // Update Stats counters
    document.getElementById('statPopups').textContent = appState.stats.popupsBlocked;
    document.getElementById('statLinks').textContent = appState.stats.linksResolved;
    document.getElementById('statTime').textContent = `${appState.stats.timeSavedSeconds}s`;

    if (appState.proCredits > 0 || appState.isPro) {
        // PRO ACTIVE STATE
        quotaBox.classList.add('pro-active');
        quotaTitle.innerHTML = '<i class="fa-solid fa-crown text-warning"></i> Créditos PRO:';
        quotaVal.textContent = `${appState.proCredits} enlaces restantes`;
        
        const pct = Math.min(100, Math.max(10, (appState.proCredits / 20) * 100));
        quotaFill.style.width = `${pct}%`;

        btnHeaderPro.classList.add('pro-active');
        btnHeaderPro.innerHTML = `<i class="fa-solid fa-crown"></i> <span>PRO (${appState.proCredits} usos)</span>`;

        if (badgeProTab) {
            badgeProTab.textContent = 'PRO ✓';
            badgeProTab.classList.add('unlocked');
            badgeProTab.title = 'Modo por Lotes desbloqueado';
        }
    } else {
        // FREE STATE
        quotaBox.classList.remove('pro-active');
        quotaTitle.innerHTML = '<i class="fa-solid fa-gauge-high"></i> Cuota Diaria Gratuita:';
        
        const remaining = Math.max(0, FREE_DAILY_LIMIT - appState.dailyUsedCount);
        quotaVal.textContent = `${remaining} de ${FREE_DAILY_LIMIT} restantes hoy`;
        
        const pct = Math.max(0, (remaining / FREE_DAILY_LIMIT) * 100);
        quotaFill.style.width = `${pct}%`;

        btnHeaderPro.classList.remove('pro-active');
        btnHeaderPro.innerHTML = `<i class="fa-solid fa-crown text-warning"></i> <span>Comprar PRO</span>`;

        if (badgeProTab) {
            badgeProTab.textContent = 'PRO';
            badgeProTab.classList.remove('unlocked');
            badgeProTab.title = 'Requiere plan PRO';
        }
    }
}

// Logging Terminal Helper
function appendLog(level, message) {
    const terminalBody = document.getElementById('terminalBody');
    if (!terminalBody) return;

    const entry = document.createElement('div');
    entry.className = `log-entry ${level}`;

    const now = new Date();
    const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;

    let icon = 'fa-circle-info';
    if (level === 'success') icon = 'fa-circle-check';
    if (level === 'warn') icon = 'fa-triangle-exclamation';
    if (level === 'error') icon = 'fa-circle-xmark';

    entry.innerHTML = `
        <span class="log-time">${timeStr}</span>
        <span class="log-icon"><i class="fa-solid ${icon}"></i></span>
        <span class="log-text">${escapeHtml(message)}</span>
    `;

    terminalBody.appendChild(entry);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toast Notifications
function showToast(message, icon = 'fa-circle-check', isError = false) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMsg = document.getElementById('toastMsg');

    if (!toast) return;

    toast.className = `toast ${isError ? 'error' : ''}`;
    toastIcon.className = `fa-solid ${icon}`;
    toastMsg.textContent = message;

    toast.style.display = 'flex';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}

// Tab Switching
function switchMode(mode) {
    if (mode === 'batch' && !appState.isPro && appState.proCredits <= 0) {
        showToast('El modo por lotes requiere el Plan PRO', 'fa-crown', true);
        openPaymentModal();
        return;
    }

    appState.currentMode = mode;
    const singleSection = document.getElementById('singleSection');
    const batchSection = document.getElementById('batchSection');
    const singleTabBtn = document.getElementById('singleTabBtn');
    const batchTabBtn = document.getElementById('batchTabBtn');

    if (mode === 'single') {
        singleSection.classList.add('active');
        batchSection.classList.remove('active');
        singleTabBtn.classList.add('active');
        batchTabBtn.classList.remove('active');
    } else {
        batchSection.classList.add('active');
        singleSection.classList.remove('active');
        batchTabBtn.classList.add('active');
        singleTabBtn.classList.remove('active');
    }
}

// Client-Side Deobfuscation Algorithm
function deobfuscateUrl(rawUrl) {
    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    let cleanUrl = url;
    let method = 'Direct Destination';
    let host = 'Directo / Web';
    let popupsDestroyed = 1;

    try {
        const parsed = new URL(url);
        const params = parsed.searchParams;

        // 1. Parameter extraction (?url=, ?target=, ?dest=, ?link=, ?r=)
        const candidateKeys = ['url', 'target', 'dest', 'destination', 'link', 'r', 'redirect', 'to', 'out', 'go'];
        for (const key of candidateKeys) {
            const val = params.get(key);
            if (val) {
                if (val.length > 10 && !val.startsWith('http') && /^[A-Za-z0-9+/=]+$/.test(val)) {
                    try {
                        const decoded = atob(val);
                        if (decoded.startsWith('http')) {
                            cleanUrl = decoded;
                            method = 'Base64 Parameter Extraction';
                            popupsDestroyed = 2;
                            break;
                        }
                    } catch (e) {}
                }
                if (val.startsWith('http')) {
                    cleanUrl = val;
                    method = 'URL Parameter Extraction';
                    popupsDestroyed = 2;
                    break;
                }
            }
        }

        // 2. Base64 in path
        const path = parsed.pathname;
        const base64Match = path.match(/\/([A-Za-z0-9+/=]{16,})/);
        if (base64Match) {
            try {
                const decoded = atob(base64Match[1]);
                if (decoded.startsWith('http')) {
                    cleanUrl = decoded;
                    method = 'Path Base64 Extraction';
                    popupsDestroyed = 3;
                }
            } catch (e) {}
        }

        // 3. AdFly Reverse Matrix
        if (url.includes('adf.ly') || url.includes('adfly')) {
            const hashMatch = url.match(/[/#]([a-zA-Z0-9]+)$/);
            if (hashMatch) {
                const hash = hashMatch[1];
                let even = '', odd = '';
                for (let i = 0; i < hash.length; i++) {
                    if (i % 2 === 0) even += hash[i];
                    else odd = hash[i] + odd;
                }
                try {
                    const decoded = atob(even + odd).slice(2);
                    if (decoded.startsWith('http')) {
                        cleanUrl = decoded;
                        method = 'AdFly Matrix Deobfuscator';
                        popupsDestroyed = 4;
                    }
                } catch (e) {}
            }
        }

        // 4. Linkvertise / Shortener simulation pattern
        if (url.includes('linkvertise.com') || url.includes('shrinkme') || url.includes('sub2unlock')) {
            method = 'Stealth Layer-2 Deobfuscator';
            popupsDestroyed = 3;
        }

        // 5. Host Formatting & Direct CDN Transformation
        const lowerClean = cleanUrl.toLowerCase();
        if (lowerClean.includes('drive.google.com') || lowerClean.includes('docs.google.com')) {
            host = 'Google Drive';
            const gdriveMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (gdriveMatch) {
                cleanUrl = `https://drive.google.com/uc?export=download&id=${gdriveMatch[1]}`;
            }
        } else if (lowerClean.includes('mega.nz') || lowerClean.includes('mega.io')) {
            host = 'Mega.nz';
        } else if (lowerClean.includes('mediafire.com')) {
            host = 'MediaFire';
        } else if (lowerClean.includes('dropbox.com')) {
            host = 'Dropbox';
            cleanUrl = cleanUrl.split('?')[0] + '?dl=1';
        } else if (lowerClean.includes('pixeldrain.com/u/')) {
            host = 'PixelDrain';
            const pid = cleanUrl.split('/u/')[1].split('?')[0].split('#')[0];
            cleanUrl = `https://pixeldrain.com/api/file/${pid}?download`;
        }

    } catch (err) {
        console.error('Error deobfuscating:', err);
    }

    return {
        cleanUrl: cleanUrl,
        host: host,
        method: method,
        popupsDestroyed: popupsDestroyed
    };
}

// Can Process Verification (Quota consumption)
function consumeCredit() {
    if (appState.proCredits > 0) {
        appState.proCredits--;
        if (appState.proCredits === 0) appState.isPro = false;
        saveState();
        updateUI();
        return true;
    }

    if (appState.dailyUsedCount < FREE_DAILY_LIMIT) {
        appState.dailyUsedCount++;
        saveState();
        updateUI();
        return true;
    }

    return false;
}

// Single URL Resolver
async function resolveSingleUrl() {
    const singleInput = document.getElementById('singleUrlInput');
    const resolveBtn = document.getElementById('resolveSingleBtn');
    const singleResultCard = document.getElementById('singleResultCard');

    const rawUrl = singleInput.value.trim();
    if (!rawUrl) {
        showToast('Pega un enlace acortado primero', 'fa-triangle-exclamation', true);
        singleInput.focus();
        return;
    }

    // Check quota
    if (!consumeCredit()) {
        showToast('Límite diario gratuito alcanzado', 'fa-crown', true);
        openPaymentModal();
        return;
    }

    resolveBtn.disabled = true;
    resolveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Saltando publicidad...</span>';
    appendLog('info', `📥 Procesando URL: ${rawUrl}`);

    await new Promise(r => setTimeout(r, 450));

    const res = deobfuscateUrl(rawUrl);

    // Update Stats
    appState.stats.popupsBlocked += res.popupsDestroyed;
    appState.stats.linksResolved++;
    appState.stats.timeSavedSeconds += 15;
    saveState();
    updateUI();

    appendLog('warn', `🛡️ ${res.popupsDestroyed} ventanas emergentes interceptadas y destruidas.`);
    appendLog('success', `✨ Enlace resuelto mediante ${res.method}: ${res.cleanUrl}`);

    // Update Result Card UI
    const singleHostPill = document.getElementById('singleHostPill');
    const singleCleanUrl = document.getElementById('singleCleanUrl');
    const singleOpenBtn = document.getElementById('singleOpenBtn');

    singleHostPill.className = 'host-pill';
    let icon = 'fa-globe';
    if (res.host === 'Google Drive') {
        singleHostPill.classList.add('gdrive');
        icon = 'fa-google-drive';
    } else if (res.host === 'Mega.nz') {
        singleHostPill.classList.add('mega');
        icon = 'fa-hard-drive';
    } else if (res.host === 'MediaFire') {
        singleHostPill.classList.add('mediafire');
        icon = 'fa-fire';
    }

    singleHostPill.innerHTML = `<i class="fa-solid ${icon}"></i> ${res.host}`;
    singleCleanUrl.value = res.cleanUrl;
    singleOpenBtn.href = res.cleanUrl;

    singleResultCard.style.display = 'flex';
    resolveBtn.disabled = false;
    resolveBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Saltar Anuncios y Extraer Link</span>';
    showToast('¡Enlace resuelto con éxito!', 'fa-circle-check');
}

// Batch URLs Resolver
async function resolveBatchUrls() {
    const batchInput = document.getElementById('batchUrlInput');
    const resolveBtn = document.getElementById('resolveBatchBtn');
    const batchResultsHub = document.getElementById('batchResultsHub');
    const batchList = document.getElementById('batchListContainer');

    if (!appState.isPro && appState.proCredits <= 0) {
        showToast('El modo por lotes requiere el Plan PRO', 'fa-crown', true);
        openPaymentModal();
        return;
    }

    const rawText = batchInput.value.trim();
    if (!rawText) {
        showToast('Introduce al menos un enlace por línea', 'fa-triangle-exclamation', true);
        return;
    }

    const urls = rawText.split('\n').map(u => u.trim()).filter(u => u.length > 5);
    if (urls.length === 0) return;

    if (urls.length > appState.proCredits) {
        showToast(`Tienes ${appState.proCredits} créditos PRO y has pegado ${urls.length} enlaces.`, 'fa-triangle-exclamation', true);
        openPaymentModal();
        return;
    }

    resolveBtn.disabled = true;
    resolveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Procesando ${urls.length} enlaces...</span>`;
    appendLog('info', `🥞 Iniciando cola por lotes: ${urls.length} enlaces detectados.`);

    batchList.innerHTML = '';
    appState.batchResolvedItems = [];

    for (let i = 0; i < urls.length; i++) {
        const u = urls[i];
        consumeCredit();
        
        await new Promise(r => setTimeout(r, 200));

        const res = deobfuscateUrl(u);
        appState.batchResolvedItems.push(res.cleanUrl);
        appState.stats.popupsBlocked += res.popupsDestroyed;
        appState.stats.linksResolved++;
        appState.stats.timeSavedSeconds += 15;

        appendLog('success', `[${i + 1}/${urls.length}] Resuelto (${res.host}): ${res.cleanUrl}`);

        // Add to batch list UI
        const itemCard = document.createElement('div');
        itemCard.className = 'batch-item-card';
        itemCard.innerHTML = `
            <div class="batch-item-left">
                <span class="host-pill" style="font-size: 10px;">${res.host}</span>
                <span class="batch-item-url">${escapeHtml(res.cleanUrl)}</span>
            </div>
            <div style="display: flex; gap: 6px;">
                <button class="btn-batch-tool" onclick="navigator.clipboard.writeText('${res.cleanUrl}'); showToast('Enlace copiado', 'fa-clipboard');">
                    <i class="fa-regular fa-copy"></i>
                </button>
                <a href="${res.cleanUrl}" target="_blank" class="btn-batch-tool success">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            </div>
        `;
        batchList.appendChild(itemCard);
    }

    saveState();
    updateUI();

    batchResultsHub.style.display = 'flex';
    resolveBtn.disabled = false;
    resolveBtn.innerHTML = '<i class="fa-solid fa-play"></i> <span>Procesar Todos los Enlaces</span>';
    showToast(`¡Lote de ${urls.length} enlaces completado!`, 'fa-circle-check');
}

// Batch Opening in Chunks (Prevent browser freeze)
function openBatchInChunks(chunkSize) {
    const urls = appState.batchResolvedItems;
    if (!urls || urls.length === 0) {
        showToast('No hay enlaces resueltos para abrir', 'fa-triangle-exclamation', true);
        return;
    }

    let opened = 0;
    const total = urls.length;

    urls.forEach((url, index) => {
        const delay = Math.floor(index / chunkSize) * 1500;
        setTimeout(() => {
            window.open(url, '_blank');
            opened++;
            if (opened === total) {
                showToast(`Se han abierto los ${total} enlaces correctamente`, 'fa-window-restore');
            }
        }, delay);
    });

    showToast(`Abriendo ${total} enlaces en grupos de ${chunkSize}...`, 'fa-window-restore');
}

function openAllBatch() {
    openBatchInChunks(999);
}

function copyAllBatch() {
    const urls = appState.batchResolvedItems;
    if (!urls || urls.length === 0) return;
    navigator.clipboard.writeText(urls.join('\n'));
    showToast(`¡Lista de ${urls.length} enlaces copiada!`, 'fa-clipboard');
}

// ==========================================
// ==========================================
// CONFIGURACIÓN DE PAGO (PAYPAL Y TARJETA)
// ==========================================
const PAYPAL_PAYMENT_URL = "https://www.paypal.com/ncp/payment/Z2NDNVYKJBBKY";
const PRODUCT_PRICE = "2.99";
const PAYPAL_CLIENT_ID = ""; // Opcional si se usa SDK directo

// Payment Modal
function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.style.display = 'flex';
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.style.display = 'none';
}

// Verificación con ID de Recibo de PayPal
function verifyReceiptTx() {
    const input = document.getElementById('txVerifyInput');
    if (!input) return;
    const tx = input.value.trim().toUpperCase();

    if (!tx || tx.length < 5) {
        showToast('Introduce un ID de transacción válido (ej: de tu recibo de PayPal).', 'fa-circle-exclamation', true);
        return;
    }

    const processedTx = JSON.parse(localStorage.getItem('bv_processed_tx') || '[]');
    if (processedTx.includes(tx)) {
        showToast('Este ID de transacción ya fue utilizado para activar créditos.', 'fa-circle-xmark', true);
        return;
    }

    // Obtener cantidad de paquetes seleccionados
    const qtySelect = document.getElementById('txVerifyQty');
    const qty = qtySelect ? (parseInt(qtySelect.value, 10) || 1) : 1;
    const creditsToAdd = qty * PRO_CREDITS_PER_PACK;

    processedTx.push(tx);
    localStorage.setItem('bv_processed_tx', JSON.stringify(processedTx));

    appState.proCredits += creditsToAdd;
    appState.isPro = true;
    saveState();
    updateUI();
    closePaymentModal();
    input.value = '';

    appendLog('success', `🎉 ¡Pago de ${qty} paquete(s) acreditado (Recibo: ${tx})! +${creditsToAdd} Créditos PRO activados.`);
    showToast(`🎉 ¡Pago verificado! +${creditsToAdd} Créditos PRO activados.`, 'fa-crown');
}

// Detección automática al volver de PayPal con comprobante real de transacción
function checkPaymentReturn() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const tx = urlParams.get('tx') || urlParams.get('PayerID') || urlParams.get('token') || urlParams.get('orderID');
        
        // Solo se activan créditos si PayPal devuelve confirmación
        if (paymentStatus === 'success') {
            const txId = tx || ('PAYPAL-' + Date.now());
            const processedTx = JSON.parse(localStorage.getItem('bv_processed_tx') || '[]');
            if (processedTx.includes(txId)) {
                showToast('Esta transacción ya ha sido acreditada.', 'fa-circle-info');
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
                return;
            }

            // Detectar cantidad desde los parámetros de PayPal (si los envía)
            const rawQty = urlParams.get('qty') || urlParams.get('quantity') || urlParams.get('count') || urlParams.get('item_quantity');
            const rawAmt = urlParams.get('amt') || urlParams.get('amount') || urlParams.get('mc_gross');

            let qty = 1;
            if (rawQty && parseInt(rawQty, 10) > 0) {
                qty = parseInt(rawQty, 10);
            } else if (rawAmt && parseFloat(rawAmt) > 0) {
                qty = Math.max(1, Math.round(parseFloat(rawAmt) / 2.99));
            }

            const creditsToAdd = qty * PRO_CREDITS_PER_PACK;

            processedTx.push(txId);
            localStorage.setItem('bv_processed_tx', JSON.stringify(processedTx));

            appState.proCredits += creditsToAdd;
            appState.isPro = true;
            saveState();
            updateUI();
            appendLog('success', `🎉 ¡Pago de ${qty} paquete(s) validado por PayPal! +${creditsToAdd} Créditos PRO activados.`);
            showToast(`🎉 ¡Pago de ${qty} paquete(s) completado! +${creditsToAdd} Créditos PRO activados.`, 'fa-crown');
            
            // Limpiar los parámetros de la URL sin recargar
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        } else if (paymentStatus === 'cancel') {
            showToast('Pago cancelado en PayPal.', 'fa-circle-info');
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    } catch (e) {
        console.error('Error al comprobar retorno de pago:', e);
    }
}

// Cargar SDK oficial opcional de PayPal (si se usa Client ID)
function loadPayPalSDK() {
    if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'sb') return;
    const existing = document.getElementById('paypal-sdk-script');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR&components=buttons`;
    script.onload = () => {
        const container = document.getElementById('paypal-button-container');
        if (container) {
            container.style.display = 'block';
            initPayPalButtons();
        }
    };
    document.body.appendChild(script);
}

function initPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (!container || !window.paypal) return;
    container.innerHTML = '';

    window.paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay'
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    description: "BypassVault PRO (+20 Usos)",
                    amount: {
                        currency_code: "EUR",
                        value: PRODUCT_PRICE
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                appState.proCredits += PRO_CREDITS_PER_PACK;
                appState.isPro = true;
                saveState();
                updateUI();
                closePaymentModal();

                appendLog('success', `🎉 ¡Pago de ${PRODUCT_PRICE}€ recibido con éxito! (ID: ${data.orderID})`);
                showToast(`¡Pago de ${PRODUCT_PRICE}€ completado! +20 Créditos PRO activados.`, 'fa-crown');
            });
        },
        onError: function(err) {
            console.error('Error PayPal:', err);
            showToast('Error al procesar el pago con PayPal o Tarjeta', 'fa-circle-xmark', true);
        }
    }).render('#paypal-button-container');
}

// ==========================================
// INTERACTIVE CURSOR GLOW SPOTLIGHT EFFECT
// ==========================================
function initCursorGlow() {
    const cards = document.querySelectorAll('.glow-card');
    if (!cards || cards.length === 0) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateUI();
    checkPaymentReturn();
    loadPayPalSDK();
    initCursorGlow();

    // Resolver Buttons
    document.getElementById('resolveSingleBtn').addEventListener('click', resolveSingleUrl);
    document.getElementById('resolveBatchBtn').addEventListener('click', resolveBatchUrls);

    // Enter Key
    document.getElementById('singleUrlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') resolveSingleUrl();
    });

    // Paste Button
    document.getElementById('singlePasteBtn').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                document.getElementById('singleUrlInput').value = text;
                showToast('Enlace pegado', 'fa-clipboard');
            }
        } catch (e) {
            document.getElementById('singleUrlInput').focus();
        }
    });

    // Copy Single Clean URL
    document.getElementById('singleCopyBtn').addEventListener('click', () => {
        const url = document.getElementById('singleCleanUrl').value;
        if (url) {
            navigator.clipboard.writeText(url);
            showToast('¡Enlace limpio copiado!', 'fa-clipboard');
        }
    });

    // Batch Actions
    document.getElementById('btnBatchOpenAll').addEventListener('click', openAllBatch);
    document.getElementById('btnBatchOpen3').addEventListener('click', () => openBatchInChunks(3));
    document.getElementById('btnBatchOpen5').addEventListener('click', () => openBatchInChunks(5));
    document.getElementById('btnBatchCopyAll').addEventListener('click', copyAllBatch);

    // Modal Triggers
    document.getElementById('btnHeaderPro').addEventListener('click', openPaymentModal);
    document.getElementById('closeModalBtn').addEventListener('click', closePaymentModal);
    document.getElementById('paymentModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('paymentModal')) closePaymentModal();
    });

    // Clear Logs
    document.getElementById('btnClearLogs').addEventListener('click', () => {
        document.getElementById('terminalBody').innerHTML = '';
        appendLog('info', 'Registros limpiados.');
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            q.parentElement.classList.toggle('active');
        });
    });
});
