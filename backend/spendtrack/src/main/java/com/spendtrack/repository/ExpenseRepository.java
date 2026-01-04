package com.spendtrack.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.spendtrack.entity.Expense;
import java.util.List;

public interface ExpenseRepository extends JpaRepository <Expense, Long> {
  /*  @Query(value = "SELECT category, SUM(amount) as total FROM expense GROUP BY category", nativeQuery = true)
    List<Object[]> getCategorySummary();
    */
}