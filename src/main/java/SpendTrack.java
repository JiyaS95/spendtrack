import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
/*
 * Compile & Run:
 * javac src/main/java/Expense.java src/main/java/SpendTrack.java
 * java -cp src/main/java SpendTrack
 */

public class SpendTrack {
    static Scanner scan = new Scanner(System.in);
    static ExpenseManager manager = new ExpenseManager();

    public static void main(String[] args) {

        manager.loadExpensesFromJSON();


        System.out.println("Track Your Spendings!\n");

        int choice = 0;
        while (choice != 6) {
            showMenu();
            choice = getUserChoice();

            switch (choice) {
                case 1: 
                    addExpense();
                    break;
                
                case 2:
                    viewExpenses();
                    break;

                case 3: 
                    deleteExpense();
                    break;

                case 4:
                    System.out.println("Do you want to filter by: \n1) month\n2) year\n3) no filter");
                    int filterType = scan.nextInt();
                    scan.nextLine();
                    String filterValue = "";
                    if (filterType == 1){
                        System.out.print("Enter the month (yyyy-MM): ");
                        filterValue = scan.nextLine().trim();
                    }
                    else if (filterType == 2) {
                        System.out.print("Enter the year (yyyy): ");
                        filterValue = scan.nextLine().trim();
                    }
                    viewSummary(filterType, filterValue);
                    break;
                
                case 5:
                    System.out.println("Search by: \n1) Keyword\n2) Date");
                    int search = scan.nextInt();
                    scan.nextLine();
                    searchExpenses(search);
                    break;
                case 6:
                    System.out.println("Goodbye!");
                    break;
            }
        }
    }

    public static void searchExpenses(int search) {
        if (search == 1) {
            System.out.println("Enter a keyword to search");
            String keyword = scan.nextLine().toLowerCase();

            if (manager.getExpenses().isEmpty()) {
                System.out.println("No expenses recorded yet.\n");
                return;
            }
            System.out.println();
            boolean found = false;
            for (int i = 0; i < manager.getExpenses().size(); i++) {
                Expense e = manager.getExpenses().get(i);
                
                if (e.category.toLowerCase().contains(keyword) || e.note.toLowerCase().contains(keyword)) {
                    System.out.println(e.category + ": $"+e.amount+"          "+e.date);
                    found = true;
                }
            }
            if (!found) {
                System.out.println("No expenses found");
            }

        }
        else if (search == 2) {
            System.out.println("Search by: \n1) Day\n2) Month\n3) Year");
            int searchDate = scan.nextInt();
            scan.nextLine();
            String date = "";
            if (searchDate == 1) {
                System.out.println("Enter day (yyyy-MM-dd): ");
                
            }
            else if (searchDate == 2) {
                System.out.println("Enter month (yyyy-MM): ");
            }
            else if (searchDate == 3) {
                System.out.println("Enter year (yyyy): ");
            }
            date = scan.nextLine().trim();

            boolean found = false;
            for (int i = 0; i < manager.getExpenses().size(); i++) {
                Expense e = manager.getExpenses().get(i);
                if ((searchDate == 1 && e.date.equals(date)) || ((searchDate == 2 || searchDate == 3) && e.date.startsWith(date))) {
                    System.out.println(e.category + ": $"+e.amount+"          "+e.date);
                    found = true;
                }
            }

            if (!found) {
                System.out.println("No expenses found");
            }
            
        }

    }

    public static void viewSummary(int filterType, String filterValue) { //displays totals in each category
        if (manager.getExpenses().isEmpty()) {
            System.out.println("No expenses recorded yet");
            return;
        }

        double total = 0;
        HashMap<String, Double> categoryTotals = new HashMap<>();
        

        for (int i = 0; i < manager.getExpenses().size(); i++) {
            Expense e = manager.getExpenses().get(i);

            boolean include = false;

            if (filterType == 3) { //no filter
                include = true;
            }

            else if (filterType == 1) { //filter by month
                if (e.date.startsWith(filterValue)) {
                    include = true;
                }
            }

            else if (filterType == 2) { //filter by year
                if (e.date.startsWith(filterValue)) {
                    include = true;
                }
            }

            if (include) {
                total = total + e.amount;
                if (categoryTotals.containsKey(e.category)) {
                    double oldTotal = categoryTotals.get(e.category);
                    categoryTotals.put(e.category, oldTotal + e.amount);
                }
                else {
                    categoryTotals.put(e.category, e.amount);
                }
            }

        }
        ArrayList<String> categories = new ArrayList<>(categoryTotals.keySet());

        for (int i = 0; i < categories.size() - 1; i++) {
            for (int j = i + 1; j < categories.size(); j++) {
                if (categoryTotals.get(categories.get(i)) < categoryTotals.get(categories.get(j))) {
                    String temp = categories.get(i);
                    categories.set(i, categories.get(j));
                    categories.set(j, temp);
                }
            }
        }

        System.out.println("\nTotal Spent: $"+String.format("%.2f", total));
        System.out.println("Breakdown by Category: \n--------------------------------");
        for (int i = 0; i < categories.size(); i++) {
            String category = categories.get(i);
            double cateAmount = categoryTotals.get(category);
            double percentAmount = (cateAmount / total) * 100;
            int blocks = (int) (percentAmount / 2);
            StringBuilder bar = new StringBuilder();

            for (int b = 0; b < blocks; b++) {
                bar.append("█");
            }


            System.out.println(category + "           " + bar.toString() + "  "+ String.format("%.2f", percentAmount) 
                + "% ($" + String.format("%.2f", cateAmount) + ")");
        }
    }

    public static void showMenu() { //shows possible choices
        System.out.println("\nSelection Panel: \n-----------------");
        System.out.println("Add Expense - 1");
        System.out.println("View all Expenses - 2");
        System.out.println("Delete Expense - 3");
        System.out.println("View Summary - 4");
        System.out.println("Search Expenses - 5");
        System.out.println("Exit - 6");
    }

    public static int getUserChoice() { //gets user's choice from selected options       
        while (true) {
            try {
                System.out.print("Choice: ");
                int choice = Integer.parseInt(scan.nextLine());
                if (choice >= 1 && choice <= 6) {
                    return choice;
                }
                else {
                    System.out.println("Please enter a valid choice between 1 and 6.");
                }
            }
            catch (NumberFormatException e) {
                System.out.println("Invalid Input. Please enter a number");
            }
            
        }
    }

    public static void addExpense() { //adds an expense to the file
        String date = getValidDate();
        
        System.out.println("Enter the Category:");
        String category = scan.nextLine();
        
        double amount = getValidAmount();

        System.out.println("Enter the Note:");
        String note = scan.nextLine();
        
        Expense exp = new Expense(category, amount, date, note);
        manager.addExpense(exp); //memory + JSON
        manager.handleCSVExport(exp, scan); //optional CSV export
        
        System.out.println("Expense added!\n");
    }

    public static double getValidAmount () { //ensures a valid amount is entered
        while (true) {
            System.out.println("Enter the Amount:");
            String input = scan.nextLine();
            try {
                double amount = Double.parseDouble(input);
                if (amount >= 0) {
                    return amount;
                }
                else {
                    System.out.println("Answer cannot be negative. Please enter again.");

                }
            }
            catch (NumberFormatException e) {
                System.out.println("Invalid amount. Please enter a valid number.");
            }
        }
    }

    public static String getValidDate() { //ensures a proper date format is entered
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        System.out.println("");
        while (true) {
            System.out.println("Enter the Date (yyyy-MM-dd):");
            String dateInput = scan.nextLine().trim();
            try {
                LocalDate date = LocalDate.parse(dateInput, formatter);
                return date.toString();
            }
            catch (DateTimeParseException e) {
                System.out.println("Invalid date format.");
            }
        }
    }


    public static void viewExpenses() { //displays all expenses
        if (manager.getExpenses().isEmpty()) {
            System.out.println("No expenses recorded yet.\n");
            return;
        }
        System.out.println();
        for (int i = 0; i < manager.getExpenses().size(); i++) {
            Expense e = manager.getExpenses().get(i);
            System.out.println("Expense #"+(i+1)+":");
            System.out.println("Date: " + e.date);
            System.out.println("Category: " + e.category);
            System.out.println("Amount: $" + e.amount);
            System.out.println("Note: " + e.note);
            System.out.println("------------------------");
        }
    }

    public static void deleteExpense() { //deletes an expense
        if (manager.getExpenses().isEmpty()) {
            System.out.println("No expenses to delete");
            return;
        }
        viewExpenses();
        System.out.println("Enter the expense number to delete:");
        int indexToDelete = -1;
        String expNum = scan.nextLine();
        
        try {
            int eNum = Integer.parseInt(expNum);  
            if (eNum >= 1 && eNum <= manager.getExpenses().size()) {
                indexToDelete = eNum - 1;
                manager.deleteExpense(indexToDelete);
                System.out.println("Expense deleted successfully!");

            }
            else {
                System.out.println("Invalid expense number.");
            } 
        }
        catch (NumberFormatException e) {
            System.out.println("Invalid input.");
            return;
        }
        
    }
}