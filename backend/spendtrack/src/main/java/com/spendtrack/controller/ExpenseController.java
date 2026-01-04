package com.spendtrack.controller;

import com.spendtrack.entity.Expense;
import com.spendtrack.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List; //want list of expenses

@RestController
@RequestMapping("/expenses")
public class ExpenseController {
    private final ExpenseRepository repo; //class has a variable named repo, declared only!

    public ExpenseController(ExpenseRepository repo) { //receiving a repo
        this.repo = repo;
    }
    @GetMapping
    public List<Expense> getAllExpenses() {
        return repo.findAll();
    }
    @PostMapping
    public Expense addExpense(@RequestBody Expense expense) {
        return repo.save(expense);
    }
    

/*
    @GetMapping ("/summary/category")
    public List<Object[]> getCategorySummary() {
        return repo.getCategorySummary();
    }
*/
}