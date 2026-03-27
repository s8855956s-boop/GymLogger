package com.gymLog.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "GYM_LOG")
@Getter
@Setter
public class GymLog {
    @Id
    private BigDecimal id;
    @OneToMany
    private List<LogExercise> logExercises;
}
