# Contributing to BookingMx Testing Project

Thank you for your interest in contributing to the BookingMx Testing Project! This document provides guidelines and best practices for contributing to this repository.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Documentation Guidelines](#documentation-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Standards

- **Be Respectful**: Treat all contributors with respect and courtesy
- **Be Constructive**: Provide helpful and constructive feedback
- **Be Professional**: Maintain professionalism in all interactions
- **Be Collaborative**: Work together towards common goals

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Java 17+** and **Maven 3.6+** (for Sprint 1)
- **Node.js 14+** and **npm 6+** (for Sprint 2)
- **Git** installed and configured
- **IntelliJ IDEA** or **VS Code** (recommended)
- Familiarity with **JUnit** and **Jest**

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/bookingmx-reservations-testing.git
cd bookingmx-reservations-testing

# Add upstream remote
git remote add upstream https://github.com/bookingmx/bookingmx-reservations-testing.git
```

### Setup Development Environment

#### Sprint 1 (Java)
```bash
cd sprint1-java-junit
mvn clean install
mvn test
```

#### Sprint 2 (JavaScript)
```bash
cd sprint2-javascript-jest
npm install
npm test
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Conventions

- **Features**: `feature/add-email-validation`
- **Bug Fixes**: `fix/reservation-date-bug`
- **Documentation**: `docs/update-api-guide`
- **Tests**: `test/add-edge-cases`
- **Refactor**: `refactor/simplify-dijkstra`

### 2. Write Tests First (TDD)

We follow **Test-Driven Development (TDD)**:

```java
// Step 1: Write a failing test
@Test
void testNewFeature() {
    // This should fail initially
    assertTrue(feature.works());
}

// Step 2: Write minimum code to pass
// Step 3: Refactor
```

### 3. Implement Your Changes

Make your changes following our [coding standards](#coding-standards).

### 4. Run Tests

```bash
# Sprint 1
mvn clean test
mvn test jacoco:report

# Sprint 2
npm test
npm run test:coverage
```

**Required**: All tests must pass and coverage must be ≥ 90%

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add email validation for reservations"
```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples

```
feat(reservation): add email validation

- Add email format validation using regex
- Add tests for valid and invalid emails
- Update documentation

Closes #123
```

```
fix(graph): correct Haversine formula precision

The distance calculation was off by ~5% due to
incorrect radian conversion.

Fixes #456
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Coding Standards

### Java Code Style (Sprint 1)

#### Naming Conventions

```java
// Classes: PascalCase
public class ReservationService { }

// Methods: camelCase
public Reservation createReservation() { }

// Constants: UPPER_SNAKE_CASE
private static final int MAX_GUESTS = 10;

// Variables: camelCase
private String guestName;
```

#### Code Organization

```java
public class ReservationService {
    // 1. Constants
    private static final int MAX_GUESTS = 10;
    
    // 2. Instance variables
    private final ReservationRepository repository;
    
    // 3. Constructor
    public ReservationService(ReservationRepository repository) {
        this.repository = repository;
    }
    
    // 4. Public methods
    public Reservation createReservation(Reservation reservation) {
        // ...
    }
    
    // 5. Private methods
    private void validateReservation(Reservation reservation) {
        // ...
    }
}
```

#### JavaDoc Comments

```java
/**
 * Creates a new reservation in the system.
 * 
 * @param reservation the reservation to create (must not be null)
 * @return the created reservation with generated ID
 * @throws InvalidReservationException if validation fails
 * @throws ReservationAlreadyExistsException if reservation already exists
 */
public Reservation createReservation(Reservation reservation) {
    // Implementation
}
```

### JavaScript Code Style (Sprint 2)

#### Naming Conventions

```javascript
// Classes: PascalCase
class CityGraph { }

// Methods/Functions: camelCase
function calculateDistance() { }

// Constants: UPPER_SNAKE_CASE
const MAX_DISTANCE = 1000;

// Variables: camelCase
let cityName = 'Mexico City';
```

#### Code Organization

```javascript
class CityGraph {
  // 1. Constructor
  constructor() {
    this.cities = new Map();
    this.connections = new Map();
  }
  
  // 2. Public methods
  addCity(city) {
    // ...
  }
  
  // 3. Private methods (prefix with _)
  _validateCity(city) {
    // ...
  }
}
```

#### JSDoc Comments

```javascript
/**
 * Finds the shortest path between two cities using Dijkstra's algorithm.
 * 
 * @param {string} startCityId - The ID of the starting city
 * @param {string} endCityId - The ID of the destination city
 * @returns {Object} An object containing the path array and total distance
 * @returns {null} If no path exists between the cities
 * @throws {Error} If either city doesn't exist in the graph
 * @example
 * const result = graph.findShortestPath('cdmx', 'mty');
 * // Returns: { path: [...], distance: 912.45 }
 */
findShortestPath(startCityId, endCityId) {
  // Implementation
}
```

### General Best Practices

1. **Keep Functions Small**: Ideally < 20 lines
2. **Single Responsibility**: One function, one purpose
3. **Meaningful Names**: `getUserById` not `get`
4. **Avoid Magic Numbers**: Use named constants
5. **Error Handling**: Always handle errors gracefully
6. **Comments**: Explain WHY, not WHAT

---

## Testing Requirements

### Coverage Requirements

- **Minimum Coverage**: 90%
- **Target Coverage**: 95%+
- **Mandatory**: All new code must have tests

### Test Structure (AAA Pattern)

```java
@Test
void testMethodName() {
    // Arrange: Set up test data
    Reservation reservation = new Reservation(/*...*/);
    
    // Act: Execute the method
    Reservation result = service.createReservation(reservation);
    
    // Assert: Verify the results
    assertNotNull(result);
    assertEquals("John Doe", result.getGuestName());
}
```

### Test Categories

#### 1. Positive Tests (Happy Path)

```java
@Test
@DisplayName("Should create reservation successfully")
void testCreateReservation_Success() {
    // Test successful operation
}
```

#### 2. Negative Tests (Error Cases)

```java
@Test
@DisplayName("Should throw exception for invalid email")
void testCreateReservation_InvalidEmail() {
    assertThrows(InvalidReservationException.class, () -> {
        service.createReservation(invalidReservation);
    });
}
```

#### 3. Edge Cases (Boundary Conditions)

```java
@Test
@DisplayName("Should handle maximum number of guests")
void testCreateReservation_MaxGuests() {
    reservation.setNumberOfGuests(10);
    // Test behavior at boundary
}
```

### Test Naming Conventions

- Use descriptive names: `testCreateReservation_Success`
- Use `@DisplayName` for readability
- Format: `test<Method>_<Scenario>`

### Mock Usage

```java
@Mock
private ReservationRepository repository;

@BeforeEach
void setUp() {
    MockitoAnnotations.openMocks(this);
    when(repository.findById("123")).thenReturn(Optional.of(reservation));
}
```

### Running Tests

```bash
# Run all tests
mvn test  # Java
npm test  # JavaScript

# Run specific test
mvn test -Dtest=ReservationServiceTest
npm test City.test.js

# Run with coverage
mvn test jacoco:report
npm run test:coverage
```

---

## Documentation Guidelines

### Code Documentation

#### When to Add Comments

✅ **Do Comment**:
- Complex algorithms (e.g., Dijkstra)
- Business logic decisions
- Non-obvious code behavior
- Public APIs (JavaDoc/JSDoc)

❌ **Don't Comment**:
- Obvious code
- What the code does (the code shows that)
- Outdated information

#### JavaDoc/JSDoc Format

```java
/**
 * Brief one-line description.
 * 
 * Detailed description explaining the purpose, behavior,
 * and any important considerations.
 * 
 * @param paramName description of parameter
 * @return description of return value
 * @throws ExceptionType when and why it's thrown
 * @see RelatedClass#relatedMethod
 * @since 1.0.0
 */
```

### README Updates

When adding new features:

1. Update main README.md
2. Update module-specific README
3. Add usage examples
4. Update architecture diagrams if needed

### API Documentation

When creating new endpoints:

```markdown
#### Create Reservation

**Endpoint**: `POST /api/reservations`

**Request Body**:
\`\`\`json
{
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "hotelName": "Hotel Plaza",
  "checkInDate": "2024-12-01",
  "checkOutDate": "2024-12-05",
  "numberOfGuests": 2
}
\`\`\`

**Response**: `201 Created`
\`\`\`json
{
  "id": "abc123",
  "status": "PENDING",
  ...
}
\`\`\`

**Errors**:
- `400 Bad Request`: Invalid data
- `409 Conflict`: Reservation already exists
```

---

## Pull Request Process

### Before Creating PR

- [ ] All tests pass locally
- [ ] Coverage is ≥ 90%
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commits follow conventional format
- [ ] No console.log or debug code
- [ ] No commented-out code

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] All tests passing
- [ ] Coverage maintained/improved

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
```

### PR Review Process

1. **Automated Checks**: CI runs tests and coverage
2. **Code Review**: At least one approval required
3. **Address Feedback**: Make requested changes
4. **Merge**: Squash and merge into main

### Review Criteria

Reviewers will check:
- Code quality and readability
- Test coverage and quality
- Documentation completeness
- Performance considerations
- Security implications

---

## Issue Reporting

### Bug Reports

Use this template:

```markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: Windows 10
- Java Version: 17
- Maven Version: 3.8.6

**Screenshots**
Add screenshots if applicable.

**Additional Context**
Any other relevant information.
```

### Feature Requests

```markdown
**Feature Description**
Clear description of the feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about.

**Additional Context**
Any other relevant information.
```

---


---

**Last Updated**: November 2024  
**Version**: 1.0.0