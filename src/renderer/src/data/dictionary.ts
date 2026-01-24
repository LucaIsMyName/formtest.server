import { CONFIG } from "../app.config";

export const DICTIONARY = {
    "forms": {
        en: "Forms",
        de: "Formulare",
    },
    "payment-methods": {
        en: "Payment Methods",
        de: "Bezahlmethoden",
    },
    "schedules": {
        en: "Schedules",
        de: "Zeitpläne",
    },
    "tests": {
        en: "Tests",
        de: "Tests",
    },
    "settings": {
        en: "Settings",
        de: "Einstellungen",
    },
    "legal": {
        en: "Legal",
        de: "Rechtliches",
    },
    "docs": {
        en: "Docs",
        de: "Doku",
    },
    "scripts": {
        en: "Scripts",
        de: "Skripte",
    },
    "users": {
        en: "Users",
        de: "Benutzer",
    },
    "roles": {
        en: "Roles",
        de: "Rollen",
    },
    "permissions": {
        en: "Permissions",
        de: "Berechtigungen",
    },
    "groups": {
        en: "Groups",
        de: "Gruppen",
    },
    "organizations": {
        en: "Organizations",
        de: "Organisationen",
    },
    "run-tests": {
        en: "Run Tests",
        de: "Tests ausführen",
    },
    "start-tests": {
        en: "Start Tests",
        de: "Tests starten",
    },
    "stop-tests": {
        en: "Stop Tests",
        de: "Tests stoppen",
    },
    "add-form": {
        en: "Add Form",
        de: "Formular hinzufügen",
    },
    "add-payment-method": {
        en: "Add Payment Method",
        de: "Bezahlmethode hinzufügen",
    },
    "add-schedule": {
        en: "Add Schedule",
        de: "Zeitplan hinzufügen",
    },
    "add-script": {
        en: "Add Script",
        de: "Skript hinzufügen",
    },
    "add-tag": {
        en: "Add Tag",
        de: "Tag hinzufügen",
    },
    "add-user": {
        en: "Add User",
        de: "Benutzer hinzufügen",
    },
    "add-role": {
        en: "Add Role",
        de: "Rolle hinzufügen",
    },
    "add-permission": {
        en: "Add Permission",
        de: "Berechtigung hinzufügen",
    },
    "add-group": {
        en: "Add Group",
        de: "Gruppe hinzufügen",
    },
    "add-organization": {
        en: "Add Organization",
        de: "Organisation hinzufügen",
    },
    "test-timeline": {
        en: "Test Timeline",
        de: "Test Verlauf",
    },
};

export const t = (key: string = "de") => {
    switch (CONFIG.language) {
        case "en":
            return DICTIONARY[key as keyof typeof DICTIONARY].en;
        case "de":
            return DICTIONARY[key as keyof typeof DICTIONARY].de;
        default:
            return DICTIONARY[key as keyof typeof DICTIONARY].en;
    }
};