import { expect } from "chai";
import { ethers } from "hardhat";
import { UFRJ_CRID } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

enum EnrollmentState {
    PENDENTE,
    CONFIRMADA,
    TRANCADA,
}

describe("UFRJ_CRID Contract", function () {
    // Variáveis para armazenar o contrato e as contas
    let cridContract: UFRJ_CRID;
    let admin: SignerWithAddress;
    let student1: SignerWithAddress;
    let student2: SignerWithAddress;

    // Hook que roda antes de cada teste para garantir um estado limpo
    beforeEach(async function () {
    try {
        [admin, student1, student2] = await ethers.getSigners();
        const UFRJ_CRID_Factory = await ethers.getContractFactory("UFRJ_CRID", admin);
        cridContract = await UFRJ_CRID_Factory.deploy();
    } catch (error) {
        console.error('DEPLOYMENT ERROR:', error);
        throw error;
    }
    });
    describe("Deployment", function () {
        it("Should set the deployer as the admin", async function () {
            expect(await cridContract.admin()).to.equal(admin.address);
        });
    });

    describe("Course Management", function () {
        it("Should allow the admin to create a new course", async function () {
            const courseCode = "MAB123";
            const maxCapacity = 30;

            // Admin cria o curso e verifica se o evento foi emitido
            await expect(cridContract.createCourse(courseCode, maxCapacity))
                .to.emit(cridContract, "CourseCreated")
                .withArgs(courseCode, maxCapacity);

            // Verifica se os dados do curso foram armazenados corretamente
            const course = await cridContract.courses(courseCode);
            expect(course.code).to.equal(courseCode);
            expect(course.maxCapacity).to.equal(maxCapacity);
            expect(course.confirmedCount).to.equal(0);
        });

        it("Should NOT allow a non-admin to create a course", async function () {
            await expect(
                cridContract.connect(student1).createCourse("MAB123", 30)
            ).to.be.revertedWith("Somente administrador");
        });

        it("Should fail if creating a course that already exists", async function () {
            await cridContract.createCourse("MAB123", 30);
            await expect(
                cridContract.createCourse("MAB123", 30)
            ).to.be.revertedWith("Disciplina ja existe");
        });
    });

    describe("Enrollment Workflow", function () {
        const courseCode = "MAB123";
        const maxCapacity = 1;

        beforeEach(async function () {
            // Cria um curso com capacidade 1 antes de cada teste deste bloco
            await cridContract.createCourse(courseCode, maxCapacity);
        });

        it("Should allow a student to request and then confirm an enrollment", async function () {
            // 1. Aluno solicita matrícula (estado PENDENTE)
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.PENDENTE);
            let enrollment = await cridContract.enrollments(student1.address, courseCode);
            expect(enrollment.state).to.equal(EnrollmentState.PENDENTE);

            // 2. Aluno confirma a matrícula
            await expect(cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.CONFIRMADA))
                .to.emit(cridContract, "EnrollmentChanged")
                .withArgs(student1.address, courseCode, EnrollmentState.CONFIRMADA);
            
            enrollment = await cridContract.enrollments(student1.address, courseCode);
            expect(enrollment.state).to.equal(EnrollmentState.CONFIRMADA);

            const course = await cridContract.courses(courseCode);
            expect(course.confirmedCount).to.equal(1);
        });

        it("Should NOT allow a student to confirm enrollment if capacity is full", async function () {
            // student1 preenche a única vaga
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.PENDENTE);
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.CONFIRMADA);

            // student2 tenta se matricular
            await cridContract.connect(student2).updateEnrollment(courseCode, EnrollmentState.PENDENTE);
            await expect(
                cridContract.connect(student2).updateEnrollment(courseCode, EnrollmentState.CONFIRMADA)
            ).to.be.revertedWith("Vagas esgotadas");
        });

        it("Should allow a student to lock an enrollment and release a slot", async function () {
            // Aluno confirma a matrícula, ocupando uma vaga
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.PENDENTE);
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.CONFIRMADA);
            
            let course = await cridContract.courses(courseCode);
            expect(course.confirmedCount).to.equal(1);

            // Aluno tranca a matrícula
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.TRANCADA);
            const enrollment = await cridContract.enrollments(student1.address, courseCode);
            expect(enrollment.state).to.equal(EnrollmentState.TRANCADA);

            // Verifica se a vaga foi liberada
            course = await cridContract.courses(courseCode);
            expect(course.confirmedCount).to.equal(0);
        });

        it("Should NOT allow confirming from a state other than PENDENTE", async function() {
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.PENDENTE);
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.TRANCADA);

            await expect(
                cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.CONFIRMADA)
            ).to.be.revertedWith("So pode confirmar de PENDENTE");
        });

    });

    describe("View Functions", function () {
        it("Should return the correct number of remaining slots", async function () {
            const courseCode = "FIS123";
            const maxCapacity = 10;
            await cridContract.createCourse(courseCode, maxCapacity);

            // Vagas iniciais
            expect(await cridContract.getRemainingSlots(courseCode)).to.equal(maxCapacity);

            // student1 confirma
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.PENDENTE);
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.CONFIRMADA);
            expect(await cridContract.getRemainingSlots(courseCode)).to.equal(maxCapacity - 1);

            // student2 confirma
            await cridContract.connect(student2).updateEnrollment(courseCode, EnrollmentState.PENDENTE);
            await cridContract.connect(student2).updateEnrollment(courseCode, EnrollmentState.CONFIRMADA);
            expect(await cridContract.getRemainingSlots(courseCode)).to.equal(maxCapacity - 2);

            // student1 tranca, liberando uma vaga
            await cridContract.connect(student1).updateEnrollment(courseCode, EnrollmentState.TRANCADA);
            expect(await cridContract.getRemainingSlots(courseCode)).to.equal(maxCapacity - 1);
        });
    });
});