const { Employee } = require('../src/models');
const sequelize = require('../src/config/database');

async function test() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");
    
    // Create temporary employee 1
    console.log("Creating Test Employee 1...");
    const emp1 = await Employee.create({
      personalNumber: "TEST9991",
      idCard: "V-99999991",
      firstName: "TEST",
      lastName: "ONE",
      managementId: 8,
      jobTitleId: 1,
      occupationId: 1,
      email: null,
      phone: null
    });
    console.log("Employee 1 created successfully.");
    
    // Create temporary employee 2
    console.log("Creating Test Employee 2...");
    const emp2 = await Employee.create({
      personalNumber: "TEST9992",
      idCard: "V-99999992",
      firstName: "TEST",
      lastName: "TWO",
      managementId: 8,
      jobTitleId: 1,
      occupationId: 1,
      email: null,
      phone: null
    });
    console.log("Employee 2 created successfully.");
    
    // Clean up
    await emp1.destroy();
    await emp2.destroy();
    console.log("Test employees cleaned up successfully.");
    console.log("Test PASSED: Multiple employees can have NULL email and phone!");
  } catch (error) {
    console.error("Test FAILED:", error);
  } finally {
    await sequelize.close();
  }
}

test();
