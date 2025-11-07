package com.bookingmx.reservations.model;

import java.time.LocalDate;
import java.util.Objects;

public class Reservation {
    private String id;
    private String guestName;
    private String guestEmail;
    private String hotelName;
    private String roomType;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private int numberOfGuests;
    private ReservationStatus status;
    private double totalPrice;

    public enum ReservationStatus {
        PENDING,
        CONFIRMED,
        CANCELLED,
        COMPLETED
    }

    // Constructor completo
    public Reservation(String id, String guestName, String guestEmail, String hotelName,
                       String roomType, LocalDate checkInDate, LocalDate checkOutDate,
                       int numberOfGuests, double totalPrice) {
        this.id = id;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.hotelName = hotelName;
        this.roomType = roomType;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfGuests = numberOfGuests;
        this.totalPrice = totalPrice;
        this.status = ReservationStatus.PENDING;
    }

    // Constructor sin id (para nuevas reservaciones)
    public Reservation(String guestName, String guestEmail, String hotelName,
                       String roomType, LocalDate checkInDate, LocalDate checkOutDate,
                       int numberOfGuests, double totalPrice) {
        this(null, guestName, guestEmail, hotelName, roomType, checkInDate,
                checkOutDate, numberOfGuests, totalPrice);
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getGuestName() {
        return guestName;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public String getHotelName() {
        return hotelName;
    }

    public String getRoomType() {
        return roomType;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public int getNumberOfGuests() {
        return numberOfGuests;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public void setNumberOfGuests(int numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public long getNumberOfNights() {
        return java.time.temporal.ChronoUnit.DAYS.between(checkInDate, checkOutDate);
    }

    public double getPricePerNight() {
        long nights = getNumberOfNights();
        return nights > 0 ? totalPrice / nights : totalPrice;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Reservation that = (Reservation) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Reservation{" +
                "id='" + id + '\'' +
                ", guestName='" + guestName + '\'' +
                ", hotelName='" + hotelName + '\'' +
                ", checkInDate=" + checkInDate +
                ", checkOutDate=" + checkOutDate +
                ", status=" + status +
                ", totalPrice=" + totalPrice +
                '}';
    }
}