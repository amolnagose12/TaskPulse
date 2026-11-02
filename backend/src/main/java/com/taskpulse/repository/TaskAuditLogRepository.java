package com.taskpulse.repository;

import com.taskpulse.model.TaskAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskAuditLogRepository extends JpaRepository<TaskAuditLog, Long> {
    List<TaskAuditLog> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}

