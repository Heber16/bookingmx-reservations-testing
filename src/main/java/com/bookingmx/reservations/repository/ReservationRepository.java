package com.bookingmx.reservations.repository;

import com.bookingmx.reservations.model.Reservation;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository {

    Reservation save(Reservation reservation);

    Reservation update(Reservation reservation);

    Optional<Reservation> findById(String id);

    List<Reservation> findByGuestName(String guestName);

    List<Reservation> findByGuestEmail(String email);

    List<Reservation> findByHotelName(String hotelName);

    List<Reservation> findAll();

    void deleteById(String id);

    boolean existsById(String id);

    long count();
}