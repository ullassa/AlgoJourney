import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        ProblemManager manager = new ProblemManager();
        Scanner sc = new Scanner(System.in);
        int choice;

        System.out.println("👋 Welcome to AlgoLog Tracker (DSA Problem Manager)");

        do {
            System.out.println("\n📋 Menu:");
            System.out.println("1️⃣  Add Problem");
            System.out.println("2️⃣  View All Problems");
            System.out.println("3️⃣  Mark as Solved");
            System.out.println("4️⃣  Filter by Topic / Difficulty / Solved");
            System.out.println("5️⃣  Show Stats");
            System.out.println("6️⃣  Undo Last Added");
            System.out.println("7️⃣  Export to File");
            System.out.println("8️⃣  Import from File");
            System.out.println("0️⃣  Exit");
            System.out.print("👉 Enter your choice: ");

            choice = sc.nextInt();
            sc.nextLine(); // consume newline

            switch (choice) {
                case 1:
                    System.out.print("📌 Title: ");
                    String title = sc.nextLine();
                    System.out.print("🗂️ Topic: ");
                    String topic = sc.nextLine();
                    System.out.print("🌐 Platform (LeetCode/Codeforces/etc): ");
                    String platform = sc.nextLine();
                    System.out.print("⚙️ Difficulty (Easy/Medium/Hard): ");
                    String difficulty = sc.nextLine();
                    System.out.print("🔗 Link: ");
                    String link = sc.nextLine();
                    manager.addProblem(new Problem(title, topic, platform, difficulty, link));
                    break;

                case 2:
                    manager.viewAll();
                    break;

                case 3:
                    manager.viewAll();
                    System.out.print("✔️ Enter problem number to mark solved: ");
                    int index = sc.nextInt() - 1;
                    manager.markSolved(index);
                    break;

                case 4:
                    System.out.print("🔍 Enter topic / difficulty / 'solved' or 'unsolved': ");
                    String keyword = sc.nextLine();
                    manager.filter(keyword);
                    break;

                case 5:
                    manager.showStats();
                    break;

                case 6:
                    manager.undo();
                    break;

                case 7:
                    System.out.print("📁 Enter filename to export (e.g., data.csv): ");
                    String exportFile = sc.nextLine();
                    manager.exportToFile(exportFile);
                    break;

                case 8:
                    System.out.print("📁 Enter filename to import: ");
                    String importFile = sc.nextLine();
                    manager.importFromFile(importFile);
                    break;

                case 0:
                    System.out.println("👋 Exiting... Happy Coding!");
                    break;

                default:
                    System.out.println("⚠️ Invalid choice.");
            }

        } while (choice != 0);

        sc.close();
    }
}
