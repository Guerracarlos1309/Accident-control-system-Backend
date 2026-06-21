const PDFDocument = require('pdfkit');
const path = require('path');

class PdfGenerator {
  static formatDate(dateStr) {
    if (!dateStr) return '-';
    if (dateStr instanceof Date) {
      return dateStr.toLocaleDateString('es-ES');
    }
    const cleanStr = typeof dateStr === 'string' ? dateStr.split('T')[0] : '';
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return new Date(dateStr).toLocaleDateString('es-ES');
  }

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

  static drawFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Save and temporarily disable the bottom margin to prevent PDFKit auto-page breaks in footer
      const oldBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      
      // Footer line
      doc.moveTo(50, doc.page.height - 45).lineTo(doc.page.width - 50, doc.page.height - 45).lineWidth(0.5).strokeColor('#DCDCDC').stroke();
      
      // Footer text
      doc.font('Helvetica').fontSize(6.5).fillColor('#888888');
      doc.text('Documento generado automáticamente por el Sistema de Control de Accidentes y Gestión ASHO.', 50, doc.page.height - 36);
      doc.text(`Página ${i + 1} de ${pageCount}`, doc.page.width - 150, doc.page.height - 36, { align: 'right' });

      // Restore the original bottom margin
      doc.page.margins.bottom = oldBottom;
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

      const isSelected = (key) => selectedCols.some(c => c.key === key);

      // Summary block
      const summaryY = doc.y;
      doc.rect(50, summaryY, doc.page.width - 100, 32).fill('#F7F9FB');
      doc.rect(50, summaryY, doc.page.width - 100, 32).lineWidth(0.5).strokeColor('#CDD6DC').stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#005C9E').text('RESUMEN DE NÓMINA GENERAL', 65, summaryY + 12);
      doc.font('Helvetica').fontSize(8).fillColor('#333333').text(`Total Personal Activo: ${employees.length} trabajadores`, 225, summaryY + 12);
      doc.font('Helvetica').fontSize(8).text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, doc.page.width - 200, summaryY + 12, { align: 'right', width: 140 });
      
      doc.y = summaryY + 45;

      employees.forEach((emp) => {
        const cardFields = [];
        
        if (isSelected('management')) cardFields.push({ label: 'Gerencia:', value: emp.management ? emp.management.name : '-' });
        if (isSelected('jobTitle')) cardFields.push({ label: 'Cargo:', value: emp.jobTitle ? emp.jobTitle.name : '-' });
        if (isSelected('occupation')) cardFields.push({ label: 'Ocupación:', value: emp.occupation ? emp.occupation.name : '-' });
        if (isSelected('phone')) cardFields.push({ label: 'Teléfono:', value: emp.phone || '-' });
        if (isSelected('gender')) {
          const genderStr = emp.gender === 'M' ? 'MASCULINO' : emp.gender === 'F' ? 'FEMENINO' : 'OTRO';
          cardFields.push({ label: 'Género:', value: genderStr });
        }
        if (isSelected('birthDate')) cardFields.push({ label: 'Fec. Nac.:', value: this.formatDate(emp.birthDate) });
        if (isSelected('email')) cardFields.push({ label: 'Correo:', value: emp.email || '-' });
        if (isSelected('maritalStatus')) {
          const statuses = { "1": "SOLTERO/A", "2": "CASADO/A", "3": "DIVORCIADO/A", "4": "VIUDO/A", "5": "CONCUBINATO" };
          cardFields.push({ label: 'Edo. Civil:', value: statuses[String(emp.maritalStatus)] || '-' });
        }
        if (isSelected('dominantHand')) {
          const hands = { "1": "DIESTRO", "2": "ZURDO", "3": "AMBIDIESTRO" };
          cardFields.push({ label: 'Lateralidad:', value: hands[String(emp.dominantHand)] || '-' });
        }
        if (isSelected('educationLevel')) {
          const levels = {
            "primaria": "PRIMARIA", "bachiller": "BACHILLERATO", "tecnico_medio": "TÉCNICO MEDIO",
            "tsu": "T.S.U.", "universitario": "UNIVERSITARIO", "especializacion": "POSTGRADO",
            "maestria": "MAESTRÍA", "doctorado": "DOCTORADO"
          };
          cardFields.push({ label: 'Niv. Educativo:', value: levels[String(emp.educationLevel).toLowerCase()] || emp.educationLevel || '-' });
        }
        if (isSelected('hireDate')) cardFields.push({ label: 'Fec. Ingreso:', value: this.formatDate(emp.hireDate) });
        if (isSelected('officePhone')) cardFields.push({ label: 'Tel. Oficina:', value: emp.officePhone || '-' });
        if (isSelected('birthPlace')) cardFields.push({ label: 'Lugar Nac.:', value: emp.birthPlace || '-', fullWidth: true });
        if (isSelected('homeAddress')) cardFields.push({ label: 'Dirección:', value: emp.homeAddress || '-', fullWidth: true });

        const standardFields = cardFields.filter(f => !f.fullWidth);
        const fullWidthFields = cardFields.filter(f => f.fullWidth);

        const numRows = Math.ceil(standardFields.length / 2);
        const bodyHeight = (numRows * 13) + (fullWidthFields.length * 15) + 10;
        const cardHeight = 22 + bodyHeight;

        if (doc.y + cardHeight + 15 > doc.page.height - 65) {
          doc.addPage();
          this.drawHeader(doc, title);
        }

        const rowY = doc.y;
        // Bounding box for the employee card
        doc.rect(50, rowY, 495, cardHeight).lineWidth(0.5).strokeColor('#E5E7EB').stroke();

        // Header bar inside card
        doc.rect(50, rowY, 495, 20).fill('#F2F5F8');
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#005C9E');
        const nameStr = `${emp.lastName || ''}, ${emp.firstName || ''}`.trim() || 'Trabajador';
        doc.text(nameStr.toUpperCase(), 55, rowY + 6);

        // Header details (Ficha / Cédula)
        let headerRight = '';
        if (isSelected('personalNumber')) headerRight += `FICHA: ${emp.personalNumber || '-'}   `;
        if (isSelected('idCard')) headerRight += `C.I.: ${emp.idCard || '-'}`;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#555555');
        doc.text(headerRight.trim(), 300, rowY + 6, { width: 240, align: 'right' });

        const y_body = rowY + 25;
        // Two-column layout for standard fields
        standardFields.forEach((field, fIdx) => {
          const colIdx = fIdx % 2;
          const rowIdx = Math.floor(fIdx / 2);
          const x = colIdx === 0 ? 55 : 300;
          const y = y_body + (rowIdx * 13);
          
          doc.font('Helvetica').fontSize(7.5).fillColor('#666666').text(field.label, x, y);
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333').text(String(field.value), x + 70, y, { width: 165, lineBreak: false });
        });

        // Full width fields at the bottom
        const y_full = y_body + (numRows * 13) + 5;
        fullWidthFields.forEach((field, fIdx) => {
          const y = y_full + (fIdx * 15);
          doc.font('Helvetica').fontSize(7.5).fillColor('#666666').text(field.label, 55, y);
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333').text(String(field.value), 125, y, { width: 410 });
        });

        doc.y = rowY + cardHeight + 12;
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
      
      const dateFormatted = this.formatDate(accident.accidentDate);
      const facilityStr = accident.facility ? `${accident.facility.name} (${accident.facility.location ? accident.facility.location.name : ''})` : '-';
      
      this.drawDataRow(doc, 'Nro. Control:', accident.accidentControlNumber || accident.accident_control_number, 50, startY);
      this.drawDataRow(doc, 'Exp. INPSASEL:', accident.inpsaselFileNumber, 50, startY + 14);
      this.drawDataRow(doc, 'Fecha / Hora:', `${dateFormatted} - ${accident.accidentTime || ''}`, 50, startY + 28);
      this.drawDataRow(doc, 'Instalación:', facilityStr, 50, startY + 42, 250);
      this.drawDataRow(doc, 'Gerencia:', accident.management ? accident.management.name : '-', 50, startY + 56, 250);

      const workTypeStr = accident.workType === 'ordinario'
        ? 'Ordinario'
        : accident.workType === 'eventual'
          ? 'Eventual u ocasional'
          : accident.workType || '-';
      const magnitudeStr = accident.magnitude ? (accident.magnitude.name || accident.magnitude.description) : '-';

      this.drawDataRow(doc, 'Tipo Incidente:', accident.type ? accident.type.name : '-', 315, startY, 230);
      this.drawDataRow(doc, 'Magnitud:', magnitudeStr, 315, startY + 14, 230);
      this.drawDataRow(doc, 'Tipo Trabajo:', workTypeStr, 315, startY + 28, 230);
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
        // Column X positions (printable area: x=50 to x=545)
        // Name: 50-195 (145px) | Mgt: 200-320 (120px) | Injury: 325-410 (85px) | Level: 415-500 (85px) | Days: 505-545 (40px)
        const COL = { name: 55, mgt: 200, injury: 325, level: 415, days: 505 };

        const tableStartY = doc.y;
        doc.rect(50, tableStartY, doc.page.width - 100, 16).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('IDENTIFICACIÓN Y NOMBRES', COL.name, tableStartY + 4, { width: 140 });
        doc.text('GERENCIA / OCUPACIÓN',     COL.mgt,   tableStartY + 4, { width: 115 });
        doc.text('TIPO DE LESIÓN',           COL.injury, tableStartY + 4, { width: 80 });
        doc.text('NIVEL / CONSECUENCIA',     COL.level, tableStartY + 4, { width: 80 });
        doc.text('DÍAS',                     COL.days,  tableStartY + 4, { width: 38, align: 'center' });

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
          
          // Nombre completo
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#222222');
          const name = ie.employee ? `${ie.employee.lastName}, ${ie.employee.firstName}` : '-';
          doc.text(name.substring(0, 28), COL.name, rowY + 5, { width: 140 });
          doc.font('Helvetica').fontSize(6.5).fillColor('#666666');
          doc.text(`CI: ${ie.employee?.idCard || ie.employeePersonalNumber || 'N/E'}`, COL.name, rowY + 14, { width: 140 });
          
          // Gerencia / Ocupación
          const mgt = ie.employee?.management ? ie.employee.management.name : '-';
          const occ = ie.employee?.occupation ? ie.employee.occupation.name : '-';
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          doc.text(mgt.substring(0, 22), COL.mgt, rowY + 5, { width: 115 });
          doc.font('Helvetica').fontSize(6.5).fillColor('#666666');
          doc.text(occ.substring(0, 22), COL.mgt, rowY + 14, { width: 115 });
          
          // Tipo de lesión
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          doc.text(ie.injuryType ? ie.injuryType.name.substring(0, 18) : '-', COL.injury, rowY + 5, { width: 80 });
          doc.font('Helvetica').fontSize(6.5).fillColor('#666666');
          doc.text(`Pte: ${ie.affectedArea || 'N/E'} / Nat: ${ie.injuryNature || 'N/E'}`, COL.injury, rowY + 14, { width: 80 });

          // Nivel / Consecuencia
          const lvl = ie.injuryLevel === '1' ? 'LEVE' : ie.injuryLevel === '2' ? 'MODERADO' : ie.injuryLevel === '3' ? 'GRAVE' : ie.injuryLevel === '4' ? 'FATAL' : 'S/L';
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          doc.text(`NIVEL: ${lvl}`, COL.level, rowY + 5, { width: 80 });
          doc.font('Helvetica').fontSize(6.5).fillColor('#666666');
          doc.text(`${ie.injuryConsequence || 'N/E'}`.substring(0, 14), COL.level, rowY + 14, { width: 80 });

          // Días (centrado, limitado)
          const dias = ie.restDays != null ? String(ie.restDays) : '0';
          doc.font('Helvetica-Bold').fontSize(8).fillColor('#E30613');
          doc.text(dias, COL.days, rowY + 9, { width: 38, align: 'center' });

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
      
      const dateFormatted = this.formatDate(inspection.date);
      const inspectorStr = inspection.inspector ? `${inspection.inspector.lastName}, ${inspection.inspector.firstName} (Ficha: ${inspection.inspector.personalNumber})` : '-';
      const facilityStr = inspection.facility ? `${inspection.facility.name} (${inspection.facility.location ? inspection.facility.location.name : ''})` : '-';
      
      this.drawDataRow(doc, 'Código Inspección:', inspection.inspectionNumber || `ID: ${inspection.id}`, 50, startY);
      this.drawDataRow(doc, 'Fecha Ejecución:', dateFormatted, 50, startY + 14);
      this.drawDataRow(doc, 'Instalación:', facilityStr, 50, startY + 28, 250);

      this.drawDataRow(doc, 'Inspector:', inspectorStr, 315, startY, 230);
      this.drawDataRow(doc, 'Estatus:', inspection.status ? inspection.status.name : 'REGISTRADO', 315, startY + 28, 230);
      
      doc.y = startY + 56;

      // Section 2: Observations
      this.drawSectionHeader(doc, 'Diagnóstico y Observaciones de Campo');
      const obsText = (inspection.observations || '').trim();
      if (obsText) {
        doc.font('Helvetica').fontSize(8).fillColor('#222222').text(obsText, 50, doc.y, {
          width: doc.page.width - 100,
          align: 'justify'
        });
        doc.y += 12;
      } else {
        doc.y += 4;
      }

      // Section 3: Specialized Modules
      if (inspection.extinguisherInspection) {
        const extInsp = inspection.extinguisherInspection;
        const details = extInsp.details || [];
        
        this.drawSectionHeader(doc, `Evaluación de Extintores (${extInsp.brand || 'General'})`);
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#444444').text(`Detalles Ubicación:  ${extInsp.locationDetails || 'Instalación general'}`, 50, doc.y);
        doc.y += 14;

        // Helpers for parsing detail observations
        const parseGeneralObservations = (str) => {
          const data = {
            locationOk: true,
            signageOk: true,
            demarcationOk: true,
            operationOk: true,
            accessOk: true,
            impulseType: 'DIRECTO',
            physicalArea: 'No especificada',
            observationsText: ''
          };
          
          if (!str || !str.startsWith('CHECKLIST:')) {
            data.observationsText = str || '';
            return data;
          }

          try {
            const parts = str.split('. ');
            const checklistPart = parts[0] || '';
            const impulsePart = parts[1] || '';
            const areaPart = parts[2] || '';
            const obsPart = parts[3] || '';
            
            data.locationOk = checklistPart.includes('Ubicacion=OK');
            data.signageOk = checklistPart.includes('Señalizacion=OK');
            data.demarcationOk = checklistPart.includes('Demarcacion=OK');
            data.accessOk = checklistPart.includes('Acceso=OK');
            data.operationOk = checklistPart.includes('Funcionamiento=OK');
            
            if (impulsePart.includes('Impulsor: ')) {
              data.impulseType = impulsePart.replace('Impulsor: ', '');
            }
            if (areaPart.includes('Area: ')) {
              data.physicalArea = areaPart.replace('Area: ', '');
            }
            if (obsPart.includes('Observaciones: ')) {
              data.observationsText = obsPart.replace('Observaciones: ', '');
            }
          } catch (e) {
            data.observationsText = str;
          }
          return data;
        };

        const parseDetailObservations = (observationsStr, extinguisherNumber) => {
          const data = {
            code: `EXT-${String(extinguisherNumber).padStart(3, '0')}`,
            physicalArea: 'No especificada',
            impulseType: 'DIRECTO',
            locationOk: true,
            signageOk: true,
            demarcationOk: true,
            accessOk: true,
            operationOk: true,
            maintenancePart: '',
            observationsText: ''
          };

          if (!observationsStr) return data;

          if (!observationsStr.includes('|')) {
            if (observationsStr.startsWith('Mantenimiento: ')) {
              data.maintenancePart = observationsStr.replace('Mantenimiento: ', '').toUpperCase();
            } else {
              data.observationsText = observationsStr;
            }
            return data;
          }

          try {
            const parts = observationsStr.split('|');
            parts.forEach(part => {
              const [key, value] = part.split(':');
              if (!key || !value) return;
              const cleanKey = key.trim();
              const cleanValue = value.trim();

              if (cleanKey === 'Code') data.code = cleanValue;
              else if (cleanKey === 'Area') data.physicalArea = cleanValue;
              else if (cleanKey === 'Imp') data.impulseType = cleanValue.toUpperCase();
              else if (cleanKey === 'Obs') data.observationsText = cleanValue;
              else if (cleanKey === 'Maint') data.maintenancePart = cleanValue.toUpperCase();
              else if (cleanKey === 'CK') {
                const checks = cleanValue.split(',');
                if (checks.length === 5) {
                  data.locationOk = checks[0] === '1';
                  data.signageOk = checks[1] === '1';
                  data.demarcationOk = checks[2] === '1';
                  data.accessOk = checks[3] === '1';
                  data.operationOk = checks[4] === '1';
                }
              }
            });
          } catch (err) {
            console.error('Error parsing detail observations:', err);
          }
          return data;
        };

        const getExtinguisherData = (detail, extInsp) => {
          if (detail && (!detail.observations || !detail.observations.includes('|'))) {
            const parsed = parseGeneralObservations(extInsp.generalObservations);
            return {
              code: extInsp.extinguisherCode || `EXT-${String(detail.extinguisherNumber || 1).padStart(3, '0')}`,
              physicalArea: parsed.physicalArea || 'No especificada',
              impulseType: parsed.impulseType || 'DIRECTO',
              locationOk: parsed.locationOk,
              signageOk: parsed.signageOk,
              demarcationOk: parsed.demarcationOk,
              accessOk: parsed.accessOk,
              operationOk: parsed.operationOk,
              maintenancePart: detail.observations && detail.observations.startsWith('Mantenimiento: ') 
                ? detail.observations.replace('Mantenimiento: ', '').toUpperCase() 
                : '',
              observationsText: parsed.observationsText || ''
            };
          }
          return parseDetailObservations(detail ? detail.observations : '', detail ? detail.extinguisherNumber : 1);
        };

        details.forEach((det, idx) => {
          const parsed = getExtinguisherData(det, extInsp);
          
          const cardHeight = 70 + (parsed.maintenancePart ? 10 : 0) + (parsed.observationsText ? 12 : 0);
          const rectHeight = cardHeight + 8;
          
          if (doc.y + rectHeight > doc.page.height - 70) {
            doc.addPage();
            this.drawHeader(doc, title);
          }
          
          const rowY = doc.y;
          // Card outer boundary box
          doc.rect(50, rowY, 495, rectHeight).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
          
          // Header info inside the card
          doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#005C9E').text(parsed.code, 55, rowY + 5);
          const capacityStr = `${det.agentType ? det.agentType.name : 'Extintor'} - ${det.capacity || '10 Lb'}`;
          doc.font('Helvetica').fontSize(7.5).fillColor('#666666').text(`(${capacityStr})`, 130, rowY + 6.5);
          
          // Status/Operatividad badge on the right
          const approved = det.generalStatus === 'OPERATIVO';
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor(approved ? 'green' : 'orange');
          doc.text(`OPERATIVIDAD: ${det.generalStatus || 'OPERATIVO'}`, 380, rowY + 6.5, { width: 160, align: 'right' });
          
          // Divider under card header
          doc.moveTo(50, rowY + 18).lineTo(545, rowY + 18).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
          
          const y_body = rowY + 23;
          // Vertical divider line in the middle of card body
          doc.moveTo(255, y_body).lineTo(255, y_body + 42).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
          
          // Left Column (Especificaciones Técnicas)
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#444444').text('Especificaciones Técnicas', 55, y_body);
          
          doc.font('Helvetica').fontSize(7).fillColor('#666666').text('Área Ubicado:', 55, y_body + 11);
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#333333').text(parsed.physicalArea, 125, y_body + 11, { width: 125 });
          
          doc.font('Helvetica').fontSize(7).fillColor('#666666').text('Agente Impulsor:', 55, y_body + 20);
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#333333').text(parsed.impulseType, 125, y_body + 20);
          
          const rechargeDateStr = this.formatDate(det.rechargeDate) === '-' ? 'N/R' : this.formatDate(det.rechargeDate);
          doc.font('Helvetica').fontSize(7).fillColor('#666666').text('Fecha Recarga:', 55, y_body + 29);
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#333333').text(rechargeDateStr, 125, y_body + 29);
          
          const expDateStr = this.formatDate(det.expirationDate) === '-' ? 'N/R' : this.formatDate(det.expirationDate);
          doc.font('Helvetica').fontSize(7).fillColor('#666666').text('Vencimiento:', 55, y_body + 38);
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#333333').text(expDateStr, 125, y_body + 38);
          
          // Right Column (Chequeo Visual del Puesto)
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#444444').text('Chequeo Visual del Puesto', 265, y_body);
          
          const drawCheckItem = (label, val, x_pos, y_pos) => {
            doc.font('Helvetica').fontSize(7).fillColor('#555555').text(label, x_pos, y_pos);
            doc.font('Helvetica-Bold').fontSize(7).fillColor(val ? 'green' : 'red').text(val ? 'BUENO' : 'FALLA', x_pos + 115, y_pos, { align: 'right', width: 45 });
          };
          
          drawCheckItem('Ubicación Correcta:', parsed.locationOk, 265, y_body + 11);
          drawCheckItem('Señalización Visible:', parsed.signageOk, 265, y_body + 19);
          drawCheckItem('Área Demarcada:', parsed.demarcationOk, 265, y_body + 27);
          drawCheckItem('Acceso Despejado:', parsed.accessOk, 265, y_body + 35);
          drawCheckItem('Manómetro / Precinto:', parsed.operationOk, 265, y_body + 43);
          
          // Sub-body rows for failures and observations
          let nextY = y_body + 53;
          if (parsed.maintenancePart) {
            doc.font('Helvetica-Bold').fontSize(7).fillColor('red').text(`REPUESTO / PARTE EN FALLA: ${parsed.maintenancePart}`, 55, nextY, { width: 195 });
            nextY += 10;
          }
          if (parsed.observationsText) {
            doc.font('Helvetica-Oblique').fontSize(7).fillColor('#555555').text(`Obs. del Cilindro: ${parsed.observationsText}`, 55, nextY, { width: 480 });
          }
          
          doc.y = rowY + rectHeight + 10;
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
          
          // chk.status is stored as boolean in the DB
          const isFunctional = chk.status === true || chk.status === 1;
          const statusLabel = isFunctional ? 'ÓPTIMO' : 'CON FALLA';
          doc.font('Helvetica-Bold').fillColor(isFunctional ? 'green' : 'red');
          doc.text(statusLabel, 300, rowY + 5);
          
          // observations is stored as serialized "B:x|M:x|NE:x|Obs:text" — extract human-readable part
          let obsDisplay = '-';
          const rawObs = chk.observations || '';
          if (rawObs.includes('|')) {
            // Parse serialized format
            let buenos = 0, malos = 0, noExiste = 0, obsComment = '';
            rawObs.split('|').forEach(part => {
              const [key, ...rest] = part.split(':');
              const val = rest.join(':');
              if (key === 'B') buenos = parseInt(val) || 0;
              else if (key === 'M') malos = parseInt(val) || 0;
              else if (key === 'NE') noExiste = parseInt(val) || 0;
              else if (key === 'Obs') obsComment = val || '';
            });
            if (noExiste === 1) {
              obsDisplay = 'NO EXISTE';
            } else {
              const parts = [];
              if (buenos > 0) parts.push(`Sirven: ${buenos}`);
              if (malos > 0) parts.push(`Fallas: ${malos}`);
              if (obsComment) parts.push(obsComment);
              obsDisplay = parts.join(' | ') || '-';
            }
          } else if (rawObs.trim()) {
            obsDisplay = rawObs.trim();
          }
          
          doc.font('Helvetica').fillColor('#555555');
          doc.text(obsDisplay, 380, rowY + 5, { width: 160 });
          
          doc.y = rowY + rowHeight;
        });
      } else if (inspection.protectionInspection) {
        const protInsp = inspection.protectionInspection;
        const details = (protInsp.details || []).slice();
        
        // Sort details by category ID to match frontend order
        details.sort((a, b) => (a.categoryId || 0) - (b.categoryId || 0));

        this.drawSectionHeader(doc, 'Control de Inventario de Equipos de Protección');
        const respStr = protInsp.responsible ? `${protInsp.responsible.lastName}, ${protInsp.responsible.firstName}` : `ID: ${protInsp.responsible_id}`;
        
        const protY = doc.y;
        this.drawDataRow(doc, 'Responsable Almacén:', respStr, 50, protY, 490);
        
        doc.y = protY + 20;

        const tableStartY = doc.y;
        doc.rect(50, tableStartY, doc.page.width - 100, 16).fill('#005C9E');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        doc.text('CATEGORÍA DE EQUIPO DE PROTECCIÓN', 55, tableStartY + 4);
        doc.text('BUENOS', 255, tableStartY + 4, { width: 40, align: 'center' });
        doc.text('FALLAS', 300, tableStartY + 4, { width: 40, align: 'center' });
        doc.text('TOTAL', 345, tableStartY + 4, { width: 40, align: 'center' });
        doc.text('ESTADO', 390, tableStartY + 4);
        doc.text('OBSERVACIONES DE DETALLE', 455, tableStartY + 4);

        doc.y = tableStartY + 16;
        details.forEach((det, idx) => {
          if (doc.y > doc.page.height - 65) {
            doc.addPage();
            this.drawHeader(doc, title);
          }
          
          let buenos = det.operative !== undefined ? det.operative : 0;
          let malos = det.totalChecked !== undefined ? (det.totalChecked - det.operative) : 0;
          let noExisten = 0;
          let commentText = '';

          const obsRaw = det.observations || '';
          if (obsRaw.includes('|')) {
            const parts = obsRaw.split('|');
            parts.forEach(part => {
              const [key, val] = part.split(':');
              if (key === 'B') buenos = parseInt(val) || 0;
              else if (key === 'M') malos = parseInt(val) || 0;
              else if (key === 'NE') noExisten = parseInt(val) || 0;
              else if (key === 'Obs') commentText = val || '';
            });
          } else {
            commentText = obsRaw;
          }

          const total = buenos + malos;

          // Determine status label and color
          let statusLabel = 'SIN NOVEDAD';
          let statusColor = '#666666';
          const isAllOk = malos === 0 && noExisten === 0 && buenos > 0;
          const hasIssues = malos > 0;
          const hasMissing = noExisten > 0;

          if (isAllOk) {
            statusLabel = 'OPERATIVO';
            statusColor = 'green';
          } else if (buenos === 0 && malos === 0 && noExisten === 0) {
            statusLabel = 'SIN NOVEDAD';
            statusColor = '#666666';
          } else if (hasIssues) {
            statusLabel = 'REPOSICIÓN';
            statusColor = 'red';
          } else if (hasMissing) {
            statusLabel = 'INCOMPLETO';
            statusColor = 'orange';
          }

          const rowY = doc.y;
          const rowHeight = 18;
          if (idx % 2 === 1) {
            doc.rect(50, rowY, doc.page.width - 100, rowHeight).fill('#F9FAFB');
          }
          doc.rect(50, rowY + rowHeight - 0.5, doc.page.width - 100, 0.5).fill('#E5E7EB');
          
          doc.font('Helvetica').fontSize(7.5).fillColor('#333333');
          const categoryName = det.category ? det.category.name : `Categoría ID: ${det.categoryId}`;
          doc.text(categoryName.substring(0, 48), 55, rowY + 5, { width: 195 });
          
          doc.text(String(buenos), 255, rowY + 5, { width: 40, align: 'center' });
          doc.text(String(malos), 300, rowY + 5, { width: 40, align: 'center' });
          doc.text(String(total), 345, rowY + 5, { width: 40, align: 'center' });
          
          doc.font('Helvetica-Bold').fillColor(statusColor);
          doc.text(statusLabel, 390, rowY + 5);
          
          doc.font('Helvetica').fillColor('#555555');
          doc.text(commentText || '-', 455, rowY + 5, { width: 85 });
          
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

      const isSelected = (key) => selectedCols.some(c => c.key === key);

      // Stats block
      const statsY = doc.y;
      doc.rect(50, statsY, doc.page.width - 100, 32).fill('#FDF8F8');
      doc.rect(50, statsY, doc.page.width - 100, 32).lineWidth(0.5).strokeColor('#F2CFCF').stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#E30613').text('ESTADÍSTICAS DEL REGISTRO', 65, statsY + 12);
      doc.font('Helvetica').fontSize(8).fillColor('#333333').text(`Total Accidentes: ${accidents.length} incidentes registrados`, 215, statsY + 12);
      doc.font('Helvetica').fontSize(8).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, doc.page.width - 200, statsY + 12, { align: 'right', width: 140 });
      
      doc.y = statsY + 45;

      accidents.forEach((acc) => {
        const cardFields = [];
        
        if (isSelected('accidentType')) cardFields.push({ label: 'Tipo Incidente:', value: acc.type ? acc.type.name : '-' });
        if (isSelected('facility')) cardFields.push({ label: 'Instalación:', value: acc.facility ? acc.facility.name : '-' });
        if (isSelected('management')) cardFields.push({ label: 'Gerencia Resp.:', value: acc.management ? acc.management.name : '-' });
        if (isSelected('status')) {
          const statusText = acc.processStatus ? acc.processStatus.name : 'REGISTRADO';
          cardFields.push({ label: 'Estatus:', value: statusText, isStatus: true });
        }
        if (isSelected('medicalCenterName')) cardFields.push({ label: 'Centro Médico:', value: acc.medicalCenterName || '-' });
        if (isSelected('medicalObservations')) cardFields.push({ label: 'Obs. Médicas:', value: acc.medicalObservations || '-' });
        if (isSelected('globalObservations')) cardFields.push({ label: 'Obs. Globales:', value: acc.globalObservations || '-' });
        if (isSelected('description')) cardFields.push({ label: 'Descripción:', value: acc.description || '-' });

        // Conservative height check
        if (doc.y + 150 > doc.page.height - 65) {
          doc.addPage();
          this.drawHeader(doc, title);
        }

        let rowY = doc.y;

        // Render header details (Date / Time)
        let headerRight = '';
        if (isSelected('accidentDate')) {
          const dateStr = this.formatDate(acc.accidentDate);
          headerRight += `FECHA: ${dateStr}   `;
        }
        if (isSelected('accidentTime')) {
          const timeStr = acc.accidentTime || acc.accident_time || '-';
          headerRight += `HORA: ${timeStr}`;
        }

        // Draw header background
        doc.rect(50, rowY, 495, 20).fill('#F2F5F8');
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#005C9E');
        const codeVal = acc.accidentControlNumber || acc.accident_control_number || acc.inpsaselFileNumber || `ID: ${acc.id}`;
        doc.text(String(codeVal).toUpperCase(), 55, rowY + 6);

        doc.font('Helvetica-Bold').fontSize(8).fillColor('#555555');
        doc.text(headerRight.trim(), 300, rowY + 6, { width: 240, align: 'right' });

        // Divider
        doc.moveTo(50, rowY + 20).lineTo(545, rowY + 20).lineWidth(0.5).strokeColor('#E5E7EB').stroke();

        let currentY = rowY + 26;

        // Render all fields vertically to dynamically wrap and prevent overlap
        cardFields.forEach((field) => {
          if (currentY > doc.page.height - 75) {
            doc.rect(50, rowY, 495, currentY - rowY + 5).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
            
            doc.addPage();
            this.drawHeader(doc, title);
            rowY = doc.y;
            currentY = rowY;
            
            doc.rect(50, currentY, 495, 20).fill('#F2F5F8');
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#005C9E');
            doc.text(`${codeVal} (CONTINUACIÓN)`, 55, currentY + 6);
            
            doc.moveTo(50, currentY + 20).lineTo(545, currentY + 20).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
            currentY += 26;
          }

          doc.font('Helvetica').fontSize(7.5).fillColor('#666666').text(field.label, 55, currentY, { width: 115 });
          
          if (field.isStatus) {
            const isComp = String(field.value).toLowerCase().includes('comp');
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(isComp ? 'green' : 'orange');
          } else {
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333');
          }
          
          doc.text(String(field.value), 175, currentY, { width: 360 });
          currentY = doc.y + 4;
        });

        const cardHeight = currentY - rowY;
        doc.rect(50, rowY, 495, cardHeight).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
        doc.y = rowY + cardHeight + 12;
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

      const allCols = [
        { key: 'inspectionNumber', label: 'CÓDIGO/INSP.' },
        { key: 'date', label: 'FECHA' },
        { key: 'facility', label: 'INSTALACIÓN EVALUADA' },
        { key: 'inspector', label: 'INSPECTOR RESPONSABLE' },
        { key: 'typeStatus', label: 'TIPO INSPECCIÓN' },
        { key: 'status', label: 'ESTATUS EVALUACIÓN' },
        { key: 'coordinates', label: 'COORDENADAS' },
        { key: 'observations', label: 'OBSERVACIONES' }
      ];

      let selectedCols = allCols;
      if (columns && Array.isArray(columns) && columns.length > 0) {
        selectedCols = allCols.filter(c => columns.includes(c.key));
      }
      if (selectedCols.length === 0) selectedCols = allCols;

      const isSelected = (key) => selectedCols.some(c => c.key === key);

      // Stats block
      const statsY = doc.y;
      doc.rect(50, statsY, doc.page.width - 100, 32).fill('#F4F7FA');
      doc.rect(50, statsY, doc.page.width - 100, 32).lineWidth(0.5).strokeColor('#CCD5E0').stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#005C9E').text('ESTADÍSTICAS DEL REGISTRO', 65, statsY + 12);
      doc.font('Helvetica').fontSize(8).fillColor('#333333').text(`Total Inspecciones: ${inspections.length} informes registrados`, 215, statsY + 12);
      doc.font('Helvetica').fontSize(8).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, doc.page.width - 200, statsY + 12, { align: 'right', width: 140 });
      doc.y = statsY + 45;

      inspections.forEach((insp) => {
        const cardFields = [];

        let typeStr = 'General';
        if (insp.extinguisherInspection) typeStr = 'Extintores';
        else if (insp.vehicleInspection) typeStr = 'Vehicular';
        else if (insp.protectionInspection) typeStr = 'Protección';

        if (isSelected('facility')) cardFields.push({ label: 'Instalación:', value: insp.facility ? `${insp.facility.name}${insp.facility.location ? ' (' + insp.facility.location.name + ')' : ''}` : '-' });
        if (isSelected('inspector')) cardFields.push({ label: 'Inspector:', value: insp.inspector ? `${insp.inspector.lastName}, ${insp.inspector.firstName}` : '-' });
        if (isSelected('typeStatus')) cardFields.push({ label: 'Tipo Inspección:', value: typeStr, isType: true });
        if (isSelected('status')) {
          cardFields.push({ label: 'Estatus:', value: insp.status ? insp.status.name : 'Pendiente', isStatus: true, statusId: insp.statusId });
        }
        if (isSelected('coordinates')) cardFields.push({ label: 'Coordenadas:', value: insp.coordinates || '-' });
        if (isSelected('observations')) cardFields.push({ label: 'Observaciones:', value: insp.observations || '-' });

        if (doc.y + 120 > doc.page.height - 65) {
          doc.addPage();
          this.drawHeader(doc, title);
        }

        let rowY = doc.y;

        doc.rect(50, rowY, 495, 20).fill('#F2F5F8');
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#005C9E');
        const codeVal = insp.inspectionNumber || `ID: ${insp.id}`;
        doc.text(String(codeVal).toUpperCase(), 55, rowY + 6);

        let headerRight = '';
        if (isSelected('date')) {
          const dateStr = this.formatDate(insp.date);
          headerRight = `FECHA: ${dateStr}`;
        }
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#555555');
        doc.text(headerRight.trim(), 300, rowY + 6, { width: 240, align: 'right' });

        doc.moveTo(50, rowY + 20).lineTo(545, rowY + 20).lineWidth(0.5).strokeColor('#E5E7EB').stroke();

        let currentY = rowY + 26;

        cardFields.forEach((field) => {
          if (currentY > doc.page.height - 75) {
            doc.rect(50, rowY, 495, currentY - rowY + 5).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
            doc.addPage();
            this.drawHeader(doc, title);
            rowY = doc.y;
            currentY = rowY;
            doc.rect(50, currentY, 495, 20).fill('#F2F5F8');
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#005C9E');
            doc.text(`${codeVal} (CONTINUACIÓN)`, 55, currentY + 6);
            doc.moveTo(50, currentY + 20).lineTo(545, currentY + 20).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
            currentY += 26;
          }

          doc.font('Helvetica').fontSize(7.5).fillColor('#666666').text(field.label, 55, currentY, { width: 115 });

          if (field.isType) {
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#005C9E');
          } else if (field.isStatus) {
            const statusColor = field.statusId === 3 ? '#10B981' : field.statusId === 2 ? '#F59E0B' : '#6B7280';
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(statusColor);
          } else {
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333');
          }

          doc.text(String(field.value), 175, currentY, { width: 360 });
          currentY = doc.y + 4;
        });

        const cardHeight = currentY - rowY;
        doc.rect(50, rowY, 495, cardHeight).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
        doc.y = rowY + cardHeight + 12;
      });

      this.drawFooter(doc);
      doc.end();
    });
  }
}

module.exports = PdfGenerator;
