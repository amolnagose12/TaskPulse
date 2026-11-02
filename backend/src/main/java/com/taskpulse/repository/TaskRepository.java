package com.taskpulse.repository;

import com.taskpulse.model.Task;
import com.taskpulse.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssigneeId(Long assigneeId);

    List<Task> findByMentorId(Long mentorId);

    List<Task> findByManagerId(Long managerId);

    List<Task> findByStatus(TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.dueDate <= :targetDate AND t.status != 'COMPLETED'")
    List<Task> findOverdueOrApproachingDeadline(@Param("targetDate") LocalDate targetDate);
}

