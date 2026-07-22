import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ServiceOrder, Client, Vehicle, Employee, Presupuesto, OrdenReparacion, NotaSalida } from '../types';

/**
 * Returns the raw HTML string representing the official SAE Presupuesto form,
 * styled exactly like the physical paper document.
 */
export function getSaePresupuestoHtml(presupuesto: Presupuesto): string {
  const crimson = '#A21C26';

  return `
    <!-- Header Section -->
    <div style="display: flex !important; justify-content: space-between !important; align-items: flex-start !important; margin-bottom: 15px !important; border-bottom: 2px solid ${crimson} !important; padding-bottom: 12px !important; background-color: transparent !important;">
      <div style="display: flex !important; flex-direction: column !important; gap: 4px !important; background-color: transparent !important;">
        <!-- SAE Logo -->
        <div style="display: flex !important; align-items: center !important; gap: 10px !important;">
          <div style="font-family: 'Inter', sans-serif !important; font-weight: 900 !important; font-style: italic !important; font-size: 38px !important; color: ${crimson} !important; letter-spacing: -2px !important; line-height: 1 !important;">
            SAE
          </div>
          <div style="font-size: 10px !important; color: ${crimson} !important; font-weight: 700 !important;">
            Servicio Automotriz Especializado
          </div>
        </div>
        <div style="font-weight: 900 !important; font-size: 26px !important; color: ${crimson} !important; tracking: 1px !important; margin-top: 4px !important;">
          PRESUPUESTO
        </div>
      </div>

      <!-- Workshop Info & Folio -->
      <div style="text-align: right !important; font-size: 9.5px !important; color: #1F2937 !important; line-height: 1.3 !important;">
        <div style="font-weight: 600 !important;">Mixtecas Mz.52 Lt.17 Esquina Rey Tepalcatzin</div>
        <div>Col. Ajusco Alcaldia Coyoacan C.P.04300 C.D.M.X.</div>
        <div style="font-weight: 700 !important; color: #111827 !important; margin-top: 2px !important;">Tel: 55 4632 6652 y 55 3917 7754 Cel: 55 1384 6680</div>
        <div style="font-weight: 700 !important; color: ${crimson} !important; margin-top: 2px !important;">Atención Personal: ${presupuesto.asesor || 'Alberto Flores Hdz.'}</div>
        <div style="font-weight: 800 !important; font-size: 10px !important; color: #111827 !important;">Asesor De Servicios</div>
        
        <div style="display: flex !important; justify-content: flex-end !important; gap: 15px !important; margin-top: 8px !important; font-size: 12px !important; font-weight: 900 !important;">
          <span>Número: <strong style="color: ${crimson} !important; font-size: 14px !important;">${presupuesto.numero}</strong></span>
          <span>Fecha: <strong style="color: #111827 !important;">${presupuesto.fecha}</strong></span>
        </div>
      </div>
    </div>

    <!-- Cliente & Vehiculo Header Grid -->
    <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; margin-bottom: 12px !important; border: 1.5px solid #D1D5DB !important; border-radius: 8px !important; padding: 10px 12px !important; background-color: #FAFAFA !important; font-size: 11px !important; color: #111827 !important;">
      <!-- Column 1: Cliente -->
      <div style="display: flex !important; flex-direction: column !important; gap: 4px !important;">
        <div><strong style="color: #111827 !important;">CLIENTE:</strong> <span style="font-weight: 700 !important; color: #111827 !important;">${presupuesto.clienteNombre}</span></div>
        <div><strong>Calle:</strong> ${presupuesto.clienteCalle}</div>
        <div><strong>C.P./Colonia:</strong> ${presupuesto.clienteCpColonia}</div>
        <div><strong>Alcaldia:</strong> ${presupuesto.clienteAlcaldia}</div>
        <div><strong>Telefono:</strong> ${presupuesto.clienteTelefono}</div>
      </div>

      <!-- Column 2: Vehículo -->
      <div style="display: flex !important; flex-direction: column !important; gap: 4px !important;">
        <div><strong>Marca/Mot:</strong> ${presupuesto.marcaMotor}</div>
        <div><strong>Modelo/Color:</strong> ${presupuesto.modeloColor}</div>
        <div><strong>Matrícula:</strong> <strong style="color: #111827 !important;">${presupuesto.matriculaVin}</strong></div>
        <div><strong>Kilometros:</strong> ${presupuesto.kilometros ? presupuesto.kilometros.toLocaleString() : ''}</div>
      </div>
    </div>

    <!-- Items Table -->
    <div style="margin-bottom: 12px !important; border: 1.5px solid #1E293B !important; border-radius: 6px !important; overflow: hidden !important;">
      <table style="width: 100% !important; border-collapse: collapse !important; font-size: 10px !important;">
        <thead>
          <tr style="background-color: #1E293B !important; color: #FFFFFF !important; font-weight: 800 !important; text-transform: uppercase !important;">
            <th style="padding: 6px 8px !important; text-align: left !important; width: 70px !important; border-right: 1px solid #334155 !important;">Código</th>
            <th style="padding: 6px 8px !important; text-align: left !important; border-right: 1px solid #334155 !important;">Repuestos / Servicios</th>
            <th style="padding: 6px 8px !important; text-align: center !important; width: 50px !important; border-right: 1px solid #334155 !important;">Cant.</th>
            <th style="padding: 6px 8px !important; text-align: right !important; width: 80px !important; border-right: 1px solid #334155 !important;">Imp. U</th>
            <th style="padding: 6px 8px !important; text-align: right !important; width: 90px !important;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${presupuesto.items.map((item, idx) => `
            <tr style="border-bottom: 1px solid #E2E8F0 !important; background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'} !important; color: #0F172A !important;">
              <td style="padding: 5px 8px !important; font-weight: 700 !important; font-family: monospace !important; border-right: 1px solid #E2E8F0 !important;">${item.codigo || ''}</td>
              <td style="padding: 5px 8px !important; border-right: 1px solid #E2E8F0 !important;">${item.descripcion}</td>
              <td style="padding: 5px 8px !important; text-align: center !important; font-weight: 700 !important; border-right: 1px solid #E2E8F0 !important;">${item.cantidad}</td>
              <td style="padding: 5px 8px !important; text-align: right !important; border-right: 1px solid #E2E8F0 !important;">${item.importeUnitario.toFixed(2)}</td>
              <td style="padding: 5px 8px !important; text-align: right !important; font-weight: 800 !important;">${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Footer & Totals -->
    <div style="display: flex !important; justify-content: space-between !important; align-items: flex-start !important; gap: 15px !important; margin-bottom: 12px !important;">
      <div style="font-size: 10px !important; color: #1E293B !important; line-height: 1.4 !important; flex: 1 !important;">
        <div><strong>FORMA DE PAGO:</strong> ${presupuesto.formaPago || 'CONTADO'}</div>
        <div style="font-weight: 900 !important; color: ${crimson} !important; margin-top: 2px !important;">***DOCUMENTO SIN VALOR FISCAL***</div>
        <div style="font-weight: 800 !important; color: #475569 !important; font-size: 9px !important; margin-top: 1px !important;">
          NOTA: ESTOS COSTOS SON APROXIMADOS POR POSIBLES PARTES EXTRAS DAÑADAS
        </div>
      </div>

      <!-- Total Box -->
      <div style="border: 2px solid #1E293B !important; border-radius: 6px !important; overflow: hidden !important; min-width: 180px !important; text-align: right !important;">
        <div style="background-color: #1E293B !important; color: #FFFFFF !important; font-weight: 900 !important; font-size: 11px !important; padding: 4px 10px !important; text-align: center !important; text-transform: uppercase !important;">
          Total
        </div>
        <div style="padding: 8px 12px !important; font-size: 18px !important; font-weight: 900 !important; color: #0F172A !important; font-family: monospace !important; background-color: #F1F5F9 !important;">
          $${presupuesto.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>

    <!-- Terms & Signatures -->
    <div style="display: grid !important; grid-template-columns: 1.2fr 1fr 1.2fr !important; gap: 8px !important; border-top: 1.5px solid #CBD5E1 !important; pt: 8px !important; font-size: 8.5px !important; color: #334155 !important;">
      <div style="border: 1px solid #CBD5E1 !important; border-radius: 4px !important; padding: 6px !important; background-color: #F8FAFC !important;">
        <strong style="color: #0F172A !important; display: block !important; margin-bottom: 2px !important;">VALIDEZ DEL PRESUPUESTO</strong>
        ESTE PRESUPUESTO TIENE UNA VALIDEZ DE ${presupuesto.validezDias || 12} DÍAS HÁBILES. SE ENTREGARÁ EL VEHÍCULO PASADOS ${presupuesto.diasEntrega || '___'} DÍAS. ACEPTO EL PRESUPUESTO.
      </div>
      <div style="border: 1px solid #CBD5E1 !important; border-radius: 4px !important; padding: 6px !important; background-color: #F8FAFC !important;">
        <strong style="color: #0F172A !important; display: block !important; margin-bottom: 2px !important;">PIEZAS SUSTITUIDAS</strong>
        Renuncio a recoger las piezas sustituidas a mi vehículo.
      </div>
      <div style="border: 1px solid #CBD5E1 !important; border-radius: 4px !important; padding: 6px !important; background-color: #F8FAFC !important;">
        <strong style="color: #0F172A !important; display: block !important; margin-bottom: 2px !important;">CONFORMIDAD DEL CLIENTE</strong>
        El cliente declara conocer y aceptar el contenido del presupuesto, firmando este documento como prueba de su plena conformidad.
      </div>
    </div>
  `;
}

/**
 * Returns the raw HTML string representing the official SAE reception form,
 * styled exactly like the physical paper.
 */
export function getSaeHtml(
  order: ServiceOrder,
  client: Client | undefined,
  vehicle: Vehicle | undefined,
  employees: Employee[]
): string {
  // Find employee names
  const advisorName = employees.find(e => e.id === order.advisorId)?.name || 'Asesor de Guardia';
  const mechanicName = order.tecnico || employees.find(e => e.id === order.mechanicId)?.name || 'Mecánico Asignado';

  // Get date and time
  const dateStr = order.fecha || order.dateOpened.split(' ')[0] || new Date().toISOString().split('T')[0];
  const timeStr = order.hora || (order.dateOpened.split(' ').length > 1 ? order.dateOpened.split(' ')[1].substring(0, 5) : '10:00');

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

  return `
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
}

/**
 * Downloads the SAE work order as a beautiful high-fidelity PDF.
 */
export async function generateSaePdf(
  order: ServiceOrder,
  client: Client | undefined,
  vehicle: Vehicle | undefined,
  employees: Employee[]
): Promise<void> {
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
  container.style.opacity = '0.99';
  container.style.pointerEvents = 'none';

  container.innerHTML = getSaeHtml(order, client, vehicle, employees);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const imgWidth = 216;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    const filename = `Orden_SAE_Folio_${order.folio || order.id.replace('OS-', '')}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating SAE Order PDF:', error);
    alert('Ocurrió un error al generar el PDF. Por favor reintente.');
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generates and returns a PDF file binary as a Blob.
 */
export async function generateSaePdfBlob(
  order: ServiceOrder,
  client: Client | undefined,
  vehicle: Vehicle | undefined,
  employees: Employee[]
): Promise<Blob | null> {
  const container = document.createElement('div');
  container.id = 'sae-pdf-render-root-pdf-blob';
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
  container.style.opacity = '0.99';
  container.style.pointerEvents = 'none';

  container.innerHTML = getSaeHtml(order, client, vehicle, employees);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const imgWidth = 216;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating SAE PDF blob:', error);
    return null;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generates and returns a PNG Image file binary as a Blob.
 */
export async function generateSaeImageBlob(
  order: ServiceOrder,
  client: Client | undefined,
  vehicle: Vehicle | undefined,
  employees: Employee[]
): Promise<Blob | null> {
  const container = document.createElement('div');
  container.id = 'sae-pdf-render-root-image';
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
  container.style.opacity = '0.99';
  container.style.pointerEvents = 'none';

  container.innerHTML = getSaeHtml(order, client, vehicle, employees);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false
    });
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error generating SAE image blob:', error);
    return null;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Downloads the SAE work order as a high-fidelity PNG image.
 */
export async function downloadSaeImage(
  order: ServiceOrder,
  client: Client | undefined,
  vehicle: Vehicle | undefined,
  employees: Employee[]
): Promise<void> {
  const blob = await generateSaeImageBlob(order, client, vehicle, employees);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Orden_SAE_Folio_${order.folio || order.id.replace('OS-', '')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies the SAE work order image directly into the user's Clipboard.
 * This allows quick "Paste (Ctrl+V)" inside WhatsApp Web or Email clients.
 */
export async function copySaeImageToClipboard(
  order: ServiceOrder,
  client: Client | undefined,
  vehicle: Vehicle | undefined,
  employees: Employee[]
): Promise<boolean> {
  try {
    const blob = await generateSaeImageBlob(order, client, vehicle, employees);
    if (!blob) return false;

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);
    return true;
  } catch (error) {
    console.error('Error copying SAE image to clipboard:', error);
    return false;
  }
}

/**
 * Shares the document using the native Web Share API (mostly on mobile devices).
 */
export async function shareSaeOrderMobile(
  order: ServiceOrder,
  client: Client | undefined,
  vehicle: Vehicle | undefined,
  employees: Employee[],
  type: 'pdf' | 'png' = 'pdf'
): Promise<boolean> {
  try {
    if (type === 'pdf') {
      const pdfBlob = await generateSaePdfBlob(order, client, vehicle, employees);
      if (!pdfBlob) return false;
      const file = new File(
        [pdfBlob],
        `Orden_SAE_Folio_${order.folio || order.id.replace('OS-', '')}.pdf`,
        { type: 'application/pdf' }
      );
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Orden SAE Folio ${order.folio || order.id.replace('OS-', '')}`,
          text: `Te compartimos la Orden de Entrada Digital de tu vehículo en SAE.`
        });
        return true;
      }
    } else {
      const pngBlob = await generateSaeImageBlob(order, client, vehicle, employees);
      if (!pngBlob) return false;
      const file = new File(
        [pngBlob],
        `Orden_SAE_Folio_${order.folio || order.id.replace('OS-', '')}.png`,
        { type: 'image/png' }
      );
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Orden SAE Folio ${order.folio || order.id.replace('OS-', '')}`,
          text: `Te compartimos la imagen de tu Orden de Entrada Digital de tu vehículo en SAE.`
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error using Web Share API:', error);
    return false;
  }
}

export async function generateSaePresupuestoPdfBlob(presupuesto: Presupuesto): Promise<Blob | null> {
  const container = document.createElement('div');
  container.id = 'sae-pdf-render-root-presupuesto';
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
  container.style.opacity = '0.99';
  container.style.pointerEvents = 'none';

  container.innerHTML = getSaePresupuestoHtml(presupuesto);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating Presupuesto PDF blob:', error);
    return null;
  } finally {
    document.body.removeChild(container);
  }
}

export async function downloadSaePresupuestoPdf(presupuesto: Presupuesto): Promise<void> {
  const pdfBlob = await generateSaePresupuestoPdfBlob(presupuesto);
  if (!pdfBlob) return;
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Presupuesto_SAE_Folio_${presupuesto.numero}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareSaePresupuestoMobile(presupuesto: Presupuesto): Promise<boolean> {
  try {
    const pdfBlob = await generateSaePresupuestoPdfBlob(presupuesto);
    if (!pdfBlob) return false;
    const file = new File(
      [pdfBlob],
      `Presupuesto_SAE_Folio_${presupuesto.numero}.pdf`,
      { type: 'application/pdf' }
    );
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Presupuesto SAE Folio ${presupuesto.numero}`,
        text: `Te compartimos el Presupuesto oficial de tu vehículo en Servicio Automotriz Especializado (SAE).`
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sharing Presupuesto mobile:', error);
    return false;
  }
}

/**
 * Returns the raw HTML string representing the official SAE Orden de Reparación form,
 * matching the paper document.
 */
export function getSaeOrdenDeReparacionHtml(orden: OrdenReparacion): string {
  const crimson = '#A21C26';

  return `
    <!-- Top Bar with Notice and Title -->
    <div style="display: flex !important; justify-content: space-between !important; align-items: flex-start !important; margin-bottom: 12px !important; border-bottom: 2px solid ${crimson} !important; padding-bottom: 10px !important; background-color: transparent !important;">
      
      <!-- Red Notice Box matching paper document -->
      <div style="border: 2px solid ${crimson} !important; background-color: #FFF5F5 !important; padding: 8px 12px !important; border-radius: 6px !important; max-width: 360px !important; font-size: 8.5px !important; font-weight: 800 !important; color: ${crimson} !important; line-height: 1.3 !important; text-transform: uppercase !important;">
        RECUERDA QUE LAS REFACCIONES QUE SE UTILICEN DEBEN SER ANOTADAS AL REVERZO DE LA HOJA, LAS QUE SE COMPRARON Y LAS QUE SE EXTRAJERON DEL ALMACEN.
      </div>

      <!-- Workshop Info & Title -->
      <div style="text-align: right !important; font-size: 9.5px !important; color: #1F2937 !important; line-height: 1.3 !important;">
        <div style="font-weight: 900 !important; font-size: 22px !important; color: ${crimson} !important; letter-spacing: 0.5px !important;">
          ORDEN DE REPARACIÓN
        </div>
        <div style="font-weight: 800 !important; font-size: 13px !important; color: #111827 !important; margin-top: 2px !important;">
          Número: <span style="color: ${crimson} !important;">${orden.numero}</span> &nbsp;&nbsp;|&nbsp;&nbsp; Fecha: <span>${orden.fecha}</span>
        </div>
        <div style="font-weight: 600 !important; margin-top: 2px !important;">Mixtecas Mz.52 Lt.17 Esquina Rey Tepalcatzin</div>
        <div>Col. Ajusco Alcaldía Coyoacán C.P. 04300 C.D.M.X.</div>
        <div style="font-weight: 700 !important; color: #111827 !important;">Tel: 55 4632 6652 y 55 3917 7754 Cel: 55 1384 6680</div>
        <div style="font-weight: 700 !important; color: ${crimson} !important; margin-top: 2px !important;">Atención Personal: ${orden.asesor || 'Alberto Flores Hdz.'}</div>
      </div>
    </div>

    <!-- Vehicle & Client Main Header Card -->
    <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; margin-bottom: 12px !important; border: 1.5px solid #D1D5DB !important; border-radius: 8px !important; padding: 10px 12px !important; background-color: #FAFAFA !important; font-size: 11px !important; color: #111827 !important;">
      <!-- Column 1: Client Info -->
      <div style="display: flex !important; flex-direction: column !important; gap: 4px !important;">
        <div><strong style="color: #111827 !important;">CLIENTE:</strong> <span style="font-weight: 700 !important; color: #111827 !important;">${orden.clienteNombre}</span></div>
        <div><strong>Calle:</strong> ${orden.clienteCalle || ''}</div>
        <div><strong>C.P./Colonia:</strong> ${orden.clienteCpColonia || ''}</div>
        <div><strong>Alcaldía:</strong> ${orden.clienteAlcaldia || ''}</div>
        <div><strong>Teléfono:</strong> ${orden.clienteTelefono || ''}</div>
      </div>

      <!-- Column 2: Vehicle Info -->
      <div style="display: flex !important; flex-direction: column !important; gap: 4px !important;">
        <div><strong>Matrícula / VIN:</strong> <strong style="color: ${crimson} !important;">${orden.matriculaVin}</strong></div>
        <div><strong>Marca/Motor:</strong> ${orden.marcaMotor}</div>
        <div><strong>Modelo/Color:</strong> ${orden.modeloColor}</div>
        <div><strong>Kilómetros:</strong> ${orden.kilometros ? orden.kilometros.toLocaleString() : ''} Kms.</div>
      </div>
    </div>

    <!-- Quality Check & Revisions Section -->
    <div style="margin-bottom: 12px !important; border: 1px solid #CBD5E1 !important; border-radius: 6px !important; padding: 8px 12px !important; background-color: #F8FAFC !important; font-size: 9.5px !important; font-weight: 700 !important; color: #334155 !important; display: flex !important; flex-direction: column !important; gap: 6px !important;">
      <div style="display: flex !important; justify-content: space-between !important; border-bottom: 1px dashed #CBD5E1 !important; padding-bottom: 4px !important;">
        <span>ROTACIÓN Y PRESIÓN DE AIRE A LLANTAS:</span>
        <span style="color: #0F172A !important; font-weight: 800 !important;">${orden.rotacionAireLlantas || '_____________________________________'}</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important; border-bottom: 1px dashed #CBD5E1 !important; padding-bottom: 4px !important;">
        <span>REV. LIMPIA PARABRISAS Y CHISGUETEROS:</span>
        <span style="color: #0F172A !important; font-weight: 800 !important;">${orden.revLimpiaParabrisas || '_____________________________________'}</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important;">
        <span>REV. DE LUCES Y NIVELES EN GENERAL:</span>
        <span style="color: #0F172A !important; font-weight: 800 !important;">${orden.revLucesNivelesEngral || '_____________________________________'}</span>
      </div>
    </div>

    <!-- Items Table -->
    <div style="margin-bottom: 15px !important; border: 1.5px solid #1E293B !important; border-radius: 6px !important; overflow: hidden !important;">
      <table style="width: 100% !important; border-collapse: collapse !important; font-size: 10px !important;">
        <thead>
          <tr style="background-color: #1E293B !important; color: #FFFFFF !important; font-weight: 800 !important; text-transform: uppercase !important;">
            <th style="padding: 6px 8px !important; text-align: left !important; width: 80px !important; border-right: 1px solid #334155 !important;">Marca</th>
            <th style="padding: 6px 8px !important; text-align: left !important; border-right: 1px solid #334155 !important;">Repuestos / Trabajos</th>
            <th style="padding: 6px 8px !important; text-align: center !important; width: 60px !important;">Cant.</th>
          </tr>
        </thead>
        <tbody>
          ${orden.items.map((item, idx) => `
            <tr style="border-bottom: 1px solid #E2E8F0 !important; background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'} !important; color: #0F172A !important;">
              <td style="padding: 5px 8px !important; font-weight: 700 !important; font-family: monospace !important; border-right: 1px solid #E2E8F0 !important;">${item.codigo || ''}</td>
              <td style="padding: 5px 8px !important; border-right: 1px solid #E2E8F0 !important;">${item.descripcion}</td>
              <td style="padding: 5px 8px !important; text-align: center !important; font-weight: 800 !important;">${item.cantidad}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Footer Signatures -->
    <div style="margin-top: 25px !important; display: flex !important; justify-content: space-between !important; align-items: flex-end !important; font-size: 11px !important; font-weight: 800 !important; color: #0F172A !important; padding-top: 15px !important;">
      <div>
        <span>TECNICO: </span>
        <span style="border-bottom: 1.5px solid #0F172A !important; padding-bottom: 2px !important; display: inline-block !important; width: 280px !important;">
          ${orden.tecnico || ''}
        </span>
      </div>
      <div>
        <span>ASESOR / RECEPCIÓN: </span>
        <span style="border-bottom: 1.5px solid #0F172A !important; padding-bottom: 2px !important; display: inline-block !important; width: 200px !important; text-align: center !important;">
          ${orden.asesor || 'Alberto Flores Hdz.'}
        </span>
      </div>
    </div>
  `;
}

export async function generateSaeOrdenDeReparacionPdfBlob(orden: OrdenReparacion): Promise<Blob | null> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '210mm';
  container.style.padding = '12mm';
  container.style.backgroundColor = '#FFFFFF';
  container.style.fontFamily = "'Arial', sans-serif";
  container.innerHTML = getSaeOrdenDeReparacionHtml(orden);

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating Orden de Reparación PDF blob:', error);
    return null;
  } finally {
    document.body.removeChild(container);
  }
}

export async function downloadSaeOrdenDeReparacionPdf(orden: OrdenReparacion): Promise<void> {
  const pdfBlob = await generateSaeOrdenDeReparacionPdfBlob(orden);
  if (!pdfBlob) return;
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Orden_de_Reparacion_SAE_Numero_${orden.numero}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareSaeOrdenDeReparacionMobile(orden: OrdenReparacion): Promise<boolean> {
  try {
    const pdfBlob = await generateSaeOrdenDeReparacionPdfBlob(orden);
    if (!pdfBlob) return false;
    const file = new File(
      [pdfBlob],
      `Orden_de_Reparacion_SAE_Numero_${orden.numero}.pdf`,
      { type: 'application/pdf' }
    );
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Órden de Reparación SAE Número ${orden.numero}`,
        text: `Te compartimos la Órden de Reparación oficial de tu vehículo en Servicio Automotriz Especializado (SAE).`
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sharing Orden de Reparación mobile:', error);
    return false;
  }
}

/**
 * Returns raw HTML string representing the official SAE Nota de Salida form,
 * matching physical paper format (Folio/Salida 187).
 */
export function getSaeNotaSalidaHtml(nota: NotaSalida): string {
  const crimson = '#A21C26';

  return `
    <!-- Header Section -->
    <div style="display: flex !important; justify-content: space-between !important; align-items: flex-start !important; margin-bottom: 15px !important; border-bottom: 2px solid ${crimson} !important; padding-bottom: 12px !important; background-color: transparent !important;">
      <div style="display: flex !important; flex-direction: column !important; gap: 4px !important; background-color: transparent !important;">
        <!-- SAE Logo -->
        <div style="display: flex !important; align-items: center !important; gap: 10px !important;">
          <div style="font-family: 'Inter', sans-serif !important; font-weight: 900 !important; font-style: italic !important; font-size: 38px !important; color: ${crimson} !important; letter-spacing: -2px !important; line-height: 1 !important;">
            SAE
          </div>
          <div style="font-size: 9px !important; color: ${crimson} !important; font-weight: 700 !important; max-width: 200px !important; line-height: 1.2 !important;">
            Servicio Automotriz Especializado<br/>
            <span style="font-size: 8px !important; font-weight: 900 !important;">¡¡¡LA ESCUDERÍA QUE TE LLEVA SEGURO A TU DESTINO!!!</span>
          </div>
        </div>
        <div style="font-weight: 900 !important; font-size: 28px !important; color: ${crimson} !important; letter-spacing: 1px !important; margin-top: 4px !important;">
          SALIDA
        </div>
      </div>

      <!-- Workshop Info & Folio -->
      <div style="text-align: right !important; font-size: 9.5px !important; color: #1F2937 !important; line-height: 1.3 !important;">
        <div style="font-weight: 600 !important;">Mixtecas Mz.52 Lt.17 Esquina Rey Tepalcatzin</div>
        <div>Col. Ajusco Alcaldia Coyoacan C.P.04300 C.D.M.X.</div>
        <div style="font-weight: 700 !important; color: #111827 !important; margin-top: 2px !important;">Tel:55 4632 6652 y 55 3917 7754 Cel:55 1384 6680</div>
        <div style="font-weight: 700 !important; color: ${crimson} !important; margin-top: 2px !important;">Atención Personal: ${nota.asesor || 'Alberto Flores Hdz.'}</div>
        <div style="font-weight: 800 !important; font-size: 10px !important; color: #111827 !important;">Asesor De Servicios</div>
        
        <div style="display: flex !important; justify-content: flex-end !important; gap: 15px !important; margin-top: 8px !important; font-size: 12px !important; font-weight: 900 !important;">
          <span>Número: <strong style="color: ${crimson} !important; font-size: 14px !important;">${nota.numero}</strong></span>
          <span>Fecha: <strong style="color: #111827 !important;">${nota.fecha}</strong></span>
        </div>
      </div>
    </div>

    <!-- Cliente & Vehiculo Header Grid -->
    <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; margin-bottom: 12px !important; border: 1.5px solid #D1D5DB !important; border-radius: 8px !important; padding: 10px 12px !important; background-color: #FAFAFA !important; font-size: 11px !important; color: #111827 !important;">
      <!-- Column 1: Cliente -->
      <div style="display: flex !important; flex-direction: column !important; gap: 4px !important;">
        <div><strong style="color: #111827 !important;">CLIENTE:</strong> <span style="font-weight: 800 !important; color: #111827 !important;">${nota.clienteNombre}</span></div>
        <div><strong>Calle:</strong> ${nota.clienteCalle}</div>
        <div><strong>C.P./Colonia:</strong> ${nota.clienteCpColonia}</div>
        <div><strong>Alcaldia:</strong> ${nota.clienteAlcaldia}</div>
        <div><strong>Telefono:</strong> ${nota.clienteTelefono}</div>
      </div>

      <!-- Column 2: Vehículo -->
      <div style="display: flex !important; flex-direction: column !important; gap: 4px !important;">
        <div><strong>Marca/Motor:</strong> ${nota.marcaMotor}</div>
        <div><strong>Modelo/Color:</strong> ${nota.modeloColor}</div>
        <div><strong>Matrícula:</strong> <strong style="color: #111827 !important;">${nota.matriculaVin}</strong></div>
        <div><strong>Kilometros:</strong> ${nota.kilometros ? nota.kilometros.toLocaleString() : ''}</div>
      </div>
    </div>

    <!-- Items Table -->
    <div style="margin-bottom: 12px !important; border: 1.5px solid #1E293B !important; border-radius: 6px !important; overflow: hidden !important;">
      <table style="width: 100% !important; border-collapse: collapse !important; font-size: 10px !important;">
        <thead>
          <tr style="background-color: #1E293B !important; color: #FFFFFF !important; font-weight: 800 !important; text-transform: uppercase !important;">
            <th style="padding: 6px 8px !important; text-align: left !important; width: 70px !important; border-right: 1px solid #334155 !important;">Código</th>
            <th style="padding: 6px 8px !important; text-align: left !important; border-right: 1px solid #334155 !important;">Repuestos</th>
            <th style="padding: 6px 8px !important; text-align: center !important; width: 50px !important; border-right: 1px solid #334155 !important;">Cant.</th>
            <th style="padding: 6px 8px !important; text-align: right !important; width: 80px !important; border-right: 1px solid #334155 !important;">Importe. U</th>
            <th style="padding: 6px 8px !important; text-align: right !important; width: 90px !important;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${nota.items.map((item, idx) => `
            <tr style="border-bottom: 1px solid #E2E8F0 !important; background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'} !important; color: #0F172A !important;">
              <td style="padding: 5px 8px !important; font-weight: 700 !important; font-family: monospace !important; border-right: 1px solid #E2E8F0 !important;">${item.codigo || ''}</td>
              <td style="padding: 5px 8px !important; border-right: 1px solid #E2E8F0 !important;">${item.descripcion}</td>
              <td style="padding: 5px 8px !important; text-align: center !important; font-weight: 700 !important; border-right: 1px solid #E2E8F0 !important;">${item.cantidad}</td>
              <td style="padding: 5px 8px !important; text-align: right !important; border-right: 1px solid #E2E8F0 !important;">${item.importeUnitario.toFixed(2)}</td>
              <td style="padding: 5px 8px !important; text-align: right !important; font-weight: 800 !important;">${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Footer & Totals -->
    <div style="display: flex !important; justify-content: space-between !important; align-items: flex-start !important; gap: 15px !important; margin-bottom: 12px !important;">
      <div style="font-size: 10px !important; color: #1E293B !important; line-height: 1.5 !important; flex: 1 !important;">
        <div><strong>FORMA DE PAGO:</strong> ${nota.formaPago || 'CONTADO'}</div>
        <div style="font-weight: 900 !important; color: ${crimson} !important; margin-top: 2px !important;">***DOCUMENTO SIN VALOR FISCAL***</div>
        <div style="font-weight: 800 !important; color: #111827 !important; font-size: 9.5px !important; margin-top: 3px !important;">
          GARANTIA: ${nota.garantia || '30 DIAS Ó 2,000 KMS. LO QUE OCURRA PRIMERO'} &nbsp;&nbsp;&nbsp; ORD. DE SERV. # ${nota.ordenServicioNumero || '378A'}
        </div>
      </div>

      <!-- Total Box -->
      <div style="border: 2px solid #1E293B !important; border-radius: 6px !important; overflow: hidden !important; min-width: 180px !important; text-align: right !important;">
        <div style="background-color: #1E293B !important; color: #FFFFFF !important; font-weight: 900 !important; font-size: 11px !important; padding: 4px 10px !important; text-align: center !important; text-transform: uppercase !important;">
          Total
        </div>
        <div style="padding: 8px 12px !important; font-size: 18px !important; font-weight: 900 !important; color: #0F172A !important; font-family: monospace !important; background-color: #F1F5F9 !important;">
          $${nota.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  `;
}

export async function generateSaeNotaSalidaPdfBlob(nota: NotaSalida): Promise<Blob | null> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px'; // ~A4 width in px at 96 DPI
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#000000';
  container.style.padding = '30px';
  container.style.fontFamily = 'Inter, Arial, sans-serif';

  container.innerHTML = getSaeNotaSalidaHtml(nota);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating Nota de Salida PDF blob:', error);
    return null;
  } finally {
    document.body.removeChild(container);
  }
}

export async function downloadSaeNotaSalidaPdf(nota: NotaSalida): Promise<void> {
  const pdfBlob = await generateSaeNotaSalidaPdfBlob(nota);
  if (!pdfBlob) return;
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Nota_de_Salida_SAE_Numero_${nota.numero}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareSaeNotaSalidaMobile(nota: NotaSalida): Promise<boolean> {
  try {
    const pdfBlob = await generateSaeNotaSalidaPdfBlob(nota);
    if (!pdfBlob) return false;
    const file = new File(
      [pdfBlob],
      `Nota_de_Salida_SAE_Numero_${nota.numero}.pdf`,
      { type: 'application/pdf' }
    );
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Nota de Salida SAE Número ${nota.numero}`,
        text: `Te compartimos la Nota de Salida oficial de tu vehículo en Servicio Automotriz Especializado (SAE).`
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sharing Nota de Salida mobile:', error);
    return false;
  }
}
