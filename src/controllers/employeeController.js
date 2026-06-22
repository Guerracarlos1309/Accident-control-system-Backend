const { Employee, JobTitle, Occupation, Management } = require("../models");
const { Op } = require("sequelize");

/*
  Get all employees with associations
 */
exports.getAllEmployees = async (req, res, next) => {
  try {
    const { status } = req.query;

    let whereClause;

    if (status === undefined) {
      // No filter → show all "active-state" employees (1=Activo, 2=Inactivo temporal,
      // 3=Vacaciones, 4=Reposo Médico, 5=Suspendido). Only exclude retired (status 0).
      whereClause = { status: { [Op.ne]: 0 } };
    } else {
      // Explicit filter (e.g. ?status=0 for the inactive/historic panel)
      whereClause = { status: parseInt(status) };
    }

    const employees = await Employee.findAll({
      where: whereClause,
      include: [

        { model: JobTitle, as: "jobTitle" },
        { model: Occupation, as: "occupation" },
        { model: Management, as: "management" },
      ],
    });
    res.status(200).json(employees);
  } catch (error) {
    next(error);
  }
};

/*
  Get employee by personal number
 */
exports.getEmployeeByPersonalNumber = async (req, res, next) => {
  try {
    const { personal_number } = req.params;
    const employee = await Employee.findOne({
      where: { personalNumber: personal_number },
      include: [

        { model: JobTitle, as: "jobTitle" },
        { model: Occupation, as: "occupation" },
        { model: Management, as: "management" },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

/*
  Create a new employee
 */
exports.createEmployee = async (req, res, next) => {
  try {
    const employeeData = req.body;
    
    if (req.file) {
      employeeData.imageUrl = `/uploads/employees/${req.file.filename}`;
    }

    // Si seleccionó 'Otros', registrar el nuevo Cargo en la base de datos
    if (employeeData.occupationId === 'other' && employeeData.customOccupation) {
      const [occRecord] = await Occupation.findOrCreate({
        where: { name: employeeData.customOccupation.trim() }
      });
      employeeData.occupationId = occRecord.id;
    }

    // Si seleccionó 'Otros', registrar la nueva Ocupación en la base de datos
    if (employeeData.jobTitleId === 'other' && employeeData.customJobTitle) {
      const [jtRecord] = await JobTitle.findOrCreate({
        where: { name: employeeData.customJobTitle.trim() }
      });
      employeeData.jobTitleId = jtRecord.id;
    }
    
    // Basic server-side validation for required fields
    const required = ['personalNumber', 'idCard', 'firstName', 'lastName', 'managementId', 'jobTitleId', 'occupationId'];
    for(const field of required) {
      if(!employeeData[field]) {
        return res.status(400).json({ message: "Se deben enviar todos los datos obligatorios marcados con (*)" });
      }
    }

    const newEmployee = await Employee.create(employeeData);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    
    if (error.name === "SequelizeUniqueConstraintError") {
      let field = "";
      let value = "";
      
      if (error.errors && error.errors.length > 0) {
        field = error.errors[0].path;
        value = error.errors[0].value;
      } else if (error.parent && error.parent.detail) {
        // Parse details like "Key (personal_number)=(123) already exists."
        const match = error.parent.detail.match(/\((.*?)\)=\((.*?)\)/);
        if (match) {
          field = match[1];
          value = match[2];
        }
      }

      let message = "Ya existe un registro con estos datos.";
      const fieldLower = field ? field.toLowerCase() : "";

      if (fieldLower === "id_card" || fieldLower === "idcard") 
        message = `Ya existe un empleado registrado con la Cédula: ${value}`;
      else if (fieldLower === "personal_number" || fieldLower === "personalnumber") 
        message = `El Número de Personal ${value} ya está asignado a otro empleado`;
      else if (fieldLower === "email") 
        message = `El correo electrónico ${value} ya está en uso`;
      else if (fieldLower === "phone")
        message = `El número de teléfono ${value} ya está asignado a otro empleado`;

      return res.status(400).json({ message });
    }
    next(error);
  }
};

/*
  Update an employee
 */
exports.updateEmployee = async (req, res, next) => {
  try {
    const { personal_number } = req.params;
    const employeeData = req.body;
    
    if (req.file) {
      employeeData.imageUrl = `/uploads/employees/${req.file.filename}`;
    }
    
    // Si seleccionó 'Otros', registrar el nuevo Cargo en la base de datos
    if (employeeData.occupationId === 'other' && employeeData.customOccupation) {
      const [occRecord] = await Occupation.findOrCreate({
        where: { name: employeeData.customOccupation.trim() }
      });
      employeeData.occupationId = occRecord.id;
    }

    // Si seleccionó 'Otros', registrar la nueva Ocupación en la base de datos
    if (employeeData.jobTitleId === 'other' && employeeData.customJobTitle) {
      const [jtRecord] = await JobTitle.findOrCreate({
        where: { name: employeeData.customJobTitle.trim() }
      });
      employeeData.jobTitleId = jtRecord.id;
    }

    console.log(`UPDATE REQUEST - Param ID: ${personal_number}`, employeeData);

    const [updatedRows] = await Employee.update(employeeData, {
      where: { personalNumber: personal_number },
    });

    if (updatedRows > 0) {
      const updatedEmployee = await Employee.findOne({
        where: { personalNumber: personal_number },
        include: [
          { model: Management, as: "management" },
          { model: JobTitle, as: "jobTitle" },
          { model: Occupation, as: "occupation" },
        ],
      });
      return res.status(200).json(updatedEmployee);
    }

    return res.status(404).json({ message: "Employee not found" });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      let field = "";
      let value = "";
      
      if (error.errors && error.errors.length > 0) {
        field = error.errors[0].path;
        value = error.errors[0].value;
      } else if (error.parent && error.parent.detail) {
        const match = error.parent.detail.match(/\((.*?)\)=\((.*?)\)/);
        if (match) {
          field = match[1];
          value = match[2];
        }
      }

      let message = "Conflicto de duplicidad en la actualización.";
      const fieldLower = field ? field.toLowerCase() : "";

      if (fieldLower === "id_card" || fieldLower === "idcard") 
        message = `No se puede actualizar: La Cédula ${value} ya pertenece a otro empleado`;
      else if (fieldLower === "personal_number" || fieldLower === "personalnumber") 
        message = `No se puede actualizar: El N° Personal ${value} ya existe`;
      else if (fieldLower === "email") 
        message = `No se puede actualizar: El correo ${value} ya está registrado`;
      else if (fieldLower === "phone")
        message = `No se puede actualizar: El teléfono ${value} ya pertenece a otro empleado`;

      return res.status(400).json({ message });
    }
    next(error);
  }
};

/*
  Delete an employee (Soft or Hard delete based on permanent query param)
 */
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { personal_number } = req.params;
    const { permanent } = req.query;

    if (permanent === "true") {
      // Hard delete (Physical)
      const deletedRows = await Employee.destroy({
        where: { personalNumber: personal_number },
      });

      if (deletedRows > 0) {
        return res
          .status(200)
          .json({ message: "Employee permanently deleted" });
      }
    } else {
      // Soft delete (Logical - Deactivate)
      const [updatedRows] = await Employee.update(
        { status: 0 },
        {
          where: { personalNumber: personal_number },
        },
      );

      if (updatedRows > 0) {
        return res
          .status(200)
          .json({ message: "Employee deactivated successfully" });
      }
    }

    return res.status(404).json({ message: "Employee not found" });
  } catch (error) {
    next(error);
  }
};
