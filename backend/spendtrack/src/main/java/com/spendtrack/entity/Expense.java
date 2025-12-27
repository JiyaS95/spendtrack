@Entity //this class must be stored in the database
@Id //id as primary key --> unique identifier for each row
@GeneratedValue(strategy = GenerationType.IDENTITY) //database automatically asigns a number to id whenever a new expense is added

private Long id; //unique num for each expense
public LocalDate date;
public String category;
public double amount;
public String note;

public Expense() {

}

public Expense(LocalDate date, String category, double amount, String note) {
    this.date = date;
    this.category = category;
    this.amount = amount;
    this.note = note;
}

public LocalDate getDate() {
    return date;
}
public void setDate(LocalDate date) {
    this.date = date;
}

public String getCategory() {
    return category;
}
public void setCategory(String category) {
    this.category = category;
}

public double getAmount() {
    return amount;
}
public void setAmount(double amount) {
    this.amount = amount;
}

public String getNote() {
    return note;
}
public void setNote(String note) {
    this.note = note;
}


public Long getId() {
    return id;
}
public void setId(Long id) {
    this.id = id;
}

