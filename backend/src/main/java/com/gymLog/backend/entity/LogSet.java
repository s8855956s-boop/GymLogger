package com.gymLog.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "LOG_SET")
@Getter
@Setter
public class LogSet {
    @Id
    private String id;
    private BigDecimal reps;
    private BigDecimal weight;
}
