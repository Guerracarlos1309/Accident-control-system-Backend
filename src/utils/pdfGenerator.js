const PDFDocument = require('pdfkit');
const path = require('path');

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

    // Header Logo & Content
    try {
      const logoPath = path.join(__dirname, '..', 'assets', 'logoCorpoelec.png');
      doc.image(logoPath, 50, 32, { width: 90 });
    } catch (e) {
      console.error("Logo image not found or failed to load in PDF header:", e);
    }

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#005C9E').text('CORPOELEC', 155, 36);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#666666').text('CORPORACIÓN ELÉCTRICA NACIONAL', 155, 50);
    doc.font('Helvetica').fontSize(7.5).text('GERENCIA DE AMBIENTE, SEGURIDAD E HIGIENE OCUPACIONAL (ASHO)', 155, 61);

    // Document Title
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#E30613').text(title.toUpperCase(), 50, 84, { align: 'right' });
    
    // Thin separator line
    doc.moveTo(50, 102).lineTo(doc.page.width - 50, 102).lineWidth(1).strokeColor('#E0E0E0').stroke();
    
    // Reset positions
    doc.y = 115;
  }

  /**
   * Helper to draw a sleek footer on all pages
   */
  static drawFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Footer line
      doc.moveTo(50, doc.page.height - 45).lineTo(doc.page.width - 50, doc.page.height - 45).lineWidth(0.5).strokeColor('#DCDCDC').stroke();
      
      // Footer text
      doc.font('Helvetica').fontSize(6.5).fillColor('#888888');
      doc.text('Documento generado automáticamente por el Sistema de Control de Accidentes y Gestión ASHO.', 50, doc.page.height - 36);
      doc.text(`Página ${i + 1} de ${pageCount}`, doc.page.width - 150, doc.page.height - 36, { align: 'right' });
    }
  }

  /**
   * Helper to draw a clean, modern section title (colored bar prefix)
   */
  static drawSectionHeader(doc, title) {
    // Add vertical space before unless we are at page top
    if (doc.y > 120) {
      doc.y += 15;
    }
    
    // Check if section header fits on page, otherwise break page
    if (doc.y > doc.page.height - 80) {
      doc.addPage();
      this.drawHeader(doc, doc.currentTitle || 'Reporte');
    }

    const currentY = doc.y;
    doc.rect(50, currentY, 3, 13).fill('#005C9E');
    doc.fillColor('#333333');
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#005C9E').text(title.toUpperCase(), 58, currentY + 1.5);
    doc.y = currentY + 18;
  }

  /**
   * Helper to draw standard key-value info rows
   */
  static drawDataRow(doc, label, value, x, y, colWidth = 240) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#555555').text(label, x, y, { width: 100 });
    doc.font('Helvetica').fontSize(8).fillColor('#111111').text(value || '-', x + 105, y, { width: colWidth - 105 });
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

      const title = 'Reporte de Nómina de Personal';
      doc.currentTitle = title;
      this.drawHeader(doc, title);

      // Summary block
      const summaryY = doc.y;
      doc.rect(50, summaryY, doc.page.width - 100, 32).fill('#F7F9FB');
      doc.rect(50, summaryY, doc.page.width - 100, 32).lineWidth(0.5).strokeColor('#CDD6DC').stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#005C9E').text('RESUMEN DE NÓMINA GENERAL', 65, summaryY + 12);
      doc.font('Helvetica').fontSize(8).fillColor('#333333').text(`Total Personal Activo: ${employees.length} trabajadores`, 225, summaryY + 12);
      doc.font('Helvetica').fontSize(8).text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, doc.page.width - 200, summaryY + 12, { align: 'right', width: 140 });
      
      doc.y = summaryY + 45;

      // Table Headers
      const startY = doc.y;
      doc.rect(50, startY, doc.page.width - 100, 18).fill('#005C9E');
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
      doc.text('FICHA / PERS.', 55, startY + 5);
      doc.text('CÉDULA', 115, startY + 5);
      doc.text('APELLIDOS Y NOMBRES', 185, startY + 5);
      doc.text('GERENCIA', 345, startY + 5);
      doc.text('CARGO / OCUPACIÓN', 460, startY + 5);

      doc.y = startY + 18;

      let isEven = false;
      employees.forEach((emp) => {
        if (doc.y > doc.page.height - 65) {
          doc.addPage();
          this.drawHeader(doc, title);
          
          const pageStartY = doc.y;
          doc.rect(50, pageStartY, doc.page.width - 100, 18).fill('#005C9E');
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
          doc.text('FICHA / PERS.', 55, pageStartY + 5);
          doc.text('CÉDULA', 115, pageStartY + 5);
          doc.text('APELLIDOS Y NOMBRES', 185, pageStartY + 5);
          doc.text('GERENCIA', 345, pageStartY + 5);
          doc.text('CARGO / OCUPACIÓN', 460, pageStartY + 5);
          doc.y = pageStartY + 18;
        }

        const rowHeight = 18;
        const rowY = doc.y;
        if (isEven) {
          doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
        }
        
        doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#EAEAEA');

        doc.font('Helvetica').fontSize(7.5).fillColor('#222222');
        doc.text(emp.personalNumber || '-', 55, rowY + 5);
        doc.text(emp.idCard || '-', 115, rowY + 5);
        
        const fullName = `${emp.lastName || ''}, ${emp.firstName || ''}`.trim();
        doc.text(fullName.substring(0, 30), 185, rowY + 5);
        
        const mgt = emp.management ? emp.management.name : '-';
        doc.text(mgt.substring(0, 22), 345, rowY + 5);
        
        const job = emp.jobTitle ? emp.jobTitle.name : (emp.occupation ? emp.occupation.name : '-');
        doc.text(job.substring(0, 22), 460, rowY + 5);

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

      const title = `Expediente ASHO de Incidente (N° ${accident.inpsaselFileNumber || accident.id})`;
      doc.currentTitle = title;
      this.drawHeader(doc, title);

      // Section 1: General Information (Clean Grid)
      this.drawSectionHeader(doc, 'Información del Suceso');
      const startY = doc.y;
      
      const dateFormatted = accident.accidentDate ? new Date(accident.accidentDate).toLocaleDateString('es-ES') : '-';
      const facilityStr = accident.facility ? `${accident.facility.name} (${accident.facility.location ? accident.facility.location.name : ''})` : '-';
      
      this.drawDataRow(doc, 'Nro. Control:', accident.accidentControlNumber || accident.accident_control_number, 50, startY);
      this.drawDataRow(doc, 'Exp. INPSASEL:', accident.inpsaselFileNumber, 50, startY + 14);
      this.drawDataRow(doc, 'Fecha / Hora:', `${dateFormatted} - ${accident.accidentTime || ''}`, 50, startY + 28);
      this.drawDataRow(doc, 'Instalación:', facilityStr, 50, startY + 42, 250);
      this.drawDataRow(doc, 'Gerencia:', accident.management ? accident.management.name : '-', 50, startY + 56, 250);

      this.drawDataRow(doc, 'Tipo Incidente:', accident.type ? accident.type.name : '-', 315, startY, 230);
      this.drawDataRow(doc, 'Agente Daño:', accident.damageAgent ? accident.damageAgent.name : '-', 315, startY + 14, 230);
      this.drawDataRow(doc, 'Tipo Contacto:', accident.contactType ? accident.contactType.name : '-', 315, startY + 28, 230);
      this.drawDataRow(doc, 'Estatus:', accident.processStatus ? accident.processStatus.name : '-', 315, startY + 42, 230);
      this.drawDataRow(doc, 'Año / Periodo:', accident.period ? String(accident.period.annuality) : '-', 315, startY + 56, 230);

      doc.y = startY + 76;

      // Section 2: Technical Description
      this.drawSectionHeader(doc, 'Descripción Técnica de los Hechos');
      doc.font('Helvetica').fontSize(8).fillColor('#222222').text(accident.description || 'Sin descripción detallada.', 50, doc.y, {
        width: doc.page.width - 100,
        align: 'justify',
        lineGap: 3.5
      });
      doc.y += 12;

      // Section 3: Involved Employees
      this.drawSectionHeader(doc, 'Trabajadores Afectados');
      const employees = accident.involvedEmployees || [];
      if (employees.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(8).fillColor('#666666').text('No se registraron lesionados.', 50, doc.y);
        doc.y += 14;
      } else {
        const tableStartY = doc.y;
        doc.rect(50, tableStartY, doc.page.width - 100, 16).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('IDENTIFICACIÓN Y NOMBRES', 55, tableStartY + 4);
        doc.text('GERENCIA / OCUPACIÓN', 215, tableStartY + 4);
        doc.text('TIPO DE LESIÓN', 345, tableStartY + 4);
        doc.text('NIVEL / CONSECUENCIA', 455, tableStartY + 4);
        doc.text('DÍAS', 525, tableStartY + 4);

        doc.y = tableStartY + 16;
        employees.forEach((ie, idx) => {
          if (doc.y > doc.page.height - 70) {
            doc.addPage();
            this.drawHeader(doc, title);
          }
          
          const rowY = doc.y;
          const rowHeight = 24;
          if (idx % 2 === 1) {
            doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
          }
          doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#E5E7EB');
          
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#222222');
          const name = ie.employee ? `${ie.employee.lastName}, ${ie.employee.firstName}`.substring(0, 30) : '-';
          doc.text(name, 55, rowY + 5);
          doc.font('Helvetica').fontSize(6.5).fillColor('#666666');
          doc.text(`CI: ${ie.employee?.idCard || ie.employeePersonalNumber}`, 55, rowY + 14);
          
          const mgt = ie.employee?.management ? ie.employee.management.name : '-';
          const occ = ie.employee?.occupation ? ie.employee.occupation.name : '-';
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          doc.text(mgt.substring(0, 24), 215, rowY + 5);
          doc.font('Helvetica').fontSize(6.5).fillColor('#666666');
          doc.text(occ.substring(0, 24), 215, rowY + 14);
          
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          doc.text(ie.injuryType ? ie.injuryType.name.substring(0, 24) : '-', 345, rowY + 5);
          doc.font('Helvetica').fontSize(6.5).fillColor('#666666');
          doc.text(`Parte: ${ie.affectedArea || 'N/E'} / Nat: ${ie.injuryNature || 'N/E'}`, 345, rowY + 14);

          const lvl = ie.injuryLevel === '1' ? 'LEVE' : ie.injuryLevel === '2' ? 'MODERADO' : ie.injuryLevel === '3' ? 'GRAVE' : ie.injuryLevel === '4' ? 'FATAL' : 'S/L';
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          doc.text(`NIVEL: ${lvl}`, 455, rowY + 5);
          doc.font('Helvetica').fontSize(6.5).fillColor('#666666');
          doc.text(`${ie.injuryConsequence || 'N/E'}`.substring(0, 16), 455, rowY + 14);

          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#E30613');
          doc.text(ie.restDays ? String(ie.restDays) : '0', 525, rowY + 9);

          doc.y = rowY + rowHeight;
        });
      }
      doc.y += 10;

      // Section 4: Medical Center
      if (doc.y > doc.page.height - 110) {
        doc.addPage();
        this.drawHeader(doc, title);
      }
      this.drawSectionHeader(doc, 'Centro Asistencial y Diagnóstico');
      const medY = doc.y;
      
      const centerName = accident.medicalCenter ? accident.medicalCenter.name : (accident.medicalCenterName || '-');
      const centerAddr = accident.medicalCenter ? accident.medicalCenter.address : (accident.medicalCenterAddress || '-');

      this.drawDataRow(doc, 'Centro Clínico:', centerName, 50, medY, 490);
      this.drawDataRow(doc, 'Dirección Centro:', centerAddr, 50, medY + 14, 490);
      this.drawDataRow(doc, 'Diagnóstico Médico:', accident.medicalObservations, 50, medY + 28, 490);
      
      doc.y = medY + 55;

      // Section 5: Witnesses
      if (doc.y > doc.page.height - 90) {
        doc.addPage();
        this.drawHeader(doc, title);
      }
      this.drawSectionHeader(doc, 'Testigos Registrados');
      const witnesses = accident.witnesses || [];
      if (witnesses.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(8).fillColor('#666666').text('No se reportaron testigos presenciales.', 50, doc.y);
        doc.y += 14;
      } else {
        const wText = witnesses.map((w, i) => `${i + 1}. ${w.name} (C.I: ${w.idCard || 'N/E'} - Tel: ${w.phone || 'N/E'})`).join('   |   ');
        doc.font('Helvetica').fontSize(7.5).fillColor('#333333').text(wText, 50, doc.y, { width: doc.page.width - 100 });
        doc.y += 20;
      }

      // Signatures Space
      doc.y += 20;
      if (doc.y > doc.page.height - 90) {
        doc.addPage();
        this.drawHeader(doc, title);
        doc.y += 40;
      }
      
      const sigY = doc.y + 35;
      doc.moveTo(80, sigY).lineTo(230, sigY).lineWidth(0.5).strokeColor('#888888').stroke();
      doc.moveTo(doc.page.width - 230, sigY).lineTo(doc.page.width - 80, sigY).stroke();
      
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#444444');
      doc.text('DELEGADO DE PREVENCIÓN ASHO', 92, sigY + 5);
      doc.text('REPRESENTANTE LEGAL CORPOELEC', doc.page.width - 222, sigY + 5);

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

      const title = `Ficha de Inspección Técnica (N° ${inspection.inspectionNumber || inspection.id})`;
      doc.currentTitle = title;
      this.drawHeader(doc, title);

      // Section 1: General Info
      this.drawSectionHeader(doc, 'Generalidades');
      const startY = doc.y;
      
      const dateFormatted = inspection.date ? new Date(inspection.date).toLocaleDateString('es-ES') : '-';
      const inspectorStr = inspection.inspector ? `${inspection.inspector.lastName}, ${inspection.inspector.firstName} (Ficha: ${inspection.inspector.personalNumber})` : '-';
      const facilityStr = inspection.facility ? `${inspection.facility.name} (${inspection.facility.location ? inspection.facility.location.name : ''})` : '-';
      
      this.drawDataRow(doc, 'Código Inspección:', inspection.inspectionNumber || `ID: ${inspection.id}`, 50, startY);
      this.drawDataRow(doc, 'Fecha Ejecución:', dateFormatted, 50, startY + 14);
      this.drawDataRow(doc, 'Instalación:', facilityStr, 50, startY + 28, 250);

      this.drawDataRow(doc, 'Inspector:', inspectorStr, 315, startY, 230);
      this.drawDataRow(doc, 'Estatus:', inspection.status ? inspection.status.name : 'REGISTRADO', 315, startY + 14, 230);
      
      doc.y = startY + 46;

      // Section 2: Observations
      this.drawSectionHeader(doc, 'Diagnóstico y Observaciones de Campo');
      doc.font('Helvetica').fontSize(8).fillColor('#222222').text(inspection.observations || 'Sin observaciones registradas.', 50, doc.y, {
        width: doc.page.width - 100,
        align: 'justify'
      });
      doc.y += 12;

      // Section 3: Specialized Modules
      if (inspection.extinguisherInspection) {
        const extInsp = inspection.extinguisherInspection;
        const details = extInsp.details || [];
        
        this.drawSectionHeader(doc, `Evaluación de Extintores (${extInsp.brand || 'General'})`);
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#444444').text(`Detalles Ubicación:  ${extInsp.locationDetails || 'Instalación general'}`, 50, doc.y);
        doc.y += 14;

        const tableStartY = doc.y;
        doc.rect(50, tableStartY, doc.page.width - 100, 16).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('CÓDIGO / CAP.', 55, tableStartY + 4);
        doc.text('AGENTE', 160, tableStartY + 4);
        doc.text('PRESIÓN', 270, tableStartY + 4);
        doc.text('MANGUERA / PRECINTO', 360, tableStartY + 4);
        doc.text('APROBADO', 485, tableStartY + 4);

        doc.y = tableStartY + 16;
        details.forEach((det, idx) => {
          if (doc.y > doc.page.height - 65) {
            doc.addPage();
            this.drawHeader(doc, title);
          }
          
          const rowY = doc.y;
          const rowHeight = 18;
          if (idx % 2 === 1) {
            doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
          }
          doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#E5E7EB');
          
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          doc.text(`${det.code || 'N/A'} (${det.capacity || 'S/C'})`, 55, rowY + 5);
          doc.text(det.agentType ? det.agentType.name : '-', 160, rowY + 5);
          
          doc.font('Helvetica-Bold').fillColor(det.pressureStatus === 1 ? 'green' : 'red');
          doc.text(det.pressureStatus === 1 ? 'NORMAL' : 'RECARGAR', 270, rowY + 5);
          
          doc.font('Helvetica').fillColor('#333333');
          const safety = `${det.hoseStatus === 1 ? 'OK' : 'DAÑADA'} / ${det.safetySeal === 1 ? 'SELLO OK' : 'ROTO'}`;
          doc.text(safety, 360, rowY + 5);
          
          const approved = det.status === 'APROBADO';
          doc.font('Helvetica-Bold').fillColor(approved ? 'green' : 'red');
          doc.text(approved ? 'SÍ' : 'NO', 485, rowY + 5);
          
          doc.y = rowY + rowHeight;
        });
      } else if (inspection.vehicleInspection) {
        const vehInsp = inspection.vehicleInspection;
        const checks = vehInsp.accessoryChecks || [];
        
        this.drawSectionHeader(doc, 'Inspección de Unidad Vehicular');
        const vehStr = vehInsp.vehicle ? `${vehInsp.vehicle.brand || ''} ${vehInsp.vehicle.model ? vehInsp.vehicle.model.name : ''} (Placa: ${vehInsp.plate_id || vehInsp.vehicle.plate})` : `Placa: ${vehInsp.plate_id}`;
        
        const vehY = doc.y;
        this.drawDataRow(doc, 'Vehículo:', vehStr, 50, vehY, 250);
        this.drawDataRow(doc, 'Kilometraje:', `${vehInsp.mileage || '0'} Km`, 315, vehY, 230);
        
        doc.y = vehY + 20;

        const tableStartY = doc.y;
        doc.rect(50, tableStartY, doc.page.width - 100, 16).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('ACCESORIO / ELEMENTO DE SEGURIDAD', 55, tableStartY + 4);
        doc.text('ESTATUS', 300, tableStartY + 4);
        doc.text('OBSERVACIONES GENERALES', 380, tableStartY + 4);

        doc.y = tableStartY + 16;
        checks.forEach((chk, idx) => {
          if (doc.y > doc.page.height - 65) {
            doc.addPage();
            this.drawHeader(doc, title);
          }
          
          const rowY = doc.y;
          const rowHeight = 18;
          if (idx % 2 === 1) {
            doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
          }
          doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#E5E7EB');
          
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          doc.text(chk.accessory ? chk.accessory.name : `Accesorio ID: ${chk.accessoryId}`, 55, rowY + 5);
          
          const isOpt = chk.status === 'OPTIMO';
          doc.font('Helvetica-Bold').fillColor(isOpt ? 'green' : 'red');
          doc.text(chk.status || 'EVALUADO', 300, rowY + 5);
          
          doc.font('Helvetica').fillColor('#555555');
          doc.text(chk.observations || '-', 380, rowY + 5, { width: 160 });
          
          doc.y = rowY + rowHeight;
        });
      } else if (inspection.protectionInspection) {
        const protInsp = inspection.protectionInspection;
        const details = protInsp.details || [];
        
        this.drawSectionHeader(doc, 'Control de Inventario de Equipos de Protección');
        const respStr = protInsp.responsible ? `${protInsp.responsible.lastName}, ${protInsp.responsible.firstName}` : `ID: ${protInsp.responsible_id}`;
        
        const protY = doc.y;
        this.drawDataRow(doc, 'Responsable Almacén:', respStr, 50, protY, 490);
        
        doc.y = protY + 20;

        const tableStartY = doc.y;
        doc.rect(50, tableStartY, doc.page.width - 100, 16).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('CATEGORÍA DE EQUIPO DE PROTECCIÓN', 55, tableStartY + 4);
        doc.text('STOCK', 300, tableStartY + 4);
        doc.text('ESTADO', 380, tableStartY + 4);
        doc.text('OBSERVACIONES DE DETALLE', 450, tableStartY + 4);

        doc.y = tableStartY + 16;
        details.forEach((det, idx) => {
          if (doc.y > doc.page.height - 65) {
            doc.addPage();
            this.drawHeader(doc, title);
          }
          
          const rowY = doc.y;
          const rowHeight = 18;
          if (idx % 2 === 1) {
            doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
          }
          doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#E5E7EB');
          
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          doc.text(det.category ? det.category.name : `Categoría ID: ${det.categoryId}`, 55, rowY + 5);
          doc.text(String(det.quantity || 0), 300, rowY + 5);
          
          const isDisp = det.status === 'DISPONIBLE';
          doc.font('Helvetica-Bold').fillColor(isDisp ? 'green' : 'orange');
          doc.text(det.status || 'ACTIVO', 380, rowY + 5);
          
          doc.font('Helvetica').fillColor('#555555');
          doc.text(det.observations || '-', 450, rowY + 5, { width: 90 });
          
          doc.y = rowY + rowHeight;
        });
      }

      // Signature area
      doc.y += 20;
      if (doc.y > doc.page.height - 85) {
        doc.addPage();
        this.drawHeader(doc, title);
        doc.y += 40;
      }
      
      const sigY = doc.y + 40;
      doc.moveTo(80, sigY).lineTo(230, sigY).lineWidth(0.5).strokeColor('#888888').stroke();
      doc.moveTo(doc.page.width - 230, sigY).lineTo(doc.page.width - 80, sigY).stroke();
      
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#444444');
      doc.text('INSPECTOR DE SEGURIDAD ASHO', 88, sigY + 5);
      doc.text('DELEGADO DE INSTALACIÓN / PREVENCIÓN', doc.page.width - 240, sigY + 5);

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

      const title = 'Listado General de Accidentes ASHO';
      doc.currentTitle = title;
      this.drawHeader(doc, title);

      // Stats block
      const statsY = doc.y;
      doc.rect(50, statsY, doc.page.width - 100, 32).fill('#FDF8F8');
      doc.rect(50, statsY, doc.page.width - 100, 32).lineWidth(0.5).strokeColor('#F2CFCF').stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#E30613').text('ESTADÍSTICAS DEL REGISTRO', 65, statsY + 12);
      doc.font('Helvetica').fontSize(8).fillColor('#333333').text(`Total Accidentes: ${accidents.length} incidentes registrados`, 215, statsY + 12);
      doc.font('Helvetica').fontSize(8).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, doc.page.width - 200, statsY + 12, { align: 'right', width: 140 });
      
      doc.y = statsY + 45;

      // Table Headers
      const startY = doc.y;
      doc.rect(50, startY, doc.page.width - 100, 18).fill('#005C9E');
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
      doc.text('CÓDIGO/CONTROL', 55, startY + 5);
      doc.text('FECHA', 170, startY + 5);
      doc.text('TIPO ACCIDENTE', 230, startY + 5);
      doc.text('INSTALACIÓN / DIRECCIÓN', 350, startY + 5);
      doc.text('ESTATUS', 485, startY + 5);

      doc.y = startY + 18;

      let isEven = false;
      accidents.forEach((acc) => {
        if (doc.y > doc.page.height - 65) {
          doc.addPage();
          this.drawHeader(doc, title);
          
          const pageStartY = doc.y;
          doc.rect(50, pageStartY, doc.page.width - 100, 18).fill('#005C9E');
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
          doc.text('CÓDIGO/CONTROL', 55, pageStartY + 5);
          doc.text('FECHA', 170, pageStartY + 5);
          doc.text('TIPO ACCIDENTE', 230, pageStartY + 5);
          doc.text('INSTALACIÓN / DIRECCIÓN', 350, pageStartY + 5);
          doc.text('ESTATUS', 485, pageStartY + 5);
          doc.y = pageStartY + 18;
        }

        const rowHeight = 20;
        const rowY = doc.y;
        if (isEven) {
          doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
        }
        doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#E5E7EB');
        
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333');
        const code = acc.accidentControlNumber || acc.accident_control_number || acc.inpsaselFileNumber || `ID: ${acc.id}`;
        doc.text(code.substring(0, 24), 55, rowY + 6);
        
        const dateStr = acc.accidentDate ? new Date(acc.accidentDate).toLocaleDateString('es-ES') : '-';
        doc.font('Helvetica').fontSize(7.5).fillColor('#444444');
        doc.text(dateStr, 170, rowY + 6);
        
        const typeStr = acc.type ? acc.type.name : '-';
        doc.text(typeStr.substring(0, 24), 230, rowY + 6);
        
        const instStr = acc.facility ? acc.facility.name : '-';
        doc.text(instStr.substring(0, 28), 350, rowY + 6);
        
        doc.font('Helvetica-Bold').fillColor('#E30613');
        doc.text(acc.processStatus ? acc.processStatus.name : 'REGISTRADO', 485, rowY + 6);

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

      const title = 'Listado General de Inspecciones ASHO';
      doc.currentTitle = title;
      this.drawHeader(doc, title);

      // Stats block
      const statsY = doc.y;
      doc.rect(50, statsY, doc.page.width - 100, 32).fill('#F4F7FA');
      doc.rect(50, statsY, doc.page.width - 100, 32).lineWidth(0.5).strokeColor('#CCD5E0').stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#005C9E').text('ESTADÍSTICAS DEL REGISTRO', 65, statsY + 12);
      doc.font('Helvetica').fontSize(8).fillColor('#333333').text(`Total Inspecciones: ${inspections.length} informes registrados`, 215, statsY + 12);
      doc.font('Helvetica').fontSize(8).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, doc.page.width - 200, statsY + 12, { align: 'right', width: 140 });
      
      doc.y = statsY + 45;

      // Table Headers
      const startY = doc.y;
      doc.rect(50, startY, doc.page.width - 100, 18).fill('#005C9E');
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
      doc.text('CÓDIGO/INSP.', 55, startY + 5);
      doc.text('FECHA', 160, startY + 5);
      doc.text('INSTALACIÓN EVALUADA', 220, startY + 5);
      doc.text('INSPECTOR RESPONSABLE', 360, startY + 5);
      doc.text('TIPO / ESTATUS', 485, startY + 5);

      doc.y = startY + 18;

      let isEven = false;
      inspections.forEach((insp) => {
        if (doc.y > doc.page.height - 65) {
          doc.addPage();
          this.drawHeader(doc, title);
          
          const pageStartY = doc.y;
          doc.rect(50, pageStartY, doc.page.width - 100, 18).fill('#005C9E');
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
          doc.text('CÓDIGO/INSP.', 55, pageStartY + 5);
          doc.text('FECHA', 160, pageStartY + 5);
          doc.text('INSTALACIÓN EVALUADA', 220, pageStartY + 5);
          doc.text('INSPECTOR RESPONSABLE', 360, pageStartY + 5);
          doc.text('TIPO / ESTATUS', 485, pageStartY + 5);
          doc.y = pageStartY + 18;
        }

        const rowHeight = 20;
        const rowY = doc.y;
        if (isEven) {
          doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
        }
        doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#E5E7EB');
        
        doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
        doc.text(insp.inspectionNumber || `ID: ${insp.id}`, 55, rowY + 6);
        
        const dateStr = insp.date ? new Date(insp.date).toLocaleDateString('es-ES') : '-';
        doc.text(dateStr, 160, rowY + 6);
        
        const instStr = insp.facility ? insp.facility.name : '-';
        doc.text(instStr.substring(0, 25), 220, rowY + 6);
        
        const inspName = insp.inspector ? `${insp.inspector.lastName}, ${insp.inspector.firstName}` : '-';
        doc.text(inspName.substring(0, 25), 360, rowY + 6);
        
        let typeStr = 'General';
        if (insp.extinguisherInspection) typeStr = 'Extintores';
        else if (insp.vehicleInspection) typeStr = 'Vehicular';
        else if (insp.protectionInspection) typeStr = 'Protección';
        
        doc.font('Helvetica-Bold').fillColor('#005C9E');
        doc.text(`${typeStr}`, 485, rowY + 6);

        doc.y += rowHeight;
        isEven = !isEven;
      });

      this.drawFooter(doc);
      doc.end();
    });
  }
}

module.exports = PdfGenerator;
