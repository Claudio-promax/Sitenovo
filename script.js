// Função para gerar a fatura com os dados do formulário
function gerarFatura() {
  const nome = document.getElementById('nome').value.trim();
  const origem = document.getElementById('origem').value.trim();
  const destino = document.getElementById('destino').value.trim();
  const dataVoo = document.getElementById('dataVoo').value;
  const companhia = document.getElementById('companhia').value.trim();
  const valor = document.getElementById('valor').value;

  // Validação
  if (!nome || !origem || !destino || !dataVoo || !companhia || !valor) {
    alert("⚠️ Preencha todos os campos!");
    return;
  }

  if (parseFloat(valor) <= 0) {
    alert("⚠️ Valor deve ser maior que zero!");
    return;
  }

  // Formatar data para exibição
  const dataFormatada = new Date(dataVoo).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Atualizar a fatura exibida
  document.getElementById('fatura-nome').textContent = nome;
  document.getElementById('fatura-origem').textContent = origem.toUpperCase();
  document.getElementById('fatura-destino').textContent = destino.toUpperCase();
  document.getElementById('fatura-data').textContent = dataFormatada;
  document.getElementById('fatura-companhia').textContent = companhia;
  document.getElementById('fatura-valor').textContent = parseFloat(valor).toFixed(2);

  // Mostrar seções
  document.getElementById('faturaContainer').style.display = 'block';
  document.getElementById('historicoContainer').style.display = 'block';
  
  // Carregar histórico
  carregarHistorico();
}

// Função para baixar PDF - FUNCIONA OFFLINE NO CELULAR
function baixarPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Dados da fatura
    const nome = document.getElementById('fatura-nome').textContent;
    const origem = document.getElementById('fatura-origem').textContent;
    const destino = document.getElementById('fatura-destino').textContent;
    const data = document.getElementById('fatura-data').textContent;
    const companhia = document.getElementById('fatura-companhia').textContent;
    const valor = document.getElementById('fatura-valor').textContent;
    
    // Cabeçalho
    doc.setFontSize(22);
    doc.setTextColor(0, 32, 96);
    doc.text("FATURA DE PASSAGEM AÉREA", 105, 20, null, null, 'center');
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Documento válido para comprovação fiscal", 105, 28, null, null, 'center');
    
    // Linha divisória
    doc.setDrawColor(0, 32, 96);
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);
    
    // Dados da fatura
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`PASSAGEIRO: ${nome}`, 20, 45);
    doc.text(`ROTA: ${origem} → ${destino}`, 20, 55);
    doc.text(`DATA DO VOO: ${data}`, 20, 65);
    doc.text(`COMPANHIA: ${companhia}`, 20, 75);
    doc.text(`VALOR: R$ ${valor}`, 20, 85);
    
    // Rodapé
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Fatura gerada em: ${dataAtual} | Sistema Offline`, 105, 110, null, null, 'center');
    
    // Salvar no dispositivo
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    
    // Método compatível com celulares
    if (navigator.userAgent.match(/Android|iPhone|iPad/i)) {
      // Para dispositivos móveis
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura_voo_${nome.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert("✅ Fatura salva na pasta de Downloads!");
      }, 100);
    } else {
      // Para desktop
      doc.save(`fatura_voo_${nome.replace(/\s+/g, '_')}.pdf`);
    }
    
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("❌ Erro ao gerar PDF. Verifique o console para detalhes.");
  }
}

// Função para salvar fatura no localStorage (memória do telefone)
function salvarFatura() {
  const nome = document.getElementById('fatura-nome').textContent;
  const origem = document.getElementById('fatura-origem').textContent;
  const destino = document.getElementById('fatura-destino').textContent;
  const data = document.getElementById('fatura-data').textContent;
  const companhia = document.getElementById('fatura-companhia').textContent;
  const valor = document.getElementById('fatura-valor').textContent;
  
  // Criar objeto da fatura
  const fatura = {
    id: Date.now(),
    nome,
    origem,
    destino,
    dataVoo: data,
    companhia,
    valor,
    dataEmissao: new Date().toLocaleString('pt-BR')
  };
  
  // Obter histórico existente ou criar novo
  let historico = JSON.parse(localStorage.getItem('faturasVoo')) || [];
  
  // Adicionar nova fatura
  historico.push(fatura);
  
  // Salvar no localStorage
  localStorage.setItem('faturasVoo', JSON.stringify(historico));
  
  alert("✅ Fatura salva localmente! Acesse o histórico a qualquer momento.");
  carregarHistorico();
}

// Função para carregar histórico de faturas
function carregarHistorico() {
  const historicoLista = document.getElementById('historicoLista');
  const historico = JSON.parse(localStorage.getItem('faturasVoo')) || [];
  
  if (historico.length === 0) {
    historicoLista.innerHTML = '<p>Nenhuma fatura salva ainda.</p>';
    return;
  }
  
  // Ordenar por data (mais recente primeiro)
  historico.sort((a, b) => b.id - a.id);
  
  // Limitar a 5 itens no histórico
  const ultimasFaturas = historico.slice(0, 5);
  
  let html = `<h4>Últimas ${ultimasFaturas.length} faturas:</h4>`;
  
  ultimasFaturas.forEach(fatura => {
    html += `
      <div class="historico-item">
        <p><strong>${fatura.nome}</strong></p>
        <p><small>${fatura.origem} → ${fatura.destino} | ${fatura.dataVoo}</small></p>
        <p><strong>R$ ${fatura.valor}</strong> - ${fatura.dataEmissao}</p>
      </div>
    `;
  });
  
  historicoLista.innerHTML = html;
}

// Carregar histórico ao iniciar
document.addEventListener('DOMContentLoaded', function() {
  carregarHistorico();
  
  // Configurar data atual como mínimo para o campo de data
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('dataVoo').setAttribute('min', hoje);
  
  // Verificar se o usuário está em dispositivo móvel
  if (navigator.userAgent.match(/Android|iPhone|iPad/i)) {
    document.querySelector('header p').textContent = '✅ Sistema funcional offline no seu dispositivo!';
  }
});