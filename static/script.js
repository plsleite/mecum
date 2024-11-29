document.addEventListener('DOMContentLoaded', () => {
  const searchLawsInput = document.getElementById('search-laws');
  const lawButtons = document.querySelectorAll('.law-button');
  const lawContent = document.getElementById('law-content');
  const loginBtn = document.getElementById('login-btn');
  const searchTextInput = document.getElementById('search-text');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const iconMoon = document.getElementById('theme-icon-moon');
  const iconSun = document.getElementById('theme-icon-sun');
  const themeText = document.getElementById('theme-text');
  const bodyElement = document.body;
  const lawCache = {};
  let currentLawId = null;

  // Sticky Headers
  const fixedHeadersContainer = document.getElementById('fixed-headers-container');
  const maxFixedHeaders = 5;
  const fixedHeaders = [];

  // Função para mostrar mensagens temporárias
  function showTemporaryMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'temporary-message';
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    setTimeout(() => {
      msgDiv.remove();
    }, 3000);
  }

  // Filtrar botões de leis com base na pesquisa com debounce
  let debounceTimer;
  searchLawsInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = searchLawsInput.value.toLowerCase();
      lawButtons.forEach(button => {
        const text = button.textContent.toLowerCase();
        button.parentElement.style.display = text.includes(query) ? 'block' : 'none';
      });
    }, 300);
  });

  // Função para determinar a profundidade com base no path
  function getDepth(path) {
    return path.split('.').length;
  }

  // Função para gerar IDs únicos para agrupamentos
  function generateId(type, identifier) {
    let id = type.toLowerCase().replace(/\s+/g, '-');
    if (identifier) {
      id += `-${identifier.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`;
    }
    return id;
  }

  // Função para exibir o conteúdo da lei
  function displayLawContent(data) {
    let htmlContent = ``;

    data.sections.forEach(section => {
      const type = section.type;
      let identifier = section.identifier ? section.identifier : '';
      const content = section.content ? section.content : '';
      const path = section.path;

      // Determinar a profundidade da seção
      const depth = getDepth(path);

      // Classe de indentação baseada na profundidade
      const indentClass = `indent-level-${depth}`;

      // Gerar um ID único para cada agrupamento
      let groupingId = '';
      switch(type) {
        case 'Epígrafe':
          groupingId = generateId(type, '');
          htmlContent += `<div id="${groupingId}" class="grouping-header epigrafe ${indentClass} expanded" data-type="${type}">
            <span class="header-text">${content}</span>
            <i class="fas fa-chevron-right expand-icon"></i>
          </div>`;
          break;
        case 'Ementa':
          htmlContent += `<p class="p-ementa">${content}</p>`;
          break;
        case 'Preâmbulo':
          groupingId = generateId(type, '');
          htmlContent += `<div id="${groupingId}" class="grouping-header preambulo-subtitle ${indentClass} expanded" data-type="${type}">
            <span class="header-text">Preâmbulo</span>
            <i class="fas fa-chevron-right expand-icon"></i>
          </div>`;
          htmlContent += `<p class="preambulo-content">${content}</p>`;
          break;
        case 'Disposições Preliminares':
        case 'Disposições Gerais':
        case 'Disposições Finais':
        case 'Disposições Transitórias':
          groupingId = generateId(type, '');
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} expanded" data-type="${type}">
            <span class="header-text">${type}</span>
            <i class="fas fa-chevron-right expand-icon"></i>
          </div>`;
          break;
        case 'Parte':
          groupingId = generateId(type, identifier);
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} expanded" data-type="${type}">
            <span class="header-text">Parte ${identifier}</span>
            <i class="fas fa-chevron-right expand-icon"></i>
          </div>`;
          break;
        case 'Livro':
          groupingId = generateId(type, identifier);
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} expanded" data-type="${type}">
            <span class="header-text">Livro ${identifier} - ${content}</span>
            <i class="fas fa-chevron-right expand-icon"></i>
          </div>`;
          break;
        case 'Título':
          groupingId = generateId(type, identifier);
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} expanded" data-type="${type}">
            <span class="header-text">Título ${identifier} - ${content}</span>
            <i class="fas fa-chevron-right expand-icon"></i>
          </div>`;
          break;
        case 'Capítulo':
          groupingId = generateId(type, identifier);
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} expanded" data-type="${type}">
            <span class="header-text">Capítulo ${identifier} - ${content}</span>
            <i class="fas fa-chevron-right expand-icon"></i>
          </div>`;
          break;
        case 'Seção':
          groupingId = generateId(type, identifier);
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} expanded" data-type="${type}">
            <span class="header-text">Seção ${identifier} - ${content}</span>
            <i class="fas fa-chevron-right expand-icon"></i>
          </div>`;
          break;
        case 'Subseção':
          groupingId = generateId(type, identifier);
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} expanded" data-type="${type}">
            <span class="header-text">Subseção ${identifier} - ${content}</span>
            <i class="fas fa-chevron-right expand-icon"></i>
          </div>`;
          break;
        case 'Artigo':
          htmlContent += `<p class="artigo"><strong>Art. ${identifier}</strong> ${content}</p>`;
          break;
        case 'Parágrafo':
          if (identifier.toLowerCase() === 'único') {
            htmlContent += `<p class="paragrafo"><strong>Parágrafo ${identifier}.</strong> ${content}</p>`;
          } else {
            identifier = identifier.replace(/^§+/, '').trim();
            const numberMatch = identifier.match(/\d+/);
            const number = numberMatch ? parseInt(numberMatch[0], 10) : 0;
            if (number >= 10) {
              htmlContent += `<p class="paragrafo"><strong>§ ${identifier}.</strong> ${content}</p>`;
            } else {
              htmlContent += `<p class="paragrafo"><strong>§ ${identifier}</strong> ${content}</p>`;
            }
          }
          break;
        case 'Inciso':
          htmlContent += `<p class="inciso ${indentClass}">${identifier} - ${content}</p>`;
          break;
        case 'Alínea':
          htmlContent += `<p class="alinea ${indentClass}">${identifier}) ${content}</p>`;
          break;
        case 'Item':
          htmlContent += `<p class="item ${indentClass}">${identifier}. ${content}</p>`;
          break;
        case 'Data de Promulgação':
        case 'Data de Publicação':
          htmlContent += `<p class="data-publicacao"><strong>${type}:</strong> ${content}</p>`;
          break;
        default:
          htmlContent += `<p>${content}</p>`;
          break;
      }
    });

    lawContent.innerHTML = htmlContent;

    // Inicializar os observadores
    initStickyHeaders();
    initGroupingHeaderEvents();
  }

  // Manipular clique nos botões de leis
  lawButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lawId = button.dataset.lawId;
      currentLawId = lawId;

      // Adicionar classe 'selected' ao botão clicado e remover dos outros
      lawButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');

      // Desabilitar todos os botões durante o carregamento
      lawButtons.forEach(btn => btn.disabled = true);

      // Limpar headers fixos
      fixedHeadersContainer.innerHTML = '';
      fixedHeaders.length = 0;

      // Mostra o loader
      lawContent.innerHTML = `
        <div class="loader">
          <div class="spinner"></div>
          <p>Carregando...</p>
        </div>
      `;

      // Verifica cache
      if (lawCache[lawId]) {
        displayLawContent(lawCache[lawId]);
        lawButtons.forEach(btn => btn.disabled = false);
      } else {
        // Faz a chamada ao endpoint com o ID da lei
        fetch(`/api/laws/${lawId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (data.error) {
              lawContent.innerHTML = `<p>${data.error}</p>`;
            } else {
              lawCache[lawId] = data;
              displayLawContent(data);
            }
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            showTemporaryMessage('Erro ao carregar o conteúdo da lei.');
            lawContent.innerHTML = `<p>Erro ao carregar o conteúdo da lei.</p>`;
          })
          .finally(() => {
            // Reabilitar os botões após o carregamento
            lawButtons.forEach(btn => btn.disabled = false);
          });
      }
    });
  });

  // Botão de login
  loginBtn.addEventListener('click', () => {
    showTemporaryMessage('Função de login ainda não implementada.');
  });

  // Pesquisa no texto da lei com debounce
  let searchDebounceTimer;
  searchTextInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      showTemporaryMessage('Função de busca no texto da lei ainda não implementada.');
    }, 300);
  });

  // Função para definir o tema
  function setTheme(theme) {
    if (theme === 'dark') {
      bodyElement.classList.add('dark-theme');
      iconMoon.style.display = 'none';
      iconSun.style.display = 'block';
      themeText.textContent = 'Tema claro';
      themeToggleBtn.setAttribute('aria-pressed', 'true');
      localStorage.setItem('theme', 'dark');
    } else {
      bodyElement.classList.remove('dark-theme');
      iconMoon.style.display = 'block';
      iconSun.style.display = 'none';
      themeText.textContent = 'Tema escuro';
      themeToggleBtn.setAttribute('aria-pressed', 'false');
      localStorage.setItem('theme', 'light');
    }
  }

  // Inicializa o tema
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  // Alterna o tema quando o botão é clicado
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = bodyElement.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // Inicializar os observadores de sticky headers
  function initStickyHeaders() {
    const groupingHeaders = document.querySelectorAll('.grouping-header');

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 1]
    };

    groupingHeaders.forEach(header => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.intersectionRatio < 1 && entry.boundingClientRect.top <= 0) {
            // Header atingiu o topo, fixar
            addFixedHeader(entry.target);
          } else {
            // Header saiu do topo, remover
            removeFixedHeader(entry.target);
          }
        });
      }, observerOptions);

      observer.observe(header);
    });
  }

  // Adicionar header fixo
  function addFixedHeader(header) {
    const existingIndex = fixedHeaders.findIndex(item => item.originalHeader === header);

    if (existingIndex === -1) {
      // Clonar o header
      const clonedHeader = header.cloneNode(true);
      clonedHeader.classList.add('fixed-header', 'shrink');
      clonedHeader.addEventListener('click', () => {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      // Adicionar ao container
      fixedHeadersContainer.appendChild(clonedHeader);

      // Adicionar à lista de headers fixos
      fixedHeaders.push({ originalHeader: header, clonedHeader });

      // Limitar a cinco headers
      if (fixedHeaders.length > maxFixedHeaders) {
        // Remover o primeiro
        const removed = fixedHeaders.shift();
        fixedHeadersContainer.removeChild(removed.clonedHeader);
      }

      // Atualizar posições
      updateFixedHeadersPosition();
    }
  }

  // Remover header fixo
  function removeFixedHeader(header) {
    const index = fixedHeaders.findIndex(item => item.originalHeader === header);
    if (index !== -1) {
      const removed = fixedHeaders.splice(index, 1)[0];
      fixedHeadersContainer.removeChild(removed.clonedHeader);

      // Atualizar posições
      updateFixedHeadersPosition();
    }
  }

  // Atualizar posições dos headers fixos
  function updateFixedHeadersPosition() {
    fixedHeaders.forEach((item, index) => {
      item.clonedHeader.style.top = `${index * 30}px`;
    });
  }

  // Inicializar eventos dos grouping headers
  function initGroupingHeaderEvents() {
    const groupingHeaders = document.querySelectorAll('.grouping-header');

    groupingHeaders.forEach(header => {
      const expandIcon = header.querySelector('.expand-icon');
      const headerType = header.getAttribute('data-type');

      // Inicialmente, todas as seções estão expandidas
      header.classList.add('expanded');
      // Garantir que o ícone está rotacionado para baixo
      expandIcon.style.transform = 'rotate(90deg)';

      header.addEventListener('click', () => {
        const isCollapsed = header.classList.contains('collapsed');
        header.classList.toggle('collapsed', !isCollapsed);
        header.classList.toggle('expanded', isCollapsed);

        // Rotacionar o ícone
        if (isCollapsed) {
          expandIcon.style.transform = 'rotate(90deg)';
        } else {
          expandIcon.style.transform = 'rotate(0deg)';
        }

        const nextElements = [];
        let nextSibling = header.nextElementSibling;

        while (nextSibling && !nextSibling.classList.contains('grouping-header')) {
          nextElements.push(nextSibling);
          nextSibling = nextSibling.nextElementSibling;
        }

        // Alternar visibilidade
        nextElements.forEach(element => {
          element.style.display = isCollapsed ? '' : 'none';
        });
      });
    });
  }
});
