//will hold the key to open/unlock the database
//safe since the key is in one place and others only need to call this file to access/use the database without directly being given the key
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DB {
    private static final String URL = "jdbc:postgresql://localhost:5432/spendtrack";
    private static final String USER = "postgres";
    private static final String PASSWORD = "postgres";
    public static Connection getConnection() throws SQLException { //a connection with the key, gives it to temporarily to the one who wants to use it
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}