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
        LocalDate now = LocalDate.now();
        LocalDate sixMonthsAgo = now.minusMonths(6);
        double totalSpend = allExpenses.stream()
            .filter(e -> e.getDate().isAfter(sixMonthsAgo))
            .mapToDouble(Expense::getAmount).sum();
        double avgMonthlySpend = totalSpend / 6.0;
        double monthlySavings = avgMonthlySpend * 0.2;
        List<Wishlist> items = wishlistRepo.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Wishlist w : items) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", w.getId());
            item.put("name", w.getName());
            item.put("targetPrice", w.getTargetPrice());
            item.put("savedAmount", w.getSavedAmount());
            double remaining = Math.max(w.getTargetPrice() - w.getSavedAmount(), 0);
            double monthsNeeded = monthlySavings > 0 ? remaining / monthlySavings : -1;
            item.put("monthsToGoal", monthlySavings > 0 ? Math.ceil(monthsNeeded) : null);
            item.put("monthlySavingsEstimate", Math.round(monthlySavings * 100.0) / 100.0);
            item.put("progressPercent", w.getTargetPrice() > 0
                ? Math.min(100, Math.round((w.getSavedAmount() / w.getTargetPrice()) * 1000.0) / 10.0)
                : 0);
            result.add(item);
        }
        return result;
    }
    @PostMapping
    public Wishlist addItem(@RequestBody Wishlist item) {
        item.setUserId(uid());
        return wishlistRepo.save(item);
    }
    @PostMapping("/{id}/save")
    public Wishlist addSavings(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        Wishlist w = wishlistRepo.findById(id).orElseThrow();
        double amount = body.getOrDefault("amount", 0.0);
        w.setSavedAmount(w.getSavedAmount() + amount);
        return wishlistRepo.save(w);
    }
    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        wishlistRepo.deleteById(id);
    }
}
