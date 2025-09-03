// Botão "Voltar ao topo"
let scrollThreshold = 300; // Pixels para mostrar o botão

export const initBackToTop = () => {
  const backToTopButton = document.getElementById("back-to-top");

  if (!backToTopButton) return;

  // Função para mostrar/ocultar o botão baseado no scroll
  const toggleBackToTop = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > scrollThreshold) {
      backToTopButton.classList.remove("opacity-0", "pointer-events-none");
      backToTopButton.classList.add("opacity-100");
    } else {
      backToTopButton.classList.add("opacity-0", "pointer-events-none");
      backToTopButton.classList.remove("opacity-100");
    }
  };

  // Função para voltar ao topo com scroll suave
  const scrollToTop = () => {
    // Adicionar feedback visual
    backToTopButton.classList.add("scale-95");
    setTimeout(() => {
      backToTopButton.classList.remove("scale-95");
    }, 150);

    // Scroll suave para o topo
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Event listeners
  window.addEventListener("scroll", toggleBackToTop);
  backToTopButton.addEventListener("click", scrollToTop);

  // Verificar estado inicial
  toggleBackToTop();

  // Ajustar threshold inicial baseado no tamanho da tela
  updateScrollThreshold();
};

// Função para ajustar o threshold baseado no tamanho da tela
export const updateScrollThreshold = () => {
  // Em telas menores, mostrar o botão mais cedo
  if (window.innerWidth < 768) {
    scrollThreshold = 200;
  } else {
    scrollThreshold = 300;
  }
};

// Função para mostrar o botão manualmente (útil para listas longas)
export const showBackToTopButton = () => {
  const backToTopButton = document.getElementById("back-to-top");
  if (backToTopButton) {
    backToTopButton.classList.remove("opacity-0", "pointer-events-none");
    backToTopButton.classList.add("opacity-100");
  }
};

// Função para ocultar o botão manualmente
export const hideBackToTopButton = () => {
  const backToTopButton = document.getElementById("back-to-top");
  if (backToTopButton) {
    backToTopButton.classList.add("opacity-0", "pointer-events-none");
    backToTopButton.classList.remove("opacity-100");
  }
};
