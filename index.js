// ===== CONFIGURAÇÃO DO RELÓGIO AO VIVO =====
// Atualiza o relógio no cabeçalho a cada segundo
function updateClock() {
    // Obtém a hora atual formatada em português brasileiro
    document.getElementById('liveClock').innerText = new Date().toLocaleTimeString('pt-BR');
}
// Inicia o relógio e atualiza a cada 1000ms (1 segundo)
setInterval(updateClock, 1000);
updateClock(); // Chama imediatamente para evitar delay inicial

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

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    const getPointerPosition = event => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    const startDraw = event => {
        event.preventDefault();
        drawing = true;
        const pos = getPointerPosition(event);
        lastX = pos.x;
        lastY = pos.y;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(lastX, lastY, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        canvas.dataset.drawn = 'true';
        canvas.setPointerCapture(event.pointerId);
    };

    const draw = event => {
        if (!drawing) return;
        event.preventDefault();
        const pos = getPointerPosition(event);
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
        canvas.dataset.drawn = 'true';
    };

    const stopDraw = event => {
        drawing = false;
        if (event.pointerId) {
            canvas.releasePointerCapture(event.pointerId);
        }
    };

    canvas.addEventListener('pointerdown', startDraw);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointercancel', stopDraw);
    canvas.addEventListener('pointerleave', stopDraw);
}


// ===== SEGURANÇA E SANITIZAÇÃO =====
// Função para sanitizar entrada de texto (remove tags HTML e caracteres perigosos)
function sanitizeText(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>'"&]/g, '').trim();
}

// Função para validar entrada numérica
function sanitizeNumber(input) {
    if (typeof input !== 'string') return '0';
    const cleaned = input.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? '0' : num.toString();
}

// Função para validar e sanitizar entrada antes de salvar
function secureInputValidation() {
    // Sanitiza campos de texto
    const textInputs = document.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach(input => {
        input.value = sanitizeText(input.value);
    });

    // Valida campos numéricos
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        const originalValue = input.value;
        const sanitized = sanitizeNumber(originalValue);
        if (originalValue !== sanitized) {
            console.warn(`Campo numérico sanitizado: ${originalValue} -> ${sanitized}`);
            input.value = sanitized;
        }
    });

    return true;
}

// Função para prevenir XSS em elementos dinâmicos
function safeSetInnerHTML(element, html) {
    if (!element || typeof html !== 'string') return;
    // Remove qualquer script ou event handler
    const sanitized = html.replace(/<script[^>]*>.*?<\/script>/gi, '')
                         .replace(/on\w+="[^"]*"/gi, '')
                         .replace(/javascript:/gi, '');
    element.innerHTML = sanitized;
}

// ===== GERAÇÃO DINÂMICA DO GRID DE HIGIENE =====
// Define os critérios de higiene que serão exibidos
const criteria = ["Paredes Internas", "Sem Furos", "Teto", "Chão Limpo", "Sem Odor", "Sem Pragas"];
// Seleciona o container onde os critérios serão inseridos
const hygieneGrid = document.getElementById('hygieneGrid');
// Para cada critério, cria um elemento HTML com botões C/NC
criteria.forEach(item => {
    // Cria um div para cada item
    const div = document.createElement('div');
    // Adiciona classes CSS para estilização
    div.className = "flex items-center justify-between p-4 bg-slate-200 rounded-xl border border-slate-300 shadow-sm";
    // Define o HTML interno com rótulos e botões radio
    div.innerHTML = `<span class="text-[9px] font-black text-slate-700 uppercase">${item}</span>
        <div class="flex gap-2">
            <input type="radio" name="${item}" id="${item}c" class="hidden peer/c" checked> <!-- Radio para "C" (checked por padrão) -->
            <label for="${item}c" class="w-8 h-8 flex items-center justify-center bg-green-500 border border-green-600 rounded-lg peer-checked/c:bg-green-600 peer-checked/c:text-white text-[10px] font-bold cursor-pointer text-white">C</label> <!-- Label estilizado para "C" -->
            <input type="radio" name="${item}" id="${item}nc" class="hidden peer/nc"> <!-- Radio para "NC" -->
            <label for="${item}nc" class="w-8 h-8 flex items-center justify-center bg-slate-300 border border-slate-400 rounded-lg peer-checked/nc:bg-red-600 peer-checked/nc:border-red-700 peer-checked/nc:text-white text-[10px] font-bold cursor-pointer">NC</label> <!-- Label estilizado para "NC" -->
        </div>`;
    // Adiciona o div ao container
    hygieneGrid.appendChild(div);
});

// ===== GERENCIAMENTO DE ITENS =====
// Função para adicionar uma nova linha na tabela de itens
function addItemRow() {
    // Seleciona o corpo da tabela
    const tbody = document.getElementById('itemTableBody');
    // Cria um novo elemento tr (linha)
    const tr = document.createElement('tr');
    // Adiciona classe para hover
    tr.className = "hover:bg-slate-50";
    // Define o HTML da linha com inputs para cada coluna
    tr.innerHTML = `
        <td class="pl-6"><input type="text" class="table-input !text-left uppercase" placeholder="ITEM" required></td> <!-- Descrição do item -->
        <td><input type="number" class="table-input val-item-code text-center" placeholder="CÓD" min="0" step="1" required></td> <!-- Código do item -->
        <td class="bg-blue-50/30"><input type="number" class="table-input val-previsto text-center" value="0" min="0" step="1" oninput="audit(this)" required></td> <!-- Quantidade prevista -->
        <td class="bg-blue-50/30"><input type="number" class="table-input val-realizado text-center" value="0" min="0" step="1" oninput="audit(this)" required></td> <!-- Quantidade realizada -->
        <td><input type="number" class="table-input text-red-600 res-falta text-center" value="0" readonly></td> <!-- Faltas (calculada) -->
        <td><input type="number" class="table-input text-green-600 res-sobra text-center" value="0" readonly></td> <!-- Sobras (calculada) -->
        <td><input type="number" class="table-input val-avaria text-center" value="0" min="0" step="1" oninput="audit(this)" required></td> <!-- Avarias -->
        <td><input type="number" class="table-input val-scrap text-center" value="0" min="0" step="1" oninput="audit(this)" required></td> <!-- Scrap -->
        <td><input type="number" class="table-input val-avint text-center" value="0" min="0" step="1" oninput="audit(this)" required></td> <!-- Avarias internas -->
        <td class="bg-slate-100"><input type="number" class="table-input font-black res-bons text-center" value="0" readonly></td> <!-- Total bons (calculada) -->
        <td class="text-center"><button type="button" onclick="this.parentElement.parentElement.remove(); auditAll();" class="text-slate-300 hover:text-red-500 font-bold">✕</button></td> <!-- Botão remover -->
    `;
    // Adiciona a linha ao corpo da tabela
    tbody.appendChild(tr);
}

function addPalletRow(bodyId) {
    const tbody = document.getElementById(bodyId);
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.className = 'border-b border-muted';
    tr.innerHTML = `
        <td class="py-3 pl-4"><input type="number" class="input-field val-pallet-code text-right" placeholder="CÓD" min="0" step="1" oninput="numericOnly(this)"></td>
        <td class="py-3 pr-4"><input type="number" class="input-field val-pallet-count text-right" placeholder="Fardos Totais" min="0" step="1" oninput="numericOnly(this)"></td>
        <td class="py-3 pr-4"><input type="number" class="input-field val-pallet-per text-right" placeholder="Fardos / Pallet" min="0" step="1" oninput="numericOnly(this)"></td>
        <td class="text-center"><button type="button" onclick="removePalletRow(this)" class="text-slate-300 hover:text-red-500 font-bold">✕</button></td>
    `;
    tbody.appendChild(tr);
}

function removePalletRow(button) {
    const row = button?.closest('tr');
    if (!row) return;
    const tbody = row.parentElement;
    row.remove();
    if (tbody.children.length === 0) {
        addPalletRow(tbody.id);
    }
}

// ===== FUNÇÕES DE AUDITORIA =====
// Função para calcular faltas, sobras e totais para uma linha específica
function audit(el) {
    // Seleciona a linha do elemento
    const row = el.parentElement.parentElement;
    // Obtém os valores dos inputs
    const prev = parseFloat(row.querySelector('.val-previsto').value) || 0; // Previsto
    const real = parseFloat(row.querySelector('.val-realizado').value) || 0; // Realizado
    const av = parseFloat(row.querySelector('.val-avaria').value) || 0; // Avarias
    const sc = parseFloat(row.querySelector('.val-scrap').value) || 0; // Scrap
    const ai = parseFloat(row.querySelector('.val-avint').value) || 0; // Avarias internas

    // Calcula a diferença (positivo = sobra, negativo = falta)
    const diff = real - prev;
    // Define o valor de faltas (absoluto se negativo)
    row.querySelector('.res-falta').value = diff < 0 ? Math.abs(diff) : 0;
    // Define o valor de sobras (se positivo) - não são contabilizadas nos bons
    row.querySelector('.res-sobra').value = diff > 0 ? diff : 0;
    // Calcula total de itens bons: PREVISTO menos as perdas (avarias, scrap, av.int.)
    // As sobras NÃO são descontadas, pois não eram esperadas e serão contabilizadas em nota fiscal
    row.querySelector('.res-bons').value = prev - (av + sc + ai);
    // Atualiza os totais gerais
    auditAll();
}

// Função para calcular os totais gerais de todas as linhas
function auditAll() {
    // Soma todas as faltas
    let f = 0;
    document.querySelectorAll('.res-falta').forEach(i => f += parseFloat(i.value) || 0);
    // Soma todas as sobras
    let s = 0;
    document.querySelectorAll('.res-sobra').forEach(i => s += parseFloat(i.value) || 0);
    // Soma todos os itens bons
    let b = 0;
    document.querySelectorAll('.res-bons').forEach(i => b += parseFloat(i.value) || 0);
    // Atualiza os elementos HTML com os totais
    document.getElementById('totalFaltas').innerText = f;
    document.getElementById('totalSobra').innerText = s;
    document.getElementById('totalBonsGeral').innerText = b;
}

function numericOnly(el) {
    if (!el) return;
    el.value = el.value.replace(/\D+/g, '');
}

function togglePalletSections() {
    const flow = document.getElementById('operationTypeSelect').value;
    const inboundBox = document.getElementById('palletsInboundBox');
    const outboundBox = document.getElementById('palletsOutboundBox');
    const inboundSection = document.getElementById('inboundPalletSection');
    const outboundSection = document.getElementById('outboundPalletSection');
    const inboundInput = document.getElementById('palletsInboundInput');
    const outboundInput = document.getElementById('palletsOutboundInput');

    const setContainerDisabled = (container, disabled) => {
        if (!container) return;
        container.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = disabled;
            if (disabled) {
                el.required = false;
            }
        });
    };

    if (flow === 'INBOUND') {
        inboundBox.style.display = 'block';
        inboundSection.style.display = 'block';
        outboundBox.style.display = 'none';
        outboundSection.style.display = 'none';
        inboundInput.required = true;
        outboundInput.required = false;
        setContainerDisabled(outboundSection, true);
        setContainerDisabled(outboundBox, true);
        setContainerDisabled(inboundSection, false);
        setContainerDisabled(inboundBox, false);
    } else {
        inboundBox.style.display = 'none';
        inboundSection.style.display = 'none';
        outboundBox.style.display = 'block';
        outboundSection.style.display = 'block';
        inboundInput.required = false;
        outboundInput.required = true;
        setContainerDisabled(inboundSection, true);
        setContainerDisabled(inboundBox, true);
        setContainerDisabled(outboundSection, false);
        setContainerDisabled(outboundBox, false);
    }
}

function validateChecklist() {
    console.log('Iniciando validação do checklist...');

    const form = document.getElementById('mainChecklist');
    if (!form.checkValidity()) {
        console.log('Formulário não é válido:', form.checkValidity());
        form.reportValidity();
        return false;
    }

    const operationType = document.getElementById('operationTypeSelect').value;
    console.log('Tipo de operação:', operationType);

    const rows = document.querySelectorAll('#itemTableBody tr');
    console.log('Número de linhas na tabela:', rows.length);

    if (rows.length === 0) {
        alert('Adicione pelo menos um item na conferência técnica.');
        return false;
    }

    for (const row of rows) {
        const description = row.querySelector('input[type="text"]');
        const code = row.querySelector('.val-item-code');
        if (!description || !description.value.trim()) {
            console.log('Descrição vazia encontrada');
            alert('Preencha a descrição de todos os itens da conferência técnica.');
            return false;
        }
        if (!code || code.value.trim() === '') {
            console.log('Código vazio encontrado');
            alert('Preencha o código numérico de todos os itens da conferência técnica.');
            return false;
        }
        const numbers = row.querySelectorAll('input[type="number"]');
        for (const input of numbers) {
            if (input.required && input.value.trim() === '') {
                console.log('Campo numérico obrigatório vazio');
                alert('Preencha todos os campos numéricos da conferência técnica.');
                return false;
            }
            if (input.value.trim() !== '' && Number.isNaN(Number(input.value))) {
                console.log('Campo numérico com valor inválido');
                alert('Use apenas números nos campos numéricos da conferência técnica.');
                return false;
            }
        }
    }

    const activePalletInput = operationType === 'INBOUND'
        ? document.getElementById('palletsInboundInput')
        : document.getElementById('palletsOutboundInput');
    if (!activePalletInput.value.trim()) {
        console.log('Campo de pallets vazio');
        alert('Preencha o campo de pallets correspondente ao fluxo selecionado.');
        return false;
    }

    const palletBodyId = operationType === 'INBOUND' ? 'inboundPalletBody' : 'outboundPalletBody';
    if (!validatePalletSection(palletBodyId)) {
        console.log('Validação da seção de pallets falhou');
        return false;
    }

    const driverCanvas = document.getElementById('driverSignatureCanvas');
    const checkerCanvas = document.getElementById('checkerSignatureCanvas');
    if (isCanvasBlank(driverCanvas) || isCanvasBlank(checkerCanvas)) {
        console.log('Assinaturas faltando');
        alert('Por favor, assine no quadro do motorista e do conferente antes de finalizar.');
        return false;
    }

    console.log('Validação passou com sucesso');
    return true;
}

function validatePalletSection(bodyId) {
    const rows = document.querySelectorAll(`#${bodyId} tr`);
    let hasFilledRow = false;

    for (const row of rows) {
        const code = row.querySelector('.val-pallet-code');
        const count = row.querySelector('.val-pallet-count');
        const per = row.querySelector('.val-pallet-per');

        const codeValue = code?.value.trim() || '';
        const countValue = count?.value.trim() || '';
        const perValue = per?.value.trim() || '';
        const anyFilled = codeValue !== '' || countValue !== '' || perValue !== '';

        if (!anyFilled) {
            continue;
        }

        hasFilledRow = true;
        if (codeValue === '' || countValue === '' || perValue === '') {
            alert('Preencha todos os campos da linha de pallet ou deixe-a completamente vazia.');
            return false;
        }
        if (Number.isNaN(Number(codeValue)) || Number.isNaN(Number(countValue)) || Number.isNaN(Number(perValue))) {
            alert('Use apenas números nos campos de pallet.');
            return false;
        }
    }

    if (!hasFilledRow) {
        alert('Adicione pelo menos um código de pallet no fluxo ativo ou zere o campo de pallets.');
        return false;
    }

    return true;
}

// ===== INICIALIZAÇÃO =====
// Adiciona uma linha inicial de item ao carregar a página
addItemRow();

const operationTypeSelect = document.getElementById('operationTypeSelect');
if (operationTypeSelect) {
    operationTypeSelect.addEventListener('change', togglePalletSections);
}

togglePalletSections();
initSignatureCanvas('driverSignatureCanvas');
initSignatureCanvas('checkerSignatureCanvas');

document.addEventListener('DOMContentLoaded', () => {
    loadChecklists();
});

// ===== SALVAMENTO DO CHECKLIST =====
// Função para salvar o checklist no Firebase Firestore
async function saveChecklist(event) {
    event.preventDefault();
    console.log('Função saveChecklist chamada');

    if (!secureInputValidation()) {
        alert('Erro de validação de segurança. Verifique os dados inseridos.');
        return;
    }

    if (!validateChecklist()) {
        console.log('Validação falhou, não enviando dados');
        return;
    }

    console.log('Validação passou, coletando dados...');

    const operationType = document.getElementById('operationTypeSelect').value;

    const checklistData = {
        operationType: operationType === 'INBOUND' ? 'IN' : 'OUT',
        dtNumber: document.getElementById('dtNumberInput')?.value || '',
        driverName: document.getElementById('driverNameInput')?.value || '',
        placaCavalo: document.getElementById('placaCavaloInput')?.value || '',
        placaCarreta1: document.getElementById('placaCarreta1Input')?.value || '',
        placaCarreta2: document.getElementById('placaCarreta2Input')?.value || '',
        transportadora: document.getElementById('transportadoraInput')?.value || '',
        doca: document.getElementById('docaInput')?.value || '',
        palletsInbound: document.getElementById('palletsInboundInput')?.value || '0',
        palletsOutbound: document.getElementById('palletsOutboundInput')?.value || '0',
        totalPbr: document.getElementById('totalPbrInput')?.value || '0',
        lacre1: document.getElementById('lacre1Input')?.value || '',
        lacre2: document.getElementById('lacre2Input')?.value || '',
        statusLacre: document.getElementById('statusLacreSelect')?.value || '',
        checkinTime: new Date().toLocaleString('pt-BR'),
        hygiene: {},
        items: [],
        totalFaltas: parseInt(document.getElementById('totalFaltas')?.innerText) || 0,
        totalSobra: parseInt(document.getElementById('totalSobra')?.innerText) || 0,
        totalBonsGeral: parseInt(document.getElementById('totalBonsGeral')?.innerText) || 0,
        observations: document.querySelector('textarea')?.value || '',
        driverSignature: getSignatureData(document.getElementById('driverSignatureCanvas')),
        checkerSignature: getSignatureData(document.getElementById('checkerSignatureCanvas'))
    };

    const criteria = ["Paredes Internas", "Sem Furos", "Teto", "Chão Limpo", "Sem Odor", "Sem Pragas"];
    criteria.forEach(item => {
        const selected = document.querySelector(`input[name="${item}"]:checked`);
        checklistData.hygiene[item] = selected ? (selected.id.endsWith('c') ? 'C' : 'NC') : 'N/A';
    });

    const itemRows = document.querySelectorAll('#itemTableBody tr');
    itemRows.forEach(row => {
        const inputs = row.querySelectorAll('.table-input');
        const item = {
            description: inputs[0]?.value || '',
            code: inputs[1]?.value || '',
            previsto: parseInt(inputs[2]?.value) || 0,
            realizado: parseInt(inputs[3]?.value) || 0,
            faltas: parseInt(inputs[4]?.value) || 0,
            sobras: parseInt(inputs[5]?.value) || 0,
            avarias: parseInt(inputs[6]?.value) || 0,
            scrap: parseInt(inputs[7]?.value) || 0,
            avariasInternas: parseInt(inputs[8]?.value) || 0,
            bons: parseInt(inputs[9]?.value) || 0
        };
        checklistData.items.push(item);
    });

    checklistData.totalFardos = checklistData.items.reduce((sum, item) => sum + item.realizado, 0);
    checklistData.avariados = checklistData.items.reduce((sum, item) => sum + item.avarias, 0);
    checklistData.scrap = checklistData.items.reduce((sum, item) => sum + item.scrap, 0);
    checklistData.avariasInternas = checklistData.items.reduce((sum, item) => sum + item.avariasInternas, 0);

    const palletBodyId = operationType === 'INBOUND' ? 'inboundPalletBody' : 'outboundPalletBody';
    checklistData.palletRows = Array.from(document.querySelectorAll(`#${palletBodyId} tr`))
        .map(row => {
            const code = row.querySelector('.val-pallet-code')?.value.trim() || '';
            const count = row.querySelector('.val-pallet-count')?.value.trim() || '';
            const per = row.querySelector('.val-pallet-per')?.value.trim() || '';
            return {
                code: sanitizeText(code),
                count: parseInt(sanitizeNumber(count), 10) || 0,
                per: parseInt(sanitizeNumber(per), 10) || 0
            };
        })
        .filter(row => row.code !== '' || row.count !== 0 || row.per !== 0);

    try {
        console.log('Iniciando envio para Firebase...');
        console.log('Firebase disponível:', {
            db: !!window.firebaseDb,
            addDoc: !!window.firebaseAddDoc,
            collection: !!window.firebaseCollection,
            serverTimestamp: !!window.firebaseServerTimestamp
        });

        if (!window.firebaseDb || !window.firebaseAddDoc || !window.firebaseCollection) {
            throw new Error('Firebase não está inicializado.');
        }

        console.log('Enviando dados para Firestore...');
        const docRef = await window.firebaseAddDoc(
            window.firebaseCollection(window.firebaseDb, 'checklists'),
            {
                ...checklistData,
                createdAt: window.firebaseServerTimestamp ? window.firebaseServerTimestamp() : new Date()
            }
        );

        console.log('Documento enviado com sucesso:', docRef.id);
        alert('Checklist enviado para o painel admin com sucesso!');
        document.getElementById('mainChecklist').reset();
    } catch (error) {
        console.error('Erro ao enviar dados para o painel:', error);
        alert('Erro ao enviar o relatório para o painel admin. Verifique a conexão e tente novamente.');
    }
}


// ===== CONFIGURAÇÃO DO EVENT LISTENER =====

// Adiciona event listener para o formulário
document.getElementById('mainChecklist').addEventListener('submit', saveChecklist);