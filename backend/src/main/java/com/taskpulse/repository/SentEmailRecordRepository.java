package com.taskpulse.repository;

import com.taskpulse.model.SentEmailRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SentEmailRecordRepository extends JpaRepository<SentEmailRecord, Long> {
    List<SentEmailRecord> findAllByOrderBySentAtDesc();
    List<SentEmailRecord> findByTaskIdOrderBySentAtDesc(Long taskId);
}

