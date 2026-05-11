package com.reservation.exception;
public class ConcurrenceException extends RuntimeException {
    public ConcurrenceException(String msg) { super(msg); }
}
