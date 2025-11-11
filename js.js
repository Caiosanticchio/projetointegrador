//cabeçalho
  const header = document.querySelector("header");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll && currentScroll > 500) {
      // rolando para baixo → esconde
      header.classList.add("hidden");
    } else {
      // rolando para cima → mostra
      header.classList.remove("hidden");
    }

    lastScroll = currentScroll;
  });

  //carrinho de compra
