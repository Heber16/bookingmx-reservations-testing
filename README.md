## BookingMx - Complete Module Testing

📋 General Description
Comprehensive testing project for BookingMx, including two independent sprints:

Sprint 1: Reservation Module Testing in Java with JUnit

Sprint 2: Graph Visualization Module Testing in JavaScript with Jest

🎯 Project Objectives

Implement exhaustive unit testing for BookingMx’s critical modules, ensuring:

Minimum 90% coverage in both sprints

Tests for positive, negative, and edge cases

Detailed documentation of issues found and solutions applied

Robust and production-ready code

📁 Project Structure

bookingmx-reservations-testing/
│
├── sprint1-java-junit/              # Sprint 1: Reservation Module
│   ├── src/main/java/              # Java source code
│   ├── src/test/java/              # Tests with JUnit 5
│   ├── docs/                       # Sprint 1 documentation
│   ├── pom.xml                     # Maven configuration
│   └── README.md                   # Sprint 1 guide
│
├── sprint2-javascript-jest/         # Sprint 2: Graph Module
│   ├── src/                        # JavaScript source code
│   ├── __tests__/                  # Tests with Jest
│   ├── docs/                       # Sprint 2 documentation
│   ├── package.json                # npm configuration
│   └── README.md                   # Sprint 2 guide
└── README.md                       # This file

🚀 Sprint 1: Reservation Module (Java + JUnit)

Technologies

Java 17

Maven

JUnit 5

Mockito

JaCoCo

Tested Features

✅ Reservation creation
✅ Reservation editing
✅ Reservation cancellation
✅ Business validations
✅ Exception handling

Coverage Achieved
92% – Over 50 unit tests

Run Tests

cd sprint1-java-junit
mvn clean test
mvn clean test jacoco:report


🚀 Sprint 2: Graph Visualization Module (JavaScript + Jest)

Technologies

Node.js

JavaScript ES6+

Jest

Babel

Tested Features

✅ City management
✅ City connections
✅ Distance calculation (Haversine formula)
✅ Route search (Dijkstra algorithm)
✅ Data visualization

Coverage Achieved
95.8% – Over 190 unit tests

Run Tests

cd sprint2-javascript-jest
npm install
npm test
npm run test:coverage


📊 Summary of Results

Sprint	Technology	Tests	Coverage	Status
Sprint 1	Java / JUnit	50+	92%	✅ Completed
Sprint 2	JavaScript / Jest	190+	95.8%	✅ Completed
TOTAL	-	240+	93.9%	✅ Successful

🐛 Bugs Found and Fixed

Sprint 1 (Java)

8 bugs found

8 bugs fixed (100% resolved)

Sprint 2 (JavaScript)

12 bugs found

12 bugs fixed (100% resolved)

Total: 20 issues identified and resolved through testing

📅 Last Updated: November 2025
📌 Project Version: 2.0.0
📈 Status: ✅ Sprints 1 & 2 successfully completed

🏆 Achievements

✅ 240+ unit tests implemented
✅ 93.9% average coverage
✅ 20 bugs detected and fixed
✅ 0 failing tests
✅ Complete documentation
✅ Production-ready code
