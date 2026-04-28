// ===== CONFIGURAÇÃO DO RELÓGIO AO VIVO =====
// Atualiza o relógio no cabeçalho a cada segundo
function updateClock() {
    // Obtém a hora atual formatada em português brasileiro
    const clockElement = document.getElementById('liveClock') || document.getElementById('liveTime');
    if (clockElement) {
        clockElement.innerText = new Date().toLocaleTimeString('pt-BR');
    }
}
// Inicia o relógio e atualiza a cada 1000ms (1 segundo)
setInterval(updateClock, 1000);
updateClock(); // Chama imediatamente para evitar delay inicial

// ===== FUNÇÕES DE ASSINATURA (CANVAS) =====
function resizeSignatureCanvas(canvas) {
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    canvas.dataset.drawn = canvas.dataset.drawn || 'false';
}

function clearSignature(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.dataset.drawn = 'false';
    resizeSignatureCanvas(canvas);
}

function isCanvasBlank(canvas) {
    return !canvas || canvas.dataset.drawn !== 'true';
}

function getSignatureData(canvas) {
    return canvas && !isCanvasBlank(canvas) ? canvas.toDataURL('image/png') : '';
}

function initSignatureCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    resizeSignatureCanvas(canvas);
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function draw(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x;
        lastY = y;
        canvas.dataset.drawn = 'true';
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    // Touch events para dispositivos móveis
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x;
        lastY = y;
        canvas.dataset.drawn = 'true';
    });

    canvas.addEventListener('touchend', () => isDrawing = false);
}

// ===== FUNÇÕES UTILITÁRIAS =====
// Função para sanitizar entrada de texto
function sanitizeText(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>'"&]/g, '').trim();
}

// Função para formatar valores (evita erros se for null/undefined)
function formatValue(value) {
    return value || '';
}

// Expõe funções globais
window.updateClock = updateClock;
window.resizeSignatureCanvas = resizeSignatureCanvas;
window.clearSignature = clearSignature;
window.isCanvasBlank = isCanvasBlank;
window.getSignatureData = getSignatureData;
window.initSignatureCanvas = initSignatureCanvas;
window.sanitizeText = sanitizeText;
window.formatValue = formatValue;