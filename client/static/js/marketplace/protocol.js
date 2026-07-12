const c_marketplace = {
    jobs:[]
}



export const MPCleaningTypes = {
    GENERAL: 0,
    UPHOLSTERY: 1 << 0,        // ריפודים
    AIR_CONDITIONER: 1 << 1,   // מזגנים
    CARPETS: 1 << 2,           // שטיחים
    WINDOWS: 1 << 3,           // חלונות
    FLOORS: 1 << 4,            // רצפות
    POST_RENOVATION: 1 << 6,   // ניקיון לאחר שיפוץ
    OFFICE: 1 << 7             // ניקיון משרדים
};


export function mpCleaningTypesText(value) {
    if (value === MPCleaningTypes.GENERAL) {
        return "כללי";
    }

    const result = [];

    const types = [
        [MPCleaningTypes.UPHOLSTERY, "ריפודים"],
        [MPCleaningTypes.AIR_CONDITIONER, "מזגנים"],
        [MPCleaningTypes.CARPETS, "שטיחים"],
        [MPCleaningTypes.WINDOWS, "חלונות"],
        [MPCleaningTypes.FLOORS, "רצפות"],
        [MPCleaningTypes.POST_RENOVATION, "ניקיון לאחר שיפוץ"],
        [MPCleaningTypes.OFFICE, "ניקיון משרדים"]
    ];

    for (const [flag, text] of types) {
        if ((value & flag) !== 0) {
            result.push(text);
        }
    }
    return result.length==1?result[0]:result;
}


export const serviceCategoryLabels = {
    upholstery: "ניקוי ריפודים",
    airConditioner: "ניקוי מזגנים",
    carpet: "ניקוי שטיחים",
    general: "ניקוי כללי"
};

export const statusLabels = {
    new: "New",
    waiting: "Waiting for manager",
    requested: "Requested",
    assigned: "Assigned",
    saved: "נשמר",
    expired: "פג תוקף",
    updated: "עודכן"
};

export const eventLabels = {
    job_created: "עבודה חדשה נוצרה",
    job_taken: "מנהל לקח עבודה",
    job_expired: "עבודה פגה",
    job_updated: "עבודה עודכנה",
    manager_joined: "מנהל הצטרף לרשת"
};

export const marketplaceStats = {
    activeJobs: 27,
    jobsExchangedToday: 143,
    verifiedManagersOnline: 86,
    nearbyOpportunities: 12
};

export const networkPulse = {
    recentJobs: [
        { title: "Sofa Cleaning", city: "פתח תקווה", time: "7 דקות", value: "₪680" },
        { title: "AC Cleaning", city: "רמת גן", time: "14 דקות", value: "₪450" },
        { title: "Move-out Cleaning", city: "ראשון לציון", time: "3 דקות", value: "₪1,200" }
    ],
    onlineManagers: [
        { businessName: "נקי בעיר", city: "פתח תקווה", status: "זמין עכשיו" },
        { businessName: "ברק שירותים", city: "רמת גן", status: "בודק הזדמנויות" },
        { businessName: "צוות נקי", city: "ראשון לציון", status: "קיבל בקשה" }
    ],
    verifiedCompanies: [
        { businessName: "קלין צפון", city: "חיפה", time: "אומת לפני 18 דקות" },
        { businessName: "פרש הום", city: "ירושלים", time: "אומת היום" }
    ],
    completedCollaborations: [
        { from: "ברק שירותים", to: "נקי בעיר", service: "AC Cleaning", time: "לפני 11 דקות" },
        { from: "צוות נקי", to: "קלין פרו", service: "Carpet Cleaning", time: "לפני 24 דקות" }
    ],
    counters: [
        { label: "בקשות פעילות", value: 19 },
        { label: "עסקים זמינים", value: 86 },
        { label: "שיתופי פעולה היום", value: 143 }
    ],
    achievements: [
        { businessName: "נקי בעיר", text: "הגיע ל-34 שיתופי פעולה ברשת" },
        { businessName: "צוות נקי", text: "ממוצע תגובה של 8 דקות השבוע" }
    ]
};

export const liveNetworkMapJobs = [
    {
        id: "map-job-1",
        linkedJobId: "job-1001",
        serviceName: "Sofa Cleaning",
        serviceType: "upholstery",
        city: "פתח תקווה",
        areaLabel: "מרכז פתח תקווה",
        clusterGroup: "gush-dan",
        approximateCoordinates: [32.0871, 34.8878],
        value: "₪680",
        manager: "נקי בעיר",
        managerPhone: "052-440-1180",
        managerVerified: true,
        status: "New",
        publishedAgo: "פורסם לפני 7 דקות",
        remainingAvailability: "זמין לשעתיים הקרובות",
        activity: "פורסם לפני 7 דקות",
        trustScore: 96
    },
    {
        id: "map-job-2",
        linkedJobId: "job-1002",
        serviceName: "AC Cleaning",
        serviceType: "airConditioner",
        city: "רמת גן",
        areaLabel: "אזור רמת גן",
        clusterGroup: "gush-dan",
        approximateCoordinates: [32.0684, 34.8248],
        value: "₪450",
        manager: "ברק שירותים",
        managerPhone: "050-771-2904",
        managerVerified: true,
        status: "Waiting for manager",
        publishedAgo: "פורסם לפני 14 דקות",
        remainingAvailability: "זמין עד סוף היום",
        activity: "2 מנהלים צופים",
        trustScore: 92
    },
    {
        id: "map-job-3",
        linkedJobId: "job-1003",
        serviceName: "Carpet Cleaning",
        serviceType: "carpet",
        city: "הרצליה",
        areaLabel: "מרכז הרצליה",
        clusterGroup: "sharon",
        approximateCoordinates: [32.1624, 34.8447],
        value: "₪520",
        manager: "קלין פרו",
        managerPhone: "053-919-4200",
        managerVerified: false,
        status: "New",
        publishedAgo: "פורסם לפני 31 דקות",
        remainingAvailability: "זמין ל-5 שעות הקרובות",
        activity: "עודכן לפני 9 דקות",
        trustScore: 84
    },
    {
        id: "map-job-4",
        linkedJobId: "job-1004",
        serviceName: "Move-out Cleaning",
        serviceType: "general",
        city: "ראשון לציון",
        areaLabel: "מערב ראשון לציון",
        clusterGroup: "gush-dan",
        approximateCoordinates: [31.9730, 34.7925],
        value: "₪1,200",
        manager: "צוות נקי",
        managerPhone: "054-232-8810",
        managerVerified: true,
        status: "Requested",
        publishedAgo: "פורסם לפני 3 דקות",
        remainingAvailability: "זמין ל-45 דקות הקרובות",
        activity: "4 בקשות פעילות",
        trustScore: 98
    },
    {
        id: "map-job-5",
        linkedJobId: null,
        serviceName: "Mattress Cleaning",
        serviceType: "mattress",
        city: "חיפה",
        areaLabel: "אזור חיפה",
        clusterGroup: "north",
        approximateCoordinates: [32.7940, 34.9896],
        value: "₪290",
        manager: "קלין צפון",
        managerPhone: "052-820-1120",
        managerVerified: true,
        status: "New",
        publishedAgo: "פורסם לפני 18 דקות",
        remainingAvailability: "זמין ל-3 שעות הקרובות",
        activity: "פורסם לפני 18 דקות",
        trustScore: 91
    },
    {
        id: "map-job-6",
        linkedJobId: null,
        serviceName: "Leather Sofa",
        serviceType: "leather",
        city: "באר שבע",
        areaLabel: "מרכז באר שבע",
        clusterGroup: "south",
        approximateCoordinates: [31.2529, 34.7915],
        value: "₪650",
        manager: "נגב קלין",
        managerPhone: "050-310-7788",
        managerVerified: true,
        status: "Waiting for manager",
        publishedAgo: "פורסם לפני 22 דקות",
        remainingAvailability: "זמין לשעתיים הקרובות",
        activity: "זמין לשעתיים",
        trustScore: 88
    },
    {
        id: "map-job-7",
        linkedJobId: null,
        serviceName: "Fabric Sofa",
        serviceType: "upholstery",
        city: "תל אביב",
        areaLabel: "מרכז תל אביב",
        clusterGroup: "gush-dan",
        approximateCoordinates: [32.0853, 34.7818],
        value: "₪610",
        manager: "פרימיום קלין",
        managerPhone: "052-711-4430",
        managerVerified: true,
        status: "New",
        publishedAgo: "פורסם לפני 5 דקות",
        remainingAvailability: "זמין ל-90 דקות הקרובות",
        activity: "3 מנהלים צופים",
        trustScore: 94
    },
    {
        id: "map-job-8",
        linkedJobId: null,
        serviceName: "AC Cleaning",
        serviceType: "airConditioner",
        city: "חולון",
        areaLabel: "אזור חולון",
        clusterGroup: "gush-dan",
        approximateCoordinates: [32.0158, 34.7874],
        value: "₪340",
        manager: "מיזוג נקי",
        managerPhone: "050-618-2190",
        managerVerified: true,
        status: "Waiting for manager",
        publishedAgo: "פורסם לפני 27 דקות",
        remainingAvailability: "זמין ל-4 שעות הקרובות",
        activity: "עודכן לפני 6 דקות",
        trustScore: 90
    },
    {
        id: "map-job-9",
        linkedJobId: null,
        serviceName: "Mattress Cleaning",
        serviceType: "mattress",
        city: "נתניה",
        areaLabel: "אזור נתניה",
        clusterGroup: "sharon",
        approximateCoordinates: [32.3215, 34.8532],
        value: "₪310",
        manager: "שרון קלין",
        managerPhone: "054-508-6610",
        managerVerified: true,
        status: "New",
        publishedAgo: "פורסם לפני 11 דקות",
        remainingAvailability: "זמין ל-3 שעות הקרובות",
        activity: "פורסם לפני 11 דקות",
        trustScore: 93
    },
    {
        id: "map-job-10",
        linkedJobId: null,
        serviceName: "Carpet Cleaning",
        serviceType: "carpet",
        city: "כפר סבא",
        areaLabel: "מרכז כפר סבא",
        clusterGroup: "sharon",
        approximateCoordinates: [32.1782, 34.9076],
        value: "₪420",
        manager: "טופ שטיחים",
        managerPhone: "053-772-4050",
        managerVerified: true,
        status: "Requested",
        publishedAgo: "פורסם לפני 38 דקות",
        remainingAvailability: "זמין עד הערב",
        activity: "2 בקשות פעילות",
        trustScore: 89
    }
];

export const marketplaceJobs = [
    {
        id: "job-1001",
        serviceType: "upholstery",
        serviceName: "Sofa Cleaning",
        title: "ספה פינתית וארבעה כיסאות",
        location: "פתח תקווה",
        createdAgo: "פורסם לפני 7 דקות",
        availabilityWindow: "זמין לשעתיים הקרובות",
        date: "2026-07-14",
        priceEstimate: 680,
        distanceKm: 7,
        postedBy: "יוסי כהן",
        businessName: "נקי בעיר",
        manager: {
            name: "יוסי כהן",
            businessName: "נקי בעיר",
            phone: "052-440-1180",
            verified: true,
            rating: 4.8,
            trustScore: 96,
            completedMarketplaceJobs: 34,
            availability: "זמין עכשיו",
            lastSeen: "פעיל לפני דקה",
            responseTime: "8 דקות",
            successRate: "97%",
            professionalLevel: "Premium Partner",
            satisfactionScore: "4.9/5",
            trustLabel: "34 שיתופי פעולה ברשת"
        },
        status: "new",
        pulse: "new",
        watchers: 6,
        requests: 2,
        lastActivity: "לפני דקה",
        description: "לקוח קיים מחפש ביצוע בשעות אחר הצהריים. העבודה כוללת ספה פינתית וכיסאות אוכל.",
        requirements: ["זמינות אחרי 16:00", "מכונת הזרקה/יניקה", "שליחת תמונת סיום ללקוח"],
        transferConditions: ["עמלת העברה מוסכמת מראש", "אחריות שירות אצל המבצע", "עדכון סטטוס לאחר סיום"],
        imagePlaceholders: 3
    },
    {
        id: "job-1002",
        serviceType: "airConditioner",
        serviceName: "AC Cleaning",
        title: "שני מזגנים עיליים",
        location: "רמת גן",
        createdAgo: "פורסם לפני 14 דקות",
        availabilityWindow: "זמין עד סוף היום",
        date: "2026-07-15",
        priceEstimate: 450,
        distanceKm: 11,
        postedBy: "דנה לוי",
        businessName: "ברק שירותים",
        manager: {
            name: "דנה לוי",
            businessName: "ברק שירותים",
            phone: "050-771-2904",
            verified: true,
            rating: 4.7,
            trustScore: 92,
            completedMarketplaceJobs: 28,
            availability: "זמין להצעות",
            lastSeen: "פעיל לפני 4 דקות",
            responseTime: "11 דקות",
            successRate: "94%",
            professionalLevel: "Verified Pro",
            satisfactionScore: "4.8/5",
            trustLabel: "28 שיתופי פעולה ברשת"
        },
        status: "waiting",
        pulse: "watching",
        watchers: 4,
        requests: 1,
        lastActivity: "לפני 4 דקות",
        description: "עבודה קצרה ללקוח פרטי בבניין עם מעלית. נדרש להגיע עם ציוד כיסוי בסיסי.",
        requirements: ["סולם קטן", "ניקוי פילטרים ותעלה", "חשבונית ללקוח"],
        transferConditions: ["תשלום ישירות מול הלקוח", "שמירת מחיר שהוצע", "אישור הגעה יום לפני"],
        imagePlaceholders: 2
    },
    {
        id: "job-1003",
        serviceType: "carpet",
        serviceName: "Carpet Cleaning",
        title: "שטיח סלון גדול",
        location: "הרצליה",
        createdAgo: "פורסם לפני 31 דקות",
        availabilityWindow: "זמין ל-5 שעות הקרובות",
        date: "2026-07-18",
        priceEstimate: 520,
        distanceKm: 18,
        postedBy: "מאיר אברהם",
        businessName: "קלין פרו",
        manager: {
            name: "מאיר אברהם",
            businessName: "קלין פרו",
            phone: "053-919-4200",
            verified: false,
            rating: 4.5,
            trustScore: 84,
            completedMarketplaceJobs: 19,
            availability: "ממתין לאישור",
            lastSeen: "פעיל לפני 9 דקות",
            responseTime: "19 דקות",
            successRate: "89%",
            professionalLevel: "Network Member",
            satisfactionScore: "4.6/5",
            trustLabel: "19 שיתופי פעולה ברשת"
        },
        status: "new",
        pulse: "updated",
        watchers: 3,
        requests: 0,
        lastActivity: "לפני 9 דקות",
        description: "לקוח מבקש איסוף או ניקוי בבית לפי זמינות המבצע.",
        requirements: ["חומר מתאים לשטיח עדין", "אפשרות איסוף", "תיאום טלפוני מול הלקוח"],
        transferConditions: ["העברה ללא בלעדיות עד אישור", "הצעת מחיר סופית מול הלקוח"],
        imagePlaceholders: 1
    },
    {
        id: "job-1004",
        serviceType: "general",
        serviceName: "Move-out Cleaning",
        title: "ניקוי דירה לאחר מעבר",
        location: "ראשון לציון",
        createdAgo: "פורסם לפני 3 דקות",
        availabilityWindow: "זמין ל-45 דקות הקרובות",
        date: "2026-07-20",
        priceEstimate: 1200,
        distanceKm: 24,
        postedBy: "שחר מזרחי",
        businessName: "צוות נקי",
        manager: {
            name: "שחר מזרחי",
            businessName: "צוות נקי",
            phone: "054-232-8810",
            verified: true,
            rating: 4.9,
            trustScore: 98,
            completedMarketplaceJobs: 41,
            availability: "זמין עכשיו",
            lastSeen: "פעיל עכשיו",
            responseTime: "6 דקות",
            successRate: "98%",
            professionalLevel: "Premium Partner",
            satisfactionScore: "5.0/5",
            trustLabel: "41 שיתופי פעולה ברשת"
        },
        status: "requested",
        pulse: "hot",
        watchers: 9,
        requests: 4,
        lastActivity: "עכשיו",
        description: "דירת ארבעה חדרים ריקה. מתאים לצוות של שני עובדים ומעלה.",
        requirements: ["שני עובדים לפחות", "חומרי ניקוי מלאים", "זמינות בוקר"],
        transferConditions: ["העברה לאחר אישור מנהל", "סיכום כתוב מול הלקוח", "עדכון לאחר ביצוע"],
        imagePlaceholders: 3
    }
];

export const marketplacePartners = [
    {
        id: "partner-1",
        businessName: "נקי בעיר",
        managerName: "יוסי כהן",
        phone: "052-440-1180",
        verified: true,
        online: true,
        rating: 4.8,
        trustScore: 96,
        completedJobs: 34,
        completedMarketplaceJobs: 34,
        lastSeen: "פעיל לפני דקה",
        availability: "זמין לקבלת עבודות",
        responseTime: "8 דקות",
        successRate: "97%",
        professionalLevel: "Premium Partner",
        satisfactionScore: "4.9/5",
        services: ["upholstery", "carpet"],
        location: "פתח תקווה",
        city: "פתח תקווה",
        joinDate: "מרץ 2026",
        statusText: "בודק הזדמנויות קרובות"
    },
    {
        id: "partner-2",
        businessName: "ברק שירותים",
        managerName: "דנה לוי",
        phone: "050-771-2904",
        verified: true,
        online: true,
        rating: 4.7,
        trustScore: 92,
        completedJobs: 28,
        completedMarketplaceJobs: 28,
        lastSeen: "פעיל לפני 3 דקות",
        availability: "זמין להצעות קרובות",
        responseTime: "11 דקות",
        successRate: "94%",
        professionalLevel: "Verified Pro",
        satisfactionScore: "4.8/5",
        services: ["airConditioner", "general"],
        location: "רמת גן",
        city: "רמת גן",
        joinDate: "פברואר 2026",
        statusText: "קיבל עבודה לפני 3 דקות"
    },
    {
        id: "partner-3",
        businessName: "קלין פרו",
        managerName: "מאיר אברהם",
        phone: "053-919-4200",
        verified: false,
        online: false,
        rating: 4.5,
        trustScore: 84,
        completedJobs: 19,
        completedMarketplaceJobs: 19,
        lastSeen: "פעיל היום",
        availability: "לא מחובר כרגע",
        responseTime: "19 דקות",
        successRate: "89%",
        professionalLevel: "Network Member",
        satisfactionScore: "4.6/5",
        services: ["carpet", "upholstery", "general"],
        location: "הרצליה",
        city: "הרצליה",
        joinDate: "אפריל 2026",
        statusText: "פעיל היום"
    }
];

export const marketplaceInsights = {
    averagePrices: [
        { service: "Air Conditioner Cleaning", average: 320, trend: "+6%" },
        { service: "Fabric Sofa (2 seats)", average: 410, trend: "+3%" },
        { service: "Fabric Sofa (3 seats)", average: 520, trend: "+5%" },
        { service: "Leather Sofa", average: 650, trend: "+2%" },
        { service: "Mattress Cleaning", average: 290, trend: "+9%" },
        { service: "Carpet Cleaning", average: 180, trend: "-4%" }
    ],
    priceTrends: [
        { month: "Jan", average: 360, demand: 61 },
        { month: "Feb", average: 380, demand: 66 },
        { month: "Mar", average: 395, demand: 72 },
        { month: "Apr", average: 410, demand: 76 },
        { month: "May", average: 435, demand: 84 },
        { month: "Jun", average: 455, demand: 91 }
    ],
    demand: [
        { label: "High demand", service: "Air Conditioner Cleaning", direction: "hot" },
        { label: "Growing", service: "Mattress Cleaning", direction: "up" },
        { label: "Stable", service: "Sofa Cleaning", direction: "stable" },
        { label: "Low", service: "Carpet Cleaning", direction: "down" }
    ],
    regions: [
        { city: "Tel Aviv", sofaAverage: 610 },
        { city: "Haifa", sofaAverage: 540 },
        { city: "Jerusalem", sofaAverage: 560 },
        { city: "Beer Sheva", sofaAverage: 500 }
    ],
    activity: {
        jobsPostedToday: 143,
        jobsAcceptedToday: 98,
        averageResponseTime: "11 min",
        averageAcceptedPrice: 470,
        mostPopularService: "Air Conditioner Cleaning",
        mostCompetitiveCity: "Tel Aviv"
    }
};

export const marketplaceEvents = [
    {
        id: "event-1",
        type: "job_created",
        title: "הזדמנות חדשה בפתח תקווה",
        text: "נקי בעיר פתח שיתוף פעולה לניקוי ריפודים",
        time: "עכשיו",
        targetJobId: "job-1001"
    },
    {
        id: "event-2",
        type: "manager_joined",
        title: "עסק מאומת פעיל ברשת",
        text: "ברק שירותים זמין לשיתופי פעולה במזגנים",
        time: "לפני 2 דקות"
    },
    {
        id: "event-3",
        type: "job_updated",
        title: "נתוני הזדמנות עודכנו",
        text: "שיתוף פעולה לשטיח סלון עודכן ל-520 ₪",
        time: "לפני 9 דקות",
        targetJobId: "job-1003"
    },
    {
        id: "event-4",
        type: "job_taken",
        title: "שיתוף פעולה התקדם",
        text: "צוות נקי קיבל בקשה להזדמנות בראשון לציון",
        time: "לפני 12 דקות",
        targetJobId: "job-1004"
    },
    {
        id: "event-5",
        type: "job_expired",
        title: "עבודה פגה",
        text: "חלון ביצוע הסתיים לעבודה ישנה",
        time: "לפני 18 דקות"
    }
];

