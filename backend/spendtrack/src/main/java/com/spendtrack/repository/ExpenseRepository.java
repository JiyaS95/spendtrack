package com.spendtrack.repository;
import com.spendtrack.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserId(String userId);
    List<Expense> findByUserIdAndDateBetween(String userId, LocalDate from, LocalDate to);

    @Query("SELECT FUNCTION('TO_CHAR', e.date, 'YYYY-MM') as month, SUM(e.amount) as total " +
           "FROM Expense e WHERE e.userId = :userId AND e.date >= :from " +
           "GROUP BY FUNCTION('TO_CHAR', e.date, 'YYYY-MM') ORDER BY month ASC")
    List<Object[]> monthlyTotals(@Param("userId") String userId, @Param("from") LocalDate from);
}
