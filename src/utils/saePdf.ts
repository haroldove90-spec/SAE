import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ServiceOrder, Client, Vehicle, Employee } from '../types';

export async function generateSaePdf(
  order: ServiceOrder,
  client: Client | undefined,
  vehicle: Vehicle | undefined,
  employees: Employee[]
) {
  // Find employee names
  const advisorName = employees.find(e => e.id === order.advisorId)?.name || 'Asesor de Guardia';
  const mechanicName = order.tecnico || employees.find(e => e.id === order.mechanicId)?.name || 'Mecánico Asignado';

  // Get date and time
  const dateStr = order.fecha || order.dateOpened.split(' ')[0] || new Date().toISOString().split('T')[0];
  const timeStr = order.hora || (order.dateOpened.split(' ').length > 1 ? order.dateOpened.split(' ')[1].substring(0, 5) : '10:00');

  // Create a container styled as a letter page
  const container = document.createElement('div');
  container.id = 'sae-pdf-render-root';
  container.style.position = 'fixed';
  container.style.left = '0px';
  container.style.top = '0px';
  container.style.width = '800px';
  container.style.padding = '35px 40px';
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#111827';
  container.style.fontFamily = '"Inter", sans-serif';
  container.style.fontSize = '11px';
  container.style.lineHeight = '1.4';
  container.style.zIndex = '-9999';
  container.style.opacity = '0.99'; // Visual overlay behind other elements but laid out fully
  container.style.pointerEvents = 'none';

  // Hex Colors
  const crimson = '#A21C26'; // exact rich crimson of the form

  // Checkbox helpers
  const renderCheck = (val: boolean | undefined) => {
    return `
      <div style="display: flex !important; gap: 15px !important; align-items: center !important; color: #111827 !important; background-color: transparent !important;">
        <span style="display: flex !important; align-items: center !important; gap: 4px !important; color: #111827 !important;">
          Sí <span style="display: inline-block !important; width: 13px !important; height: 13px !important; border: 1.5px solid ${crimson} !important; text-align: center !important; line-height: 10px !important; font-weight: bold !important; font-size: 10px !important; color: ${crimson} !important; background-color: #FFFFFF !important;">${val ? 'X' : ''}</span>
        </span>
        <span style="display: flex !important; align-items: center !important; gap: 4px !important; color: #111827 !important;">
          No <span style="display: inline-block !important; width: 13px !important; height: 13px !important; border: 1.5px solid ${crimson} !important; text-align: center !important; line-height: 10px !important; font-weight: bold !important; font-size: 10px !important; color: ${crimson} !important; background-color: #FFFFFF !important;">${val === false ? 'X' : (!val ? 'X' : '')}</span>
        </span>
      </div>
    `;
  };

  container.innerHTML = `
    <!-- Header Section -->
    <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 12px !important; border-bottom: 2px solid ${crimson} !important; padding-bottom: 10px !important; background-color: transparent !important;">
      <div style="display: flex !important; align-items: center !important; gap: 12px !important; background-color: transparent !important;">
        <!-- SAE Logo Representation -->
        <div style="font-family: 'Inter', sans-serif !important; font-weight: 900 !important; font-style: italic !important; font-size: 40px !important; color: ${crimson} !important; letter-spacing: -2px !important; line-height: 1 !important; background-color: transparent !important;">
          SAE
        </div>
        <div style="display: flex !important; flex-direction: column !important; justify-content: center !important; background-color: transparent !important;">
          <div style="font-weight: 800 !important; font-size: 12px !important; color: ${crimson} !important; text-transform: uppercase !important; letter-spacing: 0.5px !important;">
            SERVICIO AUTOMOTRIZ ESPECIALIZADO
          </div>
          <div style="font-size: 10px !important; color: #1D4ED8 !important; font-weight: 700 !important; font-style: italic !important;">
            ¡La escudería que te lleva seguro a tu destino!
          </div>
        </div>
      </div>
      
      <!-- Folio box -->
      <div style="display: flex !important; align-items: center !important; gap: 6px !important; background-color: transparent !important;">
        <span style="font-weight: bold !important; font-size: 13px !important; color: #1F2937 !important;">Folio</span>
        <div style="border: 2px solid ${crimson} !important; border-radius: 12px !important; padding: 6px 14px !important; font-weight: 800 !important; font-size: 16px !important; color: ${crimson} !important; background-color: #FEF2F2 !important; font-family: monospace !important; min-width: 90px !important; text-align: center !important;">
          ${order.folio || order.id.replace('OS-', '')}
        </div>
      </div>
    </div>

    <!-- Section 1: Datos del Cliente -->
    <div style="margin-bottom: 12px !important; background-color: transparent !important;">
      <div style="background-color: ${crimson} !important; color: white !important; font-weight: bold !important; font-size: 11px !important; padding: 4px 10px !important; border-radius: 15px !important; display: flex !important; align-items: center !important; gap: 6px !important; margin-bottom: 8px !important;">
        <span style="background-color: white !important; color: ${crimson} !important; width: 15px !important; height: 15px !important; border-radius: 50% !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; font-size: 9px !important; font-weight: 900 !important;">1</span>
        DATOS DEL CLIENTE
      </div>
      <div style="display: grid !important; grid-template-columns: 3.5fr 2.5fr !important; gap: 6px !important; padding: 0 5px !important; background-color: transparent !important;">
        <div style="display: flex !important; flex-direction: column !important; gap: 5px !important; background-color: transparent !important; color: #111827 !important;">
          <div style="color: #111827 !important;"><strong>Cliente:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 80% !important; padding-bottom: 1px !important; color: #111827 !important;">${client?.name || ''}</span></div>
          <div style="color: #111827 !important;"><strong>Tel. Cel:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 78% !important; padding-bottom: 1px !important; color: #111827 !important;">${client?.phone || ''}</span></div>
          <div style="color: #111827 !important;"><strong>Calle:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 84% !important; padding-bottom: 1px !important; color: #111827 !important;">${client?.calle || client?.address || ''}</span></div>
          <div style="color: #111827 !important;"><strong>Colonia:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 81% !important; padding-bottom: 1px !important; color: #111827 !important;">${client?.colonia || ''}</span></div>
        </div>
        <div style="display: flex !important; flex-direction: column !important; gap: 5px !important; background-color: transparent !important; color: #111827 !important;">
          <div style="color: #111827 !important;"><strong>E-Mail:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 80% !important; padding-bottom: 1px !important; color: #111827 !important;">${client?.email || ''}</span></div>
          <div style="color: #111827 !important;"><strong>Tel:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 86% !important; padding-bottom: 1px !important; color: #111827 !important;">${client?.telFijo || ''}</span></div>
          <div style="color: #111827 !important;"><strong>C.P.:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 86% !important; padding-bottom: 1px !important; color: #111827 !important;">${client?.cp || ''}</span></div>
          <div style="color: #111827 !important;"><strong>Alcaldía:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 78% !important; padding-bottom: 1px !important; color: #111827 !important;">${client?.alcaldia || ''}</span></div>
        </div>
      </div>
    </div>

    <!-- Section 2: Datos del Auto -->
    <div style="margin-bottom: 12px !important; background-color: transparent !important;">
      <div style="background-color: ${crimson} !important; color: white !important; font-weight: bold !important; font-size: 11px !important; padding: 4px 10px !important; border-radius: 15px !important; display: flex !important; align-items: center !important; gap: 6px !important; margin-bottom: 8px !important;">
        <span style="background-color: white !important; color: ${crimson} !important; width: 15px !important; height: 15px !important; border-radius: 50% !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; font-size: 9px !important; font-weight: 900 !important;">2</span>
        DATOS DEL AUTO
      </div>
      
      <!-- Grid principal de auto -->
      <div style="display: grid !important; grid-template-columns: 2fr 2fr 2fr !important; gap: 6px !important; margin-bottom: 8px !important; padding: 0 5px !important; background-color: transparent !important; color: #111827 !important;">
        <div style="display: flex !important; flex-direction: column !important; gap: 5px !important; background-color: transparent !important;">
          <div style="color: #111827 !important;"><strong>Auto:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 75% !important; padding-bottom: 1px !important; color: #111827 !important;">${vehicle?.brand || ''}</span></div>
          <div style="color: #111827 !important;"><strong>No. de Serie:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 50% !important; padding-bottom: 1px !important; font-family: monospace !important; font-size: 9px !important; color: #111827 !important;">${vehicle?.serie || vehicle?.vin || ''}</span></div>
        </div>
        <div style="display: flex !important; flex-direction: column !important; gap: 5px !important; background-color: transparent !important;">
          <div style="color: #111827 !important;"><strong>Modelo:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 70% !important; padding-bottom: 1px !important; color: #111827 !important;">${vehicle?.model || ''} (${vehicle?.year || ''})</span></div>
          <div style="color: #111827 !important;"><strong>Motor:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 72% !important; padding-bottom: 1px !important; font-family: monospace !important; font-size: 9px !important; color: #111827 !important;">${vehicle?.motor || ''}</span></div>
        </div>
        <div style="display: flex !important; flex-direction: column !important; gap: 5px !important; background-color: transparent !important;">
          <div style="color: #111827 !important;"><strong>Placas:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 72% !important; padding-bottom: 1px !important; font-weight: bold !important; color: #111827 !important;">${vehicle?.plate || ''}</span></div>
          <div style="color: #111827 !important;"><strong>Kms:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 75% !important; padding-bottom: 1px !important; color: #111827 !important;">${vehicle?.mileage ? vehicle.mileage.toLocaleString() : ''}</span></div>
          <div style="color: #111827 !important;"><strong>Color:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 70% !important; padding-bottom: 1px !important; color: #111827 !important;">${vehicle?.color || ''}</span></div>
        </div>
      </div>

      <!-- Checklist de Inventario (Dos columnas simétricas) -->
      <div style="border: 1.5px solid ${crimson} !important; border-radius: 8px !important; padding: 8px !important; background-color: #FFFDFD !important; margin-bottom: 6px !important;">
        <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; background-color: transparent !important;">
          <!-- Columna Izquierda -->
          <div style="display: flex !important; flex-direction: column !important; gap: 4px !important; background-color: transparent !important;">
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Tapetes</span>
              ${renderCheck(order.checklist.tapetes)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Encendedor</span>
              ${renderCheck(order.checklist.encendedor)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Estéreo</span>
              ${renderCheck(order.checklist.estereo)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Tarjeta de Circulación</span>
              ${renderCheck(order.checklist.tarjetaCirculacion)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Comp. de Verificación</span>
              ${renderCheck(order.checklist.compVerificacion)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Póliza de seguro</span>
              ${renderCheck(order.checklist.polizaSeguro)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Seguros de Ruedas</span>
              ${renderCheck(order.checklist.segurosRuedas)}
            </div>
          </div>

          <!-- Columna Derecha -->
          <div style="display: flex !important; flex-direction: column !important; gap: 4px !important; background-color: transparent !important;">
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Gato</span>
              ${renderCheck(order.checklist.gato || order.checklist.jack)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Herramienta</span>
              ${renderCheck(order.checklist.herramienta || order.checklist.tools)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Extintor</span>
              ${renderCheck(order.checklist.extintor || order.checklist.extinguisher)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Llanta de refacción</span>
              ${renderCheck(order.checklist.llantaRefaccion || order.checklist.spareTire)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Sensores de presencia</span>
              ${renderCheck(order.checklist.sensoresPresencia)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px dashed #E5E7EB !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="color: #111827 !important;">Cámara de Reversa</span>
              ${renderCheck(order.checklist.camaraReversa)}
            </div>
            <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; padding-bottom: 2px !important; color: #111827 !important;">
              <span style="font-weight: bold !important; color: ${crimson} !important;">Nivel de Combustible:</span>
              <span style="font-weight: bold !important; color: ${crimson} !important; font-family: monospace !important;">${order.checklist.fuelLevel}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Motor y Valores lines -->
      <div style="display: flex !important; flex-direction: column !important; gap: 5px !important; padding: 0 5px !important; background-color: transparent !important; color: #111827 !important;">
        <div style="color: #111827 !important;"><strong>Inspección Componentes de Motor:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 73% !important; padding-bottom: 1px !important; color: #111827 !important;">${order.checklist.inspeccionMotor || 'Inspección visual conforme a protocolo'}</span></div>
        <div style="color: #111827 !important;"><strong>Objetos de Valor:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 85% !important; padding-bottom: 1px !important; color: #111827 !important;">${order.checklist.objetosValor || 'Ninguno reportado'}</span></div>
      </div>
    </div>

    <!-- Section 3: Descripción del Servicio -->
    <div style="margin-bottom: 12px !important; background-color: transparent !important;">
      <div style="background-color: ${crimson} !important; color: white !important; font-weight: bold !important; font-size: 11px !important; padding: 4px 10px !important; border-radius: 15px !important; display: flex !important; align-items: center !important; gap: 6px !important; margin-bottom: 8px !important;">
        <span style="background-color: white !important; color: ${crimson} !important; width: 15px !important; height: 15px !important; border-radius: 50% !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; font-size: 9px !important; font-weight: 900 !important;">3</span>
        DESCRIPCIÓN DEL SERVICIO
      </div>
      
      <div style="border: 1.5px solid ${crimson} !important; border-radius: 8px !important; padding: 8px !important; background-color: #FFFDFD !important; color: #111827 !important;">
        <div style="margin-bottom: 6px !important; color: #111827 !important;"><strong style="color: ${crimson} !important;">Falla Reportada / Síntomas:</strong></div>
        <div style="background-color: #F9FAFB !important; border: 1px solid #E5E7EB !important; border-radius: 6px !important; padding: 8px !important; font-size: 10px !important; line-height: 1.4 !important; min-height: 45px !important; font-style: italic !important; color: #1F2937 !important;">
          ${order.reportedFailure}
        </div>
        
        <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; margin-top: 8px !important; background-color: transparent !important; color: #111827 !important;">
          <div style="color: #111827 !important;"><strong>Fecha de Ingreso:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 60% !important; padding-bottom: 1px !important; font-weight: bold !important; color: #111827 !important;">${dateStr}</span></div>
          <div style="color: #111827 !important;"><strong>Hora de Ingreso:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 60% !important; padding-bottom: 1px !important; font-weight: bold !important; color: #111827 !important;">${timeStr} Hrs</span></div>
        </div>
        <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; margin-top: 5px !important; background-color: transparent !important; color: #111827 !important;">
          <div style="color: #111827 !important;"><strong>Técnico Responsable:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 50% !important; padding-bottom: 1px !important; color: #111827 !important;">${mechanicName}</span></div>
          <div style="color: #111827 !important;"><strong>Asesor de Servicio:</strong> <span style="border-bottom: 1px solid #9CA3AF !important; display: inline-block !important; width: 50% !important; padding-bottom: 1px !important; color: #111827 !important;">${advisorName}</span></div>
        </div>
      </div>
    </div>

    <!-- Section 4: Cláusulas y Términos Legales -->
    <div style="margin-bottom: 12px !important; background-color: transparent !important; color: #4B5563 !important;">
      <div style="font-size: 7.5px !important; line-height: 1.25 !important; display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; background-color: #F9FAFB !important; border: 1px solid #E5E7EB !important; border-radius: 8px !important; padding: 8px !important; color: #4B5563 !important;">
        <div style="display: flex !important; flex-direction: column !important; gap: 3px !important; color: #4B5563 !important;">
          <div style="color: #4B5563 !important;"><strong>1.</strong> Este documento no tiene validez como comprobante fiscal.</div>
          <div style="color: #4B5563 !important;"><strong>2.</strong> Presente este comprobante para cualquier aclaración o ajuste posterior.</div>
          <div style="color: #4B5563 !important;"><strong>3.</strong> La empresa no se hace responsable por objetos de valor olvidados en el vehículo que no sean reportados a la administración.</div>
          <div style="color: #4B5563 !important;"><strong>4.</strong> Si el automóvil requiere prueba de camino, el costo de la gasolina será cubierto por el cliente.</div>
          <div style="color: #4B5563 !important;"><strong>5.</strong> En caso de accidente automovilístico y/o siniestro, el cliente autoriza hacer uso de la póliza del seguro del vehículo.</div>
          <div style="color: #4B5563 !important;"><strong>6.</strong> El costo por revisión y diagnóstico es de $350.00 (trescientos cincuenta pesos 00/100 M.N.) por hora. Para esta revisión se consideran <span style="border-bottom: 1px solid #000 !important; padding: 0 4px !important; font-weight: bold !important; color: #111827 !important;">1.5</span> horas. <br/>El cliente firma de conformidad: ___________________________</div>
        </div>
        <div style="display: flex !important; flex-direction: column !important; gap: 3px !important; color: #4B5563 !important;">
          <div style="color: #4B5563 !important;"><strong>7.</strong> En caso de que el presupuesto no sea aceptado, el cliente pagará exclusivamente el costo por revisión y diagnóstico.</div>
          <div style="color: #4B5563 !important;"><strong>8.</strong> El prestador de servicio se obliga a devolver el automóvil en las condiciones que le fue entregado, exceptuando las consecuencias inevitables del diagnóstico.</div>
          <div style="color: #4B5563 !important;"><strong>9.</strong> Se cobrarán $300.00 (trescientos pesos 00/100 M.N.) diarios por concepto de pensión si el auto no es recogido después de 24 horas de haber recibido la notificación de terminado el trabajo.</div>
          <div style="color: #4B5563 !important;"><strong>10.</strong> El cliente renuncia a recoger las partes usadas que fueron retiradas de la unidad, si no son solicitadas al momento de la entrega de su vehículo ____________________________</div>
        </div>
      </div>

      <!-- Signature section -->
      <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 40px !important; margin-top: 15px !important; padding: 10px 40px 5px 40px !important; background-color: transparent !important; color: #111827 !important;">
        <div style="text-align: center !important; display: flex !important; flex-direction: column !important; align-items: center !important; background-color: transparent !important;">
          ${order.clientSignature ? `
            <img src="${order.clientSignature}" style="max-height: 52px !important; max-width: 150px !important; margin-bottom: 2px !important; background-color: transparent !important;" />
          ` : `
            <div style="height: 52px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-style: italic !important; color: #9CA3AF !important; font-size: 10px !important;">Firma Digital No Registrada</div>
          `}
          <div style="border-top: 1px solid #374151 !important; width: 100% !important; margin-bottom: 3px !important; margin-top: 5px !important;"></div>
          <strong style="font-size: 9px !important; text-transform: uppercase !important; color: #111827 !important;">Nombre y Firma del Cliente</strong>
          <span style="font-size: 8px !important; color: #6B7280 !important;">(Acepto Condiciones y presupuesto)</span>
        </div>
        <div style="text-align: center !important; display: flex !important; flex-direction: column !important; align-items: center !important; background-color: transparent !important;">
          ${order.mechanicSignature ? `
            <img src="${order.mechanicSignature}" style="max-height: 52px !important; max-width: 150px !important; margin-bottom: 2px !important; background-color: transparent !important;" />
          ` : `
            <div style="height: 52px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-style: italic !important; color: #9CA3AF !important; font-size: 10px !important;">Firma Digital No Registrada</div>
          `}
          <div style="border-top: 1px solid #374151 !important; width: 100% !important; margin-bottom: 3px !important; margin-top: 5px !important;"></div>
          <strong style="font-size: 9px !important; text-transform: uppercase !important; color: #111827 !important;">Nombre y Firma de la Empresa</strong>
          <span style="font-size: 8px !important; color: #6B7280 !important;">Asesor: ${advisorName}</span>
        </div>
      </div>
    </div>

    <!-- Page Footer with physical workshop details as in the paper image -->
    <div style="border-top: 2px solid ${crimson} !important; padding-top: 8px !important; margin-top: 12px !important; text-align: center !important; font-size: 8.5px !important; color: #4B5563 !important; font-weight: 500 !important; display: flex !important; flex-direction: column !important; gap: 3px !important; background-color: transparent !important;">
      <div style="font-weight: bold !important; color: #111827 !important; font-size: 9px !important;">
        Mixtecas Mz. 52 Lt. 17 Esq. Rey Tepalcatzin Ajusco, Coyoacán. C.P. 04300 CDMX
      </div>
      <div style="display: flex !important; justify-content: center !important; gap: 15px !important; font-weight: bold !important; color: #111827 !important;">
        <span style="color: #111827 !important;">📞 55 4632 6652</span>
        <span style="color: #111827 !important;">🟢 55 3917 7754 (WhatsApp)</span>
        <span style="color: #111827 !important;">✉️ contacto@saecdmx.com</span>
      </div>
    </div>
  `;

  // Append container to body
  document.body.appendChild(container);

  try {
    // Generate canvas
    const canvas = await html2canvas(container, {
      scale: 2, // higher resolution
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false
    });

    // Create jsPDF instance
    const imgData = canvas.toDataURL('image/png');
    
    // Letter size: 216mm x 279mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const imgWidth = 216; // fit full width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Save the PDF
    const filename = `Orden_SAE_Folio_${order.folio || order.id.replace('OS-', '')}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating SAE Order PDF:', error);
    alert('Ocurrió un error al generar el PDF. Por favor reintente.');
  } finally {
    // Cleanup container
    document.body.removeChild(container);
  }
}
