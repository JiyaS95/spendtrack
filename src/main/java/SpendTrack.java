
import java.util.ArrayList;
import java.util.Scanner;
/*
 * Compile & Run:
 * javac SpendTrack.java Expense.java
 * java SpendTrack
 */

public class SpendTrack {
    static Scanner scan = new Scanner(System.in);
    static ArrayList<Expense> expenses = new ArrayList<>();
    public static void main(String[] args) {
        
        System.out.println("Track Your Spendings!\n\n");

        int choice = 0;
        while (choice != 3) {
            showMenu();
            choice = getUserChoice();

            if (choice == 1) {
                addExpense();
            }

            else if (choice == 2) {
                viewExpenses();
            }
        }
        
    }

    public static void showMenu() {
        System.out.println("Selection Panel: \n-----------------\nAdd Expense - 1\nView all Expenses - 2\nExit - 3");
        System.out.print("Choice: ");
    }

    public static int getUserChoice() {
        int choice = scan.nextInt();
        scan.nextLine();
        return choice;
    }

    public static void addExpense() {
        System.out.println("\nEnter the Date:");
        String date = scan.nextLine();
        
        System.out.println("Enter the Category:");
        String category = scan.nextLine();

        System.out.println("Enter the Amount:");
        Double amount = scan.nextDouble();
        scan.nextLine();

        System.out.println("Enter the Note:");
        String note = scan.nextLine();
        Expense exp = new Expense(date, category, amount, note);
        expenses.add(exp);
    }

    public static void viewExpenses() {
        if (expenses.isEmpty()) {
            System.out.println("No expenses recorded yet.\n");
        }

        for (int i = 0; i < expenses.size(); ++i) {
            Expense e = expenses.get(i);
            System.out.println("Date: " + e.date);
            System.out.println("Category: " + e.category);
            System.out.println("Amount: $" + e.amount);
            System.out.println("Note: " + e.note);
            System.out.println("------------------------");
        }
    }
}