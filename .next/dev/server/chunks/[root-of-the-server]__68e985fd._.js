module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/health_ai/data/mockPatients.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockPatients",
    ()=>mockPatients
]);
const mockPatients = [
    {
        id: "p1",
        mrn: "MRN-001",
        firstName: "Alice",
        lastName: "Nguyen",
        dob: "1985-03-12",
        sex: "female",
        genomicVariants: [
            {
                id: "v1",
                gene: "BRCA1",
                variant: "c.68_69delAG",
                zygosity: "heterozygous",
                pathogenicity: "pathogenic",
                clinicalSignificance: "Associated with increased risk of breast and ovarian cancer"
            }
        ],
        emr: [
            {
                id: "e1",
                type: "diagnosis",
                code: "C50.9",
                description: "Malignant neoplasm of breast, unspecified",
                recordedAt: "2024-01-05T10:00:00Z"
            },
            {
                id: "e2",
                type: "lab",
                code: "LDL",
                description: "LDL cholesterol",
                recordedAt: "2024-01-10T09:30:00Z",
                value: 142,
                unit: "mg/dL"
            }
        ],
        riskScores: [
            {
                id: "r1",
                name: "Breast cancer polygenic risk",
                score: 0.82,
                interpretation: "High genomic risk; consider enhanced surveillance"
            }
        ],
        lastUpdated: "2024-01-15T12:00:00Z"
    },
    {
        id: "p2",
        mrn: "MRN-002",
        firstName: "David",
        lastName: "Patel",
        dob: "1973-08-22",
        sex: "male",
        genomicVariants: [
            {
                id: "v2",
                gene: "APOE",
                variant: "e4/e4",
                zygosity: "homozygous",
                pathogenicity: "VUS",
                clinicalSignificance: "Associated with increased Alzheimer’s disease risk"
            }
        ],
        emr: [
            {
                id: "e3",
                type: "diagnosis",
                code: "I10",
                description: "Essential (primary) hypertension",
                recordedAt: "2023-11-01T14:20:00Z"
            }
        ],
        riskScores: [
            {
                id: "r2",
                name: "Cardiovascular risk (10-year)",
                score: 0.34,
                interpretation: "Moderate risk; optimize lifestyle and medications"
            }
        ],
        lastUpdated: "2024-02-01T08:15:00Z"
    }
];
}),
"[project]/health_ai/pages/api/patients.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$data$2f$mockPatients$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/data/mockPatients.ts [api] (ecmascript)");
;
function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    const id = req.query.id;
    setTimeout(()=>{
        try {
            if (id) {
                const patient = __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$data$2f$mockPatients$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["mockPatients"].find((p)=>p.id === id) ?? null;
                if (!patient) {
                    return res.status(404).json({
                        error: "Patient not found"
                    });
                }
                return res.status(200).json({
                    patient
                });
            }
            return res.status(200).json({
                patients: __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$data$2f$mockPatients$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["mockPatients"]
            });
        } catch (e) {
            return res.status(500).json({
                error: "Failed to load patients"
            });
        }
    }, 400);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__68e985fd._.js.map