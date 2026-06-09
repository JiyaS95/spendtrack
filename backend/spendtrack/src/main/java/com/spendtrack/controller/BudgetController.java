package com.spendtrack.controller;
import com.spendtrack.entity.Budget;
import com.spendtrack.entity.Expense;
import com.spendtrack.repository.BudgetRepository;
import com.spendtrack.repository.ExpenseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/budgets")
public class BudgetController {
    private final BudgetRepository budgetRepo;
    private final ExpenseRepository expenseRepo;

    public BudgetController(BudgetRepository budgetRepo, ExpenseRepository expenseRepo) {
        this.budgetRepo = budgetRepo;
        this.expenseRepo = expenseRepo;
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public List<Budget> getBudgets() {
        return budgetRepo.findByUserId(getCurrentUserId());
    }

    @PostMapping
    public Budget setBudget(@RequestBody Budget budget) {
        String userId = getCurrentUserId();
        Optional<Budget> existing = budgetRepo.findByUserIdAndCategory(userId, budget.getCategory());
        if (existing.isPresent()) {
            Budget b = existing.get();
            b.setLimitAmount(budget.getLimitAmount());
            return budgetRepo.save(b);
        }
        budget.setUserId(userId);
        return budgetRepo.save(budget);
    }

    @GetMapping("/status")
    public List<Map<String, Object>> getBudgetStatus() {
        String userId = getCurrentUserId();
        List<Budget> budgets = budgetRepo.findByUserId(userId);
        List<Expense> expenses = expenseRepo.findByUserId(userId);
        LocalDate now = LocalDate.now();

        List<Map<String, Object>> status = new ArrayList<>();
        for (Budget b : budgets) {
            double spent = expenses.stream()
                .filter(e -> e.getCategory().equals(b.getCategory())
                    && e.getDate().getMonth() == now.getMonth()
                    && e.getDate().getYear() == now.getYear())
                .mapToDouble(Expense::getAmount)
                .sum();

            double percentage = (spent / b.getLimitAmount()) * 100;
            String warning = percentage >= 100 ? "OVER_BUDGET" :
                             percentage >= 80 ? "WARNING" : "OK";

            status.add(Map.of(
                "category", b.getCategory(),
                "limit", b.getLimitAmount(),
                "spent", spent,
                "percentage", Math.round(percentage),
                "status", warning
            ));
        }
        return status;
    }
}
