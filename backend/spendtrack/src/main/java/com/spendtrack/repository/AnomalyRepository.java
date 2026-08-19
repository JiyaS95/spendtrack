package com.spendtrack.repository;
import com.spendtrack.entity.Anomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AnomalyRepository extends JpaRepository<Anomaly, Long> {
    List<Anomaly> findByUserId(String userId);
}
