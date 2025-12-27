package com.spendtrack.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.spendtrack.entity.Expense;


public interface ExpenseRepository extends JpaRepository <Expense, Long> {

}