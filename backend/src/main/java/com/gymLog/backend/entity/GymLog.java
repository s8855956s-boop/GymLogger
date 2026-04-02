package com.gymLog.backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "GYM_LOG")
@Getter
@Setter
public class GymLog {
    @Id
    @Column(name = "date_id")
    private Long dateId;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @OneToMany(mappedBy = "gymLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LogExercise> logExercises;
}
