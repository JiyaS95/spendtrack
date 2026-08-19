package com.spendtrack.controller;
import com.spendtrack.entity.Anomaly;
import com.spendtrack.entity.Expense;
import com.spendtrack.repository.AnomalyRepository;
import com.spendtrack.repository.ExpenseRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/anomalies")
public class AnomalyController {
    private final AnomalyRepository anomalyRepo;
    private final ExpenseRepository expenseRepo;
    public AnomalyController(AnomalyRepository anomalyRepo, ExpenseRepository expenseRepo) {
        this.anomalyRepo = anomalyRepo;
        this.expenseRepo = expenseRepo;
    }
    private String uid() { return SecurityContextHolder.getContext().getAuthentication().getName(); }
    @GetMapping
    public List<Map<String, Object>> getAnomalies() {
        String userId = uid();
        List<Anomaly> anomalies = anomalyRepo.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Anomaly a : anomalies) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", a.getId());
            item.put("reason", a.getReason());
            item.put("anomalyScore", a.getAnomalyScore());
            item.put("flaggedAt", a.getFlaggedAt());
            Optional<Expense> exp = expenseRepo.findById(a.getExpenseId());
            if (exp.isPresent()) {
                item.put("category", exp.get().getCategory());
                item.put("amount", exp.get().getAmount());
                item.put("date", exp.get().getDate());
                item.put("note", exp.get().getNote());
            }
            result.add(item);
        }
        return result;
    }
}
