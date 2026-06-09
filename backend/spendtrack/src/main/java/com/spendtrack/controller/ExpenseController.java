package com.spendtrack.controller;
import com.spendtrack.entity.Expense;
import com.spendtrack.repository.ExpenseRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {
    private final ExpenseRepository repo;

    public ExpenseController(ExpenseRepository repo) {
        this.repo = repo;
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public List<Expense> getAllExpenses() {
        return repo.findByUserId(getCurrentUserId());
    }

    @PostMapping
    public Expense addExpense(@RequestBody Expense expense) {
        expense.setUserId(getCurrentUserId());
        return repo.save(expense);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
