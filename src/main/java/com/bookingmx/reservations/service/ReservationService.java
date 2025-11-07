package com.bookingmx.reservations.service;

import com.bookingmx.reservations.model.Reservation;
import com.bookingmx.reservations.repository.ReservationRepository;
import com.bookingmx.reservations.exception.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ReservationService {
    private final ReservationRepository repository;

    public ReservationService(ReservationRepository repository) {
        this.repository = repository;
    }

    public Reservation createReservation(Reservation reservation) {
        validateReservation(reservation);

        if (reservation.getId() == null || reservation.getId().isEmpty()) {
            reservation.setId(UUID.randomUUID().toString());
        }

        if (repository.existsById(reservation.getId())) {
            throw new ReservationAlreadyExistsException(
                    "A reservation already exists with the ID: " + reservation.getId()
            );
        }

        return repository.save(reservation);
    }

    public Reservation updateReservation(String id, Reservation updatedReservation) {
        if (id == null || id.isEmpty()) {
            throw new InvalidReservationException("The reservation ID cannot be empty");
        }

        Reservation existing = repository.findById(id)
                .orElseThrow(() -> new ReservationNotFoundException(
                        "Reservation with ID not found: " + id
                ));

        if (existing.getStatus() == Reservation.ReservationStatus.CANCELLED) {
            throw new InvalidReservationException(
                    "A cancelled reservation cannot be updated."
            );
        }

        if (existing.getStatus() == Reservation.ReservationStatus.COMPLETED) {
            throw new InvalidReservationException(
                    "A completed reservation cannot be updated"
            );
        }

        validateReservation(updatedReservation);
        updatedReservation.setId(id);

        return repository.update(updatedReservation);
    }

    public Reservation cancelReservation(String id) {
        if (id == null || id.isEmpty()) {
            throw new InvalidReservationException("The reservation ID cannot be empty");
        }

        Reservation reservation = repository.findById(id)
                .orElseThrow(() -> new ReservationNotFoundException(
                        "Reservation with ID not found: " + id
                ));

        if (reservation.getStatus() == Reservation.ReservationStatus.CANCELLED) {
            throw new InvalidReservationException("The reservation has already been cancelled");
        }

        if (reservation.getStatus() == Reservation.ReservationStatus.COMPLETED) {
            throw new InvalidReservationException(
                    "A completed reservation cannot be cancelled"
            );
        }

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        return repository.update(reservation);
    }

    public Reservation confirmReservation(String id) {
        if (id == null || id.isEmpty()) {
            throw new InvalidReservationException("The reservation ID cannot be empty");
        }

        Reservation reservation = repository.findById(id)
                .orElseThrow(() -> new ReservationNotFoundException(
                        "Reservation with ID not found: " + id
                ));

        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING) {
            throw new InvalidReservationException(
                    "Only pending reservations can be confirmed"
            );
        }

        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);
        return repository.update(reservation);
    }

    public Reservation completeReservation(String id) {
        if (id == null || id.isEmpty()) {
            throw new InvalidReservationException("The reservation ID cannot be empty");
        }

        Reservation reservation = repository.findById(id)
                .orElseThrow(() -> new ReservationNotFoundException(
                        "Reservation with ID not found: " + id
                ));

        if (reservation.getStatus() != Reservation.ReservationStatus.CONFIRMED) {
            throw new InvalidReservationException(
                    "Only pending reservations can be confirmed"
            );
        }

        reservation.setStatus(Reservation.ReservationStatus.COMPLETED);
        return repository.update(reservation);
    }

    public Reservation findReservationById(String id) {
        if (id == null || id.isEmpty()) {
            throw new InvalidReservationException("The reservation ID cannot be empty");
        }

        return repository.findById(id)
                .orElseThrow(() -> new ReservationNotFoundException(
                        "Reservation with ID not found: " + id
                ));
    }

    public List<Reservation> findReservationsByGuestName(String guestName) {
        if (guestName == null || guestName.trim().isEmpty()) {
            throw new InvalidReservationException(
                    "The guest name cannot be empty"
            );
        }
        return repository.findByGuestName(guestName);
    }

    public List<Reservation> findReservationsByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new InvalidReservationException("The email cannot be empty");
        }

        if (!isValidEmail(email)) {
            throw new InvalidReservationException("The email format is invalid");
        }

        return repository.findByGuestEmail(email);
    }

    public List<Reservation> getAllReservations() {
        return repository.findAll();
    }

    private void validateReservation(Reservation reservation) {
        if (reservation == null) {
            throw new InvalidReservationException("The reservation cannot be null");
        }

        if (reservation.getGuestName() == null || reservation.getGuestName().trim().isEmpty()) {
            throw new InvalidReservationException("Guest name is required");
        }

        if (reservation.getGuestEmail() == null || reservation.getGuestEmail().trim().isEmpty()) {
            throw new InvalidReservationException("Guest email address required");
        }

        if (!isValidEmail(reservation.getGuestEmail())) {
            throw new InvalidReservationException("The email format is invalid");
        }

        if (reservation.getHotelName() == null || reservation.getHotelName().trim().isEmpty()) {
            throw new InvalidReservationException("The hotel name is required");
        }

        if (reservation.getRoomType() == null || reservation.getRoomType().trim().isEmpty()) {
            throw new InvalidReservationException("The room type is required");
        }

        if (reservation.getCheckInDate() == null) {
            throw new InvalidReservationException("The check-in date is required");
        }

        if (reservation.getCheckOutDate() == null) {
            throw new InvalidReservationException("The check-out date is required");
        }

        if (reservation.getCheckInDate().isBefore(LocalDate.now())) {
            throw new InvalidReservationException(
                    "The check-in date cannot be earlier than today"
            );
        }

        if (reservation.getCheckInDate().isAfter(reservation.getCheckOutDate()) ||
                reservation.getCheckInDate().isEqual(reservation.getCheckOutDate())) {
            throw new InvalidReservationException(
                    "The check-in date must be earlier than the check-out date"
            );
        }

        if (reservation.getNumberOfGuests() <= 0) {
            throw new InvalidReservationException(
                    "The number of guests must be greater than 0"
            );
        }

        if (reservation.getNumberOfGuests() > 10) {
            throw new InvalidReservationException(
                    "The maximum number of guests is 10"
            );
        }

        if (reservation.getTotalPrice() <= 0) {
            throw new InvalidReservationException("The total price must be greater than 0");
        }
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email != null && email.matches(emailRegex);
    }

    public double calculateTotalPrice(LocalDate checkIn, LocalDate checkOut, double pricePerNight) {
        if (checkIn == null || checkOut == null) {
            throw new InvalidReservationException("Dates cannot be null");
        }

        if (checkIn.isAfter(checkOut) || checkIn.isEqual(checkOut)) {
            throw new InvalidReservationException(
                    "The check-in date must be earlier than the check-out date"
            );
        }

        if (pricePerNight <= 0) {
            throw new InvalidReservationException("The price per night must be greater than 0");
        }

        long numberOfNights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        return numberOfNights * pricePerNight;
    }
}