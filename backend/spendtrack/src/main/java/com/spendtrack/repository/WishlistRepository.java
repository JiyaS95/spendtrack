package com.spendtrack.repository;
import com.spendtrack.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserId(String userId);
}
