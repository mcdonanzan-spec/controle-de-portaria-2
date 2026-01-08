
import React, { useState, useCallback, useEffect } from 'react';
import { Visitor, Delivery, UserProfile } from './types.ts';
import { supabase } from './lib/supabase.ts';

import BottomNav from './components/BottomNav.tsx';
import DeliveriesView from './components/views/DeliveriesView.tsx';
import VisitorsView from './components/views/VisitorsView.tsx';
import ExitView from './components/views/ExitView.tsx';
import ReportsView from './components/views/ReportsView.tsx';
import DashboardView from './components/views/DashboardView.tsx';
import AdminView from './components/views/AdminView.tsx';
import Auth from './components/Auth.tsx';
import { BuildingIcon, LogoutIcon } from './components/icons.tsx';
import Toast from './components/Toast.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<'Painel' | 'Entregas' | 'Visitantes' | 'Saida' | 'Relatorios' | 'Gestao'>('Painel');
  const [reportType, setReportType] = useState<'visitors' | 'deliveries'>('visitors');
  const [toast, setToast] = useState<{ message: string, show: boolean, type?: 'success' | 'error' }>({ message: '', show: false });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        setProfile({ id: userId, fullName: 'Usuário', role: 'porteiro' });
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          fullName: data.nome_completo,
          role: data.cargo.toLowerCase().trim() as any,
          workId: data.obra_id
        });
      }
    } catch (err) {
      setProfile({ id: userId, fullName: 'Usuário', role: 'porteiro' });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setVisitors([]);
        setDeliveries([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!session || !profile) return;
    
    const isAdmin = profile.role === 'admin' || profile.role === 'administrador';
    
    try {
      let vQuery = supabase.from('visitors').select('*');
      let dQuery = supabase.from('deliveries').select('*');

      if (!isAdmin && profile.workId) {
        vQuery = vQuery.eq('obra_id', profile.workId);
        dQuery = dQuery.eq('obra_id', profile.workId);
      }

      const { data: vData } = await vQuery.order('entry_time', { ascending: false });
      const { data: dData } = await dQuery.order('entry_time', { ascending: false });
      
      if (vData) setVisitors(vData.map(v => ({ 
          ...v, 
          workId: v.obra_id, 
          entryTime: new Date(v.entry_time), 
          exitTime: v.exit_time ? new Date(v.exit_time) : undefined, 
          platePhoto: v.plate_photo, 
          epi: { helmet: v.helmet, boots: v.boots, glasses: v.glasses }, 
          vehicle: { model: v.vehicle_model, color: v.vehicle_color, plate: v.vehicle_plate }, 
          visitReason: v.visit_reason, 
          personVisited: v.person_visited 
      })));
      
      if (dData) setDeliveries(dData.map(d => ({ 
          ...d, 
          workId: d.obra_id, 
          entryTime: new Date(d.entry_time), 
          exitTime: d.exit_time ? new Date(d.exit_time) : undefined, 
          invoicePhoto: d.invoice_photo, 
          platePhoto: d.plate_photo, 
          driverName: d.driver_name, 
          driverDocument: d.driver_document, 
          invoiceNumber: d.invoice_number, 
          licensePlate: d.license_plate 
      })));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }, [session, profile]);

  useEffect(() => {
    if (session && profile) fetchData();
  }, [session, profile, fetchData]);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, show: true, type });
  };
  
  const handleSupabaseError = (err: any) => {
    console.error("Erro detalhado:", err);
    let msg = err.message || "Erro inesperado ao salvar.";
    
    if (msg.includes("plate_photo")) {
      msg = "ERRO DE BANCO: A coluna 'plate_photo' não foi encontrada em 'visitors'. Por favor, execute o comando SQL no painel do Supabase.";
    } else if (msg === "Failed to fetch" || msg.includes("network")) {
      msg = "CONEXÃO FALHOU: Verifique sua internet ou sinal de celular.";
    }
    
    showToast(msg, 'error');
  };

  const markExit = useCallback(async (type: 'visitor' | 'delivery', id: number) => {
    const table = type === 'visitor' ? 'visitors' : 'deliveries';
    try {
        const { error } = await supabase.from(table).update({ exit_time: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        await fetchData(); 
        showToast("Saída registrada!");
    } catch (err) {
        handleSupabaseError(err);
    }
  }, [fetchData]);

  const updateRecord = useCallback(async (type: 'visitor' | 'delivery', id: number, data: any) => {
      const table = type === 'visitor' ? 'visitors' : 'deliveries';
      try {
          const { error } = await supabase.from(table).update(data).eq('id', id);
          if (error) throw error;
          await fetchData();
          showToast("Registro atualizado!");
          return true;
      } catch (err) {
          handleSupabaseError(err);
          return false;
      }
  }, [fetchData]);

  const handleLogout = async () => {
    setConfirmationModal({
        isOpen: true,
        title: 'Sair do Sistema',
        message: 'Deseja realmente encerrar sua sessão?',
        onConfirm: async () => {
            await supabase.auth.signOut();
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-brand-charcoal"><div className="text-brand-amber animate-pulse font-black text-xs uppercase tracking-widest">Acessando Canteiro...</div></div>;
  if (!session) return <Auth />;

  const currentRole = profile?.role || 'porteiro';
  const isAdmin = currentRole === 'admin' || currentRole === 'administrador';

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast({ message: '', show: false })} />
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
      />
      <header className="bg-brand-charcoal shadow-lg p-4 flex justify-between items-center border-b border-brand-steel z-20">
        <div className="flex items-center">
            <BuildingIcon className="h-8 w-8 mr-3 text-brand-amber" />
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-brand-text uppercase leading-none text-brand-amber">Canteiro Seguro</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${isAdmin ? 'bg-brand-amber text-brand-charcoal' : 'bg-brand-amber/20 text-brand-amber'}`}>
                  {currentRole}
                </span>
                <span className="text-[8px] text-brand-text-muted font-bold uppercase">
                  {profile?.workId ? `Obra: ${profile.workId}` : 'Gestão Geral'}
                </span>
              </div>
            </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-brand-text-muted hover:text-feedback-error transition-colors"><LogoutIcon className="h-6 w-6" /></button>
      </header>

      <main className="flex-grow overflow-y-auto pb-24 bg-brand-charcoal">
        {activeTab === 'Painel' && <DashboardView visitors={visitors} deliveries={deliveries} onMarkExitRequest={markExit} onNavigateToReports={(t) => { setReportType(t); setActiveTab('Relatorios'); }} />}
        
        {activeTab === 'Entregas' && <DeliveriesView addDelivery={async (d) => {
            const payload: any = {
                supplier: d.supplier,
                driver_name: d.driverName,
                driver_document: d.driverDocument,
                invoice_number: d.invoiceNumber,
                license_plate: d.licensePlate,
                invoice_photo: d.invoicePhoto,
                user_id: session?.user?.id,
                obra_id: profile?.workId
            };
            if (d.platePhoto) payload.plate_photo = d.platePhoto;

            try {
                const { error } = await supabase.from('deliveries').insert([payload]);
                if (error) throw error;
                await fetchData(); showToast('Entrega registrada!'); return true;
            } catch (err) {
                handleSupabaseError(err);
                return false;
            }
        }} />}

        {activeTab === 'Visitantes' && <VisitorsView addVisitor={async (v) => {
            const payload: any = {
                name: v.name,
                document: v.document,
                company: v.company,
                visit_reason: v.visitReason,
                person_visited: v.personVisited,
                photo: v.photo,
                helmet: v.epi.helmet,
                boots: v.epi.boots,
                glasses: v.epi.glasses,
                vehicle_model: v.vehicle.model,
                vehicle_color: v.vehicle.color,
                vehicle_plate: v.vehicle.plate,
                user_id: session?.user?.id,
                obra_id: profile?.workId
            };
            if (v.platePhoto) payload.plate_photo = v.platePhoto;

            try {
                const { error } = await supabase.from('visitors').insert([payload]);
                if (error) throw error;
                await fetchData(); showToast('Visitante registrado!'); return true;
            } catch (err) {
                handleSupabaseError(err);
                return false;
            }
        }} />}

        {activeTab === 'Saida' && <ExitView visitors={visitors} deliveries={deliveries} onMarkExitRequest={markExit} />}
        {activeTab === 'Relatorios' && <ReportsView visitors={visitors} deliveries={deliveries} activeReportType={reportType} onReportTypeChange={setReportType} onUpdateRecord={updateRecord} />}
        {activeTab === 'Gestao' && isAdmin && <AdminView onRefresh={() => { fetchProfile(session.user.id); fetchData(); }} />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentRole as any} />
    </div>
  );
};

export default App;
