// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract UFRJ_CRID {
    enum EnrollmentState { PENDENTE, CONFIRMADA, TRANCADA }

    struct Enrollment {
        EnrollmentState state;
        uint256 lastUpdated;
    }

    struct Course {
        string code;
        uint256 maxCapacity;
        uint256 confirmedCount;
    }

    // Storage
    mapping(address => mapping(string => Enrollment)) public enrollments;
    mapping(string => Course) public courses;
    address public immutable admin;

    // Events
    event CourseCreated(string indexed courseCode, uint256 maxCapacity);
    event EnrollmentChanged(
        address indexed student,
        string indexed courseCode,
        EnrollmentState newState
    );

    constructor() {
        admin = msg.sender;
    }

    // Admin-only: Create new courses
    function createCourse(string memory _code, uint256 _maxCapacity) external {
        require(msg.sender == admin, "Somente administrador");
        require(bytes(_code).length > 0, "Codigo invalido");
        require(_maxCapacity > 0, "Capacidade deve ser >0");
        require(courses[_code].maxCapacity == 0, "Disciplina ja existe");

        courses[_code] = Course(_code, _maxCapacity, 0);
        emit CourseCreated(_code, _maxCapacity);
    }

    // Student-facing: Update enrollment status
    function updateEnrollment(string memory _code, EnrollmentState _newState) external {
        Course storage course = courses[_code];
        require(course.maxCapacity > 0, "Disciplina nao existe");

        Enrollment storage enrollment = enrollments[msg.sender][_code];

        // State transition rules
        if (_newState == EnrollmentState.CONFIRMADA) {
            require(
                enrollment.state == EnrollmentState.PENDENTE,
                "Transicao invalida: So pode confirmar de PENDENTE"
            );
            require(
                course.confirmedCount < course.maxCapacity,
                "Vagas esgotadas"
            );
            course.confirmedCount++;
        } 
        else if (_newState == EnrollmentState.TRANCADA) {
            require(
                enrollment.state != EnrollmentState.TRANCADA,
                "Ja esta trancada"
            );
            if (enrollment.state == EnrollmentState.CONFIRMADA) {
                course.confirmedCount--;
            }
        } else {
            require(
                enrollment.lastUpdated == 0,
                "So pode definir PENDENTE em nova inscricao"
            );
        }

        enrollment.state = _newState;
        enrollment.lastUpdated = block.timestamp;
        emit EnrollmentChanged(msg.sender, _code, _newState);
    }

    // View function to check capacity
    function getRemainingSlots(string memory _code) external view returns (uint256) {
        Course memory course = courses[_code];
        require(course.maxCapacity > 0, "Disciplina nao existe");
        return course.maxCapacity - course.confirmedCount;
    }
}