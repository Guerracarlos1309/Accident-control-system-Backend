const { User, Role } = require("../models");

/*
  Get all users with their roles
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      include: [{ model: Role, as: "role" }],
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/*
  Admin creates a new user
  This function is intended to be protected by isAdmin middleware in the routes
 */
exports.createUser = async (req, res, next) => {
  try {
    const { username, password, roleId, firstName, lastName, email } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      username,
      password,
      roleId,
      firstName,
      lastName,
      email,
    });

    // Return user info excluding password
    const userJson = newUser.toJSON();
    delete userJson.password;

    res.status(201).json(userJson);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Username or Email already in use" });
    }
    next(error);
  }
};


/*
  Update a user
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    // Safeguard: Do not update password if it's an empty string
    if (userData.password === "") {
      delete userData.password;
    }

    const [updatedRows] = await User.update(userData, {
      where: { id },
      individualHooks: true, // To trigger password hashing if updated
    });

    if (updatedRows > 0) {
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: [{ model: Role, as: "role" }],
      });
      return res.status(200).json(updatedUser);
    }

    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    next(error);
  }
};

/*
  Update the current authenticated user's profile
 */
exports.updateMe = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { username, roleId, name, ...otherData } = req.body; // Prevent updating role or username from profile

    // Map 'name' to 'firstName' and ignore 'lastName'
    const allowedData = { ...otherData };
    if (name) allowedData.firstName = name;

    const [updatedRows] = await User.update(allowedData, {
      where: { id },
      individualHooks: true,
    });

    if (updatedRows > 0) {
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: [{ model: Role, as: "role" }],
      });
      
      const simplifiedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.firstName,
        role: user.role ? user.role.name : null,
      };

      return res.status(200).json(simplifiedUser);
    }

    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    next(error);
  }
};

/*
  Delete a user
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedCount = await User.destroy({
      where: { id },
    });

    if (deletedCount > 0) {
      return res.status(200).json({ message: "User deleted successfully" });
    }

    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    next(error);
  }
};

