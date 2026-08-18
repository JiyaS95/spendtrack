package com.spendtrack.controller;
import com.spendtrack.entity.Expense;
import com.spendtrack.entity.Wishlist;
import com.spendtrack.repository.ExpenseRepository;
import com.spendtrack.repository.WishlistRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.DayOfWeek;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/insights")
public class InsightsController {
    private final ExpenseRepository repo;
    private final WishlistRepository wishlistRepo;

    public InsightsController(ExpenseRepository repo, WishlistRepository wishlistRepo) {
        this.repo = repo;
        this.wishlistRepo = wishlistRepo;
    }

    private String uid() { return SecurityContextHolder.getContext().getAuthentication().getName(); }

    @GetMapping("/burn-rate")
    public Map<String, Object> burnRate() {
        String userId = uid();
        LocalDate now = LocalDate.now();
        LocalDate twelveMonthsAgo = now.minusMonths(12);
        List<Object[]> rows = repo.monthlyTotals(userId, twelveMonthsAgo);
        LocalDate startOfMonth = now.withDayOfMonth(1);
        double currentMonthSpend = repo.findByUserIdAndDateBetween(userId, startOfMonth, now)
            .stream().mapToDouble(e -> e.getAmount()).sum();
        String currentMonthKey = String.format("%d-%02d", now.getYear(), now.getMonthValue());
        double historicalSum = 0;
        int historicalCount = 0;
        for (Object[] row : rows) {
            String month = (String) row[0];
            double total = ((Number) row[1]).doubleValue();
            if (!month.equals(currentMonthKey)) { historicalSum += total; historicalCount++; }
        }
        double avgMonthly = historicalCount > 0 ? historicalSum / historicalCount : currentMonthSpend;
        int daysInMonth = YearMonth.now().lengthOfMonth();
        int dayOfMonth = now.getDayOfMonth();
        double projected = dayOfMonth > 0 ? (currentMonthSpend / dayOfMonth) * daysInMonth : 0;
        double burnPercent = avgMonthly > 0 ? (projected / avgMonthly) * 100 : 0;
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("avgMonthly", Math.round(avgMonthly * 100.0) / 100.0);
        result.put("currentMonthSpend", Math.round(currentMonthSpend * 100.0) / 100.0);
        result.put("projectedMonthEnd", Math.round(projected * 100.0) / 100.0);
        result.put("burnPercent", Math.round(burnPercent * 10.0) / 10.0);
        return result;
    }

    @GetMapping("/time-machine")
    public Map<String, Object> timeMachine() {
        String userId = uid();
        LocalDate now = LocalDate.now();
        LocalDate from = now.minusMonths(12);
        List<Object[]> rows = repo.monthlyTotals(userId, from);
        List<String> labels = new ArrayList<>();
        List<Double> actuals = new ArrayList<>();
        for (Object[] row : rows) {
            labels.add((String) row[0]);
            actuals.add(Math.round(((Number) row[1]).doubleValue() * 100.0) / 100.0);
        }
        double projAvg = 0;
        if (actuals.size() >= 3) {
            int sz = actuals.size();
            projAvg = (actuals.get(sz-1) + actuals.get(sz-2) + actuals.get(sz-3)) / 3.0;
        } else if (!actuals.isEmpty()) {
            projAvg = actuals.stream().mapToDouble(d -> d).average().orElse(0);
        }
        List<String> projLabels = new ArrayList<>();
        List<Double> projValues = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            YearMonth ym = YearMonth.now().plusMonths(i);
            projLabels.add(String.format("%d-%02d", ym.getYear(), ym.getMonthValue()));
            projValues.add(Math.round(projAvg * 100.0) / 100.0);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("labels", labels);
        result.put("actuals", actuals);
        result.put("projectionLabels", projLabels);
        result.put("projectionValues", projValues);
        return result;
    }

    @GetMapping("/habits")
    public Map<String, Object> habits() {
        String userId = uid();
        List<Expense> all = repo.findByUserId(userId);
        Map<String, Object> result = new LinkedHashMap<>();
        if (all.isEmpty()) {
            result.put("message", "Add more expenses to detect habits");
            return result;
        }
        Map<String, Long> categoryCount = all.stream()
            .collect(Collectors.groupingBy(Expense::getCategory, Collectors.counting()));
        String mostFrequentCategory = categoryCount.entrySet().stream()
            .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
        Map<String, Double> categoryTotal = all.stream()
            .collect(Collectors.groupingBy(Expense::getCategory, Collectors.summingDouble(Expense::getAmount)));
        String mostExpensiveCategory = categoryTotal.entrySet().stream()
            .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
        Map<DayOfWeek, Double> byDayOfWeek = all.stream()
            .collect(Collectors.groupingBy(e -> e.getDate().getDayOfWeek(), Collectors.summingDouble(Expense::getAmount)));
        DayOfWeek biggestDay = byDayOfWeek.entrySet().stream()
            .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(DayOfWeek.MONDAY);
        double weekendSpend = all.stream()
            .filter(e -> e.getDate().getDayOfWeek() == DayOfWeek.SATURDAY || e.getDate().getDayOfWeek() == DayOfWeek.SUNDAY)
            .mapToDouble(Expense::getAmount).sum();
        double weekdaySpend = all.stream()
            .filter(e -> e.getDate().getDayOfWeek() != DayOfWeek.SATURDAY && e.getDate().getDayOfWeek() != DayOfWeek.SUNDAY)
            .mapToDouble(Expense::getAmount).sum();
        String spenderType = weekendSpend > weekdaySpend ? "weekend" : "weekday";
        Optional<LocalDate> earliest = all.stream().map(Expense::getDate).min(Comparator.naturalOrder());
        long daySpan = earliest.map(d -> d.until(LocalDate.now(), java.time.temporal.ChronoUnit.DAYS)).orElse(7L);
        double weeksSpan = Math.max(daySpan / 7.0, 1.0);
        double avgPerWeek = all.size() / weeksSpan;
        result.put("mostFrequentCategory", mostFrequentCategory);
        result.put("mostExpensiveCategory", mostExpensiveCategory);
        result.put("biggestSpendingDay", biggestDay.toString());
        result.put("spenderType", spenderType);
        result.put("avgExpensesPerWeek", Math.round(avgPerWeek * 10.0) / 10.0);
        result.put("weekendSpend", Math.round(weekendSpend * 100.0) / 100.0);
        result.put("weekdaySpend", Math.round(weekdaySpend * 100.0) / 100.0);
        result.put("totalExpenses", all.size());
        return result;
    }

    @GetMapping("/whatif")
    public Map<String, Object> whatIf(
        @RequestParam String category,
        @RequestParam double cutPercent
    ) {
        String userId = uid();
        List<Expense> all = repo.findByUserId(userId);

        // Avg monthly spend on this category over last 6 months
        LocalDate now = LocalDate.now();
        LocalDate sixMonthsAgo = now.minusMonths(6);
        double categorySpend = all.stream()
            .filter(e -> e.getCategory().equalsIgnoreCase(category) && e.getDate().isAfter(sixMonthsAgo))
            .mapToDouble(Expense::getAmount).sum();
        double avgMonthlyCategorySpend = categorySpend / 6.0;

        double monthlySaving = avgMonthlyCategorySpend * (cutPercent / 100.0);
        double yearlySaving = monthlySaving * 12;

        // How does this affect wishlist timelines
        List<Wishlist> wishlist = wishlistRepo.findByUserId(userId);
        double totalMonthlySpend = all.stream()
            .filter(e -> e.getDate().isAfter(sixMonthsAgo))
            .mapToDouble(Expense::getAmount).sum() / 6.0;
        double currentSavings = totalMonthlySpend * 0.2;
        double newSavings = currentSavings + monthlySaving;

        List<Map<String, Object>> wishlistImpact = new ArrayList<>();
        for (Wishlist w : wishlist) {
            Map<String, Object> impact = new LinkedHashMap<>();
            impact.put("name", w.getName());
            impact.put("targetPrice", w.getTargetPrice());
            double oldMonths = currentSavings > 0 ? Math.ceil(w.getTargetPrice() / currentSavings) : -1;
            double newMonths = newSavings > 0 ? Math.ceil(w.getTargetPrice() / newSavings) : -1;
            impact.put("currentMonthsToGoal", oldMonths > 0 ? oldMonths : null);
            impact.put("newMonthsToGoal", newMonths > 0 ? newMonths : null);
            impact.put("monthsSaved", (oldMonths > 0 && newMonths > 0) ? Math.max(oldMonths - newMonths, 0) : null);
            wishlistImpact.add(impact);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("category", category);
        result.put("cutPercent", cutPercent);
        result.put("avgMonthlyCategorySpend", Math.round(avgMonthlyCategorySpend * 100.0) / 100.0);
        result.put("monthlySaving", Math.round(monthlySaving * 100.0) / 100.0);
        result.put("yearlySaving", Math.round(yearlySaving * 100.0) / 100.0);
        result.put("wishlistImpact", wishlistImpact);
        return result;
    }
}
