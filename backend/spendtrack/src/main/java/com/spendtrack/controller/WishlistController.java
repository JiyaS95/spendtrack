package com.spendtrack.controller;
import com.spendtrack.entity.Wishlist;
import com.spendtrack.entity.Expense;
import com.spendtrack.repository.WishlistRepository;
import com.spendtrack.repository.ExpenseRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {
    private final WishlistRepository wishlistRepo;
    private final ExpenseRepository expenseRepo;

    public WishlistController(WishlistRepository wishlistRepo, ExpenseRepository expenseRepo) {
        this.wishlistRepo = wishlistRepo;
        this.expenseRepo = expenseRepo;
    }

    private String uid() { return SecurityContextHolder.getContext().getAuthentication().getName(); }

    @GetMapping
    public List<Map<String, Object>> getWishlist() {
        String userId = uid();
        List<Expense> allExpenses = expenseRepo.findByUserId(userId);

        // Calc avg monthly spend from last 6 months
        LocalDate now = LocalDate.now();
        LocalDate sixMonthsAgo = now.minusMonths(6);
        double totalSpend = allExpenses.stream()
            .filter(e -> e.getDate().isAfter(sixMonthsAgo))
            .mapToDouble(Expense::getAmount).sum();
        double avgMonthlySpend = totalSpend / 6.0;

        // Assume user saves 20% of avg monthly spend as a baseline
        double monthlySavings = avgMonthlySpend * 0.2;

        List<Wishlist> items = wishlistRepo.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Wishlist w : items) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", w.getId());
            item.put("name", w.getName());
            item.put("targetPrice", w.getTargetPrice());
            double monthsNeeded = monthlySavings > 0 ? w.getTargetPrice() / monthlySavings : -1;
            item.put("monthsToGoal", monthlySavings > 0 ? Math.ceil(monthsNeeded) : null);
            item.put("monthlySavingsEstimate", Math.round(monthlySavings * 100.0) / 100.0);
            result.add(item);
        }
        return result;
    }

    @PostMapping
    public Wishlist addItem(@RequestBody Wishlist item) {
        item.setUserId(uid());
        return wishlistRepo.save(item);
    }

    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        wishlistRepo.deleteById(id);
    }
}
