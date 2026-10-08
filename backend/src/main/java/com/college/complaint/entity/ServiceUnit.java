package com.college.complaint.entity;

public enum ServiceUnit {
    LIBRARY("Library Services"),
    HOSTEL("Hostel & Residential"),
    IT_SUPPORT("IT & Network Support"),
    LAB_SUPPORT("Laboratory Technical Support"),
    ELECTRICAL("Electrical Maintenance"),
    PLUMBING("Plumbing & Water Supply"),
    MAINTENANCE("General Campus Maintenance"),
    TRANSPORT("Campus Transport"),
    SECURITY("Campus Security"),
    ADMINISTRATION("Administrative Services"),
    OTHER("Other Services");

    private final String displayName;

    ServiceUnit(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static ServiceUnit fromString(String text) {
        if (text == null || text.isBlank()) return OTHER;
        for (ServiceUnit unit : ServiceUnit.values()) {
            if (unit.name().equalsIgnoreCase(text.trim()) ||
                unit.displayName.equalsIgnoreCase(text.trim())) {
                return unit;
            }
        }
        return OTHER;
    }
}
