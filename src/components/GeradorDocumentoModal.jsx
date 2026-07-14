import { useState, useEffect } from 'react';
import { X, FileText, Download, Save, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function GeradorDocumentoModal({ isOpen, onClose, cliente, processo, onDocumentSaved }) {
  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen) {
      carregarModelos();
    }
  }, [isOpen]);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (modeloSelecionado) {
      gerarPreview(modeloSelecionado);
    } else {
      setPreviewHtml('');
    }
  }, [modeloSelecionado, cliente, processo]);

  async function carregarModelos() {
    setLoading(true);
    try {
      const { data } = await api.get('/templates');
      setModelos(data);
    } catch {
      toast.error('Erro ao carregar modelos.');
    } finally {
      setLoading(false);
    }
  }

  function gerarPreview(modeloId) {
    const modelo = modelos.find(m => m.id === parseInt(modeloId));
    if (!modelo) return;

    let html = modelo.conteudo;

    // Substituição das variáveis
    const tags = {
      '{{cliente_nome}}': cliente?.nome || 'NOME DO CLIENTE',
      '{{cliente_cpf_cnpj}}': cliente?.cpf_cnpj || 'CPF/CNPJ',
      '{{cliente_endereco}}': cliente?.endereco || 'ENDEREÇO DO CLIENTE',
      '{{processo_numero}}': processo?.numero_processo || 'NPU DO PROCESSO',
      '{{processo_titulo}}': processo?.titulo || 'TÍTULO DA AÇÃO',
      '{{processo_vara}}': processo?.vara || 'VARA DO PROCESSO',
      '{{processo_area}}': processo?.area || 'ÁREA DO PROCESSO',
      '{{processo_valor}}': processo?.valor ? `R$ ${parseFloat(processo.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'R$ 0,00',
      '{{advogado_nome}}': 'Nome do Advogado Logado' // Pode ser injetado via AuthContext
    };

    Object.keys(tags).forEach(tag => {
      const regex = new RegExp(tag.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1"), 'g');
      html = html.replace(regex, `<span class="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-1 rounded border border-indigo-200 dark:border-indigo-700/50">${tags[tag]}</span>`);
    });

    // Formata quebras de linha para HTML
    html = html.replace(/\n/g, '<br />');

    setPreviewHtml(html);
  }

  async function handleExportPDF() {
    if (!modeloSelecionado || !previewHtml) return;
    
    // Lazy load do html2pdf.js
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.createElement('div');
    element.innerHTML = previewHtml.replace(/<span[^>]*>(.*?)<\/span>/g, '$1'); // Limpa a formatação de highlight das tags para o PDF real
    element.style.padding = '30px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '14pt';
    element.style.lineHeight = '1.6';
    element.style.color = '#000'; // Força texto preto no PDF
    
    const opt = {
      margin:       15,
      filename:     `Documento_${cliente?.nome?.replace(/\s/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
    toast.success('Download do PDF iniciado!');
  }

  async function handleSaveToVault() {
    if (!modeloSelecionado || !previewHtml || !processo) return toast.error("Selecione um processo primeiro.");
    
    setSaving(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      element.innerHTML = previewHtml.replace(/<span[^>]*>(.*?)<\/span>/g, '$1');
      element.style.padding = '30px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.fontSize = '14pt';
      element.style.color = '#000';
      
      const pdfBlob = await html2pdf().set({ html2canvas: { scale: 2 } }).from(element).output('blob');
      
      const formData = new FormData();
      formData.append('documento', pdfBlob, `Gerado_${Date.now()}.pdf`);
      formData.append('titulo', `Documento Gerado Automático`);
      
      await api.post(`/processos/${processo.id}/documentos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Documento salvo no cofre com sucesso!');
      if(onDocumentSaved) onDocumentSaved();
      onClose();
    } catch {
      toast.error('Erro ao salvar no cofre do sistema.');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 flex flex-col h-[85vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <FileText className="text-indigo-600 dark:text-indigo-400" /> Gerador Inteligente de Documentos
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={24} /></button>
        </div>

        <div className="p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800/30">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Selecione o Modelo</label>
          <select 
            value={modeloSelecionado} 
            onChange={(e) => setModeloSelecionado(e.target.value)}
            className="w-full sm:w-1/2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-2"
          >
            <option value="">-- Escolha um template --</option>
            {modelos.map(m => (
              <option key={m.id} value={m.id}>{m.titulo}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-[#0B1121] flex justify-center custom-scrollbar relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-500"><Loader2 className="animate-spin mb-2" size={32} /> Carregando...</div>
          ) : !modeloSelecionado ? (
            <div className="flex flex-col items-center justify-center text-slate-400 h-full">
              <FileText size={64} className="opacity-20 mb-4" />
              <p className="text-lg">Selecione um modelo acima para visualizar.</p>
            </div>
          ) : (
            <div 
              className="bg-white text-slate-800 w-full max-w-[21cm] min-h-[29.7cm] shadow-xl p-12 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>

        <div className="flex justify-between items-center p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancelar</button>
          
          <div className="flex gap-3">
            <button 
              disabled={!modeloSelecionado}
              onClick={handleExportPDF} 
              className="px-5 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Download size={18} /> Exportar PDF
            </button>

            {processo && (
              <button 
                disabled={!modeloSelecionado || saving}
                onClick={handleSaveToVault} 
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                Salvar no Cofre
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
