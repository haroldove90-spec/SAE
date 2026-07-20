import { useState, useEffect } from 'react';
import { Client, Vehicle, Employee, InventoryItem, Supplier, ServiceOrder, Transaction, WorkshopSettings, PartRequisition, PurchaseOrder, OrderStatus, BudgetLineItem, TimeLog } from './types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_VEHICLES, 
  INITIAL_EMPLOYEES, 
  INITIAL_INVENTORY, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_REQUISITIONS, 
  INITIAL_ORDERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SETTINGS 
} from './mockData';
import { supabase } from './lib/supabase';

export function useWorkshopState() {
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [requisitions, setRequisitions] = useState<PartRequisition[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<WorkshopSettings>(INITIAL_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Supabase states
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Initialize data from LocalStorage or mock data, then fetch from Supabase
  useEffect(() => {
    const initializeData = async () => {
      const localClients = localStorage.getItem('wt_clients');
      const localVehicles = localStorage.getItem('wt_vehicles');
      const localEmployees = localStorage.getItem('wt_employees');
      const localInventory = localStorage.getItem('wt_inventory');
      const localSuppliers = localStorage.getItem('wt_suppliers');
      const localPurchaseOrders = localStorage.getItem('wt_purchase_orders');
      const localRequisitions = localStorage.getItem('wt_requisitions');
      const localOrders = localStorage.getItem('wt_orders');
      const localTransactions = localStorage.getItem('wt_transactions');
      const localSettings = localStorage.getItem('wt_settings');

      setClients(localClients ? JSON.parse(localClients) : INITIAL_CLIENTS);
      setVehicles(localVehicles ? JSON.parse(localVehicles) : INITIAL_VEHICLES);
      setEmployees(localEmployees ? JSON.parse(localEmployees) : INITIAL_EMPLOYEES);
      setInventory(localInventory ? JSON.parse(localInventory) : INITIAL_INVENTORY);
      setSuppliers(localSuppliers ? JSON.parse(localSuppliers) : INITIAL_SUPPLIERS);
      setPurchaseOrders(localPurchaseOrders ? JSON.parse(localPurchaseOrders) : INITIAL_PURCHASE_ORDERS);
      setRequisitions(localRequisitions ? JSON.parse(localRequisitions) : INITIAL_REQUISITIONS);
      setOrders(localOrders ? JSON.parse(localOrders) : INITIAL_ORDERS);
      setTransactions(localTransactions ? JSON.parse(localTransactions) : INITIAL_TRANSACTIONS);
      
      let parsedSettings = localSettings ? JSON.parse(localSettings) : INITIAL_SETTINGS;
      if (parsedSettings && parsedSettings.address && (parsedSettings.address.includes('Palmas') || parsedSettings.address.includes('palmas'))) {
        parsedSettings.address = INITIAL_SETTINGS.address;
        parsedSettings.phone = INITIAL_SETTINGS.phone;
      }
      setSettings(parsedSettings);
      setLoaded(true);

      // Now, try fetching from Supabase to hydrate with latest cloud data
      await fetchFromSupabase(true);
    };

    initializeData();
  }, []);

  const fetchFromSupabase = async (isInitialLoad = false) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      // Pull clients
      const { data: clientsData, error: clientsErr } = await supabase.from('clients').select('*');
      if (clientsErr) throw clientsErr;
      
      // Pull vehicles
      const { data: vehiclesData, error: vehiclesErr } = await supabase.from('vehicles').select('*');
      if (vehiclesErr) throw vehiclesErr;

      // Pull employees
      const { data: employeesData, error: employeesErr } = await supabase.from('employees').select('*');
      if (employeesErr) throw employeesErr;

      // Pull inventory
      const { data: inventoryData, error: inventoryErr } = await supabase.from('inventory').select('*');
      if (inventoryErr) throw inventoryErr;

      // Pull suppliers
      const { data: suppliersData, error: suppliersErr } = await supabase.from('suppliers').select('*');
      if (suppliersErr) throw suppliersErr;

      // Pull purchase_orders
      const { data: poData, error: poErr } = await supabase.from('purchase_orders').select('*');
      if (poErr) throw poErr;

      // Pull requisitions
      const { data: requisitionsData, error: requisitionsErr } = await supabase.from('requisitions').select('*');
      if (requisitionsErr) throw requisitionsErr;

      // Pull service_orders
      const { data: ordersData, error: ordersErr } = await supabase.from('service_orders').select('*');
      if (ordersErr) throw ordersErr;

      // Pull transactions
      const { data: txData, error: txErr } = await supabase.from('transactions').select('*');
      if (txErr) throw txErr;

      // Pull settings
      const { data: settingsData, error: settingsErr } = await supabase.from('workshop_settings').select('*').eq('id', 'default').maybeSingle();
      if (settingsErr) throw settingsErr;

      // Connection is successful
      setSupabaseConnected(true);

      // Update local states if we got remote data
      if (clientsData && clientsData.length > 0) setClients(clientsData);
      if (vehiclesData && vehiclesData.length > 0) setVehicles(vehiclesData);
      if (employeesData && employeesData.length > 0) setEmployees(employeesData);
      if (inventoryData && inventoryData.length > 0) setInventory(inventoryData);
      if (suppliersData && suppliersData.length > 0) setSuppliers(suppliersData);
      if (poData && poData.length > 0) setPurchaseOrders(poData);
      if (requisitionsData && requisitionsData.length > 0) setRequisitions(requisitionsData);
      if (ordersData && ordersData.length > 0) setOrders(ordersData);
      if (txData && txData.length > 0) setTransactions(txData);
      if (settingsData) setSettings(settingsData);

      console.log('Fidelidad Supabase: Todo sincronizado correctamente.');
    } catch (err: any) {
      console.warn('Supabase Connection or Schema issue:', err);
      // If table/relation doesn't exist yet, we still set connection as True but with distinct warning
      if (err.code === '42P01') {
        setSupabaseConnected(true);
        setSyncError('Conectado, pero falta ejecutar el script SQL de creación de tablas.');
      } else {
        setSupabaseConnected(false);
        setSyncError(err.message || 'Error de conexión');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const uploadToSupabase = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      if (clients.length > 0) {
        const { error } = await supabase.from('clients').upsert(clients);
        if (error) throw error;
      }
      if (vehicles.length > 0) {
        const { error } = await supabase.from('vehicles').upsert(vehicles);
        if (error) throw error;
      }
      if (employees.length > 0) {
        const { error } = await supabase.from('employees').upsert(employees);
        if (error) throw error;
      }
      if (inventory.length > 0) {
        const { error } = await supabase.from('inventory').upsert(inventory);
        if (error) throw error;
      }
      if (suppliers.length > 0) {
        const { error } = await supabase.from('suppliers').upsert(suppliers);
        if (error) throw error;
      }
      if (purchaseOrders.length > 0) {
        const { error } = await supabase.from('purchase_orders').upsert(purchaseOrders);
        if (error) throw error;
      }
      if (requisitions.length > 0) {
        const { error } = await supabase.from('requisitions').upsert(requisitions);
        if (error) throw error;
      }
      if (orders.length > 0) {
        const { error } = await supabase.from('service_orders').upsert(orders);
        if (error) throw error;
      }
      if (transactions.length > 0) {
        const { error } = await supabase.from('transactions').upsert(transactions);
        if (error) throw error;
      }
      if (settings) {
        const { error } = await supabase.from('workshop_settings').upsert({ id: 'default', ...settings });
        if (error) throw error;
      }

      setSupabaseConnected(true);
      console.log('Todos los datos locales migrados correctamente a Supabase.');
    } catch (err: any) {
      console.error('Error uploading to Supabase:', err);
      setSyncError(err.message || 'Error al sincronizar datos locales');
      setSupabaseConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper to centralize safe background syncing with Supabase
  const safeUpsert = async (table: string, data: any) => {
    try {
      const { error } = await supabase.from(table).upsert(data);
      if (error) {
        console.warn(`Error auto-syncing table ${table}:`, error.message);
      }
    } catch (err) {
      console.error(`Exception auto-syncing table ${table}:`, err);
    }
  };

  // Sync to LocalStorage & Supabase Background Sync
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_clients', JSON.stringify(clients));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('clients', clients);
    }
  }, [clients, loaded, supabaseConnected]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_vehicles', JSON.stringify(vehicles));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('vehicles', vehicles);
    }
  }, [vehicles, loaded, supabaseConnected]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_employees', JSON.stringify(employees));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('employees', employees);
    }
  }, [employees, loaded, supabaseConnected]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_inventory', JSON.stringify(inventory));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('inventory', inventory);
    }
  }, [inventory, loaded, supabaseConnected]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_suppliers', JSON.stringify(suppliers));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('suppliers', suppliers);
    }
  }, [suppliers, loaded, supabaseConnected]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_purchase_orders', JSON.stringify(purchaseOrders));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('purchase_orders', purchaseOrders);
    }
  }, [purchaseOrders, loaded, supabaseConnected]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_requisitions', JSON.stringify(requisitions));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('requisitions', requisitions);
    }
  }, [requisitions, loaded, supabaseConnected]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_orders', JSON.stringify(orders));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('service_orders', orders);
    }
  }, [orders, loaded, supabaseConnected]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_transactions', JSON.stringify(transactions));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('transactions', transactions);
    }
  }, [transactions, loaded, supabaseConnected]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_settings', JSON.stringify(settings));
    if (supabaseConnected && !isSyncing) {
      safeUpsert('workshop_settings', { id: 'default', ...settings });
    }
  }, [settings, loaded, supabaseConnected]);


  // Actions

  // 1. Clients
  const addClient = (client: Omit<Client, 'id' | 'creditBalance'>) => {
    const newClient: Client = {
      ...client,
      id: `cli-${Date.now()}`,
      creditBalance: 0
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  // 2. Vehicles
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh-${Date.now()}`
    };
    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  };

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  // 3. Employees & Commissions
  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  // 4. Inventory
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `part-${Date.now()}`
    };
    setInventory(prev => [...prev, newItem]);
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  // 5. Purchase Orders
  const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'status'>) => {
    const newPO: PurchaseOrder = {
      ...po,
      id: `OC-${1000 + purchaseOrders.length + 1}`,
      status: 'Pendiente'
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
  };

  const receivePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po || po.status === 'Recibido') return;

    // Update PO status
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'Recibido' } : p));

    // Update stock & cost average in Inventory
    setInventory(prev => prev.map(invItem => {
      const poLine = po.items.find(pi => pi.itemId === invItem.id);
      if (poLine) {
        const newStock = invItem.stock + poLine.qty;
        // Calculate new weighted cost average:
        const totalPreviousCost = invItem.stock * invItem.cost;
        const totalNewCost = poLine.qty * poLine.cost;
        const newAvgCost = Math.round((totalPreviousCost + totalNewCost) / newStock);
        return {
          ...invItem,
          stock: newStock,
          cost: newAvgCost
        };
      }
      return invItem;
    }));

    // Register Expense Transaction
    const supplier = suppliers.find(s => s.id === po.supplierId);
    addTransaction({
      type: 'Egreso',
      category: 'Proveedor',
      amount: po.total,
      description: `Pago de Orden de Compra ${po.id} a ${supplier?.name || 'Proveedor'}`
    });
  };

  // 6. Service Orders & Workflows
  const createServiceOrder = (orderData: Omit<ServiceOrder, 'id' | 'items' | 'timeLogs' | 'isClockedIn' | 'isPaused' | 'totalHoursWorked' | 'payments'>) => {
    const newId = `OS-${1000 + orders.length + 1}`;
    const newOrder: ServiceOrder = {
      ...orderData,
      id: newId,
      items: [],
      timeLogs: [],
      isClockedIn: false,
      isPaused: false,
      totalHoursWorked: 0,
      payments: []
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedOrder: ServiceOrder = { ...o, status };
        if (status === 'Listo_Entrega' && !o.dateClosed) {
          updatedOrder.dateClosed = new Date().toISOString().split('T')[0];
        }
        return updatedOrder;
      }
      return o;
    }));
  };

  const updateOrderDiagnostics = (orderId: string, diagnostics: string, photos: string[] = []) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          diagnostics,
          diagnosticPhotos: [...o.diagnosticPhotos, ...photos]
        };
      }
      return o;
    }));
  };

  // Edit / Add Items to Order Quote (items)
  const addOrderItem = (orderId: string, item: Omit<BudgetLineItem, 'id' | 'approved'>) => {
    const newItem: BudgetLineItem = {
      ...item,
      id: `item-${Date.now()}`,
      approved: null // Starts as pending approval
    };
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          items: [...o.items, newItem]
        };
      }
      return o;
    }));
  };

  const deleteOrderItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          items: o.items.filter(i => i.id !== itemId)
        };
      }
      return o;
    }));
  };

  const approveBudgetLine = (orderId: string, itemId: string, approved: boolean) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedItems = o.items.map(item => {
          if (item.id === itemId) {
            return { ...item, approved };
          }
          return item;
        });
        
        // If an item requires parts and gets approved, we might automatically suggest waiting for parts,
        // or let the staff handle that transition.
        return {
          ...o,
          items: updatedItems
        };
      }
      return o;
    }));
  };

  // Clock-in / Clock-out mechanics logic
  const clockInOrder = (orderId: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newLog: TimeLog = { action: o.isPaused ? 'resume' : 'start', timestamp: now };
        return {
          ...o,
          isClockedIn: true,
          isPaused: false,
          timeLogs: [...o.timeLogs, newLog]
        };
      }
      return o;
    }));
  };

  const pauseOrder = (orderId: string, reason: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newLog: TimeLog = { action: 'pause', timestamp: now, reason };
        
        // Calculate accrued hours from previous start/resume
        let calculatedHours = o.totalHoursWorked;
        const lastLog = o.timeLogs[o.timeLogs.length - 1];
        if (lastLog && (lastLog.action === 'start' || lastLog.action === 'resume')) {
          const diffMs = new Date(now).getTime() - new Date(lastLog.timestamp).getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          calculatedHours += parseFloat(diffHours.toFixed(2));
        }

        return {
          ...o,
          isClockedIn: false,
          isPaused: true,
          totalHoursWorked: calculatedHours,
          timeLogs: [...o.timeLogs, newLog],
          status: reason === 'Falta de refacción' ? 'Esperando_Refacciones' : o.status
        };
      }
      return o;
    }));
  };

  const clockOutOrder = (orderId: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newLog: TimeLog = { action: 'stop', timestamp: now };
        
        // Calculate final hours
        let calculatedHours = o.totalHoursWorked;
        const lastLog = o.timeLogs[o.timeLogs.length - 1];
        if (lastLog && (lastLog.action === 'start' || lastLog.action === 'resume')) {
          const diffMs = new Date(now).getTime() - new Date(lastLog.timestamp).getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          calculatedHours += parseFloat(diffHours.toFixed(2));
        }

        return {
          ...o,
          isClockedIn: false,
          isPaused: false,
          totalHoursWorked: calculatedHours,
          timeLogs: [...o.timeLogs, newLog]
        };
      }
      return o;
    }));
  };

  // 7. Part Requisitions (Mechanic -> Warehouse)
  const submitPartRequisition = (orderId: string, itemId: string, qty: number, mechanicId: string) => {
    const newReq: PartRequisition = {
      id: `req-${Date.now()}`,
      orderId,
      itemId,
      qty,
      mechanicId,
      status: 'Pendiente',
      date: new Date().toISOString().split('T')[0]
    };
    setRequisitions(prev => [...prev, newReq]);
  };

  const handleRequisitionStatus = (reqId: string, status: 'Despachado' | 'Rechazado') => {
    const req = requisitions.find(r => r.id === reqId);
    if (!req || req.status !== 'Pendiente') return;

    // Update req status
    setRequisitions(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));

    if (status === 'Despachado') {
      // Deduct stock
      setInventory(prev => prev.map(item => {
        if (item.id === req.itemId) {
          return {
            ...item,
            stock: Math.max(0, item.stock - req.qty)
          };
        }
        return item;
      }));

      // Add to Service Order parts (approved automatically since dispatched by stock room)
      const inventoryPart = inventory.find(i => i.id === req.itemId);
      if (inventoryPart) {
        const orderPartItem: Omit<BudgetLineItem, 'id' | 'approved'> = {
          type: 'refaccion',
          description: `${inventoryPart.name} (Código: ${inventoryPart.code})`,
          qty: req.qty,
          unitPrice: inventoryPart.price
        };
        // Add to order items
        setOrders(prev => prev.map(o => {
          if (o.id === req.orderId) {
            // Check if parts is already in items: if yes, increase qty. If not, add new line.
            const existingIndex = o.items.findIndex(it => it.description.includes(inventoryPart.code));
            if (existingIndex !== -1) {
              const updatedItems = [...o.items];
              updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                qty: updatedItems[existingIndex].qty + req.qty,
                approved: true
              };
              return { ...o, items: updatedItems };
            } else {
              const newItem: BudgetLineItem = {
                id: `item-${Date.now()}`,
                ...orderPartItem,
                approved: true
              };
              return { ...o, items: [...o.items, newItem] };
            }
          }
          return o;
        }));
      }
    }
  };

  // 8. Financial Transactions (Payments / Invoicing)
  const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const registerOrderPayment = (orderId: string, amount: number, method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Credito') => {
    const paymentId = `pay-${Date.now()}`;
    const paymentDate = new Date().toISOString();
    
    // Add payment to service order
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          payments: [...o.payments, { id: paymentId, amount, date: paymentDate, method }]
        };
      }
      return o;
    }));

    // If method is Credit, increase Client's credit balance
    const order = orders.find(o => o.id === orderId);
    if (order && method === 'Credito') {
      setClients(prev => prev.map(c => {
        if (c.id === order.clientId) {
          return {
            ...c,
            creditBalance: c.creditBalance + amount
          };
        }
        return c;
      }));
    }

    // Register income transaction
    const client = clients.find(c => c.id === order?.clientId);
    addTransaction({
      type: 'Ingreso',
      category: 'Pago_Cliente',
      amount,
      description: `Pago ${method} por Orden ${orderId} - Cliente: ${client?.name || 'Cliente'}`,
      referenceId: orderId
    });
  };

  const handleClientCreditPayment = (clientId: string, amount: number, method: 'Efectivo' | 'Tarjeta' | 'Transferencia') => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          creditBalance: Math.max(0, c.creditBalance - amount)
        };
      }
      return c;
    }));

    const client = clients.find(c => c.id === clientId);
    addTransaction({
      type: 'Ingreso',
      category: 'Pago_Cliente',
      amount,
      description: `Abono a cuenta de crédito - Cliente: ${client?.name || 'Cliente'}`
    });
  };

  // 9. Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  // Reset database to initial values
  const resetDatabase = () => {
    setClients(INITIAL_CLIENTS);
    setVehicles(INITIAL_VEHICLES);
    setEmployees(INITIAL_EMPLOYEES);
    setInventory(INITIAL_INVENTORY);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setRequisitions(INITIAL_REQUISITIONS);
    setOrders(INITIAL_ORDERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    
    localStorage.setItem('wt_clients', JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem('wt_vehicles', JSON.stringify(INITIAL_VEHICLES));
    localStorage.setItem('wt_employees', JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem('wt_inventory', JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem('wt_suppliers', JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem('wt_purchase_orders', JSON.stringify(INITIAL_PURCHASE_ORDERS));
    localStorage.setItem('wt_requisitions', JSON.stringify(INITIAL_REQUISITIONS));
    localStorage.setItem('wt_orders', JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem('wt_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem('wt_settings', JSON.stringify(INITIAL_SETTINGS));
  };

  return {
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
    
    // Supabase Sync State & Actions
    isSyncing,
    supabaseConnected,
    syncError,
    fetchFromSupabase,
    uploadToSupabase,
    
    // Actions
    addClient,
    updateClient,
    addVehicle,
    updateVehicle,
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
  };
}
