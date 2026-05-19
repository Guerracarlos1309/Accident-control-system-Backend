const PDFDocument = require('pdfkit');

class PdfGenerator {
  /**
   * Helper to draw a beautiful, standardized header on each page
   */
  static drawHeader(doc, title) {
    // Top colored accents (CORPOELEC theme: Blue and Red lines)
    doc.rect(0, 0, doc.page.width, 15).fill('#005C9E');
    doc.rect(0, 15, doc.page.width, 5).fill('#E30613');

    // Return fill color to black
    doc.fillColor('#333333');

    // Header Content
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#005C9E').text('CORPOELEC', 50, 40);
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#666666').text('CORPORACIÓN ELÉCTRICA NACIONAL', 50, 55);
    doc.font('Helvetica').fontSize(8).text('GERENCIA DE AMBIENTE, SEGURIDAD E HIGIENE OCUPACIONAL (ASHO)', 50, 67);

    // Document Title
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#E30613').text(title.toUpperCase(), 50, 90, { align: 'right' });
    
    // Thin separator line
    doc.moveTo(50, 110).lineTo(doc.page.width - 50, 110).lineWidth(1).strokeColor('#E0E0E0').stroke();
    
    // Reset positions
    doc.y = 130;
  }

  /**
   * Helper to draw a sleek footer
   */
  static drawFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Footer line
      doc.moveTo(50, doc.page.height - 50).lineTo(doc.page.width - 50, doc.page.height - 50).lineWidth(1).strokeColor('#E0E0E0').stroke();
      
      // Footer text
      doc.font('Helvetica').fontSize(7).fillColor('#999999');
      doc.text('Documento generado automáticamente por el Sistema de Control de Accidentes y Gestión ASHO.', 50, doc.page.height - 40);
      doc.text(`Página ${i + 1} de ${pageCount}`, doc.page.width - 150, doc.page.height - 40, { align: 'right' });
    }
  }

  /**
   * Helper to draw a beautiful structured grid panel / table
   */
  static drawPanel(doc, title, yPosition, height) {
    doc.rect(50, yPosition, doc.page.width - 100, height)
       .lineWidth(1)
       .strokeColor('#E0E0E0')
       .stroke();
       
    // Header band of the panel
    doc.rect(50, yPosition, doc.page.width - 100, 20)
       .fill('#F5F5F5');
       
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#005C9E').text(title.toUpperCase(), 60, yPosition + 6);
  }

  /**
   * 1. GENERATE PAYROLL (NOMINAS) REPORT PDF
   */
  static generatePayrollPdf(employees) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      this.drawHeader(doc, 'Reporte de Nómina de Personal (Roster)');

      // Summary Stats Block
      doc.rect(50, doc.y, doc.page.width - 100, 45).lineWidth(1).strokeColor('#005C9E').stroke();
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#005C9E').text('RESUMEN DE REGISTRO', 60, doc.y + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#333333').text(`Total Personal Activo: ${employees.length} trabajadores`, 60, doc.y + 24);
      doc.font('Helvetica').fontSize(9).text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, doc.page.width - 250, doc.y + 24, { align: 'right' });
      
      doc.y += 65;

      // Table Headers
      const startY = doc.y;
      doc.rect(50, startY, doc.page.width - 100, 20).fill('#005C9E');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
      doc.text('N° PERS.', 55, startY + 6);
      doc.text('CÉDULA', 110, startY + 6);
      doc.text('APELLIDOS Y NOMBRES', 180, startY + 6);
      doc.text('GERENCIA', 340, startY + 6);
      doc.text('CARGO / OCUPACIÓN', 450, startY + 6);

      doc.y = startY + 20;

      // Table Rows
      let isEven = false;
      employees.forEach((emp) => {
        // Page break if near bottom
        if (doc.y > doc.page.height - 80) {
          doc.addPage();
          this.drawHeader(doc, 'Reporte de Nómina de Personal (Roster)');
          
          // Re-draw headers
          const pageStartY = doc.y;
          doc.rect(50, pageStartY, doc.page.width - 100, 20).fill('#005C9E');
          doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
          doc.text('N° PERS.', 55, pageStartY + 6);
          doc.text('CÉDULA', 110, pageStartY + 6);
          doc.text('APELLIDOS Y NOMBRES', 180, pageStartY + 6);
          doc.text('GERENCIA', 340, pageStartY + 6);
          doc.text('CARGO / OCUPACIÓN', 450, pageStartY + 6);
          doc.y = pageStartY + 20;
        }

        const rowHeight = 22;
        if (isEven) {
          doc.rect(50, doc.y, doc.page.width - 100, rowHeight).fill('#F9F9F9');
        }
        
        doc.font('Helvetica').fontSize(8).fillColor('#333333');
        doc.text(emp.personalNumber || '-', 55, doc.y + 7);
        doc.text(emp.idCard || '-', 110, doc.y + 7);
        
        const fullName = `${emp.lastName || ''}, ${emp.firstName || ''}`.trim();
        doc.text(fullName.substring(0, 30), 180, doc.y + 7);
        
        const mgt = emp.management ? emp.management.name : '-';
        doc.text(mgt.substring(0, 22), 340, doc.y + 7);
        
        const job = emp.jobTitle ? emp.jobTitle.name : (emp.occupation ? emp.occupation.name : '-');
        doc.text(job.substring(0, 22), 450, doc.y + 7);

        doc.y += rowHeight;
        isEven = !isEven;
      });

      this.drawFooter(doc);
      doc.end();
    });
  }

  /**
   * 2. GENERATE DETAILED ACCIDENT REPORT PDF
   */
  static generateAccidentPdf(accident) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      this.drawHeader(doc, `Reporte Detallado de Accidente (N° ${accident.inpsaselFileNumber || accident.id})`);

      // PANEL 1: GENERAL INFORMATION
      const p1Y = doc.y;
      this.drawPanel(doc, 'Información General del Incidente', p1Y, 100);
      
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#333333');
      doc.text('Código Reporte:', 60, p1Y + 30);
      doc.font('Helvetica').text(accident.inpsaselFileNumber || `N/A (ID: ${accident.id})`, 140, p1Y + 30);

      doc.font('Helvetica-Bold').text('Fecha / Hora:', 60, p1Y + 45);
      const dateFormatted = accident.accidentDate ? new Date(accident.accidentDate).toLocaleDateString('es-ES') : '-';
      doc.font('Helvetica').text(`${dateFormatted} ${accident.accidentTime || ''}`, 140, p1Y + 45);

      doc.font('Helvetica-Bold').text('Gerencia Responsable:', 60, p1Y + 60);
      doc.font('Helvetica').text(accident.management ? accident.management.name : '-', 170, p1Y + 60);

      doc.font('Helvetica-Bold').text('Instalación:', 60, p1Y + 75);
      const facilityStr = accident.facility ? `${accident.facility.name} (${accident.facility.location ? accident.facility.location.name : ''})` : '-';
      doc.font('Helvetica').text(facilityStr, 140, p1Y + 75);

      // Column 2 inside panel 1
      doc.font('Helvetica-Bold').text('Tipo de Incidente:', 320, p1Y + 30);
      doc.font('Helvetica').text(accident.type ? accident.type.name : '-', 410, p1Y + 30);

      doc.font('Helvetica-Bold').text('Agente de Daño:', 320, p1Y + 45);
      doc.font('Helvetica').text(accident.damageAgent ? accident.damageAgent.name : '-', 400, p1Y + 45);

      doc.font('Helvetica-Bold').text('Tipo de Contacto:', 320, p1Y + 60);
      doc.font('Helvetica').text(accident.contactType ? accident.contactType.name : '-', 400, p1Y + 60);

      doc.font('Helvetica-Bold').text('Estatus Proceso:', 320, p1Y + 75);
      doc.font('Helvetica').fillColor('#E30613').text(accident.processStatus ? accident.processStatus.name : '-', 400, p1Y + 75);

      // PANEL 2: DESCRIPTION OF EVENT
      doc.y = p1Y + 115;
      const p2Y = doc.y;
      this.drawPanel(doc, 'Descripción Detallada del Evento', p2Y, 80);
      doc.font('Helvetica').fontSize(8.5).fillColor('#333333').text(accident.description || 'Sin descripción detallada.', 60, p2Y + 30, {
        width: doc.page.width - 120,
        align: 'justify',
        lineGap: 3
      });

      // PANEL 3: AFFECTED PERSONNEL
      doc.y = p2Y + 95;
      const p3Y = doc.y;
      this.drawPanel(doc, 'Personal Involucrado / Afectado', p3Y, 110);
      
      const employees = accident.involvedEmployees || [];
      if (employees.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(8.5).text('No se registraron lesionados.', 60, p3Y + 35);
      } else {
        // Table inside panel
        const tableStartY = p3Y + 28;
        doc.rect(55, tableStartY, doc.page.width - 110, 15).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('TRABAJADOR (CÉDULA / N° PERS.)', 60, tableStartY + 4);
        doc.text('GERENCIA', 230, tableStartY + 4);
        doc.text('LESION / DIAGNÓSTICO', 340, tableStartY + 4);
        doc.text('DÍAS REPOSO', 475, tableStartY + 4);

        doc.y = tableStartY + 15;
        employees.forEach((ie, idx) => {
          if (doc.y > doc.page.height - 80) {
            doc.addPage();
            this.drawHeader(doc, `Reporte Detallado de Accidente (N° ${accident.inpsaselFileNumber || accident.id})`);
            doc.y = 130;
          }
          
          const rowY = doc.y;
          if (idx % 2 === 1) {
            doc.rect(55, rowY, doc.page.width - 110, 18).fill('#F9F9F9');
          }
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          
          const empName = ie.employee ? `${ie.employee.lastName}, ${ie.employee.firstName} (${ie.employee.idCard})` : `N° ${ie.employeePersonalNumber}`;
          doc.text(empName.substring(0, 42), 60, rowY + 5);
          
          const empMgt = ie.employee && ie.employee.management ? ie.employee.management.name : '-';
          doc.text(empMgt.substring(0, 20), 230, rowY + 5);
          
          const injury = ie.injuryType ? `${ie.injuryType.name} (${ie.magnitude ? ie.magnitude.name : ''})` : '-';
          doc.text(injury.substring(0, 30), 340, rowY + 5);
          
          doc.text(ie.restDays ? String(ie.restDays) : '0', 485, rowY + 5);
          
          doc.y = rowY + 18;
        });
      }

      // PANEL 4: MEDICAL CENTER & OBSERVATIONS
      doc.y += 15;
      if (doc.y > doc.page.height - 130) {
        doc.addPage();
        this.drawHeader(doc, `Reporte Detallado de Accidente (N° ${accident.inpsaselFileNumber || accident.id})`);
      }
      
      const p4Y = doc.y;
      this.drawPanel(doc, 'Atención Médica y Observaciones del Centro', p4Y, 70);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#333333');
      doc.text('Centro de Atención:', 60, p4Y + 28);
      
      const centerName = accident.medicalCenter ? accident.medicalCenter.name : (accident.medicalCenterName || '-');
      doc.font('Helvetica').text(centerName, 150, p4Y + 28);

      doc.font('Helvetica-Bold').text('Dirección Centro:', 60, p4Y + 40);
      const centerAddr = accident.medicalCenter ? accident.medicalCenter.address : (accident.medicalCenterAddress || '-');
      doc.font('Helvetica').text(centerAddr, 140, p4Y + 40);

      doc.font('Helvetica-Bold').text('Observaciones Médicas:', 60, p4Y + 52);
      doc.font('Helvetica').text(accident.medicalObservations || '-', 160, p4Y + 52);

      // PANEL 5: WITNESSES & VERIFICATION
      doc.y = p4Y + 85;
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
        this.drawHeader(doc, `Reporte Detallado de Accidente (N° ${accident.inpsaselFileNumber || accident.id})`);
      }

      const p5Y = doc.y;
      this.drawPanel(doc, 'Testigos y Firmas de Control', p5Y, 80);
      
      const witnesses = accident.witnesses || [];
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#333333');
      doc.text('Testigos del Evento:', 60, p5Y + 28);
      
      if (witnesses.length === 0) {
        doc.font('Helvetica-Oblique').text('No se registraron testigos presenciales.', 60, p5Y + 40);
      } else {
        let wText = witnesses.map(w => `${w.name} (${w.idCard || 'S/C'})`).join(', ');
        doc.font('Helvetica').text(wText, 60, p5Y + 40, { width: doc.page.width - 120 });
      }

      // Add signature space
      doc.y = p5Y + 110;
      if (doc.y > doc.page.height - 120) {
        doc.addPage();
        this.drawHeader(doc, `Reporte Detallado de Accidente (N° ${accident.inpsaselFileNumber || accident.id})`);
        doc.y = 160;
      }
      
      const sigY = doc.y + 40;
      doc.moveTo(100, sigY).lineTo(230, sigY).lineWidth(1).strokeColor('#999999').stroke();
      doc.moveTo(doc.page.width - 230, sigY).lineTo(doc.page.width - 100, sigY).stroke();
      
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333');
      doc.text('REPRESENTANTE ASHO (FIRMA Y SELLO)', 85, sigY + 8);
      doc.text('DELEGADO DE PREVENCIÓN', doc.page.width - 225, sigY + 8);

      this.drawFooter(doc);
      doc.end();
    });
  }

  /**
   * 3. GENERATE DETAILED INSPECTION REPORT PDF
   */
  static generateInspectionPdf(inspection) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      this.drawHeader(doc, `Reporte de Inspección ASHO (N° ${inspection.inspectionNumber || inspection.id})`);

      // PANEL 1: GENERAL INFO
      const p1Y = doc.y;
      this.drawPanel(doc, 'Datos Generales de la Inspección', p1Y, 85);
      
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#333333');
      doc.text('Código Inspección:', 60, p1Y + 30);
      doc.font('Helvetica').text(inspection.inspectionNumber || `ID: ${inspection.id}`, 150, p1Y + 30);

      doc.font('Helvetica-Bold').text('Fecha Ejecución:', 60, p1Y + 45);
      const dateFormatted = inspection.date ? new Date(inspection.date).toLocaleDateString('es-ES') : '-';
      doc.font('Helvetica').text(dateFormatted, 140, p1Y + 45);

      doc.font('Helvetica-Bold').text('Inspector Responsable:', 60, p1Y + 60);
      const inspectorStr = inspection.inspector ? `${inspection.inspector.lastName}, ${inspection.inspector.firstName} (${inspection.inspector.personalNumber})` : '-';
      doc.font('Helvetica').text(inspectorStr, 165, p1Y + 60);

      // Column 2 inside panel 1
      doc.font('Helvetica-Bold').text('Instalación Evaluada:', 320, p1Y + 30);
      const instStr = inspection.facility ? `${inspection.facility.name}` : '-';
      doc.font('Helvetica').text(instStr, 420, p1Y + 30);

      doc.font('Helvetica-Bold').text('Ubicación:', 320, p1Y + 45);
      const locStr = inspection.facility && inspection.facility.location ? inspection.facility.location.name : '-';
      doc.font('Helvetica').text(locStr, 375, p1Y + 45);

      doc.font('Helvetica-Bold').text('Estatus Reporte:', 320, p1Y + 60);
      doc.font('Helvetica').fillColor('#005C9E').text(inspection.status ? inspection.status.name : 'REGISTRADO', 400, p1Y + 60);

      // PANEL 2: OBSERVATIONS
      doc.y = p1Y + 100;
      const p2Y = doc.y;
      this.drawPanel(doc, 'Observaciones y Diagnóstico Inicial', p2Y, 70);
      doc.font('Helvetica').fontSize(8.5).fillColor('#333333').text(inspection.observations || 'Sin observaciones registradas.', 60, p2Y + 28, {
        width: doc.page.width - 120,
        align: 'justify'
      });

      doc.y = p2Y + 85;

      // specialized details based on type
      if (inspection.extinguisherInspection) {
        // EXTINGUISHER DETAILS
        if (doc.y > doc.page.height - 180) {
          doc.addPage();
          this.drawHeader(doc, `Reporte de Inspección ASHO (N° ${inspection.inspectionNumber || inspection.id})`);
        }
        
        const extInsp = inspection.extinguisherInspection;
        const details = extInsp.details || [];
        
        const pExtY = doc.y;
        this.drawPanel(doc, `Módulo Especializado: Inspección de Extintores (${extInsp.brand || 'General'})`, pExtY, 150 + (details.length * 18));
        
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#333333');
        doc.text('Ubicación del Extintor:', 60, pExtY + 28);
        doc.font('Helvetica').text(extInsp.locationDetails || '-', 165, pExtY + 28);
        
        // Table headers for items
        const tableStartY = pExtY + 45;
        doc.rect(55, tableStartY, doc.page.width - 110, 15).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('CÓDIGO / CAPACIDAD', 60, tableStartY + 4);
        doc.text('AGENTE EXTINTOR', 190, tableStartY + 4);
        doc.text('MANÓMETRO', 300, tableStartY + 4);
        doc.text('PRECINTO / MANGUERA', 380, tableStartY + 4);
        doc.text('ESTATUS', 480, tableStartY + 4);

        doc.y = tableStartY + 15;
        details.forEach((det, idx) => {
          const rowY = doc.y;
          if (idx % 2 === 1) {
            doc.rect(55, rowY, doc.page.width - 110, 18).fill('#F9F9F9');
          }
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          
          doc.text(`${det.code || 'N/A'} - ${det.capacity || ''}`, 60, rowY + 5);
          doc.text(det.agentType ? det.agentType.name : '-', 190, rowY + 5);
          doc.text(det.pressureStatus === 1 ? 'OK' : 'RECARGAR', 300, rowY + 5);
          
          const safety = `${det.safetySeal === 1 ? 'SELLO OK' : 'SIN SELLO'} / ${det.hoseStatus === 1 ? 'MANGUERA OK' : 'DAÑADA'}`;
          doc.text(safety, 380, rowY + 5);
          
          doc.font('Helvetica-Bold').fillColor(det.status === 'APROBADO' ? 'green' : 'red');
          doc.text(det.status || 'EVALUADO', 480, rowY + 5);
          
          doc.y = rowY + 18;
        });
      } else if (inspection.vehicleInspection) {
        // VEHICLE DETAILS
        if (doc.y > doc.page.height - 180) {
          doc.addPage();
          this.drawHeader(doc, `Reporte de Inspección ASHO (N° ${inspection.inspectionNumber || inspection.id})`);
        }
        
        const vehInsp = inspection.vehicleInspection;
        const checks = vehInsp.accessoryChecks || [];
        
        const pVehY = doc.y;
        this.drawPanel(doc, `Módulo Especializado: Inspección de Flota de Vehículos`, pVehY, 150 + (checks.length * 18));
        
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#333333');
        doc.text('Vehículo Evaluado:', 60, pVehY + 28);
        const vehStr = vehInsp.vehicle ? `${vehInsp.vehicle.brand || ''} ${vehInsp.vehicle.model ? vehInsp.vehicle.model.name : ''} (PLACA: ${vehInsp.plate_id || vehInsp.vehicle.plate})` : `Placa: ${vehInsp.plate_id}`;
        doc.font('Helvetica').text(vehStr, 150, pVehY + 28);

        doc.font('Helvetica-Bold').text('Kilometraje actual:', 320, pVehY + 28);
        doc.font('Helvetica').text(`${vehInsp.mileage || '0'} Km`, 410, pVehY + 28);

        // Table headers for items
        const tableStartY = pVehY + 45;
        doc.rect(55, tableStartY, doc.page.width - 110, 15).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('ACCESORIO / ELEMENTO DE SEGURIDAD', 60, tableStartY + 4);
        doc.text('ESTATUS EVALUACIÓN', 280, tableStartY + 4);
        doc.text('OBSERVACIONES DE CAMPO', 380, tableStartY + 4);

        doc.y = tableStartY + 15;
        checks.forEach((chk, idx) => {
          const rowY = doc.y;
          if (idx % 2 === 1) {
            doc.rect(55, rowY, doc.page.width - 110, 18).fill('#F9F9F9');
          }
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          
          doc.text(chk.accessory ? chk.accessory.name : `Accesorio ID: ${chk.accessoryId}`, 60, rowY + 5);
          
          doc.font('Helvetica-Bold').fillColor(chk.status === 'OPTIMO' ? 'green' : 'red');
          doc.text(chk.status || 'EVALUADO', 280, rowY + 5);
          
          doc.font('Helvetica').fillColor('#333333');
          doc.text(chk.observations || 'Sin observaciones.', 380, rowY + 5);
          
          doc.y = rowY + 18;
        });
      } else if (inspection.protectionInspection) {
        // PROTECTION INVENTORY DETAILS
        if (doc.y > doc.page.height - 180) {
          doc.addPage();
          this.drawHeader(doc, `Reporte de Inspección ASHO (N° ${inspection.inspectionNumber || inspection.id})`);
        }
        
        const protInsp = inspection.protectionInspection;
        const details = protInsp.details || [];
        
        const pProtY = doc.y;
        this.drawPanel(doc, `Módulo Especializado: Inventario y Entrega de Equipos de Protección`, pProtY, 150 + (details.length * 18));
        
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#333333');
        doc.text('Responsable ASHO:', 60, pProtY + 28);
        const respStr = protInsp.responsible ? `${protInsp.responsible.lastName}, ${protInsp.responsible.firstName}` : `ID: ${protInsp.responsible_id}`;
        doc.font('Helvetica').text(respStr, 155, pProtY + 28);

        doc.font('Helvetica-Bold').text('Fecha Registro:', 320, pProtY + 28);
        doc.font('Helvetica').text(dateFormatted, 390, pProtY + 28);

        // Table headers for items
        const tableStartY = pProtY + 45;
        doc.rect(55, tableStartY, doc.page.width - 110, 15).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('CATEGORÍA DE EQUIPO DE PROTECCIÓN', 60, tableStartY + 4);
        doc.text('CANTIDAD DISPONIBLE', 280, tableStartY + 4);
        doc.text('ESTATUS ALMACÉN', 380, tableStartY + 4);
        doc.text('OBSERVACIONES', 470, tableStartY + 4);

        doc.y = tableStartY + 15;
        details.forEach((det, idx) => {
          const rowY = doc.y;
          if (idx % 2 === 1) {
            doc.rect(55, rowY, doc.page.width - 110, 18).fill('#F9F9F9');
          }
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          
          doc.text(det.category ? det.category.name : `Categoría ID: ${det.categoryId}`, 60, rowY + 5);
          doc.text(String(det.quantity || 0), 280, rowY + 5);
          
          doc.font('Helvetica-Bold').fillColor(det.status === 'DISPONIBLE' ? 'green' : 'orange');
          doc.text(det.status || 'ACTIVO', 380, rowY + 5);
          
          doc.font('Helvetica').fillColor('#333333');
          doc.text(det.observations || '-', 470, rowY + 5);
          
          doc.y = rowY + 18;
        });
      }

      // Add signature space
      doc.y += 25;
      if (doc.y > doc.page.height - 120) {
        doc.addPage();
        this.drawHeader(doc, `Reporte de Inspección ASHO (N° ${inspection.inspectionNumber || inspection.id})`);
        doc.y = 160;
      }
      
      const sigY = doc.y + 40;
      doc.moveTo(100, sigY).lineTo(230, sigY).lineWidth(1).strokeColor('#999999').stroke();
      doc.moveTo(doc.page.width - 230, sigY).lineTo(doc.page.width - 100, sigY).stroke();
      
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333');
      doc.text('FIRMA INSPECTOR DE SEGURIDAD', 90, sigY + 8);
      doc.text('FIRMA RESPONSABLE DE INSTALACIÓN', doc.page.width - 235, sigY + 8);

      this.drawFooter(doc);
      doc.end();
    });
  }

  /**
   * 4. GENERATE LIST OF ALL ACCIDENTS REPORT PDF
   */
  static generateAccidentsListPdf(accidents) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      this.drawHeader(doc, 'Listado General de Accidentes ASHO');

      // Stats block
      doc.rect(50, doc.y, doc.page.width - 100, 45).lineWidth(1).strokeColor('#E30613').stroke();
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#E30613').text('ESTADÍSTICAS DEL REGISTRO', 60, doc.y + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#333333').text(`Total Accidentes: ${accidents.length} incidentes registrados`, 60, doc.y + 24);
      doc.font('Helvetica').fontSize(9).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, doc.page.width - 200, doc.y + 24, { align: 'right' });
      
      doc.y += 65;

      // Table Headers
      const startY = doc.y;
      doc.rect(50, startY, doc.page.width - 100, 20).fill('#005C9E');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
      doc.text('CÓDIGO/INPSASEL', 55, startY + 6);
      doc.text('FECHA', 160, startY + 6);
      doc.text('TIPO ACCIDENTE', 220, startY + 6);
      doc.text('INSTALACIÓN / UBICACIÓN', 340, startY + 6);
      doc.text('ESTATUS', 480, startY + 6);

      doc.y = startY + 20;

      let isEven = false;
      accidents.forEach((acc) => {
        if (doc.y > doc.page.height - 80) {
          doc.addPage();
          this.drawHeader(doc, 'Listado General de Accidentes ASHO');
          
          const pageStartY = doc.y;
          doc.rect(50, pageStartY, doc.page.width - 100, 20).fill('#005C9E');
          doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
          doc.text('CÓDIGO/INPSASEL', 55, pageStartY + 6);
          doc.text('FECHA', 160, pageStartY + 6);
          doc.text('TIPO ACCIDENTE', 220, pageStartY + 6);
          doc.text('INSTALACIÓN / UBICACIÓN', 340, pageStartY + 6);
          doc.text('ESTATUS', 480, pageStartY + 6);
          doc.y = pageStartY + 20;
        }

        const rowHeight = 22;
        if (isEven) {
          doc.rect(50, doc.y, doc.page.width - 100, rowHeight).fill('#F9F9F9');
        }
        
        doc.font('Helvetica').fontSize(8).fillColor('#333333');
        doc.text(acc.inpsaselFileNumber || `ID: ${acc.id}`, 55, doc.y + 7);
        
        const dateStr = acc.accidentDate ? new Date(acc.accidentDate).toLocaleDateString('es-ES') : '-';
        doc.text(dateStr, 160, doc.y + 7);
        
        const typeStr = acc.type ? acc.type.name : '-';
        doc.text(typeStr.substring(0, 22), 220, doc.y + 7);
        
        const instStr = acc.facility ? acc.facility.name : '-';
        doc.text(instStr.substring(0, 28), 340, doc.y + 7);
        
        doc.font('Helvetica-Bold').fillColor('#E30613');
        doc.text(acc.processStatus ? acc.processStatus.name : 'REGISTRADO', 480, doc.y + 7);

        doc.y += rowHeight;
        isEven = !isEven;
      });

      this.drawFooter(doc);
      doc.end();
    });
  }

  /**
   * 5. GENERATE LIST OF ALL INSPECTIONS REPORT PDF
   */
  static generateInspectionsListPdf(inspections) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      this.drawHeader(doc, 'Listado General de Inspecciones ASHO');

      // Stats block
      doc.rect(50, doc.y, doc.page.width - 100, 45).lineWidth(1).strokeColor('#005C9E').stroke();
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#005C9E').text('ESTADÍSTICAS DEL REGISTRO', 60, doc.y + 8);
      doc.font('Helvetica').fontSize(9).fillColor('#333333').text(`Total Inspecciones: ${inspections.length} informes registrados`, 60, doc.y + 24);
      doc.font('Helvetica').fontSize(9).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, doc.page.width - 200, doc.y + 24, { align: 'right' });
      
      doc.y += 65;

      // Table Headers
      const startY = doc.y;
      doc.rect(50, startY, doc.page.width - 100, 20).fill('#005C9E');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
      doc.text('CÓDIGO/INSP.', 55, startY + 6);
      doc.text('FECHA', 160, startY + 6);
      doc.text('INSTALACIÓN EVALUADA', 220, startY + 6);
      doc.text('INSPECTOR RESPONSABLE', 360, startY + 6);
      doc.text('TIPO / ESTATUS', 485, startY + 6);

      doc.y = startY + 20;

      let isEven = false;
      inspections.forEach((insp) => {
        if (doc.y > doc.page.height - 80) {
          doc.addPage();
          this.drawHeader(doc, 'Listado General de Inspecciones ASHO');
          
          const pageStartY = doc.y;
          doc.rect(50, pageStartY, doc.page.width - 100, 20).fill('#005C9E');
          doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
          doc.text('CÓDIGO/INSP.', 55, pageStartY + 6);
          doc.text('FECHA', 160, pageStartY + 6);
          doc.text('INSTALACIÓN EVALUADA', 220, pageStartY + 6);
          doc.text('INSPECTOR RESPONSABLE', 360, pageStartY + 6);
          doc.text('TIPO / ESTATUS', 485, pageStartY + 6);
          doc.y = pageStartY + 20;
        }

        const rowHeight = 22;
        if (isEven) {
          doc.rect(50, doc.y, doc.page.width - 100, rowHeight).fill('#F9F9F9');
        }
        
        doc.font('Helvetica').fontSize(8).fillColor('#333333');
        doc.text(insp.inspectionNumber || `ID: ${insp.id}`, 55, doc.y + 7);
        
        const dateStr = insp.date ? new Date(insp.date).toLocaleDateString('es-ES') : '-';
        doc.text(dateStr, 160, doc.y + 7);
        
        const instStr = insp.facility ? insp.facility.name : '-';
        doc.text(instStr.substring(0, 25), 220, doc.y + 7);
        
        const inspName = insp.inspector ? `${insp.inspector.lastName}, ${insp.inspector.firstName}` : '-';
        doc.text(inspName.substring(0, 25), 360, doc.y + 7);
        
        // Type details
        let typeStr = 'General';
        if (insp.extinguisherInspection) typeStr = 'Extintores';
        else if (insp.vehicleInspection) typeStr = 'Vehicular';
        else if (insp.protectionInspection) typeStr = 'Protección';
        
        doc.font('Helvetica-Bold').fillColor('#005C9E');
        doc.text(`${typeStr}`, 485, doc.y + 7);

        doc.y += rowHeight;
        isEven = !isEven;
      });

      this.drawFooter(doc);
      doc.end();
    });
  }
}

module.exports = PdfGenerator;
