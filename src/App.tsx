/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, User, Wrench, Package, Car, Laptop, Clock, 
  Settings, CheckCircle2, ChevronRight, Menu, HelpCircle, AlertTriangle,
  Smartphone, Download, X
} from 'lucide-react';
import { useWorkshopState } from './useWorkshopState';
import { UserRole } from './types';

// Dashboard Components
import AdminDashboard from './components/AdminDashboard';
import AdvisorDashboard from './components/AdvisorDashboard';
import MechanicDashboard from './components/MechanicDashboard';
import WarehouseDashboard from './components/WarehouseDashboard';
import CustomerPortal from './components/CustomerPortal';

export default function App() {
  const {
    clients,
    vehicles,
    employees,
    inventory,
    suppliers,
    purchaseOrders,
    requisitions,
    orders,
    transactions,
    settings,
    setSettings,
    
    // Actions
    addClient,
    updateClient,
    addVehicle,
    addEmployee,
    updateEmployee,
    addInventoryItem,
    updateInventoryItem,
    addPurchaseOrder,
    receivePurchaseOrder,
    createServiceOrder,
    updateOrderStatus,
    updateOrderDiagnostics,
    addOrderItem,
    deleteOrderItem,
    approveBudgetLine,
    clockInOrder,
    pauseOrder,
    clockOutOrder,
    submitPartRequisition,
    handleRequisitionStatus,
    addTransaction,
    registerOrderPayment,
    handleClientCreditPayment,
    addSupplier,
    resetDatabase
  } = useWorkshopState();

  // Active view role
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  
  // Mobile responsive menu toggle
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  // Clock state (Simulating real-world CDMX Local Time)
  const [timeStr, setTimeStr] = useState('15:52:24');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-amber-600 selection:text-white">
      
      {/* 👑 MASTER ROLE SWITCHER (DEVELOPER DECK) */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-2 px-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] text-slate-400 tracking-wider">
                DECK DE SIMULACIÓN MULTI-ROL (INTERTALLER)
              </span>
            </div>
            
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setShowRoleMenu(!showRoleMenu)} 
              className="md:hidden text-slate-300 hover:text-white p-1"
            >
              <Menu size={16} />
            </button>
          </div>

          {/* Buttons to shift roles */}
          <div className={`flex-wrap gap-1.5 md:flex ${showRoleMenu ? 'flex' : 'hidden md:flex'}`}>
            {[
              { id: 'admin', label: '👑 Administrador / Dueño', color: 'hover:bg-amber-600/30 border-amber-500/30' },
              { id: 'advisor', label: '📋 Asesor / Recepción', color: 'hover:bg-blue-600/30 border-blue-500/30' },
              { id: 'mechanic', label: '🔧 Mecánico / Técnico', color: 'hover:bg-orange-600/30 border-orange-500/30' },
              { id: 'warehouse', label: '📦 Almacén e Inventarios', color: 'hover:bg-purple-600/30 border-purple-500/30' },
              { id: 'client', label: '🚗 Portal del Cliente', color: 'hover:bg-emerald-600/30 border-emerald-500/30' }
            ].map((r) => (
              <button
                key={r.id}
                id={`role-btn-${r.id}`}
                onClick={() => {
                  setCurrentRole(r.id as UserRole);
                  setShowRoleMenu(false);
                }}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                  currentRole === r.id 
                    ? 'bg-amber-600 text-white border-amber-600 shadow-inner' 
                    : `text-slate-300 bg-slate-850 ${r.color}`
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* WORKSHOP MAIN LOGO HEADER */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo & Workshop Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img 
                src="https://appdesignproyectos.com/sre.png" 
                alt="Servicio Automotriz Especializado (SAE)" 
                className="h-14 w-auto object-contain bg-black/40 p-1 rounded-xl border border-white/10 shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
                {settings.name || 'Servicio Automotriz Especializado (SAE)'}
                <span className="text-[10px] bg-[#8D6A28] text-white px-2 py-0.5 rounded-full font-sans font-semibold uppercase border border-[#8D6A28]/20">
                  SAE PWA
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                <span>RFC: <strong>{settings.rfc}</strong></span>
                <span>•</span>
                <span className="truncate">{settings.address}</span>
              </p>
            </div>
          </div>

          {/* Time & Quick Stats Dashboard */}
          <div className="flex items-center flex-wrap gap-4 text-xs font-semibold justify-center lg:justify-end">
            {/* PWA Install Button */}
            <button
              onClick={handleInstallClick}
              id="pwa-install-nav-btn"
              className="flex items-center gap-2 bg-[#8D6A28] text-white px-4 py-2.5 rounded-xl font-bold border border-white/10 hover:bg-[#aa8134] transition-all text-xs cursor-pointer shadow-md hover:shadow-[#8D6A28]/20"
              title="Instalar Aplicación SAE en tu dispositivo"
            >
              <Smartphone size={15} className="animate-pulse text-amber-300" />
              <span>Instalar App SAE</span>
            </button>

            {/* CDMX Time Tracker */}
            <div className="text-right hidden md:block">
              <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Simulación Local CDMX</p>
              <div className="flex items-center gap-1.5 justify-end mt-0.5 text-slate-700 font-mono">
                <Clock size={12} className="text-slate-400" />
                <span>15 de Julio de 2026, {timeStr}</span>
              </div>
            </div>

            {/* Quick counters */}
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex gap-4 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase">Órdenes</p>
                <p className="font-mono font-bold text-slate-800">{orders.length}</p>
              </div>
              <div className="border-l border-slate-200 h-6 self-center"></div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase">Stock Ref.</p>
                <p className="font-mono font-bold text-slate-800">
                  {inventory.reduce((sum, item) => sum + item.stock, 0)}
                </p>
              </div>
              <div className="border-l border-slate-200 h-6 self-center"></div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase">Ingresos</p>
                <p className="font-mono font-bold text-emerald-600">
                  ${transactions.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* MASTER CONTAINER FOR WORKFLOW */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Dynamic Warning Header explaining the active simulation mode */}
        <div className={`p-4 rounded-xl border flex gap-3 text-xs items-start ${
          currentRole === 'admin' ? 'bg-amber-50 border-amber-200 text-amber-900' :
          currentRole === 'advisor' ? 'bg-blue-50 border-blue-200 text-blue-900' :
          currentRole === 'mechanic' ? 'bg-orange-50 border-orange-200 text-orange-900' :
          currentRole === 'warehouse' ? 'bg-purple-50 border-purple-200 text-purple-900' :
          'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="p-1.5 rounded-lg bg-white shadow-sm shrink-0 font-bold text-base flex justify-center items-center">
            {currentRole === 'admin' && '👑'}
            {currentRole === 'advisor' && '📋'}
            {currentRole === 'mechanic' && '🔧'}
            {currentRole === 'warehouse' && '📦'}
            {currentRole === 'client' && '🚗'}
          </div>
          <div>
            <h5 className="font-bold flex items-center gap-1">
              <span>Vista de Rol: </span>
              <strong className="underline decoration-2">
                {currentRole === 'admin' && 'Administrador General / Dueño del Taller'}
                {currentRole === 'advisor' && 'Asesor de Servicio / Recepcionista'}
                {currentRole === 'mechanic' && 'Mecánico / Técnico Operativo'}
                {currentRole === 'warehouse' && 'Administrador de Almacén e Inventarios'}
                {currentRole === 'client' && 'Portal / Monitor del Cliente'}
              </strong>
            </h5>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {currentRole === 'admin' && 'Estás viendo el control global. Aquí supervisas facturación, utilidades, gráficos de horas mecánicas, administras empleados con esquemas de comisiones y editas plantillas de cotizaciones.'}
              {currentRole === 'advisor' && 'Estás simulando la recepción del auto. Puedes registrar clientes/autos, realizar el checklist visual de entrada, cotizar mano de obra y refacciones, registrar abonos y agendar citas en bahías.'}
              {currentRole === 'mechanic' && 'Estás simulando la tablet de taller de un técnico mecánico. Desde aquí fichas entrada/pausas de tiempo en órdenes, escribes reportes de diagnóstico técnico con fotos y requieres refacciones al almacén.'}
              {currentRole === 'warehouse' && 'Estás controlando el almacén. Aquí despachas las refacciones requeridas por mecánicos en tiempo real, registras proveedores, emites órdenes de compra y controlas stocks mínimos.'}
              {currentRole === 'client' && 'Estás simulando la perspectiva del cliente. Puedes dar seguimiento en tiempo real (tracking) de las fases de tu auto, autorizar/declinar presupuestos digitales y consultar alertas de verificación CDMX.'}
            </p>
          </div>
        </div>

        {/* CONTROLLER SWITCH ANIMATED FRAME */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRole}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="focus:outline-none"
          >
            {currentRole === 'admin' && (
              <AdminDashboard
                clients={clients}
                vehicles={vehicles}
                employees={employees}
                inventory={inventory}
                suppliers={suppliers}
                orders={orders}
                transactions={transactions}
                purchaseOrders={purchaseOrders}
                settings={settings}
                setSettings={setSettings}
                addEmployee={addEmployee}
                updateEmployee={updateEmployee}
                addTransaction={addTransaction}
                handleClientCreditPayment={handleClientCreditPayment}
                resetDatabase={resetDatabase}
              />
            )}

            {currentRole === 'advisor' && (
              <AdvisorDashboard
                clients={clients}
                vehicles={vehicles}
                employees={employees}
                inventory={inventory}
                orders={orders}
                addClient={addClient}
                addVehicle={addVehicle}
                createServiceOrder={createServiceOrder}
                addOrderItem={addOrderItem}
                deleteOrderItem={deleteOrderItem}
                approveBudgetLine={approveBudgetLine}
                registerOrderPayment={registerOrderPayment}
                updateOrderStatus={updateOrderStatus}
              />
            )}

            {currentRole === 'mechanic' && (
              <MechanicDashboard
                employees={employees}
                inventory={inventory}
                orders={orders}
                clients={clients}
                vehicles={vehicles}
                clockInOrder={clockInOrder}
                pauseOrder={pauseOrder}
                clockOutOrder={clockOutOrder}
                updateOrderDiagnostics={updateOrderDiagnostics}
                submitPartRequisition={submitPartRequisition}
                updateOrderStatus={updateOrderStatus}
              />
            )}

            {currentRole === 'warehouse' && (
              <WarehouseDashboard
                inventory={inventory}
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
                requisitions={requisitions}
                employees={employees}
                orders={orders}
                addInventoryItem={addInventoryItem}
                updateInventoryItem={updateInventoryItem}
                addPurchaseOrder={addPurchaseOrder}
                receivePurchaseOrder={receivePurchaseOrder}
                handleRequisitionStatus={handleRequisitionStatus}
                addSupplier={addSupplier}
              />
            )}

            {currentRole === 'client' && (
              <CustomerPortal
                clients={clients}
                vehicles={vehicles}
                orders={orders}
                approveBudgetLine={approveBudgetLine}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* COMPLIANT FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 px-6 text-xs text-center text-slate-400 space-y-2">
        <p className="max-w-2xl mx-auto">
          <strong>Servicio Automotriz Especializado (SAE) Dashboard</strong> • Desarrollado con los más altos estándares de fidelidad y usabilidad interactiva. Sincronización local persistente en tiempo real.
        </p>
        <p className="font-mono text-[10px]">
          Simulación de Operación Mecánica • Port 3000 • CDMX Verificación Vehicular Integrada • Licencia Comercial SAE
        </p>
      </footer>

      {/* MANUAL PWA INSTALLATION GUIDE MODAL */}
      <AnimatePresence>
        {showInstallGuide && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#010101] border-2 border-[#8D6A28]/50 max-w-md w-full rounded-2xl p-6 shadow-2xl shadow-[#8D6A28]/10 text-white relative"
            >
              <button 
                onClick={() => setShowInstallGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <img 
                  src="https://appdesignproyectos.com/saeicono.png" 
                  alt="SAE Icono" 
                  className="w-16 h-16 rounded-2xl shadow-lg border border-[#8D6A28]/30 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xl font-bold font-display tracking-tight text-white">Instalar App SAE</h3>
                  <p className="text-xs text-slate-400 mt-1">Lleva el Servicio Automotriz Especializado directamente en tu pantalla de inicio móvil o tablet.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-[#F8B232] flex items-center gap-1.5">
                    <Smartphone size={16} />
                    <span>En iPhone y iPad (Safari):</span>
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-slate-300 mt-2 space-y-1 pl-1">
                    <li>Toca el botón <strong className="text-white">Compartir</strong> (icono de cuadrado con flecha hacia arriba) en la barra de navegación.</li>
                    <li>Desplázate hacia abajo y selecciona <strong className="text-white">"Agregar a Inicio"</strong>.</li>
                    <li>Confirma el nombre <strong className="text-white">SAE</strong> para tener acceso inmediato.</li>
                  </ol>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-[#F8B232] flex items-center gap-1.5">
                    <Smartphone size={16} />
                    <span>En Android (Chrome / Edge / Opera):</span>
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-slate-300 mt-2 space-y-1 pl-1">
                    <li>Toca el menú de <strong className="text-white">3 puntos</strong> en la esquina superior derecha del navegador.</li>
                    <li>Selecciona <strong className="text-white">"Instalar aplicación"</strong> o <strong className="text-white">"Agregar a la pantalla principal"</strong>.</li>
                    <li>¡Listo! La app se ejecutará de forma independiente sin barras de navegador.</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full mt-6 py-2.5 bg-[#8D6A28] text-white rounded-xl font-bold border border-[#8D6A28]/40 hover:bg-[#aa8134] transition-all text-sm cursor-pointer shadow-md"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
