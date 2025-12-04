# Integração do Painel de Acessos com o Pinmap

Este documento contém as instruções para integrar o Painel de Acessos Hora a Hora ao sistema Pinmap.

## 📋 Pré-requisitos

- Pinmap V19.2 ou superior
- Arquivo `index.html` do Pinmap
- Arquivo `script.js` do Pinmap
- URL do painel de acessos rodando localmente

## 🔧 Passo 1: Adicionar o Botão HTML

Localize a seção `.tools-group` no arquivo `index.html` do Pinmap e adicione o seguinte botão **após** o botão do heatmap:

```html
<button 
  id="access-chart-btn" 
  class="tools-btn access-chart-btn" 
  title="Painel de Acessos Hora a Hora"
  onclick="openAccessChartPanel()">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="3" y1="19" x2="21" y2="19" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="3" y1="3" x2="3" y2="19" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <polyline points="5,16 8,12 11,14 14,8 17,10 20,5" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</button>
```

## 🎨 Passo 2: Adicionar CSS

Adicione o seguinte CSS na seção `<style>` do arquivo `index.html`:

```css
/* Botão do Painel de Acessos */
.access-chart-btn {
  background: #0066cc; /* Azul vibrante */
  color: white;
  position: relative;
}

.access-chart-btn:hover {
  background: #0052a3;
  opacity: 0.9;
}

.access-chart-btn svg {
  width: 20px;
  height: 20px;
}

/* Modal do Painel */
.access-chart-modal {
  display: none;
  position: fixed;
  z-index: 10000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.access-chart-modal.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.access-chart-modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  width: 95%;
  height: 95%;
  max-width: 1400px;
  max-height: 90vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.access-chart-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.access-chart-modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.access-chart-modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.access-chart-modal-close:hover {
  background: #f0f0f0;
  color: #333;
}

.access-chart-modal-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.access-chart-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}
```

## 📜 Passo 3: Adicionar JavaScript

Adicione as seguintes funções no arquivo `script.js` do Pinmap:

```javascript
/**
 * Abre o Painel de Acessos Hora a Hora em modal tela cheia
 */
function openAccessChartPanel() {
  console.log('[AccessChart] Abrindo Painel de Acessos Hora a Hora');
  
  let modal = document.getElementById('access-chart-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'access-chart-modal';
    modal.className = 'access-chart-modal';
    modal.innerHTML = \`
      <div class="access-chart-modal-content">
        <div class="access-chart-modal-header">
          <h2>📊 Painel de Acessos Hora a Hora</h2>
          <button class="access-chart-modal-close" onclick="closeAccessChartPanel()">&times;</button>
        </div>
        <div class="access-chart-modal-body">
          <iframe 
            class="access-chart-iframe"
            src="http://localhost:3000"
            title="Painel de Acessos Hora a Hora">
          </iframe>
        </div>
      </div>
    \`;
    document.body.appendChild(modal);
  }
  
  modal.classList.add('active');
  
  modal.onclick = function(event) {
    if (event.target === modal) {
      closeAccessChartPanel();
    }
  };
  
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      closeAccessChartPanel();
    }
  });
}

/**
 * Fecha o Painel de Acessos Hora a Hora
 */
function closeAccessChartPanel() {
  const modal = document.getElementById('access-chart-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

console.log('[AccessChart] Integração carregada - Ícone de Gráfico de Linha disponível');
```

## 🚀 Passo 4: Configurar URL

**IMPORTANTE:** Atualize a URL do iframe na função `openAccessChartPanel()` para apontar para o servidor correto:

- **Desenvolvimento local:** `http://localhost:3000`
- **Produção:** Use a URL publicada do painel

```javascript
src="http://localhost:3000"  // Altere conforme necessário
```

## ✅ Resultado Final

Após seguir todos os passos:

1. Um ícone **azul** com símbolo de gráfico de linha aparecerá na barra de ferramentas do Pinmap
2. Ao clicar, o painel abrirá em modal tela cheia
3. O modal pode ser fechado:
   - Clicando no botão X
   - Pressionando ESC
   - Clicando fora do modal
4. O design é responsivo e integrado ao estilo do Pinmap

## 🎯 Funcionalidades do Painel

- ✅ Comparação Hoje x Ontem
- ✅ Comparação 3 dias (Hoje, Ontem, Anteontem)
- ✅ Média de Segunda a Sexta
- ✅ Cores e espessuras personalizadas
- ✅ Recarregamento automático a cada 30 minutos
- ✅ Variação percentual hora a hora (verde/vermelho)
- ✅ Interface limpa e profissional

## 📞 Suporte

Para dúvidas ou problemas na integração, verifique:
- Console do navegador para erros JavaScript
- URL do iframe está correta e acessível
- Servidor do painel está rodando
