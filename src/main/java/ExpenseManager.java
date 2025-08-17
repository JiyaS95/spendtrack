import java.io.*;
import java.util.*;
import org.json.JSONArray;
import org.json.JSONObject;

public class ExpenseManager {

    private ArrayList<Expense> expenses = new ArrayList<>();

    public ArrayList<Expense> getExpenses() {
        return expenses;
    }

    public void addExpense(Expense e) {
        expenses.add(e);
        saveExpensesAsJSON();
    }

    public void deleteExpense(int index) {
        expenses.remove(index);
        saveExpensesAsJSON();
    }

    public void loadExpensesFromJSON () {
        File jsonFile = new File ("expenses.json");

        if (!jsonFile.exists()) {
            System.out.println("No JSON file found. Starting with empty expenses.");
            return;
        }
        try (FileReader reader = new FileReader("expenses.json")) {
            Scanner jsonScan = new Scanner(reader);
            StringBuilder jsonText = new StringBuilder();

            while (jsonScan.hasNextLine()) {
                jsonText.append(jsonScan.nextLine());
            }

            JSONArray jsonArray = new JSONArray(jsonText.toString());
            expenses.clear();

            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);
                Expense e = new Expense(obj.getString("category"), obj.getDouble("amount"), obj.getString("date"), obj.getString("note"));
                expenses.add(e);
            }
            System.out.println("Expenses loaded from JSON successfully!");
        }
        catch (IOException ex) {
            System.out.println("Error loading expenses: "+ex.getMessage());

        }
    }

    public void saveExpensesAsJSON () {
        JSONArray jsonArray = new JSONArray();
        for (int i = 0; i < expenses.size(); i++) {
            Expense e = expenses.get(i);
            JSONObject obj = new JSONObject();
            obj.put("category", e.category);
            obj.put("amount", e.amount);
            obj.put("date", e.date);
            obj.put("note", e.note);
            jsonArray.put(obj);

        }
        try (FileWriter file = new FileWriter("expenses.json")) {
            file.write(jsonArray.toString(4));
        }
        catch (IOException ex) {
            System.out.println("Error saving expenses: "+ex.getMessage());
        }
    }

    public void saveExpensesAsCSV(Expense e) {
        try (FileWriter fw = new FileWriter("expenses.csv", true)){
            //creates a file, ensures that we add to this file
            fw.write("\"" + e.date + "\",\"" + e.category + "\"," + e.amount + ",\"" + e.note + "\"\n");
            System.out.println("Expense saved as CSV successfully!");
        }
        catch (IOException ex) {
            System.out.println("Error occurred while saving to CSV: " + ex.getMessage());
        }
    }

    public void handleCSVExport(Expense e, Scanner scan) {
        System.out.println("Do you want to export this expense to CSV? (y/n): ");
        String exportCSV = scan.nextLine().trim().toLowerCase();

        if (exportCSV.equals("y")) {
            saveExpensesAsCSV(e);;
        }
    }
}