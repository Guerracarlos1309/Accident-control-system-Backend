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
  static generatePayrollPdf(employees, columns) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      const title = 'Reporte de Nómina de Personal';
      doc.currentTitle = title;
      this.drawHeader(doc, title);

      // Define all possible columns and their weights
      const allCols = [
        { key: 'personalNumber', label: 'FICHA / PERS.', weight: 65 },
        { key: 'idCard', label: 'CÉDULA', weight: 70 },
        { key: 'fullName', label: 'APELLIDOS Y NOMBRES', weight: 160 },
        { key: 'management', label: 'GERENCIA', weight: 110 },
        { key: 'jobTitle', label: 'CARGO', weight: 90 },
        { key: 'occupation', label: 'OCUPACIÓN', weight: 90 },
        { key: 'phone', label: 'TELÉFONO', weight: 75 },
        { key: 'gender', label: 'GÉNERO', weight: 45 },
        { key: 'birthDate', label: 'FEC. NACIMIENTO', weight: 80 },
        { key: 'email', label: 'CORREO ELECTRÓNICO', weight: 125 },
        { key: 'maritalStatus', label: 'ESTADO CIVIL', weight: 70 },
        { key: 'dominantHand', label: 'LATERALIDAD', weight: 70 },
        { key: 'birthPlace', label: 'LUGAR NACIMIENTO', weight: 110 },
        { key: 'homeAddress', label: 'DIRECCIÓN', weight: 140 },
        { key: 'educationLevel', label: 'NIV. EDUCATIVO', weight: 95 },
        { key: 'hireDate', label: 'FEC. INGRESO', weight: 75 },
        { key: 'officePhone', label: 'TEL. OFICINA', weight: 75 }
      ];

      // Filter based on user selection
      let selectedCols = allCols;
      if (columns && Array.isArray(columns) && columns.length > 0) {
        selectedCols = allCols.filter(c => columns.includes(c.key));
      }
      if (selectedCols.length === 0) selectedCols = allCols;

      // Calculate layout coordinates
      const totalWeight = selectedCols.reduce((sum, c) => sum + c.weight, 0);
      const printableWidth = doc.page.width - 100;
      let currentX = 50;
      selectedCols.forEach(c => {
        c.width = (c.weight / totalWeight) * printableWidth;
        c.x = currentX;
        currentX += c.width;
      });

      // Helper to draw headers
      const drawTableHeaders = (y) => {
        doc.rect(50, y, doc.page.width - 100, 18).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        selectedCols.forEach(col => {
          doc.text(col.label, col.x + 5, y + 5, { width: col.width - 8, lineBreak: false });
        });
      };

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
      drawTableHeaders(startY);
      doc.y = startY + 18;

      let isEven = false;
      employees.forEach((emp) => {
        if (doc.y > doc.page.height - 65) {
          doc.addPage();
          this.drawHeader(doc, title);
          
          const pageStartY = doc.y;
          drawTableHeaders(pageStartY);
          doc.y = pageStartY + 18;
        }

        const rowHeight = 18;
        const rowY = doc.y;
        if (isEven) {
          doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
        }
        
        doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#EAEAEA');

        doc.font('Helvetica').fontSize(7.5).fillColor('#222222');
        selectedCols.forEach(col => {
          let val = '';
          if (col.key === 'personalNumber') {
            val = emp.personalNumber || '-';
          } else if (col.key === 'idCard') {
            val = emp.idCard || '-';
          } else if (col.key === 'fullName') {
            val = `${emp.lastName || ''}, ${emp.firstName || ''}`.trim() || '-';
          } else if (col.key === 'management') {
            val = emp.management ? emp.management.name : '-';
          } else if (col.key === 'jobTitle') {
            val = emp.jobTitle ? emp.jobTitle.name : '-';
          } else if (col.key === 'occupation') {
            val = emp.occupation ? emp.occupation.name : '-';
          } else if (col.key === 'phone') {
            val = emp.phone || '-';
          } else if (col.key === 'gender') {
            val = emp.gender === 'M' ? 'MASCULINO' : emp.gender === 'F' ? 'FEMENINO' : 'OTRO';
          } else if (col.key === 'birthDate') {
            val = emp.birthDate || '-';
          } else if (col.key === 'email') {
            val = emp.email || '-';
          } else if (col.key === 'maritalStatus') {
            const statuses = { "1": "SOLTERO/A", "2": "CASADO/A", "3": "DIVORCIADO/A", "4": "VIUDO/A", "5": "CONCUBINATO" };
            val = statuses[String(emp.maritalStatus)] || '-';
          } else if (col.key === 'dominantHand') {
            const hands = { "1": "DIESTRO", "2": "ZURDO", "3": "AMBIDIESTRO" };
            val = hands[String(emp.dominantHand)] || '-';
          } else if (col.key === 'birthPlace') {
            val = emp.birthPlace || '-';
          } else if (col.key === 'homeAddress') {
            val = emp.homeAddress || '-';
          } else if (col.key === 'educationLevel') {
            const levels = {
              "primaria": "PRIMARIA", "bachiller": "BACHILLERATO", "tecnico_medio": "TÉCNICO MEDIO",
              "tsu": "T.S.U.", "universitario": "UNIVERSITARIO", "especializacion": "POSTGRADO",
              "maestria": "MAESTRÍA", "doctorado": "DOCTORADO"
            };
            val = levels[String(emp.educationLevel).toLowerCase()] || emp.educationLevel || '-';
          } else if (col.key === 'hireDate') {
            val = emp.hireDate || '-';
          } else if (col.key === 'officePhone') {
            val = emp.officePhone || '-';
          }
          
          const maxChars = Math.max(8, Math.floor(col.width / 5.2));
          const valStr = String(val);
          const truncated = valStr.length > maxChars ? valStr.substring(0, maxChars - 3) + '...' : valStr;

          doc.text(truncated, col.x + 5, rowY + 5, { width: col.width - 8, lineBreak: false });
        });

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
  static generateAccidentsListPdf(accidents, columns) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      const title = 'Listado General de Accidentes ASHO';
      doc.currentTitle = title;
      this.drawHeader(doc, title);

      // Define all possible columns and weights
      const allCols = [
        { key: 'accidentControlNumber', label: 'CÓDIGO/CONTROL', weight: 110 },
        { key: 'accidentDate', label: 'FECHA', weight: 60 },
        { key: 'accidentTime', label: 'HORA', weight: 50 },
        { key: 'accidentType', label: 'TIPO ACCIDENTE', weight: 110 },
        { key: 'facility', label: 'INSTALACIÓN / DIRECCIÓN', weight: 120 },
        { key: 'management', label: 'GERENCIA RESPONSABLE', weight: 120 },
        { key: 'status', label: 'ESTATUS', weight: 60 },
        { key: 'description', label: 'DESCRIPCIÓN', weight: 140 },
        { key: 'medicalCenterName', label: 'CENTRO MÉDICO', weight: 120 },
        { key: 'medicalObservations', label: 'OBS. MÉDICAS', weight: 120 },
        { key: 'globalObservations', label: 'OBS. GLOBALES', weight: 120 }
      ];

      // Filter based on user selection
      let selectedCols = allCols;
      if (columns && Array.isArray(columns) && columns.length > 0) {
        selectedCols = allCols.filter(c => columns.includes(c.key));
      }
      if (selectedCols.length === 0) selectedCols = allCols;

      // Calculate layout coordinates
      const totalWeight = selectedCols.reduce((sum, c) => sum + c.weight, 0);
      const printableWidth = doc.page.width - 100;
      let currentX = 50;
      selectedCols.forEach(c => {
        c.width = (c.weight / totalWeight) * printableWidth;
        c.x = currentX;
        currentX += c.width;
      });

      // Helper to draw headers
      const drawTableHeaders = (y) => {
        doc.rect(50, y, doc.page.width - 100, 18).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        selectedCols.forEach(col => {
          doc.text(col.label, col.x + 5, y + 5, { width: col.width - 8, lineBreak: false });
        });
      };

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
      drawTableHeaders(startY);
      doc.y = startY + 18;

      let isEven = false;
      accidents.forEach((acc) => {
        if (doc.y > doc.page.height - 65) {
          doc.addPage();
          this.drawHeader(doc, title);
          
          const pageStartY = doc.y;
          drawTableHeaders(pageStartY);
          doc.y = pageStartY + 18;
        }

        const rowHeight = 20;
        const rowY = doc.y;
        if (isEven) {
          doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
        }
        doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#E5E7EB');
        
        selectedCols.forEach(col => {
          let val = '';
          let isStatus = false;
          let isBold = false;
          if (col.key === 'accidentControlNumber') {
            val = acc.accidentControlNumber || acc.accident_control_number || acc.inpsaselFileNumber || `ID: ${acc.id}`;
            isBold = true;
          } else if (col.key === 'accidentDate') {
            val = acc.accidentDate ? new Date(acc.accidentDate).toLocaleDateString('es-ES') : '-';
          } else if (col.key === 'accidentTime') {
            val = acc.accidentTime || acc.accident_time || '-';
          } else if (col.key === 'accidentType') {
            val = acc.type ? acc.type.name : '-';
          } else if (col.key === 'facility') {
            val = acc.facility ? acc.facility.name : '-';
          } else if (col.key === 'management') {
            val = acc.management ? acc.management.name : '-';
          } else if (col.key === 'status') {
            val = acc.processStatus ? acc.processStatus.name : 'REGISTRADO';
            isStatus = true;
            isBold = true;
          } else if (col.key === 'description') {
            val = acc.description || '-';
          } else if (col.key === 'medicalCenterName') {
            val = acc.medicalCenterName || '-';
          } else if (col.key === 'medicalObservations') {
            val = acc.medicalObservations || '-';
          } else if (col.key === 'globalObservations') {
            val = acc.globalObservations || '-';
          }

          if (isStatus) {
            doc.font('Helvetica-Bold').fillColor('#E30613');
          } else if (isBold) {
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333');
          } else {
            doc.font('Helvetica').fontSize(7.5).fillColor('#444444');
          }

          const maxChars = Math.max(8, Math.floor(col.width / 5.2));
          const valStr = String(val);
          const truncated = valStr.length > maxChars ? valStr.substring(0, maxChars - 3) + '...' : valStr;

          doc.text(truncated, col.x + 5, rowY + 6, { width: col.width - 8, lineBreak: false });
        });

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
  static generateInspectionsListPdf(inspections, columns) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      const title = 'Listado General de Inspecciones ASHO';
      doc.currentTitle = title;
      this.drawHeader(doc, title);

      // Define all possible columns and weights
      const allCols = [
        { key: 'inspectionNumber', label: 'CÓDIGO/INSP.', weight: 110 },
        { key: 'date', label: 'FECHA', weight: 60 },
        { key: 'facility', label: 'INSTALACIÓN EVALUADA', weight: 130 },
        { key: 'inspector', label: 'INSPECTOR RESPONSABLE', weight: 120 },
        { key: 'typeStatus', label: 'TIPO INSPECCIÓN', weight: 90 },
        { key: 'status', label: 'ESTATUS EVALUACIÓN', weight: 90 },
        { key: 'coordinates', label: 'COORDENADAS', weight: 90 },
        { key: 'observations', label: 'OBSERVACIONES', weight: 140 }
      ];

      // Filter based on user selection
      let selectedCols = allCols;
      if (columns && Array.isArray(columns) && columns.length > 0) {
        selectedCols = allCols.filter(c => columns.includes(c.key));
      }
      if (selectedCols.length === 0) selectedCols = allCols;

      // Calculate layout coordinates
      const totalWeight = selectedCols.reduce((sum, c) => sum + c.weight, 0);
      const printableWidth = doc.page.width - 100;
      let currentX = 50;
      selectedCols.forEach(c => {
        c.width = (c.weight / totalWeight) * printableWidth;
        c.x = currentX;
        currentX += c.width;
      });

      // Helper to draw headers
      const drawTableHeaders = (y) => {
        doc.rect(50, y, doc.page.width - 100, 18).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        selectedCols.forEach(col => {
          doc.text(col.label, col.x + 5, y + 5, { width: col.width - 8, lineBreak: false });
        });
      };

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
      drawTableHeaders(startY);
      doc.y = startY + 18;

      let isEven = false;
      inspections.forEach((insp) => {
        if (doc.y > doc.page.height - 65) {
          doc.addPage();
          this.drawHeader(doc, title);
          
          const pageStartY = doc.y;
          drawTableHeaders(pageStartY);
          doc.y = pageStartY + 18;
        }

        const rowHeight = 20;
        const rowY = doc.y;
        if (isEven) {
          doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
        }
        doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#E5E7EB');
        
        selectedCols.forEach(col => {
          let val = '';
          let isColor = false;
          let colorHex = '#333333';
          let isBold = false;

          if (col.key === 'inspectionNumber') {
            val = insp.inspectionNumber || `ID: ${insp.id}`;
          } else if (col.key === 'date') {
            val = insp.date ? new Date(insp.date).toLocaleDateString('es-ES') : '-';
          } else if (col.key === 'facility') {
            val = insp.facility ? insp.facility.name : '-';
          } else if (col.key === 'inspector') {
            val = insp.inspector ? `${insp.inspector.lastName}, ${insp.inspector.firstName}` : '-';
          } else if (col.key === 'typeStatus') {
            let typeStr = 'General';
            if (insp.extinguisherInspection) typeStr = 'Extintores';
            else if (insp.vehicleInspection) typeStr = 'Vehicular';
            else if (insp.protectionInspection) typeStr = 'Protección';
            val = typeStr;
            isColor = true;
            colorHex = '#005C9E';
            isBold = true;
          } else if (col.key === 'status') {
            val = insp.status ? insp.status.name : 'EN PROCESO';
            isColor = true;
            colorHex = insp.statusId === 3 ? '#10B981' : insp.statusId === 2 ? '#F59E0B' : '#6B7280';
            isBold = true;
          } else if (col.key === 'coordinates') {
            val = insp.coordinates || '-';
          } else if (col.key === 'observations') {
            val = insp.observations || '-';
          }

          if (isColor) {
            doc.font('Helvetica-Bold').fillColor(colorHex);
          } else if (isBold) {
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333');
          } else {
            doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          }

          const maxChars = Math.max(8, Math.floor(col.width / 5.2));
          const valStr = String(val);
          const truncated = valStr.length > maxChars ? valStr.substring(0, maxChars - 3) + '...' : valStr;

          doc.text(truncated, col.x + 5, rowY + 6, { width: col.width - 8, lineBreak: false });
        });

        doc.y += rowHeight;
        isEven = !isEven;
      });

      this.drawFooter(doc);
      doc.end();
    });
  }
}

module.exports = PdfGenerator;
