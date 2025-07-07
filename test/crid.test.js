// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("UFRJ_CRID", () => {
//   let contract, admin, student;

//   before(async () => {
//     [admin, student] = await ethers.getSigners();
//     const UFRJ_CRID = await ethers.getContractFactory("UFRJ_CRID");
//     contract = await UFRJ_CRID.deploy();
//   });

//   it("Should create courses only by admin", async () => {
//     await contract.connect(admin).createCourse("MAT1234", 30);
//     await expect(contract.connect(student).createCourse("INF1234", 20))
//       .to.be.revertedWith("Somente administrador");
//   });

//   it("Should enforce state transitions", async () => {
//     await contract.connect(student).updateEnrollment("MAT1234", 1); // CONFIRMADA
//     const enrollment = await contract.enrollments(student.address, "MAT1234");
//     expect(enrollment.state).to.equal(1); // Confirmada
//   });
// });