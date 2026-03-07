module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/health_ai/lib/validation/medicalSchemas.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "zAcmgClassification",
    ()=>zAcmgClassification,
    "zAlleleFrequency",
    ()=>zAlleleFrequency,
    "zAssociatedCondition",
    ()=>zAssociatedCondition,
    "zBiologicalSex",
    ()=>zBiologicalSex,
    "zClinVarSignificance",
    ()=>zClinVarSignificance,
    "zClinicalNote",
    ()=>zClinicalNote,
    "zClinicalNoteType",
    ()=>zClinicalNoteType,
    "zConditionStatus",
    ()=>zConditionStatus,
    "zDemographics",
    ()=>zDemographics,
    "zDrugGeneInteraction",
    ()=>zDrugGeneInteraction,
    "zEvidenceBasedRecommendation",
    ()=>zEvidenceBasedRecommendation,
    "zEvidenceLevel",
    ()=>zEvidenceLevel,
    "zFollowUpRecommendation",
    ()=>zFollowUpRecommendation,
    "zGeneVariant",
    ()=>zGeneVariant,
    "zGenomicFinding",
    ()=>zGenomicFinding,
    "zLabFlag",
    ()=>zLabFlag,
    "zLabResult",
    ()=>zLabResult,
    "zLiteratureReference",
    ()=>zLiteratureReference,
    "zMedicalCondition",
    ()=>zMedicalCondition,
    "zMedicationOrder",
    ()=>zMedicationOrder,
    "zMedicationRoute",
    ()=>zMedicationRoute,
    "zPatientRecord",
    ()=>zPatientRecord,
    "zRaceEthnicity",
    ()=>zRaceEthnicity,
    "zRecommendationStatus",
    ()=>zRecommendationStatus,
    "zTreatmentPlan",
    ()=>zTreatmentPlan,
    "zVariantAnnotation",
    ()=>zVariantAnnotation,
    "zVariantType",
    ()=>zVariantType,
    "zZygosity",
    ()=>zZygosity
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/health_ai/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const zBiologicalSex = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "male",
    "female",
    "intersex",
    "unknown"
]);
const zRaceEthnicity = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "asian",
    "black",
    "white",
    "hispanic_latino",
    "native_american",
    "pacific_islander",
    "other",
    "unknown"
]);
const zDemographics = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    givenName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    familyName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    dateOfBirth: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sex: zBiologicalSex,
    raceEthnicity: zRaceEthnicity,
    country: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    regionOrState: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const zConditionStatus = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "active",
    "inactive",
    "resolved",
    "remission"
]);
const zMedicalCondition = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    code: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    codeSystem: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
        "ICD-10",
        "SNOMED-CT",
        "Other"
    ]),
    display: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    onsetDate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime().optional(),
    resolutionDate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime().optional(),
    status: zConditionStatus,
    notes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const zMedicationRoute = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "oral",
    "iv",
    "subcutaneous",
    "intramuscular",
    "topical",
    "other"
]);
const zMedicationOrder = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    drugName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    genericName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    rxNormCode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    dose: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    route: zMedicationRoute,
    frequency: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    startDate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime(),
    endDate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime().optional(),
    isCurrent: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].boolean(),
    indication: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const zLabFlag = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "normal",
    "high",
    "low",
    "critical_high",
    "critical_low"
]);
const zLabResult = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    testName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    loincCode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    collectedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime(),
    value: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].union([
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].number(),
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string()
    ]),
    unit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    referenceRange: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
        low: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].number().optional(),
        high: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].number().optional(),
        text: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional()
    }).optional(),
    flag: zLabFlag.optional()
});
const zZygosity = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "heterozygous",
    "homozygous",
    "hemizygous",
    "unknown"
]);
const zClinVarSignificance = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "benign",
    "likely_benign",
    "vus",
    "likely_pathogenic",
    "pathogenic",
    "drug_response",
    "other"
]);
const zAcmgClassification = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "benign",
    "likely_benign",
    "vus",
    "likely_pathogenic",
    "pathogenic"
]);
const zAlleleFrequency = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
        "gnomAD",
        "1000G",
        "Other"
    ]),
    population: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    value: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].number().min(0).max(1)
});
const zVariantType = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "SNP",
    "indel",
    "CNV",
    "fusion",
    "other"
]);
const zLiteratureReference = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    pmid: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    title: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    journal: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    year: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].number().int().optional(),
    url: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().url().optional()
});
const zGeneVariant = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    geneSymbol: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    transcriptId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    genomicChange: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    codingChange: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    proteinChange: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    zygosity: zZygosity,
    variantType: zVariantType.optional(),
    clinVarSignificance: zClinVarSignificance.optional(),
    acmgClassification: zAcmgClassification.optional(),
    alleleFrequencies: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zAlleleFrequency).optional(),
    pathogenicityScore: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].number().min(0).max(1).optional(),
    associatedDiseases: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)).optional(),
    literatureReferences: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zLiteratureReference).optional()
});
const zAssociatedCondition = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    code: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    codeSystem: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
        "OMIM",
        "Orphanet",
        "ICD-10",
        "Other"
    ]).optional(),
    category: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
        "cancer",
        "cardio",
        "neuro",
        "pharmacogenomic",
        "other"
    ]),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const zEvidenceLevel = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "A",
    "B",
    "C",
    "D"
]);
const zVariantAnnotation = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    variantId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    conditionIds: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)),
    evidenceLevel: zEvidenceLevel,
    guidelineSources: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)),
    summary: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)
});
const zDrugGeneInteraction = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    geneSymbol: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    variantPattern: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    drugName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    rxNormCode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    effect: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    clinicalRecommendation: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    evidenceLevel: zEvidenceLevel,
    guidelineSource: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const zEvidenceBasedRecommendation = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    levelOfEvidence: zEvidenceLevel,
    strengthOfRecommendation: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
        "strong",
        "moderate",
        "weak",
        "informational"
    ]),
    summary: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    rationale: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().optional(),
    referenceLinks: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().url()).optional()
});
const zClinicalNoteType = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "consultation",
    "follow_up",
    "tumor_board",
    "treatment_plan",
    "other"
]);
const zClinicalNote = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    noteType: zClinicalNoteType,
    authorRole: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    createdAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime(),
    updatedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime().optional(),
    title: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    summary: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    body: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    tags: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)).optional()
});
const zTreatmentPlan = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    createdAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime(),
    updatedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime().optional(),
    goals: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)),
    plannedMedications: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)),
    genomicConsiderations: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)).optional(),
    followUpIntervalMonths: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].number().int().positive().optional()
});
const zRecommendationStatus = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
    "open",
    "in_progress",
    "completed"
]);
const zFollowUpRecommendation = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    recommendationText: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    dueDate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime().optional(),
    priority: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].enum([
        "low",
        "medium",
        "high"
    ]),
    status: zRecommendationStatus
});
const zGenomicFinding = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    patientId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    variantId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1),
    clinicalSignificance: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].union([
        zClinVarSignificance,
        zAcmgClassification
    ]),
    associatedConditionIds: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)),
    drugGeneInteractionIds: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)),
    evidenceRecommendationIds: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().min(1)),
    generatedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].string().datetime()
});
const zPatientRecord = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
    demographics: zDemographics,
    medicalHistory: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zMedicalCondition),
    currentMedications: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zMedicationOrder),
    labResults: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zLabResult),
    genomic: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].object({
        variants: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zGeneVariant),
        associatedConditions: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zAssociatedCondition),
        variantAnnotations: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zVariantAnnotation),
        drugGeneInteractions: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zDrugGeneInteraction),
        evidenceBasedRecommendations: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zEvidenceBasedRecommendation),
        genomicFindings: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zGenomicFinding)
    }),
    clinicalNotes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zClinicalNote),
    treatmentPlans: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zTreatmentPlan),
    followUpRecommendations: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$health_ai$2f$node_modules$2f$zod$29$__["z"].array(zFollowUpRecommendation)
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/health_ai/lib/mockData.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createSamplePatientRecord",
    ()=>createSamplePatientRecord,
    "createSamplePatients",
    ()=>createSamplePatients
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$validation$2f$medicalSchemas$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/lib/validation/medicalSchemas.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$validation$2f$medicalSchemas$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$validation$2f$medicalSchemas$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
/**
 * Helper to create ISO timestamps relative to "now" without depending on real PHI dates.
 */ function daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
}
/**
 * Synthetic but clinically plausible genomic variants.
 */ function createGenomicVariants(patientId) {
    return [
        {
            id: `${patientId}-var-brca1`,
            patientId,
            geneSymbol: "BRCA1",
            transcriptId: "NM_007294.4",
            genomicChange: "chr17:g.43071077_43071078del",
            codingChange: "c.68_69delAG",
            proteinChange: "p.Glu23Valfs",
            zygosity: "heterozygous",
            variantType: "indel",
            clinVarSignificance: "pathogenic",
            acmgClassification: "pathogenic",
            alleleFrequencies: [
                {
                    source: "gnomAD",
                    population: "NFE",
                    value: 0.00012
                }
            ],
            pathogenicityScore: 0.95,
            associatedDiseases: [
                "Hereditary breast and ovarian cancer syndrome",
                "Breast cancer",
                "Ovarian cancer"
            ],
            literatureReferences: [
                {
                    pmid: "20301425",
                    title: "BRCA1 c.68_69delAG (185delAG) is a founder mutation in the Ashkenazi Jewish population",
                    journal: "Am J Hum Genet",
                    year: 2010,
                    url: "https://pubmed.ncbi.nlm.nih.gov/20301425/"
                },
                {
                    pmid: "25614872",
                    title: "NCCN Guidelines: Genetic/Familial High-Risk Assessment: Breast, Ovarian, and Pancreatic",
                    journal: "J Natl Compr Canc Netw",
                    year: 2020
                }
            ]
        },
        {
            id: `${patientId}-var-apoe`,
            patientId,
            geneSymbol: "APOE",
            transcriptId: "NM_000041.3",
            genomicChange: "chr19:g.45411941T>C",
            codingChange: "c.388T>C",
            proteinChange: "p.Cys130Arg (e4)",
            zygosity: "homozygous",
            variantType: "SNP",
            clinVarSignificance: "other",
            acmgClassification: "vus",
            alleleFrequencies: [
                {
                    source: "gnomAD",
                    population: "EUR",
                    value: 0.14
                }
            ],
            pathogenicityScore: 0.5,
            associatedDiseases: [
                "Late-onset Alzheimer disease",
                "Cardiovascular disease risk modifier"
            ],
            literatureReferences: [
                {
                    pmid: "23485494",
                    title: "APOE ε4: the most prevalent genetic risk factor for Alzheimer disease",
                    journal: "Nat Rev Neurol",
                    year: 2013,
                    url: "https://pubmed.ncbi.nlm.nih.gov/23485494/"
                }
            ]
        },
        {
            id: `${patientId}-var-tpmt`,
            patientId,
            geneSymbol: "TPMT",
            transcriptId: "NM_000367.6",
            genomicChange: "chr6:g.18139228A>G",
            codingChange: "c.238G>C",
            proteinChange: "p.Ala80Pro",
            zygosity: "heterozygous",
            variantType: "SNP",
            clinVarSignificance: "drug_response",
            acmgClassification: "likely_pathogenic",
            alleleFrequencies: [
                {
                    source: "gnomAD",
                    population: "NFE",
                    value: 0.031
                }
            ],
            pathogenicityScore: 0.72,
            associatedDiseases: [
                "Thiopurine-induced myelosuppression",
                "Azathioprine/6-MP toxicity"
            ],
            literatureReferences: [
                {
                    pmid: "21205996",
                    title: "Clinical Pharmacogenetics Implementation Consortium guideline for thiopurine methyltransferase genotype",
                    journal: "Clin Pharmacol Ther",
                    year: 2011,
                    url: "https://pubmed.ncbi.nlm.nih.gov/21205996/"
                }
            ]
        }
    ];
}
function createAssociatedConditions() {
    return [
        {
            id: "cond-breast-cancer",
            name: "Hereditary breast and ovarian cancer syndrome",
            code: "C50.9",
            codeSystem: "ICD-10",
            category: "cancer",
            description: "Increased lifetime risk of breast and ovarian cancer associated with pathogenic BRCA1/2 variants."
        },
        {
            id: "cond-alzheimer",
            name: "Late-onset Alzheimer disease risk",
            code: "G30.1",
            codeSystem: "ICD-10",
            category: "neuro",
            description: "Increased risk of late-onset Alzheimer disease."
        }
    ];
}
function createDrugGeneInteractions() {
    return [
        {
            id: "dgi-parp-brca1",
            geneSymbol: "BRCA1",
            variantPattern: "any pathogenic loss-of-function",
            drugName: "Olaparib",
            rxNormCode: "1801280",
            effect: "Increased sensitivity to PARP inhibition",
            clinicalRecommendation: "Consider PARP inhibitor therapy in appropriate oncologic context per NCCN guidelines.",
            evidenceLevel: "A",
            guidelineSource: "NCCN Breast Cancer Guidelines v3.2024"
        },
        {
            id: "dgi-apoe-statins",
            geneSymbol: "APOE",
            variantPattern: "e4/e4",
            drugName: "Atorvastatin",
            rxNormCode: "83367",
            effect: "Potentially altered lipid-lowering response",
            clinicalRecommendation: "Monitor LDL response closely; may require dose adjustment to achieve guideline targets.",
            evidenceLevel: "B",
            guidelineSource: "Expert consensus, observational studies"
        }
    ];
}
function createEvidenceRecommendations(patientId) {
    return [
        {
            id: `${patientId}-rec-brca1-surveillance`,
            patientId,
            source: "NCCN Breast Cancer Risk Reduction Guidelines v3.2024",
            levelOfEvidence: "A",
            strengthOfRecommendation: "strong",
            summary: "Enhanced breast cancer surveillance with annual MRI and mammography starting at age 30–35.",
            rationale: "Pathogenic BRCA1 variant confers substantially increased lifetime risk of breast cancer.",
            referenceLinks: [
                "https://www.nccn.org"
            ]
        },
        {
            id: `${patientId}-rec-lifestyle-cv`,
            patientId,
            source: "ACC/AHA Primary Prevention Guidelines",
            levelOfEvidence: "B",
            strengthOfRecommendation: "moderate",
            summary: "Aggressive management of cardiovascular risk factors given elevated polygenic and APOE-related risk.",
            rationale: "Combined genomic and clinical risk suggests benefit from tighter lipid and blood pressure control.",
            referenceLinks: [
                "https://www.acc.org"
            ]
        }
    ];
}
function createMedicalHistory(patientId) {
    return [
        {
            id: `${patientId}-hx-breast`,
            patientId,
            code: "C50.9",
            codeSystem: "ICD-10",
            display: "Malignant neoplasm of breast, unspecified",
            onsetDate: daysAgo(380),
            status: "active",
            notes: "Diagnosed after abnormal screening mammogram; BRCA1-positive."
        },
        {
            id: `${patientId}-hx-htn`,
            patientId,
            code: "I10",
            codeSystem: "ICD-10",
            display: "Essential (primary) hypertension",
            onsetDate: daysAgo(3650),
            status: "active"
        }
    ];
}
function createMedications(patientId) {
    return [
        {
            id: `${patientId}-med-atorvastatin`,
            patientId,
            drugName: "Atorvastatin 40 mg tablet",
            genericName: "atorvastatin",
            rxNormCode: "617318",
            dose: "40 mg",
            route: "oral",
            frequency: "once daily",
            startDate: daysAgo(730),
            isCurrent: true,
            indication: "Hyperlipidemia"
        },
        {
            id: `${patientId}-med-olaparib`,
            patientId,
            drugName: "Olaparib 300 mg tablet",
            genericName: "olaparib",
            rxNormCode: "1801280",
            dose: "300 mg",
            route: "oral",
            frequency: "twice daily",
            startDate: daysAgo(120),
            isCurrent: true,
            indication: "BRCA1-positive breast cancer"
        }
    ];
}
function createLabs(patientId) {
    return [
        {
            id: `${patientId}-lab-ldl`,
            patientId,
            testName: "LDL cholesterol",
            loincCode: "2089-1",
            collectedAt: daysAgo(14),
            value: 82,
            unit: "mg/dL",
            referenceRange: {
                high: 130
            },
            flag: "normal"
        },
        {
            id: `${patientId}-lab-ca125`,
            patientId,
            testName: "CA-125",
            loincCode: "10334-1",
            collectedAt: daysAgo(30),
            value: 18,
            unit: "U/mL",
            referenceRange: {
                high: 35
            },
            flag: "normal"
        }
    ];
}
function createClinicalNotes(patientId) {
    return [
        {
            id: `${patientId}-note-consult`,
            patientId,
            noteType: "consultation",
            authorRole: "medical oncologist",
            createdAt: daysAgo(120),
            title: "Initial oncology consultation",
            summary: "Discussed BRCA1-positive breast cancer diagnosis and treatment options.",
            body: "Patient presents with early-stage BRCA1-positive breast cancer. " + "Reviewed surgical options, systemic therapy, and role of PARP inhibitors. " + "Strong family history of breast cancer on maternal side.",
            tags: [
                "oncology",
                "genetics"
            ]
        },
        {
            id: `${patientId}-note-plan`,
            patientId,
            noteType: "treatment_plan",
            authorRole: "medical oncologist",
            createdAt: daysAgo(110),
            updatedAt: daysAgo(30),
            title: "Updated treatment plan with PARP inhibitor",
            summary: "Initiated PARP inhibitor based on BRCA1 variant and NCCN guidance.",
            body: "Given pathogenic BRCA1 variant and high risk of recurrence, initiated olaparib " + "as adjuvant therapy consistent with NCCN guidelines. Monitored labs and tolerance.",
            tags: [
                "treatment-plan",
                "parp-inhibitor"
            ]
        }
    ];
}
function createTreatmentPlans(patientId) {
    return [
        {
            id: `${patientId}-tp-1`,
            patientId,
            createdAt: daysAgo(110),
            updatedAt: daysAgo(30),
            goals: [
                "Reduce risk of breast cancer recurrence",
                "Optimize cardiovascular risk profile"
            ],
            plannedMedications: [
                "Olaparib",
                "Atorvastatin"
            ],
            genomicConsiderations: [
                "Pathogenic BRCA1 variant supports PARP inhibitor therapy",
                "APOE e4/e4 genotype supports aggressive lipid management"
            ],
            followUpIntervalMonths: 3
        }
    ];
}
function createFollowUps(patientId) {
    return [
        {
            id: `${patientId}-fu-mri`,
            patientId,
            recommendationText: "Schedule annual breast MRI and mammography per high-risk screening protocol.",
            dueDate: daysAgo(-200),
            priority: "high",
            status: "open"
        },
        {
            id: `${patientId}-fu-lipids`,
            patientId,
            recommendationText: "Repeat fasting lipid panel and assess statin response in 6 months.",
            dueDate: daysAgo(-180),
            priority: "medium",
            status: "open"
        }
    ];
}
function createSamplePatientRecord(patientId) {
    const demographics = {
        patientId,
        givenName: "Alice",
        familyName: "Nguyen",
        dateOfBirth: "1985-03-12",
        sex: "female",
        raceEthnicity: "asian",
        country: "USA",
        regionOrState: "CA"
    };
    const conditions = createMedicalHistory(patientId);
    const meds = createMedications(patientId);
    const labs = createLabs(patientId);
    const variants = createGenomicVariants(patientId);
    const associatedConditions = createAssociatedConditions();
    const dgis = createDrugGeneInteractions();
    const recs = createEvidenceRecommendations(patientId);
    const notes = createClinicalNotes(patientId);
    const plans = createTreatmentPlans(patientId);
    const followUps = createFollowUps(patientId);
    const genomicFindings = variants.map((variant, idx)=>({
            id: `${patientId}-finding-${idx + 1}`,
            patientId,
            variantId: variant.id,
            clinicalSignificance: variant.acmgClassification ?? variant.clinVarSignificance ?? "vus",
            associatedConditionIds: variant.geneSymbol === "BRCA1" ? [
                "cond-breast-cancer"
            ] : [
                "cond-alzheimer"
            ],
            drugGeneInteractionIds: variant.geneSymbol === "BRCA1" ? [
                "dgi-parp-brca1"
            ] : [
                "dgi-apoe-statins"
            ],
            evidenceRecommendationIds: recs.map((r)=>r.id),
            generatedAt: daysAgo(30)
        }));
    const record = {
        demographics,
        medicalHistory: conditions,
        currentMedications: meds,
        labResults: labs,
        genomic: {
            variants,
            associatedConditions,
            variantAnnotations: [
                {
                    id: `${patientId}-ann-brca1`,
                    variantId: `${patientId}-var-brca1`,
                    conditionIds: [
                        "cond-breast-cancer"
                    ],
                    evidenceLevel: "A",
                    guidelineSources: [
                        "NCCN Breast Cancer Guidelines v3.2024"
                    ],
                    summary: "Pathogenic BRCA1 frameshift variant associated with high lifetime risk of breast and ovarian cancer."
                }
            ],
            drugGeneInteractions: dgis,
            evidenceBasedRecommendations: recs,
            genomicFindings
        },
        clinicalNotes: notes,
        treatmentPlans: plans,
        followUpRecommendations: followUps
    };
    // Validate in development to catch schema drift.
    if ("TURBOPACK compile-time truthy", 1) {
        __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$validation$2f$medicalSchemas$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["zPatientRecord"].parse(record);
    }
    return record;
}
function createSamplePatients() {
    const primary = createSamplePatientRecord("p-brca1-001");
    // Derive a second patient by tweaking key fields to demonstrate variability.
    const secondary = {
        ...primary,
        demographics: {
            ...primary.demographics,
            patientId: "p-cardio-002",
            givenName: "David",
            familyName: "Patel",
            dateOfBirth: "1973-08-22",
            sex: "male",
            raceEthnicity: "south_asian"
        },
        medicalHistory: primary.medicalHistory.map((cond)=>({
                ...cond,
                patientId: "p-cardio-002"
            })),
        currentMedications: primary.currentMedications.map((med)=>({
                ...med,
                patientId: "p-cardio-002"
            })),
        labResults: primary.labResults.map((lab)=>({
                ...lab,
                patientId: "p-cardio-002"
            })),
        genomic: {
            ...primary.genomic,
            variants: primary.genomic.variants.map((v)=>({
                    ...v,
                    patientId: "p-cardio-002",
                    id: v.id.replace("p-brca1-001", "p-cardio-002")
                })),
            evidenceBasedRecommendations: primary.genomic.evidenceBasedRecommendations.map((r)=>({
                    ...r,
                    patientId: "p-cardio-002",
                    id: r.id.replace("p-brca1-001", "p-cardio-002")
                })),
            genomicFindings: primary.genomic.genomicFindings.map((f)=>({
                    ...f,
                    patientId: "p-cardio-002",
                    id: f.id.replace("p-brca1-001", "p-cardio-002"),
                    variantId: f.variantId.replace("p-brca1-001", "p-cardio-002")
                }))
        },
        clinicalNotes: primary.clinicalNotes.map((n)=>({
                ...n,
                patientId: "p-cardio-002",
                id: n.id.replace("p-brca1-001", "p-cardio-002")
            })),
        treatmentPlans: primary.treatmentPlans.map((tp)=>({
                ...tp,
                patientId: "p-cardio-002",
                id: tp.id.replace("p-brca1-001", "p-cardio-002")
            })),
        followUpRecommendations: primary.followUpRecommendations.map((fu)=>({
                ...fu,
                patientId: "p-cardio-002",
                id: fu.id.replace("p-brca1-001", "p-cardio-002")
            }))
    };
    return [
        primary,
        secondary
    ];
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/health_ai/pages/api/patients.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$mockData$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/lib/mockData.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$mockData$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$mockData$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    const id = req.query.id;
    // Simulate latency and a real backend call
    setTimeout(()=>{
        try {
            const patients = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$mockData$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createSamplePatients"])();
            if (id) {
                const patient = patients.find((p)=>p.demographics.patientId === id) ?? null;
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
                patients
            });
        } catch  {
            return res.status(500).json({
                error: "Failed to load patients"
            });
        }
    }, 400);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__270debcb._.js.map