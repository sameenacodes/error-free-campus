package com.college.complaint.ai;

import com.college.complaint.dto.response.AiAnalysisResponse;
import com.college.complaint.entity.Complaint;
import com.college.complaint.entity.ComplaintStatus;
import com.college.complaint.repository.ComplaintRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@Service
@Slf4j
public class AiService {

    @Value("${ai.api.key:}")
    private String apiKey;

    @Value("${ai.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final ComplaintRepository complaintRepository;

    public AiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper, ComplaintRepository complaintRepository) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
        this.complaintRepository = complaintRepository;
    }

    public AiAnalysisResponse analyzeComplaint(String title, String description) {
        DuplicateCheckResult dup = detectDuplicate(title, description);

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String prompt = buildAnalysisPrompt(title, description);
                String rawResponse = callGeminiApi(prompt);
                AiAnalysisResponse resp = parseAnalysisResponse(rawResponse);
                resp.setSource("AI_MODEL");
                resp.setDuplicateFound(dup.found);
                resp.setDuplicateComplaintId(dup.id);
                resp.setDuplicateComplaintTitle(dup.title);
                resp.setDuplicateSimilarity(dup.similarity);
                return resp;
            } catch (Exception e) {
                log.warn("Gemini AI API call failed, switching to rule-based engine: {}", e.getMessage());
            }
        }

        // Deterministic Fallback Engine
        return runDeterministicEngine(title, description, dup);
    }

    public AiAnalysisResponse generateAdminSummary(String statsJson) {
        if (apiKey != null && !apiKey.isBlank()) {
            String prompt = "You are an executive analyst for a college complaint management system. " +
                "Based on these statistics: " + statsJson + " — generate a concise 3-4 sentence executive summary. " +
                "Highlight key metrics, top problematic departments, pending vs resolved ratio, and recommended administrative action. " +
                "Return only the summary text, no markdown or JSON.";
            try {
                String rawResponse = callGeminiApi(prompt);
                return AiAnalysisResponse.builder()
                    .aiAvailable(true)
                    .source("AI_MODEL")
                    .summary(extractTextFromGeminiResponse(rawResponse))
                    .build();
            } catch (Exception e) {
                log.warn("Gemini AI summary failed, using rule-based summary: {}", e.getMessage());
            }
        }

        // Deterministic summary
        String summary = "Executive System Summary: Campus complaint infrastructure is actively monitored. " +
            "Maintenance and electrical tickets represent the majority of operational workload. " +
            "Departments with pending issues are prioritized according to safety and SLA deadlines. " +
            "Administrative review is recommended for unresolved critical tickets.";

        return AiAnalysisResponse.builder()
            .aiAvailable(true)
            .source("RULE_BASED")
            .summary(summary)
            .message("Generated using deterministic analytics summary")
            .build();
    }

    private AiAnalysisResponse runDeterministicEngine(String title, String description, DuplicateCheckResult dup) {
        String fullText = (title + " " + description).toLowerCase();

        String category = "Infrastructure";
        String department = "Admin";
        String priority = "MEDIUM";
        double categoryConf = 0.88;
        double priorityConf = 0.85;
        String resolution;
        String sentiment = "Normal";
        String urgency = "Medium";

        // Check for Critical safety hazards
        if (containsAny(fullText, "spark", "smoke", "fire", "shock", "danger", "hazard", "burn", "explosion")) {
            priority = "CRITICAL";
            priorityConf = 0.98;
            urgency = "Critical";
            sentiment = "Emergency";
        } else if (containsAny(fullText, "urgent", "leak", "overflow", "damage", "broken window", "crying", "unacceptable")) {
            priority = "HIGH";
            priorityConf = 0.90;
            urgency = "High";
            sentiment = "Frustrated";
        } else if (containsAny(fullText, "schedule", "routine", "suggestion", "minor")) {
            priority = "LOW";
            priorityConf = 0.85;
            urgency = "Low";
        }

        // Categorization & Department Routing
        if (containsAny(fullText, "fan", "light", "switch", "wiring", "spark", "power", "plug", "socket", "voltage", "bulb", "tube")) {
            category = "Electrical";
            department = "EEE";
            categoryConf = 0.94;
            resolution = "1. Dispatch electrical maintenance technician.\n2. Inspect power feed and circuit breaker.\n3. Test and repair or replace defective wiring/fixture.\n4. Verify voltage and ground safety.";
        } else if (containsAny(fullText, "water", "pipe", "leak", "drain", "drainage", "tap", "sink", "flush", "toilet", "washroom", "cooler")) {
            category = "Plumbing";
            department = "Admin";
            categoryConf = 0.92;
            resolution = "1. Shut off local water supply valve.\n2. Inspect pipe fittings and drainage line.\n3. Clear obstruction or replace damaged pipe components.\n4. Restore pressure and test for leaks.";
        } else if (containsAny(fullText, "wifi", "wi-fi", "internet", "network", "ethernet", "router", "lan", "connection", "server", "portal")) {
            category = "Internet / Wi-Fi";
            department = "IT";
            categoryConf = 0.95;
            resolution = "1. Verify network access point status and switch port.\n2. Check gateway routing and DNS connectivity.\n3. Power-cycle or re-provision access point.\n4. Test bandwidth throughput.";
        } else if (containsAny(fullText, "projector", "bench", "desk", "door", "window", "ac", "air condition", "chair", "blackboard", "whiteboard", "classroom")) {
            category = "Infrastructure";
            department = containsAny(fullText, "ece") ? "ECE" : containsAny(fullText, "eee") ? "EEE" : containsAny(fullText, "mech") ? "MECH" : "CSE";
            categoryConf = 0.90;
            resolution = "1. Conduct on-site physical inspection.\n2. Identify broken parts or mechanical failure.\n3. Coordinate carpentry/hardware repair.\n4. Confirm safe operational condition.";
        } else if (containsAny(fullText, "exam", "marks", "grade", "syllabus", "lecture", "professor", "class", "attendance", "course", "schedule")) {
            category = "Academic";
            department = "CSE";
            categoryConf = 0.91;
            resolution = "1. Forward ticket to Academic Coordinator.\n2. Verify course timetable and faculty schedule.\n3. Issue clarified notice or schedule update to students.\n4. Log resolution in departmental records.";
        } else if (containsAny(fullText, "garbage", "trash", "dustbin", "dirty", "clean", "smell", "waste", "cleaning")) {
            category = "Cleanliness";
            department = "Admin";
            categoryConf = 0.93;
            resolution = "1. Assign housekeeping supervisor.\n2. Deploy sanitation staff with cleaning equipment.\n3. Empty and sanitize collection bins.\n4. Inspect area for hygiene compliance.";
        } else if (containsAny(fullText, "hostel", "mess", "food", "warden", "room", "cot")) {
            category = "Hostel";
            department = "Admin";
            categoryConf = 0.90;
            resolution = "1. Notify hostel warden and facility supervisor.\n2. Inspect reported room or mess facility.\n3. Execute required repair or service restoration.\n4. Obtain student confirmation of resolution.";
        } else if (containsAny(fullText, "bus", "transport", "driver", "route", "van")) {
            category = "Transport";
            department = "Admin";
            categoryConf = 0.92;
            resolution = "1. Contact transport officer and route coordinator.\n2. Review GPS tracking and driver departure logs.\n3. Re-align schedule or dispatch relief vehicle.\n4. Update route timing notification.";
        } else if (containsAny(fullText, "lab", "oscilloscope", "microscope", "apparatus", "multimeter", "experiment")) {
            category = "Laboratory";
            department = containsAny(fullText, "ece") ? "ECE" : "CSE";
            categoryConf = 0.91;
            resolution = "1. Tag instrument for maintenance.\n2. Perform calibration and diagnostic test.\n3. Replace faulty probe/board component.\n4. Certify equipment for student lab sessions.";
        } else if (containsAny(fullText, "guard", "security", "gate", "cctv", "camera", "id card", "parking", "theft")) {
            category = "Security";
            department = "Admin";
            categoryConf = 0.90;
            resolution = "1. Alert campus chief security officer.\n2. Review CCTV surveillance recordings.\n3. Dispatch patrol or repair security equipment.\n4. Record security incident report.";
        } else {
            resolution = "1. Review complaint details with departmental supervisor.\n2. Schedule on-site assessment.\n3. Execute appropriate corrective action.\n4. Verify resolution with complainant.";
        }

        // Service Unit Mapping
        String serviceUnit = "MAINTENANCE";
        if (containsAny(fullText, "library", "book", "journal", "reading room")) {
            serviceUnit = "LIBRARY";
        } else if (containsAny(fullText, "hostel", "mess", "warden", "room", "cot", "bed", "dorm")) {
            serviceUnit = "HOSTEL";
        } else if (containsAny(fullText, "projector", "lab", "oscilloscope", "multimeter", "apparatus", "equipment", "experiment")) {
            serviceUnit = "LAB_SUPPORT";
        } else if (containsAny(fullText, "wifi", "wi-fi", "internet", "network", "ethernet", "router", "lan", "server", "portal", "software")) {
            serviceUnit = "IT_SUPPORT";
        } else if (containsAny(fullText, "fan", "light", "switch", "wiring", "spark", "power", "plug", "socket", "voltage", "bulb", "tube", "electrical")) {
            serviceUnit = "ELECTRICAL";
        } else if (containsAny(fullText, "water", "pipe", "leak", "drain", "drainage", "tap", "sink", "flush", "toilet", "washroom", "cooler", "plumbing")) {
            serviceUnit = "PLUMBING";
        } else if (containsAny(fullText, "bus", "transport", "driver", "route", "van", "shuttle")) {
            serviceUnit = "TRANSPORT";
        } else if (containsAny(fullText, "guard", "security", "gate", "cctv", "camera", "id card", "parking", "theft")) {
            serviceUnit = "SECURITY";
        } else if (containsAny(fullText, "fee", "admission", "certificate", "scholarship", "hall ticket")) {
            serviceUnit = "ADMINISTRATION";
        }

        String summary = title.length() > 60 ? title.substring(0, 57) + "..." : title;

        return AiAnalysisResponse.builder()
            .suggestedCategory(category)
            .categoryConfidence(categoryConf)
            .suggestedPriority(priority)
            .priorityConfidence(priorityConf)
            .suggestedDepartment(department)
            .suggestedServiceUnit(serviceUnit)
            .summary(summary)
            .suggestedResolution(resolution)
            .sentiment(sentiment)
            .urgencyLevel(urgency)
            .duplicateFound(dup.found)
            .duplicateComplaintId(dup.id)
            .duplicateComplaintTitle(dup.title)
            .duplicateSimilarity(dup.similarity)
            .aiAvailable(true)
            .source("RULE_BASED")
            .message("Rule-based fallback engine (Deterministic Pattern & Historical Matching)")
            .build();
    }

    private static class DuplicateCheckResult {
        boolean found;
        Long id;
        String title;
        Double similarity;
    }

    private DuplicateCheckResult detectDuplicate(String title, String description) {
        DuplicateCheckResult res = new DuplicateCheckResult();
        try {
            List<Complaint> active = complaintRepository.findByStatusNotIn(
                List.of(ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED)
            );

            Set<String> newWords = extractKeyWords(title + " " + description);
            double maxSim = 0.0;
            Complaint matched = null;

            for (Complaint c : active) {
                Set<String> existWords = extractKeyWords(c.getTitle() + " " + c.getDescription());
                double sim = calculateJaccardSimilarity(newWords, existWords);
                if (sim > maxSim) {
                    maxSim = sim;
                    matched = c;
                }
            }

            if (maxSim >= 0.55 && matched != null) {
                res.found = true;
                res.id = matched.getId();
                res.title = matched.getTitle();
                res.similarity = Math.round(maxSim * 100.0) / 100.0;
            }
        } catch (Exception e) {
            log.warn("Duplicate detection check encountered error: {}", e.getMessage());
        }
        return res;
    }

    private Set<String> extractKeyWords(String text) {
        Set<String> words = new HashSet<>();
        if (text == null) return words;
        String[] tokens = text.toLowerCase().replaceAll("[^a-z0-9 ]", " ").split("\\s+");
        Set<String> stopWords = Set.of("the", "a", "an", "is", "in", "at", "and", "or", "for", "to", "of", "with", "this", "that", "it", "not", "has", "been", "was");
        for (String t : tokens) {
            if (t.length() > 2 && !stopWords.contains(t)) {
                words.add(t);
            }
        }
        return words;
    }

    private double calculateJaccardSimilarity(Set<String> s1, Set<String> s2) {
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(s1);
        intersection.retainAll(s2);
        Set<String> union = new HashSet<>(s1);
        union.addAll(s2);
        return (double) intersection.size() / union.size();
    }

    private boolean containsAny(String text, String... words) {
        for (String w : words) {
            if (text.contains(w)) return true;
        }
        return false;
    }

    private String buildAnalysisPrompt(String title, String description) {
        return """
            You are an AI assistant for a college complaint management system. Analyze the following complaint and respond ONLY with a valid JSON object.

            Complaint Title: %s
            Complaint Description: %s

            Respond with exactly this JSON structure (no markdown, no explanation):
            {
              "suggestedCategory": "one of: Infrastructure, Electrical, Plumbing, Cleanliness, Academic, Hostel, Transport, Laboratory, Internet / Wi-Fi, Security, Other",
              "categoryConfidence": 0.0 to 1.0,
              "suggestedPriority": "one of: LOW, MEDIUM, HIGH, CRITICAL",
              "priorityConfidence": 0.0 to 1.0,
              "suggestedDepartment": "one of: CSE, ECE, EEE, MECH, CIVIL, IT, AI & DS, Admin, Other",
              "suggestedServiceUnit": "one of: LIBRARY, HOSTEL, IT_SUPPORT, LAB_SUPPORT, ELECTRICAL, PLUMBING, MAINTENANCE, TRANSPORT, SECURITY, ADMINISTRATION, OTHER",
              "summary": "One sentence summary of the complaint",
              "suggestedResolution": "Step-by-step resolution recommendation in 3-5 steps",
              "sentiment": "one of: Normal, Frustrated, Urgent, Emergency",
              "urgencyLevel": "one of: Low, Medium, High, Critical"
            }
            """.formatted(title, description);
    }

    private String callGeminiApi(String prompt) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            ))
        );

        return webClient.post()
            .uri(apiUrl + "?key=" + apiKey)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .block();
    }

    private AiAnalysisResponse parseAnalysisResponse(String rawResponse) {
        try {
            String text = extractTextFromGeminiResponse(rawResponse);
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            JsonNode node = objectMapper.readTree(text);
            return AiAnalysisResponse.builder()
                .suggestedCategory(getStr(node, "suggestedCategory"))
                .categoryConfidence(getDbl(node, "categoryConfidence"))
                .suggestedPriority(getStr(node, "suggestedPriority"))
                .priorityConfidence(getDbl(node, "priorityConfidence"))
                .suggestedDepartment(getStr(node, "suggestedDepartment"))
                .suggestedServiceUnit(getStr(node, "suggestedServiceUnit"))
                .summary(getStr(node, "summary"))
                .suggestedResolution(getStr(node, "suggestedResolution"))
                .sentiment(getStr(node, "sentiment"))
                .urgencyLevel(getStr(node, "urgencyLevel"))
                .aiAvailable(true)
                .build();
        } catch (Exception e) {
            log.warn("Failed to parse AI response: {}", e.getMessage());
            throw new RuntimeException("Could not parse AI response", e);
        }
    }

    private String extractTextFromGeminiResponse(String rawResponse) throws Exception {
        JsonNode root = objectMapper.readTree(rawResponse);
        return root.path("candidates").get(0)
            .path("content").path("parts").get(0)
            .path("text").asText();
    }

    private String getStr(JsonNode node, String field) {
        return node.has(field) ? node.get(field).asText() : null;
    }

    private Double getDbl(JsonNode node, String field) {
        return node.has(field) ? node.get(field).asDouble() : null;
    }
}
