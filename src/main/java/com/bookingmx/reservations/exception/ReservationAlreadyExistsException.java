package com.bookingmx.reservations.exception;

public class ReservationAlreadyExistsException extends RuntimeException {

    public ReservationAlreadyExistsException(String message) {
        super(message);
    }

    public ReservationAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}