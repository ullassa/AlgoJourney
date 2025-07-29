public class Problem {
    String title;
    String topic;
    String platform;
    String difficulty;
    String link;
    boolean isSolved;

    public Problem(String title, String topic, String platform, String difficulty, String link) {
        this.title = title;
        this.topic = topic;
        this.platform = platform;
        this.difficulty = difficulty;
        this.link = link;
        this.isSolved = false;
    }

    public String getTitle() {
        return title;
    }

    public String getTopic() {
        return topic;
    }

    public String getPlatform() {
        return platform;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getLink() {
        return link;
    }

    public boolean isSolved() {
        return isSolved;
    }

    public void markSolved() {
        this.isSolved = true;
    }

    @Override
    public String toString() {
        return String.format("[%s] Title: %s | Topic: %s | Platform: %s | Difficulty: %s | Link: %s",
                (isSolved ? "✅" : "❌"), title, topic, platform, difficulty, link);
    }

    public String toCSV() {
        return String.join(",", title, topic, platform, difficulty, link, String.valueOf(isSolved));
    }

    public static Problem fromCSV(String csvLine) {
        String[] parts = csvLine.split(",", -1);
        Problem p = new Problem(parts[0], parts[1], parts[2], parts[3], parts[4]);
        if (Boolean.parseBoolean(parts[5])) {
            p.markSolved();
        }
        return p;
    }
}
