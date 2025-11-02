// Código JavaScript
function ajustarAltura(elemento) {
  // 1. Zera a altura para que o scrollHeight seja recalculado corretamente
  elemento.style.height = 'auto'; 

  // 2. Define a nova altura com base na altura do conteúdo (scrollHeight)
  // O +2px é um pequeno ajuste para evitar que a barra de rolagem apareça brevemente
  elemento.style.height = (elemento.scrollHeight + 2) + 'px';
}

// Opcional: Chama a função uma vez ao carregar a página para ajustar o texto pré-existente
document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('autoExpand');
  if (textarea) {
    ajustarAltura(textarea);
  }
});