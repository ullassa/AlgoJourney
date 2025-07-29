import java.io.*;
import java.util.*;

public class ProblemManager {
    List<Problem> problems = new ArrayList<>();
    Stack<Problem> undoStack = new Stack<>();

    public void addProblem(Problem p) {
        problems.add(p);
        undoStack.push(p);
        System.out.println("✅ Problem added successfully!");
    }

    public void viewAll() {
        if (problems.isEmpty()) {
            System.out.println("📭 No problems found.");
            return;
        }
        for (int i = 0; i < problems.size(); i++) {
            System.out.println((i + 1) + ". " + problems.get(i));
        }
    }

    public void markSolved(int index) {
        if (index >= 0 && index < problems.size()) {
            problems.get(index).markSolved();
            System.out.println("✅ Marked as solved.");
        } else {
            System.out.println("❌ Invalid index.");
        }
    }

    public void filter(String keyword) {
        boolean found = false;
        for (Problem p : problems) {
            if (p.getTopic().equalsIgnoreCase(keyword) ||
                    p.getDifficulty().equalsIgnoreCase(keyword) ||
                    (keyword.equalsIgnoreCase("solved") && p.isSolved()) ||
                    (keyword.equalsIgnoreCase("unsolved") && !p.isSolved())) {
                System.out.println(p);
                found = true;
            }
        }
        if (!found)
            System.out.println("🔍 No matching problems found.");
    }

    public void showStats() {
        int total = problems.size();
        long solved = problems.stream().filter(Problem::isSolved).count();
        long unsolved = total - solved;
        double percent = total > 0 ? (solved * 100.0 / total) : 0;

        System.out.println("📊 Total: " + total);
        System.out.println("✅ Solved: " + solved);
        System.out.println("❌ Unsolved: " + unsolved);
        System.out.printf("📈 Solved Percentage: %.2f%%\n", percent);
    }

    public void undo() {
        if (!undoStack.isEmpty()) {
            Problem last = undoStack.pop();
            problems.remove(last);
            System.out.println("↩️ Last added problem removed.");
        } else {
            System.out.println("⚠️ Nothing to undo.");
        }
    }

    public void exportToFile(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            for (Problem p : problems) {
                writer.println(p.toCSV());
            }
            System.out.println("📤 Exported to " + filename);
        } catch (IOException e) {
            System.out.println("❌ Error writing file.");
        }
    }

    public void importFromFile(String filename) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                problems.add(Problem.fromCSV(line));
            }
            System.out.println("📥 Imported successfully from " + filename);
        } catch (IOException e) {
            System.out.println("❌ Error reading file.");
        }
    }
}
