import React, { useState } from 'react';
import { Coil, Product } from '../types/pcp';
import { ExcelService } from '../services/excelService';
import { StorageService } from '../services/storageService';
import { 
  Database, 
  Upload, 
  Plus, 
  RefreshCw, 
  FileSpreadsheet, 
  Disc, 
  Layers, 
  RotateCcw,
  Cloud
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DataManagementViewProps {
  coils: Coil[];
  products: Product[];
  onDataUpdated: () => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  coils,
  products,
  onDataUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'coils' | 'products' | 'firebase'>('import');
  const [importStatus, setImportStatus] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [newCoil, setNewCoil] = useState<Partial<Coil>>({
    codigo: 'BQN10040',
    lote: 'LOTE-NOVO-01',
    espessura: 1.5,
    largura: 1200,
    peso: 15.0,
    quantidade: 1,
    status: 'Disponível'
  });

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    codigo: 'TBZ10001',
    descricao: 'NOVO TUBO INDUSTRIAL',
    tipo: 'TUBO',
    espessura: 1.5,
    larguraFita: 238,
    demandaT: 10,
    familia: 'TUBO'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'coils' | 'products') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('Lendo e processando arquivo Excel...');

    try {
      const buffer = await file.arrayBuffer();
      if (type === 'coils') {
        const importedCoils = ExcelService.parseCoilsFile(buffer);
        if (importedCoils.length > 0) {
          const current = StorageService.getCoils();
          StorageService.saveCoils([...importedCoils, ...current]);
          setImportStatus(`Sucesso! ${importedCoils.length} bobinas importadas.`);
          confetti({ particleCount: 50 });
          onDataUpdated();
        } else {
          setImportStatus('Nenhuma bobina válida identificada no arquivo.');
        }
      } else {
        const importedProducts = ExcelService.parseProductsFile(buffer);
        if (importedProducts.length > 0) {
          const current = StorageService.getProducts();
          StorageService.saveProducts([...importedProducts, ...current]);
          setImportStatus(`Sucesso! ${importedProducts.length} produtos importados.`);
          confetti({ particleCount: 50 });
          onDataUpdated();
        } else {
          setImportStatus('Nenhum produto válido identificado no arquivo.');
        }
      }
    } catch (err: any) {
      setImportStatus(`Erro ao importar: ${err.message || err}`);
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleAddCoil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoil.lote || !newCoil.largura || !newCoil.espessura) return;

    const coilObj: Coil = {
      id: `COIL_${Date.now()}`,
      codigo: newCoil.codigo || 'BQN10000',
      lote: newCoil.lote,
      espessura: Number(newCoil.espessura),
      largura: Number(newCoil.largura),
      peso: Number(newCoil.peso || 10),
      quantidade: 1,
      status: 'Disponível',
      dataRecebimento: new Date().toISOString().split('T')[0]
    };

    StorageService.addCoil(coilObj);
    onDataUpdated();
    confetti({ particleCount: 40 });
    setNewCoil({
      codigo: 'BQN10040',
      lote: `LOTE-${Math.floor(Math.random() * 9000) + 1000}`,
      espessura: 1.5,
      largura: 1200,
      peso: 15.0,
      quantidade: 1,
      status: 'Disponível'
    });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.codigo || !newProduct.larguraFita || !newProduct.espessura) return;

    const prodObj: Product = {
      id: `PROD_${Date.now()}`,
      codigo: newProduct.codigo,
      descricao: newProduct.descricao || 'Produto Cadastrado',
      tipo: newProduct.familia || 'TUBO',
      espessura: Number(newProduct.espessura),
      larguraFita: Number(newProduct.larguraFita),
      demandaT: Number(newProduct.demandaT || 0),
      familia: (newProduct.familia as any) || 'TUBO'
    };

    StorageService.addProduct(prodObj);
    onDataUpdated();
    confetti({ particleCount: 40 });
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    const res = await StorageService.syncWithFirestore();
    setIsSyncing(false);
    setImportStatus(res.message);
    onDataUpdated();
  };

  const handleResetToInitial = () => {
    if (window.confirm('Deseja realmente restaurar a base de dados original das planilhas Excel?')) {
      StorageService.resetToInitial();
      onDataUpdated();
      setImportStatus('Base de dados restaurada para o padrão com sucesso!');
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            TELA 6 – Gestão de Dados & Importador de Planilhas Excel
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Importe arquivos Excel, gerencie o catálogo de produtos e bobinas ou sincronize com o Firebase Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncCloud}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sincronizar Firebase</span>
          </button>

          <button
            onClick={handleResetToInitial}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black rounded-xl transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Restaurar Base Inicial</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'import', label: 'Importador Excel (.xlsx / .xls)', icon: Upload },
          { id: 'coils', label: `Bobinas Cadastradas (${coils.length})`, icon: Disc },
          { id: 'products', label: `Produtos / Demanda (${products.length})`, icon: Layers },
          { id: 'firebase', label: 'Configuração Firebase', icon: Cloud }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Alert Banner */}
      {importStatus && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span>{importStatus}</span>
          <button onClick={() => setImportStatus('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* TAB 1: Import Excel Files */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Coils Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <Disc className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Importar Estoque de Bobinas</h3>
                <p className="text-xs text-slate-500 font-medium">Atualizar lotes, pesos, espessuras e larguras</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-all bg-slate-50">
              <FileSpreadsheet className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-700 font-bold">
                Selecione ou arraste sua planilha de bobinas (.xlsx, .xls)
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Colunas esperadas: Item, Lote, Espessura, Largura (ou Bobina_mm), Peso (ou Saldo)
              </p>

              <label className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-md transition-all">
                <Upload className="w-4 h-4" />
                <span>Escolher Arquivo</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => handleFileUpload(e, 'coils')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Box 2: Products Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Importar Demanda & Produtos</h3>
                <p className="text-xs text-slate-500 font-medium">Atualizar catálogo de tubos/perfis, blanks e metas</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-6 text-center transition-all bg-slate-50">
              <FileSpreadsheet className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-slate-700 font-bold">
                Selecione ou arraste sua planilha de demanda (.xlsx, .xls)
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Colunas esperadas: Tipo, Codigo, Produto, Espessura, Largura (Fita), Demanda_t
              </p>

              <label className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-md transition-all">
                <Upload className="w-4 h-4" />
                <span>Escolher Arquivo</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => handleFileUpload(e, 'products')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Add Coils */}
      {activeTab === 'coils' && (
        <div className="space-y-6">
          <form onSubmit={handleAddCoil} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Cadastrar Nova Bobina de Matéria-Prima
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 uppercase font-black">Código Item</label>
                <input
                  type="text"
                  required
                  value={newCoil.codigo}
                  onChange={(e) => setNewCoil({ ...newCoil, codigo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 uppercase font-black">Lote</label>
                <input
                  type="text"
                  required
                  value={newCoil.lote}
                  onChange={(e) => setNewCoil({ ...newCoil, lote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 uppercase font-black">Largura (mm)</label>
                <input
                  type="number"
                  required
                  value={newCoil.largura}
                  onChange={(e) => setNewCoil({ ...newCoil, largura: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 uppercase font-black">Espessura (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newCoil.espessura}
                  onChange={(e) => setNewCoil({ ...newCoil, espessura: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 uppercase font-black">Peso (t)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newCoil.peso}
                  onChange={(e) => setNewCoil({ ...newCoil, peso: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md"
              >
                + Adicionar ao Estoque
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Add Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <form onSubmit={handleAddProduct} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              Cadastrar Novo Produto Final / Fita
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 uppercase font-black">Código</label>
                <input
                  type="text"
                  required
                  value={newProduct.codigo}
                  onChange={(e) => setNewProduct({ ...newProduct, codigo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-600 uppercase font-black">Descrição</label>
                <input
                  type="text"
                  required
                  value={newProduct.descricao}
                  onChange={(e) => setNewProduct({ ...newProduct, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 uppercase font-black">Família</label>
                <select
                  value={newProduct.familia}
                  onChange={(e) => setNewProduct({ ...newProduct, familia: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                >
                  <option value="TUBO">TUBO</option>
                  <option value="PERFIL">PERFIL</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 uppercase font-black">Espessura (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProduct.espessura}
                  onChange={(e) => setNewProduct({ ...newProduct, espessura: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 uppercase font-black">Largura Fita (mm)</label>
                <input
                  type="number"
                  required
                  value={newProduct.larguraFita}
                  onChange={(e) => setNewProduct({ ...newProduct, larguraFita: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl shadow-md"
              >
                + Cadastrar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Firebase Configuration */}
      {activeTab === 'firebase' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Configuração do Projeto Firebase</h3>
              <p className="text-xs text-slate-500">Projeto conectado: <strong className="text-amber-700 font-mono">slitterpcp</strong></p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
            <div><strong>Project ID:</strong> slitterpcp</div>
            <div><strong>Auth Domain:</strong> slitterpcp.firebaseapp.com</div>
            <div><strong>Storage Bucket:</strong> slitterpcp.firebasestorage.app</div>
            <div><strong>Messaging Sender ID:</strong> 1041964906397</div>
            <div><strong>App ID:</strong> 1:1041964906397:web:74c0cd0954ae4da6f02174</div>
            <div><strong>Measurement ID:</strong> G-5T6Q0WPZ9L</div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSyncCloud}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Forçar Sincronização com Nuvem</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
