package com.gymLog.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "LOG_EXERCISE")
public class LogExercise {
    @Id
    private String id;
    private String name;
    private String unit;
    //image
    @OneToMany
    private List<LogSet> sets;
}
