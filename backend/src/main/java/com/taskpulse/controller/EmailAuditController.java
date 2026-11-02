package com.taskpulse.controller;

import com.taskpulse.dto.SentEmailResponse;
import com.taskpulse.repository.SentEmailRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/emails")
public class EmailAuditController {

    @Autowired
    private SentEmailRecordRepository emailRecordRepository;

    @GetMapping("/outbox")
    public ResponseEntity<List<SentEmailResponse>> getOutboxEmails(@RequestParam(required = false) Long taskId) {
        List<SentEmailResponse> records = (taskId != null 
                ? emailRecordRepository.findByTaskIdOrderBySentAtDesc(taskId)
                : emailRecordRepository.findAllByOrderBySentAtDesc())
                .stream()
                .map(SentEmailResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }
}

