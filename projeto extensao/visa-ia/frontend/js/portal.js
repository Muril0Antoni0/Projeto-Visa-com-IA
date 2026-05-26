document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('form-container')) return;

    const totalSteps = 4;
    let currentStep = 1;

    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const stepIndicators = document.querySelectorAll('.step');
    const uploadZones = document.querySelectorAll('.upload-zone');
    const progressValue = document.querySelector('.progress-value');
    const progressText = document.querySelector('.text-muted.text-sm');
    const checklistItems = document.querySelectorAll('.checklist-item');

    const totalDocs = 8;
    const mandatoryFiles = {};
    const additionalFiles = [];

    // --- Máscara de CNPJ ---
    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 14) v = v.slice(0, 14);
            if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, "$1.$2.$3/$4-$5");
            else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, "$1.$2.$3/$4");
            else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{1,3})$/, "$1.$2.$3");
            else if (v.length > 2) v = v.replace(/^(\d{2})(\d{1,3})$/, "$1.$2");
            e.target.value = v;
        });
    }

    // --- Navegação de Passos ---
    function updateSteps() {
        document.querySelectorAll('.step-content').forEach(s => s.style.display = 'none');
        document.getElementById(`step-${currentStep}`).style.display = 'block';

        stepIndicators.forEach((ind, i) => {
            ind.classList.toggle('active', i < currentStep);
        });

        btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

        if (currentStep === totalSteps) {
            btnNext.style.display = 'none';
            btnSubmit.style.display = 'inline-block';
            updateReviewSection();
        } else {
            btnNext.style.display = 'inline-block';
            btnSubmit.style.display = 'none';
        }
    }

    btnNext.addEventListener('click', () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep < totalSteps) { currentStep++; updateSteps(); }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) { currentStep--; updateSteps(); }
    });

    function validateStep1() {
        const fields = ['razao_social', 'cnpj', 'tipo_estabelecimento'];
        let valid = true;
        fields.forEach(id => {
            const el = document.getElementById(id);
            const err = document.getElementById(`error-${id.split('_')[0]}`);
            if (!el.value.trim()) {
                el.style.borderColor = 'var(--danger)';
                if (err) err.style.display = 'block';
                valid = false;
            } else {
                el.style.borderColor = 'var(--border-color)';
                if (err) err.style.display = 'none';
            }
        });
        return valid;
    }

    // --- Upload de Documentos ---
    uploadZones.forEach(zone => {
        if (zone.id === 'upload-adicional') return;
        const input = zone.querySelector('.file-input');
        const docType = zone.getAttribute('data-doc');

        zone.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-file')) {
                delete mandatoryFiles[docType];
                zone.classList.remove('uploaded');
                zone.querySelector('.zone-default').style.display = 'block';
                zone.querySelector('.zone-uploaded').style.display = 'none';
                updateProgress();
                return;
            }
            if (input) input.click();
        });

        if (input) {
            input.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    mandatoryFiles[docType] = file;
                    zone.classList.add('uploaded');
                    zone.querySelector('.zone-default').style.display = 'none';
                    const view = zone.querySelector('.zone-uploaded');
                    view.querySelector('.filename-display').innerText = file.name;
                    view.style.display = 'block';
                    updateProgress();
                }
            });
        }
    });

    function updateProgress() {
        const count = Object.keys(mandatoryFiles).length;
        const perc = Math.round((count / totalDocs) * 100);
        progressValue.innerText = `${perc}%`;
        if (progressText) progressText.innerText = `${count} de 8 documentos enviados`;
        const circle = document.querySelector('.circular-progress');
        if (circle) circle.style.background = `conic-gradient(var(--primary-color) ${perc * 3.6}deg, #f1f5f9 0deg)`;
    }

    // --- Finalização ---
    btnSubmit.addEventListener('click', async () => {
        if (!document.getElementById('declaracao').checked) {
            alert('Confirme a declaração de veracidade.');
            return;
        }
        btnSubmit.disabled = true;
        btnSubmit.innerText = 'Enviando...';

        // Simulação de envio / Integração com IA
        setTimeout(() => {
            alert('Processo enviado com sucesso!');
            window.location.href = 'dashboard_static.html';
        }, 1500);
    });
});