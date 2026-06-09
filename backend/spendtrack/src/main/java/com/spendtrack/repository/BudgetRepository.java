package com.spendtrack.repository;
import com.spendtrack.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(String userId);
    Optional<Budget> findByUserIdAndCategory(String userId, String category);
}
