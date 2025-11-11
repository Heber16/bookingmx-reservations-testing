# System Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Module Design](#module-design)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Design Patterns](#design-patterns)
7. [Security Considerations](#security-considerations)

---

## Overview

The BookingMx system consists of two main modules designed to handle hotel reservations and geographical data visualization. This document describes the architectural decisions, design patterns, and technical implementations.

### Architectural Principles

1. **Separation of Concerns**: Each module has distinct responsibilities
2. **Testability**: Code designed for easy unit testing (90%+ coverage)
3. **Modularity**: Independent modules with clear interfaces
4. **Scalability**: Designed to handle growth in users and data
5. **Maintainability**: Clean code with comprehensive documentation

---

## System Architecture

### High-Level Architecture Diagram

```mermaid
C4Context
    title System Context Diagram - BookingMx

    Person(customer, "Customer", "Hotel booking user")
    Person(admin, "Admin", "BookingMx staff")
    
    System(bookingmx, "BookingMx Platform", "Hotel reservation and city visualization system")
    
    System_Ext(email, "Email Service", "Send confirmation emails")
    System_Ext(payment, "Payment Gateway", "Process payments")
    System_Ext(maps, "Maps API", "Geographical data")
    
    Rel(customer, bookingmx, "Books hotels, views nearby cities")
    Rel(admin, bookingmx, "Manages reservations and data")
    Rel(bookingmx, email, "Sends notifications")
    Rel(bookingmx, payment, "Processes payments")
    Rel(bookingmx, maps, "Gets location data")
```

### Component Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application]
        MOBILE[Mobile App]
    end
    
    subgraph "API Gateway"
        GATEWAY[API Gateway<br/>Load Balancer]
    end
    
    subgraph "Service Layer"
        RESERVATION[Reservations Service<br/>Java/Spring Boot]
        GRAPH[Graph Service<br/>Node.js/Express]
        AUTH[Authentication Service]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Main Database)]
        REDIS[(Redis<br/>Cache)]
        S3[(AWS S3<br/>File Storage)]
    end
    
    subgraph "External Services"
        MAIL[Email Service]
        PAY[Payment Gateway]
        MAPS[Maps API]
    end
    
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> RESERVATION
    GATEWAY --> GRAPH
    
    RESERVATION --> POSTGRES
    RESERVATION --> REDIS
    GRAPH --> POSTGRES
    GRAPH --> REDIS
    
    RESERVATION --> MAIL
    RESERVATION --> PAY
    GRAPH --> MAPS
    
    style RESERVATION fill:#ff9999
    style GRAPH fill:#99ccff
```

---

## Module Design

### Sprint 1: Reservations Module

#### Component Diagram

```mermaid
graph LR
    subgraph "Presentation Layer"
        API[REST API Controller]
    end
    
    subgraph "Business Logic Layer"
        SERVICE[ReservationService]
        VALIDATOR[Validation Layer]
    end
    
    subgraph "Data Access Layer"
        REPO[ReservationRepository]
        DAO[Data Access Objects]
    end
    
    subgraph "Domain Model"
        ENTITY[Reservation Entity]
        ENUMS[Enumerations]
    end
    
    API --> SERVICE
    SERVICE --> VALIDATOR
    SERVICE --> REPO
    SERVICE --> ENTITY
    REPO --> DAO
    DAO --> ENTITY
    
    style SERVICE fill:#90EE90
```

#### Class Diagram - Detailed

```mermaid
classDiagram
    class Reservation {
        <<entity>>
        -String id
        -String guestName
        -String guestEmail
        -String hotelName
        -String roomType
        -LocalDate checkInDate
        -LocalDate checkOutDate
        -int numberOfGuests
        -ReservationStatus status
        -double totalPrice
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +Reservation(String, String, String, ...)
        +getNumberOfNights() long
        +getPricePerNight() double
        +validate() boolean
        +equals(Object) boolean
        +hashCode() int
        +toString() String
    }
    
    class ReservationStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        CANCELLED
        COMPLETED
    }
    
    class ReservationService {
        <<service>>
        -ReservationRepository repository
        +createReservation(Reservation) Reservation
        +updateReservation(String, Reservation) Reservation
        +cancelReservation(String) Reservation
        +confirmReservation(String) Reservation
        +completeReservation(String) Reservation
        +findReservationById(String) Reservation
        +findReservationsByGuestEmail(String) List
        +calculateTotalPrice(LocalDate, LocalDate, double) double
        -validateReservation(Reservation) void
        -isValidEmail(String) boolean
    }
    
    class ReservationRepository {
        <<interface>>
        +save(Reservation) Reservation
        +update(Reservation) Reservation
        +findById(String) Optional~Reservation~
        +findByGuestName(String) List~Reservation~
        +findByGuestEmail(String) List~Reservation~
        +findByHotelName(String) List~Reservation~
        +findAll() List~Reservation~
        +deleteById(String) void
        +existsById(String) boolean
        +count() long
    }
    
    class InvalidReservationException {
        <<exception>>
        +InvalidReservationException(String)
        +InvalidReservationException(String, Throwable)
    }
    
    class ReservationNotFoundException {
        <<exception>>
        +ReservationNotFoundException(String)
        +ReservationNotFoundException(String, Throwable)
    }
    
    class ReservationAlreadyExistsException {
        <<exception>>
        +ReservationAlreadyExistsException(String)
        +ReservationAlreadyExistsException(String, Throwable)
    }
    
    Reservation --> ReservationStatus
    ReservationService --> Reservation
    ReservationService --> ReservationRepository
    ReservationService ..> InvalidReservationException
    ReservationService ..> ReservationNotFoundException
    ReservationService ..> ReservationAlreadyExistsException
```

#### State Diagram - Reservation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Create Reservation
    
    PENDING --> CONFIRMED: Confirm Payment
    PENDING --> CANCELLED: Cancel Reservation
    
    CONFIRMED --> COMPLETED: Check-out
    CONFIRMED --> CANCELLED: Cancel Reservation
    
    CANCELLED --> [*]
    COMPLETED --> [*]
    
    note right of PENDING
        Initial state when
        reservation is created
    end note
    
    note right of CONFIRMED
        Payment processed
        successfully
    end note
    
    note right of COMPLETED
        Guest checked out
        successfully
    end note
```

### Sprint 2: Graph Visualization Module

#### Component Diagram

```mermaid
graph TB
    subgraph "API Layer"
        REST[REST Endpoints]
    end
    
    subgraph "Service Layer"
        VIZ[GraphVisualizer]
    end
    
    subgraph "Domain Layer"
        GRAPH[CityGraph]
        CITY[City]
    end
    
    subgraph "Algorithm Layer"
        HAVERSINE[Haversine Calculator]
        DIJKSTRA[Dijkstra Pathfinder]
    end
    
    REST --> VIZ
    VIZ --> GRAPH
    GRAPH --> CITY
    CITY --> HAVERSINE
    GRAPH --> DIJKSTRA
    
    style VIZ fill:#FFB6C1
```

#### Class Diagram - Detailed

```mermaid
classDiagram
    class City {
        <<model>>
        -String id
        -String name
        -double latitude
        -double longitude
        -String state
        +City(String, String, double, double, String)
        +distanceTo(City) double
        +toJSON() Object
        +fromJSON(Object) City
        +equals(City) boolean
        +toString() String
        -_toRadians(double) double
    }
    
    class CityGraph {
        <<data structure>>
        -Map~String, City~ cities
        -Map~String, Map~ connections
        +CityGraph()
        +addCity(City) void
        +addConnection(String, String, double) void
        +getNearbyCities(String) Array
        +getNearbyCitiesWithinRadius(String, double) Array
        +findShortestPath(String, String) Object
        +getCity(String) City
        +hasConnection(String, String) boolean
        +getDistance(String, String) double
        +getCityCount() int
        +getConnectionCount() int
        +getAllCities() Array
        +clear() void
        +toJSON() Object
        +fromJSON(Object) CityGraph
    }
    
    class GraphVisualizer {
        <<service>>
        -CityGraph graph
        +GraphVisualizer(CityGraph)
        +generateNearbyCitiesData(String, int) Object
        +generateRouteData(String, String) Object
        +generateConnectionDensityData() Array
        +generateGraphStatistics() Object
        +generateHTMLTable(String) String
        +validateGraphData() Object
    }
    
    CityGraph --> City : manages
    GraphVisualizer --> CityGraph : uses
    GraphVisualizer --> City : visualizes
    
    note for City "Uses Haversine formula\nfor accurate distance\ncalculation"
    
    note for CityGraph "Implements Dijkstra\nalgorithm for shortest\npath finding"
```

#### Algorithm Flow - Dijkstra's Shortest Path

```mermaid
flowchart TD
    START([Start]) --> INIT[Initialize distances to infinity]
    INIT --> SET_START[Set start city distance to 0]
    SET_START --> CREATE_UNVISITED[Create unvisited set with all cities]
    
    CREATE_UNVISITED --> LOOP{Unvisited\nset empty?}
    
    LOOP -->|No| FIND_MIN[Find unvisited city with\nminimum distance]
    FIND_MIN --> CHECK_MIN{Distance\n= infinity?}
    
    CHECK_MIN -->|Yes| NO_PATH[Return null - no path exists]
    CHECK_MIN -->|No| CHECK_DEST{Is this the\ndestination?}
    
    CHECK_DEST -->|Yes| RECONSTRUCT[Reconstruct path]
    RECONSTRUCT --> RETURN[Return path and distance]
    
    CHECK_DEST -->|No| MARK_VISITED[Mark city as visited]
    MARK_VISITED --> GET_NEIGHBORS[Get unvisited neighbors]
    
    GET_NEIGHBORS --> UPDATE_LOOP{For each\nneighbor}
    UPDATE_LOOP -->|Has more| CALC_DIST[Calculate new distance]
    CALC_DIST --> COMPARE{New distance <\ncurrent distance?}
    
    COMPARE -->|Yes| UPDATE[Update distance\nand previous city]
    COMPARE -->|No| NEXT_NEIGHBOR[Next neighbor]
    UPDATE --> NEXT_NEIGHBOR
    
    NEXT_NEIGHBOR --> UPDATE_LOOP
    UPDATE_LOOP -->|No more| LOOP
    
    LOOP -->|Yes| NO_PATH
    NO_PATH --> END([End])
    RETURN --> END
    
    style START fill:#90EE90
    style END fill:#FFB6C1
    style RETURN fill:#87CEEB
    style NO_PATH fill:#FFA07A
```

---

## Data Flow

### Reservation Creation Flow

```mermaid
sequenceDiagram
    actor User
    participant API as API Controller
    participant Service as ReservationService
    participant Validator as Validation Layer
    participant Repo as Repository
    participant DB as Database
    participant Email as Email Service
    
    User->>API: POST /reservations
    API->>Service: createReservation(data)
    Service->>Validator: validate(reservation)
    
    alt Invalid Data
        Validator-->>Service: ValidationException
        Service-->>API: 400 Bad Request
        API-->>User: Error Message
    else Valid Data
        Validator-->>Service: OK
        Service->>Repo: save(reservation)
        Repo->>DB: INSERT
        DB-->>Repo: Success
        Repo-->>Service: Saved Reservation
        Service->>Email: sendConfirmation(email)
        Email-->>Service: Email Sent
        Service-->>API: 201 Created
        API-->>User: Reservation Created
    end
```

### Shortest Path Calculation Flow

```mermaid
sequenceDiagram
    actor User
    participant API as API Endpoint
    participant Viz as GraphVisualizer
    participant Graph as CityGraph
    participant Dijkstra as Dijkstra Algorithm
    participant Cache as Redis Cache
    
    User->>API: GET /route?from=cdmx&to=mty
    API->>Cache: Check cached route
    
    alt Route Cached
        Cache-->>API: Return cached result
        API-->>User: Route Data
    else Not Cached
        Cache-->>API: Cache miss
        API->>Viz: generateRouteData(from, to)
        Viz->>Graph: findShortestPath(from, to)
        Graph->>Dijkstra: calculate(from, to)
        Dijkstra-->>Graph: path + distance
        Graph-->>Viz: route result
        Viz-->>API: formatted data
        API->>Cache: Store result (TTL: 1h)
        API-->>User: Route Data
    end
```

---

## Technology Stack

### Sprint 1: Reservations Module

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Language** | Java | 17 | Core programming language |
| **Framework** | Spring Boot | 3.x | Application framework |
| **Testing** | JUnit 5 | 5.10.0 | Unit testing framework |
| **Mocking** | Mockito | 5.5.0 | Mock objects for testing |
| **Coverage** | JaCoCo | 0.8.10 | Code coverage analysis |
| **Build Tool** | Maven | 3.8+ | Dependency management |
| **Database** | PostgreSQL | 14+ | Relational database |
| **Cache** | Redis | 7.x | In-memory cache |

### Sprint 2: Graph Visualization Module

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Language** | JavaScript | ES6+ | Core programming language |
| **Runtime** | Node.js | 14+ | Server-side runtime |
| **Testing** | Jest | 29.7.0 | Testing framework |
| **Transpiler** | Babel | 7.23.0 | ES6+ compatibility |
| **Package Manager** | npm | 8+ | Dependency management |
| **Database** | PostgreSQL | 14+ | Relational database |
| **Cache** | Redis | 7.x | Path caching |

---

## Design Patterns

### Repository Pattern (Sprint 1)

**Purpose**: Separate data access logic from business logic

```java
public interface ReservationRepository {
    Reservation save(Reservation reservation);
    Optional<Reservation> findById(String id);
    List<Reservation> findAll();
    void deleteById(String id);
}
```

**Benefits**:
- Testability through mocking
- Flexibility to change data sources
- Cleaner business logic

### Service Layer Pattern (Both Sprints)

**Purpose**: Encapsulate business logic

```java
// Sprint 1
public class ReservationService {
    private final ReservationRepository repository;
    // Business logic methods
}
```

```javascript
// Sprint 2
class GraphVisualizer {
    constructor(graph) {
        this.graph = graph;
    }
    // Visualization methods
}
```

### Strategy Pattern (Sprint 2)

**Purpose**: Different algorithms for pathfinding

```javascript
class PathFinder {
    // Could implement different strategies:
    // - Dijkstra (current)
    // - A* (future)
    // - Bellman-Ford (future)
}
```

### Factory Pattern (Both Sprints)

**Purpose**: Object creation

```java
// Sprint 1
public static Reservation fromJSON(JSONObject json) {
    return new Reservation(/* ... */);
}
```

```javascript
// Sprint 2
static fromJSON(json) {
    return new City(/* ... */);
}
```

---

## Security Considerations

### Authentication & Authorization

```mermaid
graph LR
    A[User Request] --> B{Has JWT?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Valid JWT?}
    D -->|No| C
    D -->|Yes| E{Has Permission?}
    E -->|No| F[403 Forbidden]
    E -->|Yes| G[Process Request]
```

### Data Validation

1. **Input Validation**
    - Email format validation
    - Date range validation
    - Numeric bounds checking
    - SQL injection prevention

2. **Output Sanitization**
    - XSS prevention in HTML generation
    - Proper JSON encoding
    - Data masking for sensitive info

### Best Practices Implemented

- ✅ Parameterized queries (SQL injection prevention)
- ✅ Input validation on all endpoints
- ✅ Error messages don't expose sensitive data
- ✅ HTTPS only for production
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Environment variables for secrets

---

## Performance Considerations

### Caching Strategy

```mermaid
graph TB
    A[Request] --> B{In Cache?}
    B -->|Yes| C[Return Cached Data]
    B -->|No| D[Query Database]
    D --> E[Store in Cache]
    E --> F[Return Data]
    
    style C fill:#90EE90
    style E fill:#FFB6C1
```

### Database Optimization

1. **Indexing**
    - Primary keys on all tables
    - Index on `guestEmail` for fast lookups
    - Index on `checkInDate` for date range queries

2. **Query Optimization**
    - Use of prepared statements
    - Batch operations where possible
    - Lazy loading for relationships

### Algorithm Complexity

| Algorithm | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Haversine Distance | O(1) | O(1) |
| Dijkstra's Algorithm | O(V²) | O(V) |
| Get Nearby Cities | O(n log n) | O(n) |

---

## Scalability

### Horizontal Scaling

```mermaid
graph TB
    LB[Load Balancer]
    
    subgraph "Application Tier"
        APP1[App Server 1]
        APP2[App Server 2]
        APP3[App Server 3]
    end
    
    subgraph "Data Tier"
        DB_PRIMARY[(Primary DB)]
        DB_REPLICA1[(Replica 1)]
        DB_REPLICA2[(Replica 2)]
    end
    
    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 --> DB_PRIMARY
    APP2 --> DB_PRIMARY
    APP3 --> DB_PRIMARY
    
    DB_PRIMARY --> DB_REPLICA1
    DB_PRIMARY --> DB_REPLICA2
    
    APP1 -.Read.-> DB_REPLICA1
    APP2 -.Read.-> DB_REPLICA2
```

### Vertical Scaling Options

- Increase server CPU/RAM
- Database connection pooling
- In-memory caching (Redis)
- CDN for static assets

---

## Monitoring & Logging

### Metrics to Monitor

1. **Application Metrics**
    - Request rate
    - Response time
    - Error rate
    - CPU/Memory usage

2. **Business Metrics**
    - Reservations per hour
    - Average booking value
    - Cancellation rate

3. **Infrastructure Metrics**
    - Database query time
    - Cache hit rate
    - Network latency

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "AWS Cloud"
            ALB[Application Load Balancer]
            
            subgraph "Auto Scaling Group"
                EC2_1[EC2 Instance 1]
                EC2_2[EC2 Instance 2]
            end
            
            RDS[(RDS PostgreSQL<br/>Multi-AZ)]
            REDIS[(ElastiCache Redis)]
            S3[(S3 Bucket)]
        end
    end
    
    ALB --> EC2_1
    ALB --> EC2_2
    EC2_1 --> RDS
    EC2_2 --> RDS
    EC2_1 --> REDIS
    EC2_2 --> REDIS
    EC2_1 --> S3
    EC2_2 --> S3
```

---

**Document Version**: 1.0.0  
**Last Updated**: November 2024