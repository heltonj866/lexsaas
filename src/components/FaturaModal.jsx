import { useState, useEffect } from 'react';
import { X, Download, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FaturaModal({ isOpen, onClose, lancamento, escritorio }) {
  const [loading, setLoading] = useState(false);

  // Fecha com a tecla ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen || !lancamento) return null;

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const dataVencimento = new Date(lancamento.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
  const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lancamento.valor);
  
  // Se não existir um código, geramos um provisório para visualização
  const codigoFatura = lancamento.codigo_fatura || `FAT-${new Date().getFullYear()}-0000`;

  async function handleDownloadPDF() {
    setLoading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('fatura-preview');
      
      const opt = {
        margin:       10,
        filename:     `${codigoFatura}_${lancamento.cliente?.nome || 'Cliente'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('Fatura gerada e baixada com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar o PDF da Fatura.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-slate-100 dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 rounded-t-3xl">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <FileText className="text-indigo-600 dark:text-indigo-400" /> Pré-visualização da Fatura
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
          
          {/* 👇 INÍCIO DA FOLHA A4 PARA O PDF 👇 */}
          <div id="fatura-preview" className="bg-white text-slate-800 w-full max-w-[21cm] shadow-lg p-10 font-sans relative">
            
            {/* Cabeçalho da Fatura */}
            <div className="flex justify-between items-start border-b-2 border-indigo-100 pb-8 mb-8">
              <div>
                <h1 className="text-4xl font-black text-indigo-900 tracking-tight mb-2">FATURA</h1>
                <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">Nº {codigoFatura}</p>
                {lancamento.status === 'pago' && (
                  <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs uppercase rounded-md border border-emerald-200">
                    <CheckCircle2 size={14} /> Fatura Paga ({new Date(lancamento.data_pagamento).toLocaleDateString('pt-BR')})
                  </div>
                )}
              </div>
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-800">{escritorio?.nome || 'LexSaaS Advocacia'}</h2>
                <p className="text-sm text-slate-500 mt-1">{escritorio?.cnpj || 'CNPJ: 00.000.000/0001-00'}</p>
                <p className="text-sm text-slate-500">{escritorio?.endereco || 'Avenida Central, 1000, Centro'}</p>
                <p className="text-sm text-slate-500">{escritorio?.telefone || '(11) 99999-9999'}</p>
              </div>
            </div>

            {/* Informações de Faturamento */}
            <div className="flex justify-between items-start mb-10">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-1/2">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Faturado Para:</p>
                <h3 className="font-bold text-lg text-slate-800">{lancamento.cliente?.nome || 'Cliente Avulso'}</h3>
                <p className="text-sm text-slate-600 mt-1">{lancamento.cliente?.cpf_cnpj || 'CPF/CNPJ não informado'}</p>
                <p className="text-sm text-slate-600">{lancamento.cliente?.endereco || 'Endereço não informado'}</p>
                <p className="text-sm text-slate-600 mt-2">{lancamento.cliente?.email}</p>
              </div>
              
              <div className="w-1/3 space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-slate-500">Data Emissão:</span>
                  <span className="text-sm font-medium text-slate-800">{dataAtual}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-slate-500">Vencimento:</span>
                  <span className="text-sm font-bold text-rose-600">{dataVencimento}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-slate-500">Processo Ref:</span>
                  <span className="text-sm font-medium text-slate-800">{lancamento.processo?.numero_processo || '-'}</span>
                </div>
              </div>
            </div>

            {/* Tabela de Serviços */}
            <table className="w-full mb-10">
              <thead>
                <tr className="bg-indigo-50 border-b-2 border-indigo-200">
                  <th className="py-3 px-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Descrição do Serviço / Honorário</th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider w-32">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-4 text-sm font-medium text-slate-700">
                    {lancamento.descricao}
                    {lancamento.categoria && <span className="block text-xs text-slate-400 mt-1 uppercase">{lancamento.categoria}</span>}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-800 text-right">{valorFormatado}</td>
                </tr>
              </tbody>
            </table>

            {/* Totais */}
            <div className="flex justify-end mb-12">
              <div className="w-1/2 bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-500 uppercase">Subtotal</span>
                  <span className="text-sm font-medium text-slate-700">{valorFormatado}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">Descontos</span>
                  <span className="text-sm font-medium text-slate-700">R$ 0,00</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                  <span className="text-lg font-black text-indigo-900 uppercase">Total a Pagar</span>
                  <span className="text-2xl font-black text-indigo-600">{valorFormatado}</span>
                </div>
              </div>
            </div>

            {/* Informações de Pagamento (Condicional) */}
            {lancamento.status !== 'pago' && (
              <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 text-sm text-slate-700 mb-8">
                <h4 className="font-bold text-indigo-900 mb-2 uppercase text-xs">Instruções de Pagamento</h4>
                <p>Por favor, efetue o pagamento do valor total até a data de vencimento informada acima.</p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-bold text-slate-800 text-xs uppercase mb-1">Chave Pix</p>
                    <p className="font-mono bg-white px-2 py-1 border border-slate-200 rounded text-slate-600">{escritorio?.pix || '00.000.000/0001-00'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs uppercase mb-1">Transferência Bancária</p>
                    <p className="text-xs leading-relaxed text-slate-600">
                      Banco: {escritorio?.banco || '001 - Banco do Brasil'}<br/>
                      Agência: {escritorio?.agencia || '0001-0'}<br/>
                      Conta: {escritorio?.conta || '12345-6'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rodapé */}
            <div className="text-center pt-8 border-t border-slate-200 text-xs text-slate-400">
              Este documento não substitui a Nota Fiscal Eletrônica (NFS-e), mas serve como recibo provisório e aviso de cobrança dos honorários faturados.
            </div>

          </div>
          {/* 👆 FIM DA FOLHA A4 👆 */}
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0 rounded-b-3xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Fechar Preview</button>
          <button type="button" onClick={handleDownloadPDF} disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-all disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
            {loading ? 'Gerando...' : 'Baixar Fatura PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
