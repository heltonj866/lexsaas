import { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Edit, Trash2, AlertCircle, Save, X, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const LABEL = 'text-[10px] font-bold uppercase tracking-widest block mb-1.5';
const getInputStyle = () => ({
  background: '#07091A',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#E2E8F0',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
});

function FormField({ label, children }) {
  return (
    <div>
      <label className={LABEL} style={{ color: '#475569' }}>{label}</label>
      {children}
    </div>
  );
}

export default function Modelos() {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modeloEmEdicao, setModeloEmEdicao] = useState(null);
  const [form, setForm] = useState({ titulo: '', conteudo: '' });
  const textareaRef = useRef(null);

  const variaveis = [
    { label: 'Nome Cliente', tag: '{{cliente_nome}}' },
    { label: 'NIF/CPF', tag: '{{cliente_cpf_cnpj}}' },
    { label: 'Endereço', tag: '{{cliente_endereco}}' },
    { label: 'Nº Processo', tag: '{{processo_numero}}' },
    { label: 'Ação/Título', tag: '{{processo_titulo}}' },
    { label: 'Vara', tag: '{{processo_vara}}' },
    { label: 'Área', tag: '{{processo_area}}' },
    { label: 'Valor Causa', tag: '{{processo_valor}}' },
    { label: 'Advogado', tag: '{{advogado_nome}}' },
  ];

  async function carregarModelos() {
    try {
      setLoading(true);
      const { data } = await api.get('/templates');
      setModelos(data);
    } catch {
      toast.error('Erro ao carregar os modelos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarModelos();
  }, []);

  function abrirModal(modelo = null) {
    if (modelo) {
      setModeloEmEdicao(modelo.id);
      setForm({ titulo: modelo.titulo, conteudo: modelo.conteudo });
    } else {
      setModeloEmEdicao(null);
      setForm({ titulo: '', conteudo: '' });
    }
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false);
    setModeloEmEdicao(null);
    setForm({ titulo: '', conteudo: '' });
  }

  async function salvarModelo(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.conteudo.trim()) {
      return toast.error("O título e o conteúdo são obrigatórios.");
    }
    
    try {
      if (modeloEmEdicao) {
        await api.put(`/templates/${modeloEmEdicao}`, form);
        toast.success("Modelo atualizado com sucesso!");
      } else {
        await api.post('/templates', form);
        toast.success("Modelo criado com sucesso!");
      }
      fecharModal();
      carregarModelos();
    } catch {
      toast.error("Erro ao salvar o modelo.");
    }
  }

  async function excluirModelo(id) {
    if (!window.confirm("Tem certeza que deseja excluir este modelo permanentemente?")) return;
    try {
      await api.delete(`/templates/${id}`);
      toast.success("Modelo excluído com sucesso.");
      carregarModelos();
    } catch {
      toast.error("Erro ao excluir modelo.");
    }
  }

  function inserirVariavel(tag) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.conteudo;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    setForm({ ...form, conteudo: before + tag + after });
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + tag.length;
      textarea.selectionEnd = start + tag.length;
    }, 0);
  }

  return (
    <div className="space-y-5 animate-enter pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>
            Modelos de Documentos
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Faça a gestão dos templates para auto-geração.</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> Novo Modelo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center" style={{ color: '#F59E0B' }}>A carregar modelos...</div>
        ) : modelos.length > 0 ? (
          modelos.map(modelo => (
            <div key={modelo.id} className="p-5 rounded-2xl flex flex-col justify-between group transition-all"
                 style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.04)' }}
                 onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                 onMouseLeave={e => { e.currentTarget.style.background = '#131929'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
              <div>
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: '#E2E8F0' }}>
                  <FileText size={16} style={{ color: '#A78BFA' }} /> {modelo.titulo}
                </h3>
                <p className="text-xs line-clamp-3 mb-4" style={{ color: '#64748B' }}>
                  {modelo.conteudo}
                </p>
              </div>
              <div className="flex justify-end gap-1 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <button onClick={() => abrirModal(modelo)} className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#475569' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#F59E0B'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                    <Edit size={16} />
                </button>
                <button onClick={() => excluirModelo(modelo.id)} className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#475569' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                    <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center rounded-3xl"
               style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <FileText size={32} style={{ color: '#334155' }} />
            </div>
            <p className="text-base font-bold mb-1" style={{ color: '#F1F5F9' }}>Nenhum modelo criado ainda.</p>
            <p className="text-xs max-w-sm text-center" style={{ color: '#64748B' }}>Clique em "Novo Modelo" para começar a padronizar os seus documentos.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative w-full max-w-4xl rounded-2xl flex flex-col max-h-[92vh] animate-enter"
               style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)' }}>
            
            <div className="flex items-center justify-between p-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                <Type size={16} style={{ color: '#A78BFA' }} /> {modeloEmEdicao ? 'Editar Modelo' : 'Novo Modelo'}
              </h2>
              <button onClick={fecharModal} className="p-1.5 rounded-lg" style={{ color: '#475569', background: 'rgba(255,255,255,0.04)' }}>
                  <X size={15} />
              </button>
            </div>
            
            <form id="template-form" onSubmit={salvarModelo} className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              <FormField label="Título do Modelo">
                <input required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Contrato de Honorários Padrão" 
                       style={getInputStyle()}
                       onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'}
                       onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </FormField>

              <div className="flex-1 flex flex-col min-h-[300px]">
                <div className="flex flex-col sm:flex-row gap-4 h-full">
                  <div className="flex-1 flex flex-col">
                    <FormField label="Conteúdo do Documento" />
                    <textarea 
                      ref={textareaRef}
                      required 
                      value={form.conteudo} 
                      onChange={e => setForm({...form, conteudo: e.target.value})} 
                      placeholder="Pelo presente instrumento, o(a) cliente {{cliente_nome}}, portador(a) do CPF {{cliente_cpf_cnpj}}..." 
                      className="w-full flex-1 min-h-[300px] resize-none"
                      style={{ ...getInputStyle(), fontFamily: 'monospace', fontSize: '12px' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                  
                  <div className="w-full sm:w-64 rounded-xl p-4 flex flex-col shrink-0"
                       style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs font-bold uppercase mb-2 text-center" style={{ color: '#A78BFA' }}>Variáveis Mágicas</p>
                    <p className="text-[9px] mb-3 text-center" style={{ color: '#64748B' }}>Clique para inserir na posição do cursor.</p>
                    <div className="flex flex-wrap gap-2 justify-center overflow-y-auto">
                      {variaveis.map(v => (
                        <button type="button" key={v.tag} onClick={() => inserirVariavel(v.tag)} 
                                className="text-[10px] px-2 py-1.5 rounded-lg font-bold transition-all"
                                style={{ background: 'rgba(124,58,237,0.1)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.2)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-5 flex justify-end gap-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={fecharModal} className="px-5 py-2.5 rounded-xl font-bold btn-ghost text-sm">Cancelar</button>
              <button type="submit" form="template-form" className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 btn-primary text-sm">
                <Save size={16} /> Salvar Modelo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
