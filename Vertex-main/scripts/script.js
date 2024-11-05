let chatCounter = 1; // Contador de chats
let currentChatIndex = 0; // Índice do chat atual

function createNewChat() {
    chatCounter++;
    const newChatIndex = chatCounter - 1; // Atualiza o índice do novo chat

    // Cria nova aba
    const newTab = document.createElement('li');
    newTab.className = 'nav-item';
    newTab.innerHTML = `<a class="nav-link active" href="#" onclick="switchChat(${newChatIndex})">Chat ${chatCounter}</a>`;
    document.getElementById('chatTabs').appendChild(newTab);

    // Cria um novo chatbox
    const newChatbox = document.createElement('div');
    newChatbox.className = 'chatbox';
    newChatbox.id = `chatbox-${newChatIndex}`;
    document.getElementById('chatboxContainer').appendChild(newChatbox);

    // Mantenha o chat atual visível
    switchChat(currentChatIndex); // Retorna ao chat atual
}

function switchChat(index) {
    // Oculta todos os chatboxes
    const chatboxes = document.querySelectorAll('.chatbox');
    chatboxes.forEach(chatbox => {
        chatbox.style.display = 'none';
    });

    // Mostra o chatbox correspondente ao índice
    const activeChatbox = document.getElementById(`chatbox-${index}`);
    if (activeChatbox) {
        activeChatbox.style.display = 'block';
        currentChatIndex = index; // Atualiza o índice do chat atual
    }
}

function sendMessage() {
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value;

    if (!userMessage.trim()) {
        return; // Não enviar mensagens vazias
    }

    // Adicionar a mensagem do usuário à caixa de chat ativa
    addMessageToChat(userMessage, 'user', currentChatIndex);

    // Limpar o campo de entrada
    userInput.value = '';

    // Enviar a mensagem para o servidor
    fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage }),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
    })
    .then(data => {
        // Adicionar a resposta do assistente à caixa de chat ativa
        addMessageToChat(data.response, 'assistant', currentChatIndex);
    })
    .catch(error => console.error('Error:', error));
}

function addMessageToChat(message, sender, chatIndex) {
    const chatbox = document.getElementById(`chatbox-${chatIndex}`);
    if (!chatbox) {
        console.error(`Chatbox ${chatIndex} não encontrado!`);
        return; // Sai da função se o chatbox não existir
    }

    const messageElement = document.createElement('p');
    messageElement.className = sender; // Adiciona a classe para estilização
    messageElement.innerText = message;

    // Adiciona a mensagem à caixa de chat
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight; // Rola para a parte inferior
}

function clearChat() {
    const chatbox = document.getElementById(`chatbox-${currentChatIndex}`);
    if (chatbox) {
        chatbox.innerHTML = ''; // Limpa as mensagens do chat ativo
    } else {
        console.error(`Chatbox ${currentChatIndex} não encontrado para limpar!`);
    }
}

// Inicialização: mostrar o chat 1 ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    switchChat(0); // Mostra o chat 1 por padrão
    
    // Adiciona o evento para enviar mensagem ao pressionar "Enter"
    const userInput = document.getElementById('userInput');
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage(); // Chama a função de enviar mensagem
            event.preventDefault(); // Impede o comportamento padrão de quebra de linha
        }
    });
});
