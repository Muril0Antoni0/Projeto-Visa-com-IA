document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const roleOptions = document.querySelectorAll('input[name="role"]');
    const labelIdentificador = document.getElementById('label-identificador');
    const identificadorInput = document.getElementById('identificador');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const errorIdentificador = document.getElementById('error-identificador');
    const errorPassword = document.getElementById('error-password');

    // --- FUNÇÕES DE CONTROLE DE ERRO VISUAL ---
    // Adiciona a classe de erro (borda vermelha) e exibe a mensagem abaixo do campo
    function setFieldError(input, errorElement, message) {
        input.classList.add('input-error');
        errorElement.innerText = message;
        errorElement.style.display = 'block';
    }

    // Remove a borda vermelha e esconde a mensagem de erro
    function clearFieldError(input, errorElement) {
        input.classList.remove('input-error');
        errorElement.style.display = 'none';
    }

    // --- FUNÇÕES DE MÁSCARA (REGEX) ---
    // Formata o número conforme o padrão CPF: 000.000.000-00
    const maskCPF = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    
    // Formata o número conforme o padrão CNPJ: 00.000.000/0000-00
    const maskCNPJ = (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');

    // --- EVENTO: TROCA DE PERFIL (EMPRESA / SERVIDOR) ---
    roleOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            // Limpa o campo e erros ao trocar de perfil para evitar confusão
            identificadorInput.value = '';
            clearFieldError(identificadorInput, errorIdentificador);
            
            // Altera o rótulo (label) e o exemplo (placeholder) conforme a escolha
            if (e.target.value === 'servidor') {
                labelIdentificador.innerText = 'CPF';
                identificadorInput.placeholder = '000.000.000-00';
            } else {
                labelIdentificador.innerText = 'CNPJ';
                identificadorInput.placeholder = '00.000.000/0000-00';
            }
        });
    });

    // --- EVENTO: DIGITAÇÃO NO CAMPO IDENTIFICADOR ---
    identificadorInput.addEventListener('input', (e) => {
        // Limpa o erro assim que o usuário volta a digitar
        clearFieldError(identificadorInput, errorIdentificador);
        
        // Verifica qual perfil está ativo para aplicar a máscara correta (CPF ou CNPJ)
        const role = document.querySelector('input[name="role"]:checked').value;
        e.target.value = role === 'servidor' ? maskCPF(e.target.value) : maskCNPJ(e.target.value);
    });

    // --- EVENTO: DIGITAÇÃO NA SENHA ---
    passwordInput.addEventListener('input', () => clearFieldError(passwordInput, errorPassword));

    // --- EVENTO: MOSTRAR/ESCONDER SENHA ---
    togglePassword.addEventListener('click', () => {
        // Alterna o tipo do input entre 'password' (bolinhas) e 'text' (leitura real)
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Alterna o ícone do olho (aberto/fechado)
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // --- EVENTO: SUBMISSÃO DO FORMULÁRIO (LOGIN COMUM) ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        let isValid = true;

        const role = document.querySelector('input[name="role"]:checked').value;
        const userRawValue = identificadorInput.value.replace(/\D/g, ''); // Pega apenas os números
        const passwordValue = passwordInput.value;

        // Validação do Identificador (Se está vazio ou incompleto)
        if (role === 'servidor' && !userRawValue) {
            setFieldError(identificadorInput, errorIdentificador, "CPF obrigatório");
            isValid = false;
        } else if (role === 'empresa' && !userRawValue) {
            setFieldError(identificadorInput, errorIdentificador, "CNPJ obrigatório");
            isValid = false;
        } else if (role === 'servidor' && userRawValue.length !== 11) {
            setFieldError(identificadorInput, errorIdentificador, "CPF incompleto");
            isValid = false;
        } else if (role === 'empresa' && userRawValue.length !== 14) {
            setFieldError(identificadorInput, errorIdentificador, "CNPJ incompleto");
            isValid = false;
        }

        // Validação da Senha (Vazio ou menor que 6 caracteres)
        if (!passwordValue) {
            setFieldError(passwordInput, errorPassword, "A senha é obrigatória");
            isValid = false;
        } else if (passwordValue.length < 6) {
            setFieldError(passwordInput, errorPassword, "Mínimo de 6 caracteres");
            isValid = false;
        }

        // Se houver erro, para a execução aqui
        if (!isValid) return;

        // Redirecionamento condicional baseado no perfil escolhido
        window.location.href = role === 'servidor' ? 'dashboard_static.html' : 'portal_static.html';
    });

    // --- EVENTO: ACESSO VIA GOV.BR ---
    const btnGovBr = document.querySelector('.btn-gov-br');

    btnGovBr.addEventListener('click', () => {
        // Verifica qual perfil está selecionado no rádio antes de "conectar"
        const role = document.querySelector('input[name="role"]:checked').value;
        
        // Feedback visual de carregamento
        btnGovBr.innerText = "Conectando ao Gov.br...";
        btnGovBr.disabled = true;

        // Simula o tempo de autenticação externa do governo (1.5 segundos)
        setTimeout(() => {
            if (role === 'servidor') {            
                window.location.href = 'dashboard_static.html';
            } else {               
                window.location.href = 'portal_static.html';
            }
        }, 1500);
    });
});