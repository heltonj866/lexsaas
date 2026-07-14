import { useState, useEffect } from 'react';
import { 
  User, Building2, ShieldCheck, Palette, Globe, 
  Save, Moon, Sun, Key, Loader2, Users, PlusCircle, Trash2, AlertTriangle, Briefcase, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import AuditoriaTab from '../components/AuditoriaTab';

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

export default function Configuracoes() {
  const { hasRole } = usePermissions();
  const [abaAtiva, setAbaAtiva] = useState('perfil');
  const [loading, setLoading] = useState(true);

  const [perfil, setPerfil] = useState({ nome: '', email: '', oab: '', telefone: '', especialidade: '' });
  const [escritorio, setEscritorio] = useState({ nome: '', cnpj: '', endereco: '', logo: null });
  const [sistema, setSistema] = useState({ cnj_key: '', dias_antecedencia_aviso: '2' });
  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirmar: '' });
  
  const [equipe, setEquipe] = useState([]);
  const [novoMembro, setNovoMembro] = useState({ name: '', email: '', password: '', role: 'advogado', especialidade: '' });
  const [loadingMembro, setLoadingMembro] = useState(false);
  const [membroParaExcluir, setMembroParaExcluir] = useState(null);

  const areasDisponiveis = ['Trabalhista', 'Família', 'Criminal', 'Outros'];



  async function carregarConfiguracoes() {
    try {
      setLoading(true);
      const response = await api.get('/configuracoes');
      const { user, tenant, equipe } = response.data;

      if (equipe) setEquipe(equipe);

      setPerfil({ 
        nome: user.name || '', email: user.email || '', oab: user.oab || '', 
        telefone: user.telefone || '', especialidade: user.especialidade || '' 
      });
      if (tenant) {
        setEscritorio({ nome: tenant.nome || tenant.name || '', cnpj: tenant.cnpj || '', endereco: tenant.endereco || '', logo: tenant.logo_url });
        setSistema({ cnj_key: tenant.cnj_key || '', dias_antecedencia_aviso: tenant.config_prazos?.toString() || '2' });
      }
    } catch { toast.error("Erro ao carregar configuracoes."); } 
    finally { setLoading(false); }
  }

  useEffect(() => { carregarConfiguracoes(); }, []);

  async function handleSalvar(e) {
    e.preventDefault();
    if (senhas.nova && senhas.nova !== senhas.confirmar) return toast.error("As senhas não coincidem!");
    setLoading(true);
    
    try {
      await api.put('/configuracoes', { perfil, escritorio, sistema, senhas });
      toast.success("Alterações salvas!");
      setSenhas({ atual: '', nova: '', confirmar: '' }); 
      carregarConfiguracoes(); 
    } catch { toast.error("Erro ao guardar alterações."); } 
    finally { setLoading(false); }
  }

  const handleToggleEspecialidade = (area, state, setState) => {
    const listaAtual = state.especialidade ? state.especialidade.split(',').filter(i => i) : [];
    let novaLista;
    if (listaAtual.includes(area)) {
      novaLista = listaAtual.filter(item => item !== area);
    } else {
      novaLista = [...listaAtual, area];
    }
    setState({ ...state, especialidade: novaLista.join(',') });
  };

  async function handleAdicionarMembro(e) {
    e.preventDefault();
    setLoadingMembro(true);
    try {
      await api.post('/configuracoes/equipe', novoMembro);
      toast.success("Membro adicionado!");
      setNovoMembro({ name: '', email: '', password: '', role: 'advogado', especialidade: '' });
      carregarConfiguracoes();
    } catch { toast.error("Erro ao adicionar membro."); }
    finally { setLoadingMembro(false); }
  }

  async function confirmarExclusaoMembro() {
    if (!membroParaExcluir) return;
    try {
      await api.delete(`/configuracoes/equipe/${membroParaExcluir.id}`);
      toast.success("Membro removido.");
      setMembroParaExcluir(null);
      carregarConfiguracoes();
    } catch { toast.error("Erro ao remover membro."); }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={32} className="animate-spin" style={{ color: '#F59E0B' }} />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-enter pb-8">
      {/* Sidebar de Configurações */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="p-3 rounded-3xl" style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.04)' }}>
          <nav className="space-y-1.5">
            {[
              { id: 'perfil', label: 'Meu Perfil', icon: User },
              { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
              ...(hasRole('admin') ? [
                { id: 'escritorio', label: 'Escritório', icon: Building2 },
                { id: 'sistema', label: 'Sistema e API', icon: Globe },
                { id: 'equipe', label: 'Gestão de Equipa', icon: Users },
                { id: 'auditoria', label: 'Auditoria (LGPD)', icon: Activity }
              ] : [])
            ].map((item) => (
              <button key={item.id} onClick={() => setAbaAtiva(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all"
                style={abaAtiva === item.id 
                  ? { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' } 
                  : { color: '#64748B', background: 'transparent' }}
                onMouseEnter={e => { if(abaAtiva !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = '#E2E8F0'; } }}
                onMouseLeave={e => { if(abaAtiva !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; } }}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 rounded-3xl flex flex-col overflow-hidden" style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.04)' }}>
        {abaAtiva !== 'equipe' ? (
          <form onSubmit={handleSalvar} className="flex flex-col h-full">
            <div className="p-6 sm:p-10 flex-1">
              
              {abaAtiva === 'perfil' && (
                <div className="space-y-8 max-w-3xl animate-enter">
                  <div className="pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-2xl font-black tracking-tight" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>Informações Pessoais</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nome Completo">
                      <input type="text" style={getInputStyle()} value={perfil.nome} onChange={e => setPerfil({...perfil, nome: e.target.value})} 
                             onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </FormField>
                    <FormField label="E-mail">
                      <input type="email" disabled style={{ ...getInputStyle(), opacity: 0.5, cursor: 'not-allowed' }} value={perfil.email} />
                    </FormField>
                    <FormField label="OAB">
                      <input type="text" style={getInputStyle()} value={perfil.oab} onChange={e => setPerfil({...perfil, oab: e.target.value})} 
                             onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </FormField>
                    <FormField label="Telefone">
                      <input type="text" style={getInputStyle()} value={perfil.telefone} onChange={e => setPerfil({...perfil, telefone: e.target.value})} 
                             onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </FormField>
                    
                    <div className="md:col-span-2">
                      <FormField label="Especialidades (Atendimento WhatsApp)" />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {areasDisponiveis.map(area => {
                          const isActive = perfil.especialidade?.split(',').includes(area);
                          return (
                            <label key={area} className="flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all"
                                   style={isActive 
                                     ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' } 
                                     : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8' }}>
                              <input type="checkbox" className="hidden" checked={isActive} onChange={() => handleToggleEspecialidade(area, perfil, setPerfil)} />
                              <span className="text-xs font-bold">{area}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {abaAtiva === 'seguranca' && (
                <div className="space-y-8 max-w-3xl animate-enter">
                  <div className="pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                      <ShieldCheck size={24} style={{ color: '#10B981' }} /> Segurança
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Senha Atual">
                      <input type="password" placeholder="••••••••" style={getInputStyle()} value={senhas.atual} onChange={e => setSenhas({...senhas, atual: e.target.value})} 
                             onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </FormField>
                    <div className="hidden md:block"></div>
                    <FormField label="Nova Senha">
                      <input type="password" placeholder="••••••••" style={getInputStyle()} value={senhas.nova} onChange={e => setSenhas({...senhas, nova: e.target.value})} 
                             onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </FormField>
                    <FormField label="Confirmar Nova Senha">
                      <input type="password" placeholder="••••••••" style={getInputStyle()} value={senhas.confirmar} onChange={e => setSenhas({...senhas, confirmar: e.target.value})} 
                             onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </FormField>
                  </div>
                </div>
              )}

              {abaAtiva === 'escritorio' && hasRole('admin') && (
                <div className="space-y-8 max-w-3xl animate-enter">
                  <div className="pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                      <Building2 size={24} style={{ color: '#3B82F6' }} /> Dados do Escritório
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FormField label="Nome do Escritório">
                        <input type="text" style={getInputStyle()} value={escritorio.nome} onChange={e => setEscritorio({...escritorio, nome: e.target.value})} 
                               onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                      </FormField>
                    </div>
                    <FormField label="CNPJ">
                      <input type="text" style={getInputStyle()} value={escritorio.cnpj} onChange={e => setEscritorio({...escritorio, cnpj: e.target.value})} 
                             onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </FormField>
                    <div className="md:col-span-2">
                      <FormField label="Endereço Completo">
                        <input type="text" style={getInputStyle()} value={escritorio.endereco} onChange={e => setEscritorio({...escritorio, endereco: e.target.value})} 
                               onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                      </FormField>
                    </div>
                  </div>
                </div>
              )}

              {abaAtiva === 'sistema' && hasRole('admin') && (
                <div className="space-y-8 max-w-3xl animate-enter">
                  <div className="pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                      <Globe size={24} style={{ color: '#A78BFA' }} /> Sistema e API
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FormField label="Chave API Pública do CNJ (DataJud)">
                        <input type="text" style={getInputStyle()} value={sistema.cnj_key} onChange={e => setSistema({...sistema, cnj_key: e.target.value})} placeholder="Ex: cnj_live_12345..." 
                               onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                      </FormField>
                    </div>
                    <FormField label="Aviso de Prazos (Dias de Antecedência)">
                      <select style={getInputStyle()} value={sistema.dias_antecedencia_aviso} onChange={e => setSistema({...sistema, dias_antecedencia_aviso: e.target.value})}
                              onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                        <option value="1">1 dia antes</option>
                        <option value="2">2 dias antes</option>
                        <option value="3">3 dias antes</option>
                        <option value="5">5 dias antes</option>
                        <option value="7">1 semana antes</option>
                      </select>
                    </FormField>
                  </div>
                </div>
              )}

              {abaAtiva === 'auditoria' && hasRole('admin') && (
                <AuditoriaTab />
              )}

            </div>
            
            {abaAtiva !== 'auditoria' && (
              <div className="p-5 flex justify-end shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <button type="submit" disabled={loading} className="btn-primary px-8 py-3 rounded-xl font-bold text-sm">
                  Salvar Alterações
                </button>
              </div>
            )}
          </form>
        ) : (
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto animate-enter">
            <div className="pb-5 mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>Gestão de Equipa</h2>
            </div>
            
            <form onSubmit={handleAdicionarMembro} className="p-6 rounded-3xl mb-8" style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input type="text" style={getInputStyle()} placeholder="Nome" value={novoMembro.name} onChange={e => setNovoMembro({...novoMembro, name: e.target.value})} 
                       onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                <input type="email" style={getInputStyle()} placeholder="E-mail" value={novoMembro.email} onChange={e => setNovoMembro({...novoMembro, email: e.target.value})} 
                       onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                <input type="password" style={getInputStyle()} placeholder="Senha" value={novoMembro.password} onChange={e => setNovoMembro({...novoMembro, password: e.target.value})} 
                       onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                <select style={getInputStyle()} value={novoMembro.role} onChange={e => setNovoMembro({...novoMembro, role: e.target.value})}
                        onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                  <option value="advogado">Advogado</option>
                  <option value="estagiario">Estagiario</option>
                  <option value="admin">Administrador</option>
                </select>
                <div className="lg:col-span-2">
                  <label className={LABEL} style={{ color: '#475569' }}>Especialidades do Membro</label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {areasDisponiveis.map(area => {
                      const isActive = novoMembro.especialidade?.split(',').includes(area);
                      return (
                        <button key={area} type="button" onClick={() => handleToggleEspecialidade(area, novoMembro, setNovoMembro)} 
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                style={isActive ? { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' } : { background: 'rgba(255,255,255,0.02)', color: '#64748B', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loadingMembro} className="mt-6 btn-primary px-6 py-2.5 rounded-xl font-bold text-sm">
                Adicionar Membro
              </button>
            </form>
            
            {/* Lista de Membros */}
            <div className="space-y-3">
              {equipe.map(m => (
                <div key={m.id} className="flex justify-between p-4 rounded-2xl items-center group transition-all"
                     style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                     onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                     onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: '#E2E8F0' }}>{m.name}</h4>
                    <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>
                      <span className="uppercase font-bold" style={{ color: '#A78BFA' }}>{m.role}</span> • {m.especialidade?.split(',').join(' | ') || 'Geral'}
                    </p>
                  </div>
                  <button onClick={() => setMembroParaExcluir(m)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          style={{ color: '#475569' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}>
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Exclusão Membro */}
      {membroParaExcluir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMembroParaExcluir(null)} />
          <div className="relative rounded-2xl p-6 max-w-sm w-full animate-enter"
               style={{ background: '#131929', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.10)' }}>
              <AlertTriangle size={22} style={{ color: '#EF4444' }} />
            </div>
            <h3 className="text-base font-bold text-center mb-1" style={{ color: '#F1F5F9' }}>Remover Membro?</h3>
            <p className="text-center text-xs mb-6" style={{ color: '#475569' }}>
              Deseja remover <span className="font-semibold" style={{ color: '#CBD5E1' }}>{membroParaExcluir.name}</span> da equipa?
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setMembroParaExcluir(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
              <button type="button" onClick={confirmarExclusaoMembro} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-danger">Remover</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}