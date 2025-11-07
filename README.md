## BookingMx - Reservations Module - Testing

📋 Project Description
This project is part of Sprint 1 of the BookingMx IT team, focused on implementing comprehensive unit testing for the Reservations Module.
The goal is to ensure code quality through rigorous testing, achieving a minimum coverage of 90%.

🧠 Context

After a new feature failed in production due to insufficient testing, the team decided to implement a solid testing strategy that includes:

A complete unit testing suite using JUnit 5

Code coverage verification with JaCoCo

Detailed documentation of issues and solutions

Positive and negative test cases

🚀 Technologies Used
Tool	Purpose
Java 17	Programming language
Maven	Dependency management and build system
JUnit 5	Unit testing framework
Mockito 5.5.0	Mocking library
JaCoCo 0.8.10	Code coverage tool
AssertJ 3.24.2	Fluent assertions (optional)
IntelliJ IDEA	Recommended IDE

📁 Project Structure
bookingmx-reservations-testing/
├── src/
│   ├── main/java/com/bookingmx/reservations/
│   │   ├── model/
│   │   │   └── Reservation.java
│   │   ├── service/
│   │   │   └── ReservationService.java
│   │   ├── repository/
│   │   │   └── ReservationRepository.java
│   │   └── exception/
│   │       ├── ReservationNotFoundException.java
│   │       ├── InvalidReservationException.java
│   │       └── ReservationAlreadyExistsException.java
│   └── test/java/com/bookingmx/reservations/service/
│       └── ReservationServiceTest.java
├── docs/
│   ├── TESTING_LOG.md
│   └── screenshots/
│       ├── coverage-report.png
│       └── tests-passing.png
├── pom.xml
└── README.md

🔧 Project Setup
Prerequisites

Java JDK 17 or higher

Maven 3.6+

IntelliJ IDEA (recommended) or any Java-compatible IDE

Installation

Clone the repository:

git clone https://github.com/your-username/bookingmx-reservations-testing.git
cd bookingmx-reservations-testing


Import the project into IntelliJ IDEA:

File → Open

Select the project folder

IntelliJ will automatically detect it as a Maven project

Download dependencies:

mvn clean install

🧪 Running Tests
Option 1: From IntelliJ IDEA

Right-click on ReservationServiceTest.java

Select Run 'ReservationServiceTest'

View results in the bottom panel

Option 2: From Maven (Terminal)
# Run all tests
mvn clean test

# Run tests and generate coverage report
mvn clean test jacoco:report

📊 Viewing the Coverage Report

After running mvn clean test jacoco:report, open:

target/site/jacoco/index.html


The report shows:

Total coverage percentage

Coverage per package and class

Covered and uncovered lines

📈 Coverage Achieved

✅ Total Coverage: 92%

Component	Coverage
ReservationService	95%
Reservation (Model)	88%
Exceptions	100%
✅ Features Tested
Positive Cases

Successful reservation creation

Updating existing reservations

Cancelling reservations

Confirming reservations

Completing reservations (check-out)

Search by ID, name, and email

Total price calculation

Automatic ID generation

Negative Cases

Invalid date validation

Required fields validation

Invalid email format

Guest number out of range

Negative or zero prices

Operations on non-existent reservations

Updating cancelled/completed reservations

Cancelling completed reservations

Edge Cases

Reservations with the maximum number of guests (10)

Check-in equal to check-out

Null or empty IDs

Strings with only spaces

Date limits (today, tomorrow)

🧩 Test Suite Overview

The suite includes 50+ unit tests, organized as follows:

Category	Tests
Creation	8
Date Validation	6
Data Validation	7
Guest Count	5
Price	4
Update	5
Cancellation	4
Confirmation	2
Completion	2
Search	7
🐛 Issues and Solutions

See docs/TESTING_LOG.md for detailed notes on:

Bugs discovered during testing

Fixes implemented

Lessons learned

Suggested improvements

📸 Screenshots

Screenshots are located in docs/screenshots/:

coverage-report.png – JaCoCo report showing 92% coverage

tests-passing.png – All tests executed successfully

🏗️ Module Architecture
Data Model

Reservation – Core entity containing:

Guest information (name, email)

Hotel details (name, room type)

Stay dates

Reservation status (PENDING, CONFIRMED, CANCELLED, COMPLETED)

Price information

Service Layer

ReservationService – Business logic handling:

Extensive validations

Reservation lifecycle management

Price calculations

Searches and filters

Repository

ReservationRepository – Data access interface (for future persistence implementation)

Exceptions

ReservationNotFoundException – Reservation not found

InvalidReservationException – Invalid data

ReservationAlreadyExistsException – Duplicate reservation


📄 License

This project is part of BookingMx and is intended for internal use only.

Last Updated: November 2024
Version: 1.0.0
Sprint: 1
