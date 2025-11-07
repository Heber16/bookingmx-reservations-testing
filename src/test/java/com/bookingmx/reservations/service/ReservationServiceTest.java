package com.bookingmx.reservations.service;

import com.bookingmx.reservations.model.Reservation;
import com.bookingmx.reservations.repository.ReservationRepository;
import com.bookingmx.reservations.exception.*;
import org.junit.jupiter.api.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("ReservationService Tests")
class ReservationServiceTest {

    @Mock
    private ReservationRepository repository;

    private ReservationService service;
    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
        service = new ReservationService(repository);
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    // ==================== CREATION TESTS ====================

    @Test
    @DisplayName("You must successfully create a reservation")
    void testCreateReservation_Success() {
        // Arrange
        Reservation reservation = createValidReservation();
        when(repository.existsById(any())).thenReturn(false);
        when(repository.save(any(Reservation.class))).thenReturn(reservation);

        // Act
        Reservation result = service.createReservation(reservation);

        // Assert
        assertNotNull(result);
        assertEquals("Juan Pérez", result.getGuestName());
        assertEquals("juan@example.com", result.getGuestEmail());
        verify(repository, times(1)).save(any(Reservation.class));
    }

    @Test
    @DisplayName("You must generate an ID automatically if it does not exist")
    void testCreateReservation_GeneratesId() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setId(null);
        when(repository.existsById(any())).thenReturn(false);
        when(repository.save(any(Reservation.class))).thenReturn(reservation);

        // Act
        service.createReservation(reservation);

        // Assert
        assertNotNull(reservation.getId());
        verify(repository).save(reservation);
    }

    @Test
    @DisplayName("You must throw an exception if the reservation already exists")
    void testCreateReservation_AlreadyExists() {
        // Arrange
        Reservation reservation = createValidReservation();
        when(repository.existsById(reservation.getId())).thenReturn(true);

        // Act & Assert
        assertThrows(ReservationAlreadyExistsException.class,
                () -> service.createReservation(reservation));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("You must throw an exception if the reservation is null")
    void testCreateReservation_NullReservation() {
        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(null));
    }

    // ==================== DATE VALIDATION TESTS ====================

    @Test
    @DisplayName("It must throw an exception if check-in is after check-out")
    void testCreateReservation_CheckInAfterCheckOut() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setCheckInDate(LocalDate.now().plusDays(5));
        reservation.setCheckOutDate(LocalDate.now().plusDays(3));

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It should throw an exception if check-in is equal to check-out")
    void testCreateReservation_CheckInEqualsCheckOut() {
        // Arrange
        Reservation reservation = createValidReservation();
        LocalDate sameDate = LocalDate.now().plusDays(1);
        reservation.setCheckInDate(sameDate);
        reservation.setCheckOutDate(sameDate);

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It should throw an exception if check-in is in the past")
    void testCreateReservation_CheckInInPast() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setCheckInDate(LocalDate.now().minusDays(1));

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("You must throw an exception if the check-in date is null")
    void testCreateReservation_NullCheckInDate() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setCheckInDate(null);

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It must throw an exception if the check-out date is null")
    void testCreateReservation_NullCheckOutDate() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setCheckOutDate(null);

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    // ==================== DATA VALIDATION TESTS ====================

    @Test
    @DisplayName("It should throw an exception if the host name is empty")
    void testCreateReservation_EmptyGuestName() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setGuestName("");

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It should throw an exception if the host name is null")
    void testCreateReservation_NullGuestName() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setGuestName(null);

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It should throw an exception if the email is empty")
    void testCreateReservation_EmptyEmail() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setGuestEmail("");

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It should throw an exception if the email has an invalid format")
    void testCreateReservation_InvalidEmailFormat() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setGuestEmail("invalid-email");

        // Act & Assert
        InvalidReservationException exception = assertThrows(
                InvalidReservationException.class,
                () -> service.createReservation(reservation)
        );
        assertTrue(exception.getMessage().contains("email format"));
    }

    @Test
    @DisplayName("It must throw an exception if the hotel name is empty")
    void testCreateReservation_EmptyHotelName() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setHotelName("");

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It must throw an exception if the room type is empty")
    void testCreateReservation_EmptyRoomType() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setRoomType("");

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    // ==================== GUEST NUMBER TESTS ====================

    @Test
    @DisplayName("It must throw an exception if the number of guests is 0")
    void testCreateReservation_ZeroGuests() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setNumberOfGuests(0);

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It must throw an exception if the number of guests is negative")
    void testCreateReservation_NegativeGuests() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setNumberOfGuests(-1);

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It must throw an exception if the number of guests exceeds the maximum")
    void testCreateReservation_TooManyGuests() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setNumberOfGuests(11);

        // Act & Assert
        InvalidReservationException exception = assertThrows(
                InvalidReservationException.class,
                () -> service.createReservation(reservation)
        );
        assertTrue(exception.getMessage().contains("The maximum number of guests is 10"));
    }

    @Test
    @DisplayName("It must accept the maximum number of guests (10)")
    void testCreateReservation_MaxGuests() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setNumberOfGuests(10);
        when(repository.existsById(any())).thenReturn(false);
        when(repository.save(any(Reservation.class))).thenReturn(reservation);

        // Act
        Reservation result = service.createReservation(reservation);

        // Assert
        assertNotNull(result);
        assertEquals(10, result.getNumberOfGuests());
    }

    // ==================== PRICE TESTS ====================

    @Test
    @DisplayName("It must throw an exception if the total price is 0")
    void testCreateReservation_ZeroPrice() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setTotalPrice(0);

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It must throw an exception if the total price is negative")
    void testCreateReservation_NegativePrice() {
        // Arrange
        Reservation reservation = createValidReservation();
        reservation.setTotalPrice(-100);

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.createReservation(reservation));
    }

    @Test
    @DisplayName("It must calculate the total price correctly")
    void testCalculateTotalPrice_Success() {
        // Arrange
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(4);
        double pricePerNight = 500.0;

        // Act
        double totalPrice = service.calculateTotalPrice(checkIn, checkOut, pricePerNight);

        // Assert
        assertEquals(1500.0, totalPrice); // 3 nights * 500
    }

    @Test
    @DisplayName("It must throw an exception when calculating prices with invalid dates")
    void testCalculateTotalPrice_InvalidDates() {
        // Arrange
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.calculateTotalPrice(checkIn, checkOut, 500.0));
    }

    // ==================== UPDATE TESTS ====================

    @Test
    @DisplayName("It must successfully update a reservation")
    void testUpdateReservation_Success() {
        // Arrange
        String id = "123";
        Reservation existing = createValidReservation();
        existing.setId(id);
        Reservation updated = createValidReservation();
        updated.setGuestName("María García");

        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.update(any(Reservation.class))).thenReturn(updated);

        // Act
        Reservation result = service.updateReservation(id, updated);

        // Assert
        assertNotNull(result);
        assertEquals("María García", result.getGuestName());
        verify(repository).update(any(Reservation.class));
    }

    @Test
    @DisplayName("It must throw an exception when updating a reservation not found")
    void testUpdateReservation_NotFound() {
        // Arrange
        String id = "999";
        Reservation updated = createValidReservation();
        when(repository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ReservationNotFoundException.class,
                () -> service.updateReservation(id, updated));
    }

    @Test
    @DisplayName("It must throw an exception when updating a cancelled reservation")
    void testUpdateReservation_CancelledReservation() {
        // Arrange
        String id = "123";
        Reservation existing = createValidReservation();
        existing.setId(id);
        existing.setStatus(Reservation.ReservationStatus.CANCELLED);
        Reservation updated = createValidReservation();

        when(repository.findById(id)).thenReturn(Optional.of(existing));

        // Act & Assert
        InvalidReservationException exception = assertThrows(
                InvalidReservationException.class,
                () -> service.updateReservation(id, updated)
        );
        assertTrue(exception.getMessage().contains("cancelled"));
    }

    @Test
    @DisplayName("It must throw an exception when updating the completed reservation")
    void testUpdateReservation_CompletedReservation() {
        // Arrange
        String id = "123";
        Reservation existing = createValidReservation();
        existing.setId(id);
        existing.setStatus(Reservation.ReservationStatus.COMPLETED);
        Reservation updated = createValidReservation();

        when(repository.findById(id)).thenReturn(Optional.of(existing));

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.updateReservation(id, updated));
    }

    @Test
    @DisplayName("It should throw an exception when updating with an empty ID")
    void testUpdateReservation_EmptyId() {
        // Arrange
        Reservation updated = createValidReservation();

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.updateReservation("", updated));
    }

    // ==================== CANCELLATION TESTS ====================

    @Test
    @DisplayName("It must successfully cancel a reservation")
    void testCancelReservation_Success() {
        // Arrange
        String id = "123";
        Reservation reservation = createValidReservation();
        reservation.setId(id);
        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);

        when(repository.findById(id)).thenReturn(Optional.of(reservation));
        when(repository.update(any(Reservation.class))).thenReturn(reservation);

        // Act
        Reservation result = service.cancelReservation(id);

        // Assert
        assertNotNull(result);
        assertEquals(Reservation.ReservationStatus.CANCELLED, result.getStatus());
        verify(repository).update(reservation);
    }

    @Test
    @DisplayName("It must throw an exception when canceling a reservation not found")
    void testCancelReservation_NotFound() {
        // Arrange
        String id = "999";
        when(repository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ReservationNotFoundException.class,
                () -> service.cancelReservation(id));
    }

    @Test
    @DisplayName("It must create an exception when canceling a reservation that has already been cancelled")
    void testCancelReservation_AlreadyCancelled() {
        // Arrange
        String id = "123";
        Reservation reservation = createValidReservation();
        reservation.setId(id);
        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);

        when(repository.findById(id)).thenReturn(Optional.of(reservation));

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.cancelReservation(id));
    }

    @Test
    @DisplayName("It must throw an exception when canceling a completed reservation")
    void testCancelReservation_CompletedReservation() {
        // Arrange
        String id = "123";
        Reservation reservation = createValidReservation();
        reservation.setId(id);
        reservation.setStatus(Reservation.ReservationStatus.COMPLETED);

        when(repository.findById(id)).thenReturn(Optional.of(reservation));

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.cancelReservation(id));
    }

    // ==================== CONFIRMATION TESTS ====================

    @Test
    @DisplayName("It must successfully confirm a reservation")
    void testConfirmReservation_Success() {
        // Arrange
        String id = "123";
        Reservation reservation = createValidReservation();
        reservation.setId(id);
        reservation.setStatus(Reservation.ReservationStatus.PENDING);

        when(repository.findById(id)).thenReturn(Optional.of(reservation));
        when(repository.update(any(Reservation.class))).thenReturn(reservation);

        // Act
        Reservation result = service.confirmReservation(id);

        // Assert
        assertNotNull(result);
        assertEquals(Reservation.ReservationStatus.CONFIRMED, result.getStatus());
        verify(repository).update(reservation);
    }

    @Test
    @DisplayName("It must throw an exception when confirming a non-pending reservation")
    void testConfirmReservation_NotPending() {
        // Arrange
        String id = "123";
        Reservation reservation = createValidReservation();
        reservation.setId(id);
        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);

        when(repository.findById(id)).thenReturn(Optional.of(reservation));

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.confirmReservation(id));
    }

    // ==================== RESERVATION COMPLETION TESTS ====================

    @Test
    @DisplayName("It must successfully complete a reservation")
    void testCompleteReservation_Success() {
        // Arrange
        String id = "123";
        Reservation reservation = createValidReservation();
        reservation.setId(id);
        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);

        when(repository.findById(id)).thenReturn(Optional.of(reservation));
        when(repository.update(any(Reservation.class))).thenReturn(reservation);

        // Act
        Reservation result = service.completeReservation(id);

        // Assert
        assertNotNull(result);
        assertEquals(Reservation.ReservationStatus.COMPLETED, result.getStatus());
        verify(repository).update(reservation);
    }

    @Test
    @DisplayName("It must throw an exception when completing an unconfirmed reservation")
    void testCompleteReservation_NotConfirmed() {
        // Arrange
        String id = "123";
        Reservation reservation = createValidReservation();
        reservation.setId(id);
        reservation.setStatus(Reservation.ReservationStatus.PENDING);

        when(repository.findById(id)).thenReturn(Optional.of(reservation));

        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.completeReservation(id));
    }

    // ==================== SEARCH TESTS ====================

    @Test
    @DisplayName("It must successfully search for a reservation by ID")
    void testFindReservationById_Success() {
        // Arrange
        String id = "123";
        Reservation reservation = createValidReservation();
        reservation.setId(id);
        when(repository.findById(id)).thenReturn(Optional.of(reservation));

        // Act
        Reservation result = service.findReservationById(id);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getId());
        verify(repository).findById(id);
    }

    @Test
    @DisplayName("It should throw an exception when searching for ID not found")
    void testFindReservationById_NotFound() {
        // Arrange
        String id = "999";
        when(repository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ReservationNotFoundException.class,
                () -> service.findReservationById(id));
    }

    @Test
    @DisplayName("It must search for reservations by guest name")
    void testFindReservationsByGuestName_Success() {
        // Arrange
        String guestName = "Juan Pérez";
        List<Reservation> reservations = Arrays.asList(
                createValidReservation(),
                createValidReservation()
        );
        when(repository.findByGuestName(guestName)).thenReturn(reservations);

        // Act
        List<Reservation> result = service.findReservationsByGuestName(guestName);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(repository).findByGuestName(guestName);
    }

    @Test
    @DisplayName("It should throw an exception when searching for an empty name")
    void testFindReservationsByGuestName_EmptyName() {
        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.findReservationsByGuestName(""));
    }

    @Test
    @DisplayName("It should look for reservations by email")
    void testFindReservationsByEmail_Success() {
        // Arrange
        String email = "juan@example.com";
        List<Reservation> reservations = Arrays.asList(createValidReservation());
        when(repository.findByGuestEmail(email)).thenReturn(reservations);

        // Act
        List<Reservation> result = service.findReservationsByEmail(email);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repository).findByGuestEmail(email);
    }

    @Test
    @DisplayName("It should throw an exception when searching for an invalid email address")
    void testFindReservationsByEmail_InvalidEmail() {
        // Act & Assert
        assertThrows(InvalidReservationException.class,
                () -> service.findReservationsByEmail("email-invalido"));
    }

    @Test
    @DisplayName("It must obtain all reservations")
    void testGetAllReservations_Success() {
        // Arrange
        List<Reservation> reservations = Arrays.asList(
                createValidReservation(),
                createValidReservation(),
                createValidReservation()
        );
        when(repository.findAll()).thenReturn(reservations);

        // Act
        List<Reservation> result = service.getAllReservations();

        // Assert
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(repository).findAll();
    }

    // ==================== AUXILIARY METHODS ====================

    /**
     * Create a valid reservation for use in testing
     */
    private Reservation createValidReservation() {
        return new Reservation(
                "123",
                "Juan Pérez",
                "juan@example.com",
                "Hotel Plaza",
                "Suite Deluxe",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(4),
                2,
                1500.0
        );
    }
}