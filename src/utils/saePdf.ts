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

  // Create a hidden container styled as a letter page
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.padding = '35px 40px';
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#111827';
  container.style.fontFamily = '"Inter", sans-serif';
  container.style.fontSize = '11px';
  container.style.lineHeight = '1.4';

  // Hex Colors
  const crimson = '#A21C26'; // exact rich crimson of the form
  const lightGrey = '#F3F4F6';

  // Checkbox helpers
  const renderCheck = (val: boolean | undefined) => {
    return `
      <div style="display: flex; gap: 15px; align-items: center;">
        <span style="display: flex; align-items: center; gap: 4px;">
          Sí <span style="display: inline-block; width: 13px; height: 13px; border: 1.5px solid ${crimson}; text-align: center; line-height: 10px; font-weight: bold; font-size: 10px;">${val ? 'X' : ''}</span>
        </span>
        <span style="display: flex; align-items: center; gap: 4px;">
          No <span style="display: inline-block; width: 13px; height: 13px; border: 1.5px solid ${crimson}; text-align: center; line-height: 10px; font-weight: bold; font-size: 10px;">${val === false ? 'X' : (!val ? 'X' : '')}</span>
        </span>
      </div>
    `;
  };

  container.innerHTML = `
    <!-- Header Section -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid ${crimson}; padding-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <!-- SAE Logo Representation -->
        <div style="font-family: 'Inter', sans-serif; font-weight: 900; font-style: italic; font-size: 40px; color: ${crimson}; letter-spacing: -2px; line-height: 1;">
          SAE
        </div>
        <div style="display: flex; flex-col; justify-content: center;">
          <div style="font-weight: 800; font-size: 12px; color: ${crimson}; text-transform: uppercase; tracking: 0.5px;">
            SERVICIO AUTOMOTRIZ ESPECIALIZADO
          </div>
          <div style="font-size: 10px; color: #1D4ED8; font-weight: 700; font-style: italic;">
            ¡La escudería que te lleva seguro a tu destino!
          </div>
        </div>
      </div>
      
      <!-- Folio box -->
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-weight: bold; font-size: 13px; color: #1F2937;">Folio</span>
        <div style="border: 2px solid ${crimson}; border-radius: 12px; padding: 6px 14px; font-weight: 800; font-size: 16px; color: ${crimson}; background-color: #FEF2F2; font-family: monospace; min-width: 90px; text-align: center;">
          ${order.folio || order.id.replace('OS-', '')}
        </div>
      </div>
    </div>

    <!-- Section 1: Datos del Cliente -->
    <div style="margin-bottom: 12px;">
      <div style="background-color: ${crimson}; color: white; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 15px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
        <span style="background-color: white; color: ${crimson}; width: 15px; height: 15px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900;">1</span>
        DATOS DEL CLIENTE
      </div>
      <div style="display: grid; grid-template-columns: 3.5fr 2.5fr; gap: 6px; padding: 0 5px;">
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <div><strong>Cliente:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 80%; padding-bottom: 1px;">${client?.name || ''}</span></div>
          <div><strong>Tel. Cel:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 78%; padding-bottom: 1px;">${client?.phone || ''}</span></div>
          <div><strong>Calle:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 84%; padding-bottom: 1px;">${client?.calle || client?.address || ''}</span></div>
          <div><strong>Colonia:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 81%; padding-bottom: 1px;">${client?.colonia || ''}</span></div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <div><strong>E-Mail:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 80%; padding-bottom: 1px;">${client?.email || ''}</span></div>
          <div><strong>Tel:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 86%; padding-bottom: 1px;">${client?.telFijo || ''}</span></div>
          <div><strong>C.P.:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 86%; padding-bottom: 1px;">${client?.cp || ''}</span></div>
          <div><strong>Alcaldía:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 78%; padding-bottom: 1px;">${client?.alcaldia || ''}</span></div>
        </div>
      </div>
    </div>

    <!-- Section 2: Datos del Auto -->
    <div style="margin-bottom: 12px;">
      <div style="background-color: ${crimson}; color: white; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 15px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
        <span style="background-color: white; color: ${crimson}; width: 15px; height: 15px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900;">2</span>
        DATOS DEL AUTO
      </div>
      
      <!-- Grid principal de auto -->
      <div style="display: grid; grid-template-columns: 2fr 2fr 2fr; gap: 6px; margin-bottom: 8px; padding: 0 5px;">
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <div><strong>Auto:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 75%; padding-bottom: 1px;">${vehicle?.brand || ''}</span></div>
          <div><strong>No. de Serie:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 50%; padding-bottom: 1px; font-family: monospace; font-size: 9px;">${vehicle?.serie || vehicle?.vin || ''}</span></div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <div><strong>Modelo:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 70%; padding-bottom: 1px;">${vehicle?.model || ''} (${vehicle?.year || ''})</span></div>
          <div><strong>Motor:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 72%; padding-bottom: 1px; font-family: monospace; font-size: 9px;">${vehicle?.motor || ''}</span></div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <div><strong>Placas:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 72%; padding-bottom: 1px; font-weight: bold;">${vehicle?.plate || ''}</span></div>
          <div><strong>Kms:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 75%; padding-bottom: 1px;">${vehicle?.mileage ? vehicle.mileage.toLocaleString() : ''}</span></div>
          <div><strong>Color:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 70%; padding-bottom: 1px;">${vehicle?.color || ''}</span></div>
        </div>
      </div>

      <!-- Checklist de Inventario (Dos columnas simétricas) -->
      <div style="border: 1.5px solid ${crimson}; border-radius: 8px; padding: 8px; background-color: #FFFDFD; margin-bottom: 6px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <!-- Columna Izquierda -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Tapetes</span>
              ${renderCheck(order.checklist.tapetes)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Encendedor</span>
              ${renderCheck(order.checklist.encendedor)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Estéreo</span>
              ${renderCheck(order.checklist.estereo)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Tarjeta de Circulación</span>
              ${renderCheck(order.checklist.tarjetaCirculacion)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Comp. de Verificación</span>
              ${renderCheck(order.checklist.compVerificacion)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Póliza de seguro</span>
              ${renderCheck(order.checklist.polizaSeguro)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 2px;">
              <span>Seguros de Ruedas</span>
              ${renderCheck(order.checklist.segurosRuedas)}
            </div>
          </div>

          <!-- Columna Derecha -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Gato</span>
              ${renderCheck(order.checklist.gato || order.checklist.jack)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Herramienta</span>
              ${renderCheck(order.checklist.herramienta || order.checklist.tools)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Extintor</span>
              ${renderCheck(order.checklist.extintor || order.checklist.extinguisher)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Llanta de refacción</span>
              ${renderCheck(order.checklist.llantaRefaccion || order.checklist.spareTire)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Sensores de presencia</span>
              ${renderCheck(order.checklist.sensoresPresencia)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #E5E7EB; padding-bottom: 2px;">
              <span>Cámara de Reversa</span>
              ${renderCheck(order.checklist.camaraReversa)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 2px;">
              <span style="font-weight: bold; color: ${crimson};">Nivel de Combustible:</span>
              <span style="font-weight: bold; color: ${crimson}; font-family: monospace;">${order.checklist.fuelLevel}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Motor y Valores lines -->
      <div style="display: flex; flex-direction: column; gap: 5px; padding: 0 5px;">
        <div><strong>Inspección Componentes de Motor:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 73%; padding-bottom: 1px;">${order.checklist.inspeccionMotor || 'Inspección visual conforme a protocolo'}</span></div>
        <div><strong>Objetos de Valor:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 85%; padding-bottom: 1px;">${order.checklist.objetosValor || 'Ninguno reportado'}</span></div>
      </div>
    </div>

    <!-- Section 3: Descripción del Servicio -->
    <div style="margin-bottom: 12px;">
      <div style="background-color: ${crimson}; color: white; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 15px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
        <span style="background-color: white; color: ${crimson}; width: 15px; height: 15px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900;">3</span>
        DESCRIPCIÓN DEL SERVICIO
      </div>
      
      <!-- Falla o Servicio Reportado -->
      <div style="border: 1px solid #D1D5DB; border-radius: 6px; padding: 10px; min-height: 75px; background-color: #FAFBFB; margin-bottom: 8px; font-size: 11px;">
        <div style="font-weight: bold; color: ${crimson}; margin-bottom: 4px; border-bottom: 1px solid #F3F4F6; padding-bottom: 2px;">Falla Reportada / Síntomas:</div>
        <p style="margin: 0; white-space: pre-wrap; font-style: italic; line-height: 1.4;">${order.reportedFailure}</p>
      </div>

      <!-- Date, Time and Technical assignment footer of Section 3 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 0 5px;">
        <div><strong>Fecha:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 75%; padding-bottom: 1px; font-family: monospace;">${dateStr}</span></div>
        <div><strong>Hora:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 75%; padding-bottom: 1px; font-family: monospace;">${timeStr} hrs</span></div>
        <div><strong>Técnico:</strong> <span style="border-bottom: 1px solid #9CA3AF; display: inline-block; width: 70%; padding-bottom: 1px;">${mechanicName}</span></div>
      </div>
    </div>

    <!-- Section 4: Condiciones del Servicio -->
    <div style="margin-bottom: 12px;">
      <div style="background-color: ${crimson}; color: white; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 15px; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
        <span style="background-color: white; color: ${crimson}; width: 15px; height: 15px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900;">4</span>
        CONDICIONES DEL SERVICIO
      </div>
      
      <!-- 10 service points from the paper image, formatted in a small font two-column or compact layout -->
      <div style="font-size: 7.5px; line-height: 1.25; color: #374151; margin-bottom: 10px; text-align: justify; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border: 1px solid #E5E7EB; padding: 8px; border-radius: 6px; background-color: #FCFCFC;">
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div><strong>1.</strong> Este documento no tiene validez como comprobante fiscal.</div>
          <div><strong>2.</strong> Presente este comprobante para cualquier aclaración o ajuste posterior.</div>
          <div><strong>3.</strong> La empresa no se hace responsable por objetos de valor olvidados en el vehículo que no sean reportados a la administración.</div>
          <div><strong>4.</strong> Si el automóvil requiere prueba de camino, el costo de la gasolina será cubierto por el cliente.</div>
          <div><strong>5.</strong> En caso de accidente automovilístico y/o siniestro, el cliente autoriza hacer uso de la póliza del seguro del vehículo.</div>
          <div><strong>6.</strong> El costo por revisión y diagnóstico es de $350.00 (trescientos cincuenta pesos 00/100 M.N.) por hora. Para esta revisión se consideran <span style="border-bottom: 1px solid #000; padding: 0 4px; font-weight: bold;">1.5</span> horas. <br/>El cliente firma de conformidad: ___________________________</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div><strong>7.</strong> En caso de que el presupuesto no sea aceptado, el cliente pagará exclusivamente el costo por revisión y diagnóstico.</div>
          <div><strong>8.</strong> El prestador de servicio se obliga a devolver el automóvil en las condiciones que le fue entregado, exceptuando las consecuencias inevitables del diagnóstico.</div>
          <div><strong>9.</strong> Se cobrarán $300.00 (trescientos pesos 00/100 M.N.) diarios por concepto de pensión si el auto no es recogido después de 24 horas de haber recibido la notificación de terminado el trabajo.</div>
          <div><strong>10.</strong> El cliente renuncia a recoger las partes usadas que fueron retiradas de la unidad, si no son solicitadas al momento de la entrega de su vehículo ____________________________</div>
        </div>
      </div>

      <!-- Signature section -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 15px; padding: 10px 40px 5px 40px;">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
          <div style="border-top: 1px solid #374151; width: 100%; margin-bottom: 3px; margin-top: 25px;"></div>
          <strong style="font-size: 9px; text-transform: uppercase;">Nombre y Firma del Cliente</strong>
          <span style="font-size: 8px; color: #6B7280;">(Acepto Condiciones y presupuesto)</span>
        </div>
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
          <div style="border-top: 1px solid #374151; width: 100%; margin-bottom: 3px; margin-top: 25px;"></div>
          <strong style="font-size: 9px; text-transform: uppercase;">Nombre y Firma de la Empresa</strong>
          <span style="font-size: 8px; color: #6B7280;">Asesor: ${advisorName}</span>
        </div>
      </div>
    </div>

    <!-- Page Footer with physical workshop details as in the paper image -->
    <div style="border-top: 2px solid ${crimson}; padding-top: 8px; margin-top: 12px; text-align: center; font-size: 8.5px; color: #4B5563; font-weight: 500; display: flex; flex-direction: column; gap: 3px;">
      <div style="font-weight: bold; color: #111827; font-size: 9px;">
        Mixtecas Mz. 52 Lt. 17 Esq. Rey TepalcatzinAjusco, Coyoacán. C.P. 04300 CDMX
      </div>
      <div style="display: flex; justify-content: center; gap: 15px; font-weight: bold;">
        <span>📞 55 4632 6652</span>
        <span>🟢 55 3917 7754 (WhatsApp)</span>
        <span>✉️ contacto@saecdmx.com</span>
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
