document.addEventListener('DOMContentLoaded', () => {
    // Efeito simples de foco nos inputs
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const wrapper = input.closest('.input-wrapper, .select-wrapper');
            if(wrapper) {
                wrapper.style.opacity = '1';
            }
        });
    });

    // Lógica do Portal se estiver na página do Portal
    if (document.getElementById('form-container')) {
        initPortalLogic();
    }
});

function initPortalLogic() {
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

    // Helper to format file sizes
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // CNPJ Masking Logic
    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            let value = e.target.value;
            value = value.replace(/\D/g, ''); // Strip non-digits
            if (value.length > 14) {
                value = value.slice(0, 14); // Limit to 14
            }
            // Format 00.000.000/0000-00
            if (value.length > 12) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, "$1.$2.$3/$4-$5");
            } else if (value.length > 8) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, "$1.$2.$3/$4");
            } else if (value.length > 5) {
                value = value.replace(/^(\d{2})(\d{3})(\d{1,3})$/, "$1.$2.$3");
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{1,3})$/, "$1.$2");
            }
            e.target.value = value;
        });
    }

    // Step 1 Validation Helper
    function validateStep1() {
        const razaoInput = document.getElementById('razao_social');
        const cnpjInput = document.getElementById('cnpj');
        const tipoInput = document.getElementById('tipo_estabelecimento');
        
        let isValid = true;
        
        // Razão Social
        const errorRazao = document.getElementById('error-razao');
        if (!razaoInput.value.trim()) {
            if (errorRazao) {
                errorRazao.innerText = 'Razão Social é obrigatória.';
                errorRazao.style.display = 'block';
            }
            razaoInput.style.borderColor = 'var(--danger)';
            isValid = false;
        } else {
            if (errorRazao) errorRazao.style.display = 'none';
            razaoInput.style.borderColor = 'var(--border-color)';
        }
        
        // CNPJ
        const errorCnpj = document.getElementById('error-cnpj');
        const cnpjDigits = cnpjInput.value.replace(/\D/g, '');
        if (cnpjDigits.length === 0) {
            if (errorCnpj) {
                errorCnpj.innerText = 'CNPJ é obrigatório.';
                errorCnpj.style.display = 'block';
            }
            cnpjInput.style.borderColor = 'var(--danger)';
            isValid = false;
        } else if (cnpjDigits.length !== 14) {
            if (errorCnpj) {
                errorCnpj.innerText = 'CNPJ deve conter exatamente 14 números.';
                errorCnpj.style.display = 'block';
            }
            cnpjInput.style.borderColor = 'var(--danger)';
            isValid = false;
        } else {
            if (errorCnpj) errorCnpj.style.display = 'none';
            cnpjInput.style.borderColor = 'var(--border-color)';
        }
        
        // Tipo Estabelecimento
        const errorTipo = document.getElementById('error-tipo');
        if (!tipoInput.value) {
            if (errorTipo) {
                errorTipo.innerText = 'Tipo de Estabelecimento é obrigatório.';
                errorTipo.style.display = 'block';
            }
            tipoInput.style.borderColor = 'var(--danger)';
            isValid = false;
        } else {
            if (errorTipo) errorTipo.style.display = 'none';
            tipoInput.style.borderColor = 'var(--border-color)';
        }
        
        return isValid;
    }

    // Navigation Logic
    function updateSteps() {
        // Hide all steps
        for(let i = 1; i <= totalSteps; i++) {
            const stepEl = document.getElementById(`step-${i}`);
            if (stepEl) stepEl.style.display = 'none';
        }
        // Show current step
        const currentStepEl = document.getElementById(`step-${currentStep}`);
        if (currentStepEl) currentStepEl.style.display = 'block';

        // Update indicators
        stepIndicators.forEach((indicator, index) => {
            if (index < currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        // Update buttons
        if (currentStep === 1) {
            btnPrev.style.visibility = 'hidden';
        } else {
            btnPrev.style.visibility = 'visible';
        }

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
        if (currentStep === 1) {
            if (!validateStep1()) {
                return; // Stop if invalid establishment data
            }
        }
        if (currentStep < totalSteps) {
            currentStep++;
            updateSteps();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateSteps();
        }
    });

    // Update Progress Sidebar
    function updateProgress() {
        const mandatoryCount = Object.keys(mandatoryFiles).length;
        const percentage = Math.round((mandatoryCount / totalDocs) * 100);
        progressValue.innerText = `${percentage}%`;
        if (progressText) {
            progressText.innerText = `${mandatoryCount} de 8 documentos obrigatórios enviados`;
        }

        // Circular Progress Background update (CSS conic-gradient)
        const circularProgress = document.querySelector('.circular-progress');
        if (circularProgress) {
            circularProgress.style.background = `conic-gradient(var(--success) ${percentage * 3.6}deg, var(--border-color) 0deg)`;
        }
    }

    // Step 2: Handle file uploads for mandatory documents
    uploadZones.forEach(zone => {
        // Skip additional document zone
        if (zone.id === 'upload-adicional') return;

        const fileInput = zone.querySelector('.file-input');
        const docType = zone.getAttribute('data-doc');

        // Handle click on the zone
        zone.addEventListener('click', function(e) {
            // If clicking the remove button
            if (e.target.classList.contains('btn-remove-file')) {
                e.stopPropagation();
                if (fileInput) fileInput.value = ''; // Reset input
                
                // Reset view state
                zone.classList.remove('uploaded');
                zone.querySelector('.zone-default').style.display = 'block';
                zone.querySelector('.zone-uploaded').style.display = 'none';

                // Delete entry
                delete mandatoryFiles[docType];

                // Update Checklist
                checklistItems.forEach(item => {
                    if (item.innerText.trim() === docType) {
                        const check = item.querySelector('.circle-check');
                        check.style.backgroundColor = 'var(--border-color)';
                        check.innerHTML = '';
                    }
                });

                updateProgress();
                return;
            }

            // Normal click opens file selector
            if (e.target.tagName !== 'INPUT' && fileInput) {
                fileInput.click();
            }
        });

        // Handle file input change
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    zone.classList.add('uploaded');
                    zone.querySelector('.zone-default').style.display = 'none';
                    
                    const uploadedView = zone.querySelector('.zone-uploaded');
                    uploadedView.querySelector('.filename-display').innerText = file.name;
                    uploadedView.querySelector('.filesize-display').innerText = formatBytes(file.size);
                    uploadedView.style.display = 'block';

                    mandatoryFiles[docType] = file;

                    // Update Checklist
                    checklistItems.forEach(item => {
                        if (item.innerText.trim() === docType) {
                            const check = item.querySelector('.circle-check');
                            check.style.backgroundColor = 'var(--success)';
                            check.innerHTML = '<i class="fa-solid fa-check" style="color: white; font-size: 10px; display: flex; align-items: center; justify-content: center; height: 100%;"></i>';
                        }
                    });

                    updateProgress();
                }
            });
        }
    });

    // Step 3: Handle additional documents
    const addZone = document.getElementById('upload-adicional');
    const addInput = document.getElementById('additional-file-input');

    if (addZone && addInput) {
        addZone.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                addInput.click();
            }
        });

        addInput.addEventListener('change', function() {
            Array.from(this.files).forEach(file => {
                let docName = prompt(`Qual o nome/tipo para o documento "${file.name}"?`, file.name.replace(/\.[^/.]+$/, ""));
                if (docName === null) return; // Cancelled
                if (!docName.trim()) docName = file.name;

                additionalFiles.push({
                    customName: docName,
                    file: file
                });
            });

            // Reset file input so same file can be uploaded again
            addInput.value = '';

            renderAdditionalDocs();
        });
    }

    function renderAdditionalDocs() {
        const list = document.getElementById('adicionais-list');
        if (!list) return;
        
        list.innerHTML = '';
        additionalFiles.forEach((doc, index) => {
            const docItem = document.createElement('div');
            docItem.className = 'checklist-item mt-2 additional-doc-item';
            docItem.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); background: white; margin-bottom: 8px;';
            docItem.innerHTML = `
                <div class="circle-check" style="background-color: var(--success); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;">
                    <i class="fa-solid fa-check" style="color: white; font-size: 10px;"></i>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-start; margin-left: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span style="font-weight: 600; color: var(--text-main); font-size: 13px;">${doc.customName}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${doc.file.name} (${formatBytes(doc.file.size)})</span>
                </div>
                <button type="button" class="btn-remove-additional" data-index="${index}" style="margin-left: auto; background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px;" title="Remover documento">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            list.appendChild(docItem);
        });

        // Add event listeners for removal
        list.querySelectorAll('.btn-remove-additional').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                additionalFiles.splice(index, 1);
                renderAdditionalDocs();
            });
        });
    }

    // Step 4: Populate Review section
    function updateReviewSection() {
        const razaoInput = document.getElementById('razao_social');
        const cnpjInput = document.getElementById('cnpj');
        const tipoInput = document.getElementById('tipo_estabelecimento');

        document.getElementById('rev-razao').innerText = razaoInput.value || 'Não informado';
        document.getElementById('rev-cnpj').innerText = cnpjInput.value || 'Não informado';

        let tipoText = 'Não informado';
        if(tipoInput.selectedIndex > 0) {
            tipoText = tipoInput.options[tipoInput.selectedIndex].text;
        }
        document.getElementById('rev-tipo').innerText = tipoText;

        // Mandatory docs display
        const mandatoryCount = Object.keys(mandatoryFiles).length;
        const revObrig = document.getElementById('rev-obrig');
        revObrig.innerText = `${mandatoryCount} de 8 enviados`;
        
        if (mandatoryCount === 8) {
            revObrig.className = 'review-item-value text-success';
            revObrig.style.color = 'var(--success)';
        } else {
            revObrig.className = 'review-item-value text-danger';
            revObrig.style.color = 'var(--danger)';
        }

        const obrigContainer = document.getElementById('rev-obrig-list-container');
        const obrigList = document.getElementById('rev-obrig-list');
        if (obrigList && obrigContainer) {
            obrigList.innerHTML = '';
            if (mandatoryCount > 0) {
                obrigContainer.style.display = 'block';
                Object.entries(mandatoryFiles).forEach(([docType, file]) => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '4px';
                    li.innerHTML = `<strong>${docType}:</strong> <span class="text-muted">${file.name} (${formatBytes(file.size)})</span>`;
                    obrigList.appendChild(li);
                });
            } else {
                obrigContainer.style.display = 'none';
            }
        }

        // Additional docs display
        document.getElementById('rev-adic').innerText = `${additionalFiles.length} enviados`;

        const adicContainer = document.getElementById('rev-adic-list-container');
        const adicList = document.getElementById('rev-adic-list');
        if (adicList && adicContainer) {
            adicList.innerHTML = '';
            if (additionalFiles.length > 0) {
                adicContainer.style.display = 'block';
                additionalFiles.forEach(doc => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '4px';
                    li.innerHTML = `<strong>${doc.customName}:</strong> <span class="text-muted">${doc.file.name} (${formatBytes(doc.file.size)})</span>`;
                    adicList.appendChild(li);
                });
            } else {
                adicContainer.style.display = 'none';
            }
        }
    }

    // Submit Logic
    btnSubmit.addEventListener('click', async () => {
        const declaracao = document.getElementById('declaracao');
        if (!declaracao.checked) {
            alert('Por favor, confirme a declaração de veracidade das informações.');
            return;
        }

        const mandatoryCount = Object.keys(mandatoryFiles).length;
        if (mandatoryCount < totalDocs) {
            if(!confirm(`Você enviou apenas ${mandatoryCount} de ${totalDocs} documentos obrigatórios. Deseja enviar mesmo assim? (Pode gerar pendências)`)) {
                return;
            }
        }
        
        btnSubmit.disabled = true;
        btnSubmit.innerText = 'Enviando...';

        try {
            const fileKeys = Object.keys(mandatoryFiles);
            if (fileKeys.length > 0) {
                // Envia o primeiro documento anexado para a IA
                const formData = new FormData();
                formData.append('file', mandatoryFiles[fileKeys[0]]);
                
                // Tenta enviar para a API local (agora rodando na porta 8001)
                console.log("Enviando arquivo para a IA na porta 8001...");
                const response = await fetch('http://127.0.0.1:8001/documentos/analisar', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('Resultado da Análise da IA:', result);
                } else {
                    console.error('Erro na API da IA:', await response.text());
                }
            }

            alert('Processo enviado com sucesso para análise da VISA Londrina!');
            
            // Dynamic redirection depending on file protocol or Flask routes
            if (window.location.pathname.includes('portal_static.html') || window.location.protocol === 'file:') {
                window.location.href = 'dashboard_static.html';
            } else {
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error('Erro de conexão com a IA:', error);
            alert('Processo simulado, mas a IA está offline. Verifique o console.');
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Enviar Processo';
        }
    });
}
