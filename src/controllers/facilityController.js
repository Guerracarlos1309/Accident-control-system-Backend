const { Facility, Location, InstallationType, Parish, City, State, FacilityImage, sequelize } = require('../models');

exports.getFacilities = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    
    // Default to active (1) if no status provided
    if (status !== undefined) {
      where.status = parseInt(status);
    } else {
      where.status = 1;
    }

    const facilities = await Facility.findAll({
      where,
      include: [
        { 
          model: Location, 
          as: 'location',
          include: [{ 
            model: Parish, 
            as: 'parish', 
            include: [{ 
              model: City, 
              as: 'city', 
              include: [{ 
                model: State, 
                as: 'state' 
              }] 
            }] 
          }]
        },
        { model: InstallationType, as: 'installationType' },
        { model: FacilityImage, as: 'images' }
      ]
    });
    res.status(200).json(facilities);
  } catch (error) {
    next(error);
  }
};

exports.getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findByPk(req.params.id, {
      include: [
        { model: Location, as: 'location' },
        { model: InstallationType, as: 'installationType' },
        { model: FacilityImage, as: 'images' }
      ]
    });
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.status(200).json(facility);
  } catch (error) {
    next(error);
  }
};

exports.createFacility = async (req, res, next) => {
  try {
    let { name, parishId, ...otherData } = req.body;
    
    let locationId = req.body.locationId;

    // If parishId is a string (name), resolve it to an ID
    if (parishId && isNaN(parishId)) {
      const parishRecord = await Parish.findOne({ 
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')), 
          parishId.toLowerCase().trim()
        )
      });
      if (parishRecord) {
        parishId = parishRecord.id;
      } else {
        console.error(`ERROR: Parish not found in database: "${parishId}"`);
        return res.status(400).json({ 
          message: `La parroquia "${parishId}" no está registrada en el sistema.` 
        });
      }
    }

    if (parishId && !locationId) {
      const [location] = await Location.findOrCreate({
        where: { 
          name: `Ubicación ${name}`,
          parishId: parseInt(parishId)
        }
      });
      locationId = location.id;
    }

    const newFacility = await Facility.create({
      name,
      coordinates: otherData.coordinates,
      installationTypeId: otherData.installationTypeId,
      voltageLevel: otherData.voltageLevel,
      locationId
    });

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        return FacilityImage.create({
          imageUrl: `/uploads/facilities/${file.filename}`,
          facilityId: newFacility.id
        });
      });
      await Promise.all(imagePromises);
    }

    res.status(201).json(newFacility);
  } catch (error) {
    console.error("Error in createFacility:", error);
    next(error);
  }
};

exports.updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findByPk(req.params.id, {
      include: [{ model: Location, as: 'location' }]
    });
    
    if (!facility) return res.status(404).json({ message: 'Facility not found' });

    let { name, parishId, ...otherData } = req.body;
    let locationId = req.body.locationId || facility.locationId;

    // If parishId is a string (name), resolve it to an ID
    if (parishId && isNaN(parishId)) {
      const parishRecord = await Parish.findOne({ 
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')), 
          parishId.toLowerCase().trim()
        )
      });
      if (parishRecord) {
        parishId = parishRecord.id;
      } else {
        console.error(`ERROR: Parish not found in database: "${parishId}"`);
        return res.status(400).json({ 
          message: `La parroquia "${parishId}" no está registrada en el sistema.` 
        });
      }
    }

    if (parishId && parishId != facility.location?.parishId) {
       const [location] = await Location.findOrCreate({
        where: { 
          name: `Ubicación ${name || facility.name}`,
          parishId: parseInt(parishId)
        }
      });
      locationId = location.id;
    }

    const updateData = {
      name: name || facility.name,
      coordinates: otherData.coordinates,
      installationTypeId: otherData.installationTypeId,
      voltageLevel: otherData.voltageLevel,
      locationId,
      status: req.body.status !== undefined ? req.body.status : facility.status
    };

    await facility.update(updateData);

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        return FacilityImage.create({
          imageUrl: `/uploads/facilities/${file.filename}`,
          facilityId: facility.id
        });
      });
      await Promise.all(imagePromises);
    }

    res.status(200).json(facility);
  } catch (error) {
    console.error("Error in updateFacility:", error);
    next(error);
  }
};

exports.deleteFacility = async (req, res, next) => {
  try {
    const { permanent } = req.query;
    const facility = await Facility.findByPk(req.params.id);
    
    if (!facility) return res.status(404).json({ message: 'Facility not found' });

    if (permanent === 'true') {
      await facility.destroy();
      return res.status(204).send();
    } else {
      await facility.update({ status: 0 });
      return res.status(200).json({ message: 'Facility inactivated successfully' });
    }
  } catch (error) {
    next(error);
  }
};

exports.reactivateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findByPk(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    
    await facility.update({ status: 1 });
    res.status(200).json(facility);
  } catch (error) {
    next(error);
  }
};
