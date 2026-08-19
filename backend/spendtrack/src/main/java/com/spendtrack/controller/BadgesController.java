package com.spendtrack.controller;
import com.spendtrack.entity.Expense;
import com.spendtrack.entity.Budget;
import com.spendtrack.entity.Wishlist;
import com.spendtrack.repository.ExpenseRepository;
import com.spendtrack.repository.BudgetRepository;
import com.spendtrack.repository.WishlistRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/badges")
public class BadgesController {
    private final ExpenseRepository expenseRepo;
    private final BudgetRepository budgetRepo;
    private final WishlistRepository wishlistRepo;

    public BadgesController(ExpenseRepository expenseRepo, BudgetRepository budgetRepo, WishlistRepository wishlistRepo) {
        this.expenseRepo = expenseRepo;
        this.budgetRepo = budgetRepo;
        this.wishlistRepo = wishlistRepo;
    }

    private String uid() { return SecurityContextHolder.getContext().getAuthentication().getName(); }

    @GetMapping
    public List<Map<String, Object>> getBadges() {
        String userId = uid();
        List<Expense> expenses = expenseRepo.findByUserId(userId);
        List<Budget> budgets = budgetRepo.findByUserId(userId);
        List<Wishlist> wishlist = wishlistRepo.findByUserId(userId);

        List<Map<String, Object>> badges = new ArrayList<>();

        // First Step: logged at least 1 expense
        badges.add(badge("first_step", "First Step", "Logged your first expense",
            "footsteps-outline", !expenses.isEmpty()));

        // Consistent Tracker: logged expenses on 7 different days
        long distinctDays = expenses.stream().map(Expense::getDate).distinct().count();
        badges.add(badge("consistent_tracker", "Consistent Tracker", "Logged expenses on 7 different days",
            "calendar-outline", distinctDays >= 7));

        // Century Club: 100 total expenses logged
        badges.add(badge("century_club", "Century Club", "Logged 100 expenses",
            "trophy-outline", expenses.size() >= 100));

        // Budget Keeper: stayed under every set budget last calendar month
        badges.add(badge("budget_keeper", "Budget Keeper", "Stayed under budget in every category last month",
            "shield-checkmark-outline", checkBudgetKeeper(expenses, budgets)));

        // Goal Getter: fully funded at least one wishlist item
        boolean goalReached = wishlist.stream().anyMatch(w -> w.getSavedAmount() >= w.getTargetPrice() && w.getTargetPrice() > 0);
        badges.add(badge("goal_getter", "Goal Getter", "Fully funded a wishlist item",
            "star-outline", goalReached));

        return badges;
    }

    private boolean checkBudgetKeeper(List<Expense> expenses, List<Budget> budgets) {
        if (budgets.isEmpty()) return false;

        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        LocalDate start = lastMonth.atDay(1);
        LocalDate end = lastMonth.atEndOfMonth();

        Map<String, Double> spendByCategory = expenses.stream()
            .filter(e -> !e.getDate().isBefore(start) && !e.getDate().isAfter(end))
            .collect(Collectors.groupingBy(Expense::getCategory, Collectors.summingDouble(Expense::getAmount)));

        // must have had at least one expense logged in that month to count
        if (spendByCategory.isEmpty()) return false;

        for (Budget b : budgets) {
            double spent = spendByCategory.getOrDefault(b.getCategory(), 0.0);
            if (spent > b.getLimitAmount()) return false;
        }
        return true;
    }

    private Map<String, Object> badge(String id, String name, String description, String icon, boolean earned) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("description", description);
        m.put("icon", icon);
        m.put("earned", earned);
        return m;
    }
}
