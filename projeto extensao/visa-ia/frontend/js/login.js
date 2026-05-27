document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const roleOptions = document.querySelectorAll('input[name="role"]');
    const labelIdentificador = document.getElementById('label-identificador');
    const identificadorInput = document.getElementById('identificador');

    // Alterar label e máscara baseado no perfil
    roleOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'servidor') {
                labelIdentificador.innerText = 'CPF';
                identificadorInput.placeholder = '000.000.000-00';
            } else {
                labelIdentificador.innerText = 'CNPJ';
                identificadorInput.placeholder = '00.000.000/0000-00';
            }
        });
    });

    // Lógica de Submissão
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const role = document.querySelector('input[name="role"]:checked').value;
        const user = identificadorInput.value;

        // Simulação de 2FA para Servidores
        if (role === 'analista') {
            const token = prompt("Autenticação em Dois Fatores (2FA)\nDigite o código enviado ao seu dispositivo:");
            if (!token || token.length < 4) {
                alert("Código inválido. Acesso negado.");
                return;
            }
        }

        // Lembrar meu acesso
        if (document.getElementById('rememberMe').checked) {
            localStorage.setItem('rememberedUser', user);
        }

        // Redirecionamento baseado no perfil
        if (role === 'servidor') {
            window.location.href = 'dashboard_static.html';
        } else {
            window.location.href = 'portal_static.html';
        }
    });

    // Verificar se existe usuário lembrado
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
        identificadorInput.value = savedUser;
        document.getElementById('rememberMe').checked = true;
    }
});