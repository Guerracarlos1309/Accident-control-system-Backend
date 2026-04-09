const { Facility, Location, InstallationType, Parish, City, State } = require('../models');

exports.getFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.findAll({
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
        { model: InstallationType, as: 'installationType' }
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
        { model: InstallationType, as: 'installationType' }
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
    const newFacility = await Facility.create(req.body);
    res.status(201).json(newFacility);
  } catch (error) {
    next(error);
  }
};

exports.updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findByPk(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    await facility.update(req.body);
    res.status(200).json(facility);
  } catch (error) {
    next(error);
  }
};

exports.deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findByPk(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    await facility.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
