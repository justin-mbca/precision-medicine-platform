(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/health_ai/components/layout/Sidebar.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Sidebar",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClipboardDocumentListIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardDocumentListIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/ClipboardDocumentListIcon.js [client] (ecmascript) <export default as ClipboardDocumentListIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BeakerIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BeakerIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/BeakerIcon.js [client] (ecmascript) <export default as BeakerIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChatBubbleLeftRightIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChatBubbleLeftRightIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/ChatBubbleLeftRightIcon.js [client] (ecmascript) <export default as ChatBubbleLeftRightIcon>");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const navItems = [
    {
        name: "Patients",
        href: "/",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClipboardDocumentListIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardDocumentListIcon$3e$__["ClipboardDocumentListIcon"], {
            className: "h-5 w-5"
        }, void 0, false, {
            fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
            lineNumber: 20,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        name: "Genomic insights",
        href: "/genomic",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BeakerIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BeakerIcon$3e$__["BeakerIcon"], {
            className: "h-5 w-5"
        }, void 0, false, {
            fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
            lineNumber: 25,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        name: "Virtual Colleague",
        href: "/assistant",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChatBubbleLeftRightIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChatBubbleLeftRightIcon$3e$__["ChatBubbleLeftRightIcon"], {
            className: "h-5 w-5"
        }, void 0, false, {
            fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
            lineNumber: 30,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    }
];
function Sidebar() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "hidden md:flex md:w-64 flex-col bg-slate-900 text-slate-100",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-16 flex items-center px-6 border-b border-slate-800",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "text-lg font-semibold",
                    children: [
                        "Precision",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-brand-400",
                            children: "Med"
                        }, void 0, false, {
                            fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
                            lineNumber: 41,
                            columnNumber: 20
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 px-3 py-4 space-y-1",
                children: navItems.map((item)=>{
                    const active = router.pathname === item.href;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        href: item.href,
                        className: `w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`,
                        children: [
                            item.icon,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: item.name
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
                                lineNumber: 58,
                                columnNumber: 15
                            }, this)
                        ]
                    }, item.name, true, {
                        fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
                        lineNumber: 48,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-6 py-4 text-xs text-slate-500",
                children: "For demo use only — not clinical grade."
            }, void 0, false, {
                fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health_ai/components/layout/Sidebar.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_s(Sidebar, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Sidebar;
var _c;
__turbopack_context__.k.register(_c, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/components/layout/Header.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/next-auth/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
function Header() {
    _s();
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useSession"])();
    const role = session?.user?.role ?? "oncologist";
    const subtitle = role === "oncologist" ? "Oncology-focused genomic decision support (mock)." : "Integrated EMR + genomics for decision support (mock).";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "h-16 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 bg-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-lg font-semibold text-slate-900",
                        children: "Patient genomic overview"
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/layout/Header.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-500",
                        children: subtitle
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/layout/Header.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/layout/Header.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4",
                children: [
                    status === "loading" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-slate-400",
                        children: "Loading user…"
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/layout/Header.tsx",
                        lineNumber: 22,
                        columnNumber: 11
                    }, this),
                    session && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-right",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium text-slate-900",
                                        children: session.user?.name ?? "Clinician"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/layout/Header.tsx",
                                        lineNumber: 27,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-500",
                                        children: session.user?.email
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/layout/Header.tsx",
                                        lineNumber: 30,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/layout/Header.tsx",
                                                lineNumber: 32,
                                                columnNumber: 17
                                            }, this),
                                            role
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/health_ai/components/layout/Header.tsx",
                                        lineNumber: 31,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health_ai/components/layout/Header.tsx",
                                lineNumber: 26,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["signOut"])({
                                        callbackUrl: "/auth/signin"
                                    }),
                                className: "rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100",
                                children: "Sign out"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/layout/Header.tsx",
                                lineNumber: 36,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/layout/Header.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/layout/Header.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health_ai/components/layout/Header.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_s(Header, "ujwIunAD3hlHFoJLG3BNiDLiMqM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/components/layout/DashboardLayout.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardLayout",
    ()=>DashboardLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/layout/Sidebar.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$Header$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/layout/Header.tsx [client] (ecmascript)");
;
;
;
function DashboardLayout({ children, wide }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex bg-slate-100",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Sidebar"], {}, void 0, false, {
                fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$Header$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Header"], {}, void 0, false, {
                        fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 p-4 md:p-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `mx-auto ${wide ? "max-w-7xl" : "max-w-6xl"}`,
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = DashboardLayout;
var _c;
__turbopack_context__.k.register(_c, "DashboardLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/lib/patientService.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchPatients",
    ()=>fetchPatients
]);
async function fetchPatients() {
    const res = await fetch("/api/patients");
    if (!res.ok) {
        let message = `Failed to load patient data (status ${res.status})`;
        try {
            const body = await res.json();
            if (body?.error) message = body.error;
        } catch  {
        // ignore JSON parse errors
        }
        throw new Error(message);
    }
    const data = await res.json();
    return data.patients;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/lib/usePatients.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePatients",
    ()=>usePatients
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$patientService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/lib/patientService.ts [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
function usePatients() {
    _s();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePatients.useEffect": ()=>{
            let cancelled = false;
            async function load() {
                try {
                    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$patientService$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["fetchPatients"])();
                    if (!cancelled) {
                        setData(result);
                        setError(null);
                    }
                } catch (err) {
                    if (!cancelled) {
                        setError(err instanceof Error ? err.message : "Unknown error");
                    }
                } finally{
                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            }
            load();
            return ({
                "usePatients.useEffect": ()=>{
                    cancelled = true;
                }
            })["usePatients.useEffect"];
        }
    }["usePatients.useEffect"], []);
    return {
        data,
        loading,
        error
    };
}
_s(usePatients, "RiL7vLwmC7ZWXKL/bXt2EIBjBYk=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/lib/dashboardData.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeDimensionScores",
    ()=>computeDimensionScores
]);
function getLatestLab(patient, testName) {
    const labs = patient.labResults.filter((l)=>l.testName === testName).sort((a, b)=>new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());
    const latest = labs[0];
    return typeof latest?.value === "number" ? latest.value : undefined;
}
function statusFromScore(score) {
    if (score <= 0.33) return "green";
    if (score <= 0.66) return "yellow";
    return "red";
}
function statusFromScoreInverse(score) {
    if (score >= 0.66) return "green";
    if (score >= 0.33) return "yellow";
    return "red";
}
function now() {
    return new Date().toISOString();
}
function computeDimensionScores(patient) {
    const { genomic, medicalHistory, labResults } = patient;
    const hasBrac1Pathogenic = genomic.variants.some((v)=>v.geneSymbol === "BRCA1" && (v.acmgClassification === "pathogenic" || v.acmgClassification === "likely_pathogenic" || v.clinVarSignificance === "pathogenic" || v.clinVarSignificance === "likely_pathogenic"));
    const hasApoE4 = genomic.variants.some((v)=>v.geneSymbol === "APOE" && typeof v.proteinChange === "string" && v.proteinChange.toLowerCase().includes("e4"));
    const hasHypertension = medicalHistory.some((c)=>c.code === "I10");
    const hasDiabetes = medicalHistory.some((c)=>c.code === "E11" || c.code === "E10" || c.display?.toLowerCase().includes("diabetes"));
    const hasCancerHistory = medicalHistory.some((c)=>c.code?.startsWith("C") || c.display?.toLowerCase().includes("cancer") || c.display?.toLowerCase().includes("neoplasm"));
    const ldl = getLatestLab(patient, "LDL cholesterol");
    const hba1c = getLatestLab(patient, "HbA1c");
    const creatinine = getLatestLab(patient, "Creatinine");
    const alt = getLatestLab(patient, "ALT");
    const wbc = getLatestLab(patient, "WBC");
    const cardioContributors = [];
    let cardioScore = 0.2;
    if (hasHypertension) {
        cardioScore += 0.25;
        cardioContributors.push({
            label: "Hypertension",
            impact: 0.4,
            status: "yellow",
            source: "condition"
        });
    }
    if (typeof ldl === "number" && ldl > 130) {
        cardioScore += 0.2;
        cardioContributors.push({
            label: `LDL elevated (${ldl} mg/dL)`,
            impact: 0.35,
            status: "yellow",
            source: "lab"
        });
    }
    if (hasApoE4) {
        cardioScore += 0.15;
        cardioContributors.push({
            label: "APOE e4 genotype",
            impact: 0.25,
            status: "yellow",
            source: "genomic"
        });
    }
    if (cardioContributors.length === 0) {
        cardioContributors.push({
            label: "No major risk factors",
            impact: 0.2,
            status: "green",
            source: "lab"
        });
    }
    cardioScore = Math.min(1, cardioScore);
    const metabolicContributors = [];
    let metabolicScore = 0.15;
    if (hasDiabetes) {
        metabolicScore += 0.4;
        metabolicContributors.push({
            label: "Diabetes",
            impact: 0.5,
            status: "red",
            source: "condition"
        });
    }
    if (typeof hba1c === "number" && hba1c > 6.5) {
        metabolicScore += 0.35;
        metabolicContributors.push({
            label: `HbA1c elevated (${hba1c}%)`,
            impact: 0.45,
            status: "red",
            source: "lab"
        });
    }
    if (metabolicContributors.length === 0) {
        metabolicContributors.push({
            label: "Metabolic parameters normal",
            impact: 0.15,
            status: "green",
            source: "lab"
        });
    }
    metabolicScore = Math.min(1, metabolicScore);
    const cancerContributors = [];
    const cancerScore = hasBrac1Pathogenic ? 0.88 : hasCancerHistory ? 0.6 : 0.25;
    if (hasBrac1Pathogenic) {
        cancerContributors.push({
            label: "Pathogenic BRCA1 variant",
            impact: 0.85,
            status: "red",
            source: "genomic"
        });
    }
    if (hasCancerHistory && !hasBrac1Pathogenic) {
        cancerContributors.push({
            label: "Cancer history",
            impact: 0.6,
            status: "yellow",
            source: "condition"
        });
    }
    if (cancerContributors.length === 0) {
        cancerContributors.push({
            label: "Baseline cancer risk",
            impact: 0.25,
            status: "green",
            source: "genomic"
        });
    }
    const neuroContributors = [];
    const neuroScore = hasApoE4 ? 0.5 : 0.15;
    if (hasApoE4) {
        neuroContributors.push({
            label: "APOE e4 genotype",
            impact: 0.5,
            status: "yellow",
            source: "genomic"
        });
    } else {
        neuroContributors.push({
            label: "No major neurological risk",
            impact: 0.15,
            status: "green",
            source: "genomic"
        });
    }
    const immuneScore = typeof wbc === "number" && (wbc < 4 || wbc > 11) ? 0.55 : 0.2;
    const immuneStatus = typeof wbc === "number" && wbc >= 4 && wbc <= 11 ? "green" : "yellow";
    const immuneContributors = [
        {
            label: typeof wbc === "number" ? `WBC ${wbc} K/µL` : "WBC not in current data",
            impact: immuneScore,
            status: immuneStatus,
            source: "lab"
        }
    ];
    const cr = typeof creatinine === "number" ? creatinine : 0.9;
    const gfrEst = cr > 0 ? 140 / cr : 100;
    const renalScore = gfrEst < 60 ? 0.7 : gfrEst < 90 ? 0.4 : 0.15;
    const renalStatus = statusFromScoreInverse(gfrEst >= 90 ? 0.9 : gfrEst >= 60 ? 0.6 : 0.3);
    const renalContributors = [
        {
            label: `Creatinine ${cr} mg/dL (eGFR ~${Math.round(gfrEst)})`,
            impact: renalScore,
            status: renalStatus,
            source: "lab"
        }
    ];
    const hepaticScore = typeof alt === "number" && alt > 40 ? 0.6 : 0.2;
    const hepaticContributors = [
        {
            label: typeof alt === "number" ? `ALT ${alt} U/L` : "Liver enzymes not in current data",
            impact: hepaticScore,
            status: typeof alt === "number" && alt <= 40 ? "green" : "yellow",
            source: "lab"
        }
    ];
    const dimensions = [
        {
            dimensionId: "cardiovascular",
            status: statusFromScore(cardioScore),
            score: cardioScore,
            summary: hasHypertension ? "Hypertension present; LDL and APOE genotype contribute to cardiovascular risk." : "No major cardiovascular risk factors identified.",
            contributors: cardioContributors,
            genomicFindings: hasApoE4 ? genomic.variants.filter((v)=>v.geneSymbol === "APOE").map((v)=>`${v.geneSymbol} ${v.codingChange} (${v.proteinChange ?? "—"})`) : [],
            aiRecommendation: hasApoE4 && typeof ldl === "number" && ldl > 130 ? "APOE e4 genotype and elevated LDL support aggressive lipid management per guidelines." : undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "metabolic",
            status: statusFromScore(metabolicScore),
            score: metabolicScore,
            summary: hasDiabetes ? "Diabetes documented; metabolic parameters require monitoring." : "No significant metabolic dysfunction identified.",
            contributors: metabolicContributors,
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "cancer_risk",
            status: statusFromScore(cancerScore),
            score: cancerScore,
            summary: hasBrac1Pathogenic ? "Pathogenic BRCA1 variant confers high hereditary cancer risk." : hasCancerHistory ? "Cancer history present; ongoing surveillance recommended." : "Baseline cancer risk; no high-penetrance variants identified.",
            contributors: cancerContributors,
            genomicFindings: genomic.variants.filter((v)=>v.geneSymbol === "BRCA1" || v.geneSymbol === "BRCA2" || v.associatedDiseases?.some((d)=>d.toLowerCase().includes("cancer"))).map((v)=>`${v.geneSymbol} ${v.codingChange} (${v.acmgClassification ?? v.clinVarSignificance ?? "—"})`),
            aiRecommendation: hasBrac1Pathogenic ? "NCCN guidelines support enhanced breast/ovarian surveillance and PARP inhibitor eligibility discussion." : undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "neurological",
            status: statusFromScore(neuroScore),
            score: neuroScore,
            summary: hasApoE4 ? "APOE e4 genotype associated with increased Alzheimer disease risk." : "No major neurological risk factors from genomic profile.",
            contributors: neuroContributors,
            genomicFindings: genomic.variants.filter((v)=>v.geneSymbol === "APOE").map((v)=>`${v.geneSymbol} ${v.codingChange} (${v.proteinChange ?? "—"})`),
            aiRecommendation: hasApoE4 ? "Consider cognitive screening and lifestyle interventions per AAN guidelines." : undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "immune",
            status: immuneStatus,
            score: immuneScore,
            summary: typeof wbc === "number" && (wbc < 4 || wbc > 11) ? "WBC outside reference range; consider follow-up." : "Immune parameters within expected range.",
            contributors: immuneContributors,
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "renal",
            status: renalStatus,
            score: renalScore,
            summary: typeof creatinine === "number" && creatinine > 1.2 ? "Creatinine elevated; assess eGFR and kidney function." : "Renal function within expected range.",
            contributors: renalContributors,
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "hepatic",
            status: statusFromScoreInverse(typeof alt === "number" && alt <= 40 ? 0.85 : 0.45),
            score: hepaticScore,
            summary: typeof alt === "number" && alt > 40 ? "ALT elevated; consider hepatic workup." : "Hepatic enzymes within reference range.",
            contributors: hepaticContributors,
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "respiratory",
            status: "green",
            score: 0.2,
            summary: "No respiratory conditions or abnormal findings in current data.",
            contributors: [
                {
                    label: "No respiratory data",
                    impact: 0.2,
                    status: "green",
                    source: "lab"
                }
            ],
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "hematologic",
            status: "green",
            score: 0.25,
            summary: "Hematologic parameters within expected range.",
            contributors: [
                {
                    label: "CBC/labs not in current data",
                    impact: 0.25,
                    status: "green",
                    source: "lab"
                }
            ],
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "endocrine",
            status: statusFromScore(hasDiabetes ? 0.55 : 0.2),
            score: hasDiabetes ? 0.55 : 0.2,
            summary: hasDiabetes ? "Endocrine disorder (diabetes) documented." : "No significant endocrine dysfunction identified.",
            contributors: hasDiabetes ? [
                {
                    label: "Diabetes",
                    impact: 0.55,
                    status: "yellow",
                    source: "condition"
                }
            ] : [
                {
                    label: "No endocrine dysfunction",
                    impact: 0.2,
                    status: "green",
                    source: "condition"
                }
            ],
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "gastrointestinal",
            status: "green",
            score: 0.2,
            summary: "No GI conditions or abnormal findings in current data.",
            contributors: [
                {
                    label: "No GI data",
                    impact: 0.2,
                    status: "green",
                    source: "condition"
                }
            ],
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "musculoskeletal",
            status: "green",
            score: 0.2,
            summary: "No musculoskeletal conditions in current data.",
            contributors: [
                {
                    label: "No MSK data",
                    impact: 0.2,
                    status: "green",
                    source: "condition"
                }
            ],
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "dermatologic",
            status: "green",
            score: 0.2,
            summary: "No dermatologic conditions in current data.",
            contributors: [
                {
                    label: "No dermatologic data",
                    impact: 0.2,
                    status: "green",
                    source: "condition"
                }
            ],
            genomicFindings: [],
            aiRecommendation: undefined,
            lastUpdated: now()
        },
        {
            dimensionId: "mental_health",
            status: "green",
            score: 0.25,
            summary: "No documented mental health conditions; consider screening in high-risk contexts.",
            contributors: hasApoE4 ? [
                {
                    label: "APOE e4 may influence mood",
                    impact: 0.25,
                    status: "green",
                    source: "genomic"
                }
            ] : [
                {
                    label: "No mental health data",
                    impact: 0.25,
                    status: "green",
                    source: "condition"
                }
            ],
            genomicFindings: [],
            aiRecommendation: hasApoE4 ? "APOE e4 may influence mood; consider psychosocial support in at-risk patients." : undefined,
            lastUpdated: now()
        }
    ];
    return dimensions;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/types/dashboard.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Synoptic dashboard types for the precision medicine platform.
 * 14 health dimensions with green/yellow/red status for quick assessment.
 */ __turbopack_context__.s([
    "DIMENSION_LABELS",
    ()=>DIMENSION_LABELS,
    "HEALTH_DIMENSIONS",
    ()=>HEALTH_DIMENSIONS,
    "STATUS_COLORS",
    ()=>STATUS_COLORS,
    "getStatusColor",
    ()=>getStatusColor
]);
const DIMENSION_LABELS = {
    cardiovascular: "Cardiovascular Health",
    metabolic: "Metabolic Function",
    cancer_risk: "Cancer Risk",
    neurological: "Neurological Health",
    immune: "Immune Function",
    renal: "Renal Function",
    hepatic: "Hepatic Function",
    respiratory: "Respiratory Health",
    hematologic: "Hematologic Function",
    endocrine: "Endocrine Function",
    gastrointestinal: "Gastrointestinal Health",
    musculoskeletal: "Musculoskeletal Health",
    dermatologic: "Dermatologic Health",
    mental_health: "Mental Health"
};
const STATUS_COLORS = {
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444"
};
function getStatusColor(status) {
    switch(status){
        case "green":
            return {
                bg: "bg-emerald-500",
                border: "border-emerald-200",
                text: "text-emerald-700",
                dot: "bg-emerald-500"
            };
        case "yellow":
            return {
                bg: "bg-amber-500",
                border: "border-amber-200",
                text: "text-amber-700",
                dot: "bg-amber-500"
            };
        case "red":
            return {
                bg: "bg-red-500",
                border: "border-red-200",
                text: "text-red-700",
                dot: "bg-red-500"
            };
    }
}
const HEALTH_DIMENSIONS = [
    {
        id: "cardiovascular",
        label: "Cardiovascular Health",
        shortLabel: "Cardio",
        description: "Heart and vascular health, blood pressure, lipid profile",
        helpText: "Integrates hypertension, LDL/HDL, APOE genotype, and cardiac history."
    },
    {
        id: "metabolic",
        label: "Metabolic Function",
        shortLabel: "Metabolic",
        description: "Glucose, insulin resistance, metabolic syndrome markers",
        helpText: "Includes HbA1c, fasting glucose, BMI-related factors."
    },
    {
        id: "cancer_risk",
        label: "Cancer Risk",
        shortLabel: "Cancer",
        description: "Hereditary cancer syndromes, tumor markers, surveillance",
        helpText: "BRCA1/2, Lynch syndrome, polygenic risk, and tumor markers."
    },
    {
        id: "neurological",
        label: "Neurological Health",
        shortLabel: "Neuro",
        description: "Cognitive risk, Alzheimer disease, stroke risk",
        helpText: "APOE genotype, cognitive screening, neurological history."
    },
    {
        id: "immune",
        label: "Immune Function",
        shortLabel: "Immune",
        description: "Immunocompetence, autoimmune markers, infection risk",
        helpText: "WBC, inflammatory markers, immunosuppression status."
    },
    {
        id: "renal",
        label: "Renal Function",
        shortLabel: "Renal",
        description: "Kidney function, eGFR, proteinuria",
        helpText: "eGFR, creatinine, BUN, albuminuria."
    },
    {
        id: "hepatic",
        label: "Hepatic Function",
        shortLabel: "Hepatic",
        description: "Liver enzymes, synthetic function",
        helpText: "ALT, AST, bilirubin, albumin."
    },
    {
        id: "respiratory",
        label: "Respiratory Health",
        shortLabel: "Respiratory",
        description: "Lung function, oxygenation, chronic lung disease",
        helpText: "SpO2, spirometry, COPD/asthma history."
    },
    {
        id: "hematologic",
        label: "Hematologic Function",
        shortLabel: "Hematologic",
        description: "Blood counts, coagulation, anemia",
        helpText: "CBC, hemoglobin, platelets, coagulation studies."
    },
    {
        id: "endocrine",
        label: "Endocrine Function",
        shortLabel: "Endocrine",
        description: "Thyroid, adrenal, bone metabolism",
        helpText: "TSH, calcium, vitamin D, bone markers."
    },
    {
        id: "gastrointestinal",
        label: "Gastrointestinal Health",
        shortLabel: "GI",
        description: "Digestive function, GI cancer risk",
        helpText: "Colonoscopy history, Lynch risk, GI symptoms."
    },
    {
        id: "musculoskeletal",
        label: "Musculoskeletal Health",
        shortLabel: "MSK",
        description: "Bone density, arthritis, mobility",
        helpText: "DEXA, fracture history, joint function."
    },
    {
        id: "dermatologic",
        label: "Dermatologic Health",
        shortLabel: "Derm",
        description: "Skin cancer risk, dermatologic conditions",
        helpText: "Melanoma risk, BCC/SCC history, skin exams."
    },
    {
        id: "mental_health",
        label: "Mental Health",
        shortLabel: "Mental",
        description: "Depression, anxiety, psychosocial factors",
        helpText: "PHQ-9, GAD-7, substance use, social determinants."
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/components/ui/Tooltip.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tooltip",
    ()=>Tooltip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
function Tooltip({ content, children, placement = "top" }) {
    _s();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "relative inline-flex",
        onMouseEnter: ()=>setVisible(true),
        onMouseLeave: ()=>setVisible(false),
        children: [
            children,
            visible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `absolute z-50 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg whitespace-normal max-w-[220px] ${placement === "top" ? "bottom-full left-1/2 -translate-x-1/2 mb-2" : "top-full left-1/2 -translate-x-1/2 mt-2"}`,
                children: content
            }, void 0, false, {
                fileName: "[project]/health_ai/components/ui/Tooltip.tsx",
                lineNumber: 20,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health_ai/components/ui/Tooltip.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_s(Tooltip, "OGsIWlGlwYpVUqIrDReJ1GWx7rw=");
_c = Tooltip;
var _c;
__turbopack_context__.k.register(_c, "Tooltip");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/components/dashboard/HealthDimensionCard.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HealthDimensionCard",
    ()=>HealthDimensionCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$types$2f$dashboard$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/types/dashboard.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronRightIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/ChevronRightIcon.js [client] (ecmascript) <export default as ChevronRightIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$InformationCircleIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InformationCircleIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/InformationCircleIcon.js [client] (ecmascript) <export default as InformationCircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/ui/Tooltip.tsx [client] (ecmascript)");
"use client";
;
;
;
;
function HealthDimensionCard({ dimension, onDrillDown, "aria-label": ariaLabel }) {
    const label = __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$types$2f$dashboard$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["DIMENSION_LABELS"][dimension.dimensionId];
    const { bg, border, text, dot } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$types$2f$dashboard$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getStatusColor"])(dimension.status);
    const scorePercent = Math.round(dimension.score * 100);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: `
        group relative rounded-xl border-2 bg-white p-4 shadow-sm
        transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2
        print:break-inside-avoid
        ${border}
      `,
        "aria-label": ariaLabel ?? `Health dimension: ${label}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-start justify-between gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex min-w-0 flex-1 items-start gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `mt-1 h-3 w-3 shrink-0 rounded-full ${dot}`,
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0 flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-semibold text-slate-900 truncate",
                                    children: label
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                                    lineNumber: 47,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-2 flex-1 min-w-[60px] rounded-full bg-slate-200",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `h-2 rounded-full transition-all ${bg}`,
                                                style: {
                                                    width: `${scorePercent}%`
                                                },
                                                role: "progressbar",
                                                "aria-valuenow": scorePercent,
                                                "aria-valuemin": 0,
                                                "aria-valuemax": 100,
                                                "aria-label": `${label} score: ${scorePercent}%`
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                                                lineNumber: 52,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                                            lineNumber: 51,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `text-xs font-medium tabular-nums ${text}`,
                                            children: [
                                                scorePercent,
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                                            lineNumber: 62,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                                    lineNumber: 50,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex shrink-0 items-center gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                            content: dimension.summary,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500",
                                "aria-label": `More info about ${label}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$InformationCircleIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InformationCircleIcon$3e$__["InformationCircleIcon"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                                    lineNumber: 76,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>onDrillDown(dimension.dimensionId),
                            className: "rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500",
                            "aria-label": `View details for ${label}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronRightIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__["ChevronRightIcon"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
            lineNumber: 40,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/health_ai/components/dashboard/HealthDimensionCard.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_c = HealthDimensionCard;
var _c;
__turbopack_context__.k.register(_c, "HealthDimensionCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/components/dashboard/DimensionDrillDown.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DimensionDrillDown",
    ()=>DimensionDrillDown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XMarkIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XMarkIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/XMarkIcon.js [client] (ecmascript) <export default as XMarkIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BeakerIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BeakerIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/BeakerIcon.js [client] (ecmascript) <export default as BeakerIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$DocumentTextIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DocumentTextIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/DocumentTextIcon.js [client] (ecmascript) <export default as DocumentTextIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LightBulbIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LightBulbIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/LightBulbIcon.js [client] (ecmascript) <export default as LightBulbIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/recharts/es6/chart/BarChart.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/recharts/es6/cartesian/Bar.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/recharts/es6/cartesian/XAxis.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/recharts/es6/cartesian/YAxis.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/recharts/es6/cartesian/CartesianGrid.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/recharts/es6/component/Tooltip.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/recharts/es6/component/ResponsiveContainer.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/recharts/es6/component/Cell.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$types$2f$dashboard$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/types/dashboard.ts [client] (ecmascript)");
"use client";
;
;
;
;
const CHART_COLORS = {
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444"
};
function DimensionDrillDown({ dimensionId, score, patient, insight, onClose }) {
    const label = __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$types$2f$dashboard$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["DIMENSION_LABELS"][dimensionId];
    const statusColor = __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$types$2f$dashboard$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["STATUS_COLORS"][score.status];
    const chartData = score.contributors.map((c)=>({
            name: c.label.length > 12 ? c.label.slice(0, 11) + "…" : c.label,
            fullName: c.label,
            value: Math.round(c.impact * 100),
            status: c.status
        }));
    const relevantVariants = patient.genomic.variants.filter((v)=>{
        const genes = [
            "BRCA1",
            "BRCA2",
            "APOE",
            "TPMT",
            "CYP2C19",
            "VKORC1"
        ];
        return genes.includes(v.geneSymbol);
    });
    const relevantConditions = score.contributors.length > 0 ? patient.medicalHistory.filter((c)=>score.contributors.some((co)=>co.source === "condition" && co.label.toLowerCase().includes(c.display.toLowerCase()))) : patient.medicalHistory.slice(0, 3);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 print:bg-white print:p-0",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "drilldown-title",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl print:shadow-none print:max-h-none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 print:static",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "h-3 w-3 rounded-full shrink-0",
                                    style: {
                                        backgroundColor: statusColor
                                    },
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 84,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    id: "drilldown-title",
                                    className: "text-lg font-semibold text-slate-900",
                                    children: label
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 89,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 print:hidden",
                            "aria-label": "Close",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XMarkIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XMarkIcon$3e$__["XMarkIcon"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-semibold text-slate-800 mb-2",
                                    children: "Summary"
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-600",
                                    children: score.summary
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-xs text-slate-500",
                                    children: [
                                        "Score: ",
                                        (score.score * 100).toFixed(0),
                                        "% · Status:",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "capitalize",
                                            children: score.status
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                            lineNumber: 114,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this),
                        chartData.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-semibold text-slate-800 mb-2",
                                    children: "Contributing factors"
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 121,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-48",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                        width: "100%",
                                        height: "100%",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$client$5d$__$28$ecmascript$29$__["BarChart"], {
                                            data: chartData,
                                            layout: "vertical",
                                            margin: {
                                                top: 0,
                                                right: 20,
                                                left: 0,
                                                bottom: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                    strokeDasharray: "3 3",
                                                    stroke: "#e2e8f0"
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                    type: "number",
                                                    domain: [
                                                        0,
                                                        100
                                                    ],
                                                    tickFormatter: (v)=>`${v}%`,
                                                    stroke: "#64748b",
                                                    fontSize: 11
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 132,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                    type: "category",
                                                    dataKey: "name",
                                                    width: 80,
                                                    stroke: "#64748b",
                                                    fontSize: 11,
                                                    tick: {
                                                        fill: "#475569"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 139,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                    formatter: (value)=>[
                                                            `${value}%`,
                                                            "Impact"
                                                        ],
                                                    labelFormatter: (_, payload)=>payload?.[0]?.payload?.fullName ?? "",
                                                    contentStyle: {
                                                        fontSize: "12px",
                                                        borderRadius: "8px",
                                                        border: "1px solid #e2e8f0"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 147,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Bar"], {
                                                    dataKey: "value",
                                                    radius: [
                                                        0,
                                                        4,
                                                        4,
                                                        0
                                                    ],
                                                    maxBarSize: 24,
                                                    children: chartData.map((entry, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Cell"], {
                                                            fill: entry.status === "green" ? CHART_COLORS.green : entry.status === "yellow" ? CHART_COLORS.yellow : CHART_COLORS.red
                                                        }, i, false, {
                                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                            lineNumber: 160,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                            lineNumber: 126,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                        lineNumber: 125,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 124,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 120,
                            columnNumber: 13
                        }, this),
                        relevantVariants.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BeakerIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BeakerIcon$3e$__["BeakerIcon"], {
                                            className: "h-4 w-4 text-brand-600"
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                            lineNumber: 182,
                                            columnNumber: 17
                                        }, this),
                                        "Genomic findings"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 181,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "space-y-2",
                                    children: relevantVariants.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "rounded-lg border border-slate-200 px-3 py-2 text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-semibold text-slate-900",
                                                    children: [
                                                        v.geneSymbol,
                                                        " ",
                                                        v.codingChange
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "ml-2 text-slate-600",
                                                    children: v.acmgClassification ?? v.clinVarSignificance ?? "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 194,
                                                    columnNumber: 21
                                                }, this),
                                                v.proteinChange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "ml-2 text-slate-500",
                                                    children: [
                                                        "· ",
                                                        v.proteinChange
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 198,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, v.id, true, {
                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                            lineNumber: 187,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 185,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 180,
                            columnNumber: 13
                        }, this),
                        relevantConditions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$DocumentTextIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DocumentTextIcon$3e$__["DocumentTextIcon"], {
                                            className: "h-4 w-4 text-brand-600"
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                            lineNumber: 212,
                                            columnNumber: 17
                                        }, this),
                                        "Clinical conditions"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 211,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "space-y-1",
                                    children: relevantConditions.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "text-sm text-slate-600",
                                            children: [
                                                c.display,
                                                " (",
                                                c.code,
                                                ")"
                                            ]
                                        }, c.id, true, {
                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                            lineNumber: 217,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 215,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 210,
                            columnNumber: 13
                        }, this),
                        insight && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "rounded-lg border border-brand-200 bg-brand-50/50 p-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LightBulbIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LightBulbIcon$3e$__["LightBulbIcon"], {
                                            className: "h-4 w-4 text-brand-600"
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                            lineNumber: 232,
                                            columnNumber: 17
                                        }, this),
                                        "AI-generated insight"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 231,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-700",
                                    children: insight.text
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 235,
                                    columnNumber: 15
                                }, this),
                                insight.recommendation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-sm font-medium text-brand-700",
                                    children: [
                                        "Recommendation: ",
                                        insight.recommendation
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 237,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 230,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border-t border-slate-200 px-4 py-3 text-xs text-slate-500 print:border-t",
                    children: [
                        "Patient: ",
                        patient.demographics.givenName,
                        " ",
                        patient.demographics.familyName,
                        " · MRN:",
                        " ",
                        patient.demographics.patientId,
                        " · For clinical use only."
                    ]
                }, void 0, true, {
                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                    lineNumber: 245,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
            lineNumber: 81,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
_c = DimensionDrillDown;
var _c;
__turbopack_context__.k.register(_c, "DimensionDrillDown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/components/dashboard/SynopticDashboard.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SynopticDashboard",
    ()=>SynopticDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$usePatients$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/lib/usePatients.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$dashboardData$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/lib/dashboardData.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$HealthDimensionCard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/dashboard/HealthDimensionCard.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$DimensionDrillDown$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/dashboard/DimensionDrillDown.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$MagnifyingGlassIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MagnifyingGlassIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/MagnifyingGlassIcon.js [client] (ecmascript) <export default as MagnifyingGlassIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CalendarIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/CalendarIcon.js [client] (ecmascript) <export default as CalendarIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserCircleIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircleIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/UserCircleIcon.js [client] (ecmascript) <export default as UserCircleIcon>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function SynopticDashboard() {
    _s();
    const { data: patients, loading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$usePatients$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["usePatients"])();
    const [selectedPatientId, setSelectedPatientId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [drillDownDimension, setDrillDownDimension] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [dateRange, setDateRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("90d");
    const selectedPatient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SynopticDashboard.useMemo[selectedPatient]": ()=>{
            if (!patients) return null;
            if (selectedPatientId) return patients.find({
                "SynopticDashboard.useMemo[selectedPatient]": (p)=>p.demographics.patientId === selectedPatientId
            }["SynopticDashboard.useMemo[selectedPatient]"]) ?? null;
            return patients[0] ?? null;
        }
    }["SynopticDashboard.useMemo[selectedPatient]"], [
        patients,
        selectedPatientId
    ]);
    const filteredPatients = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SynopticDashboard.useMemo[filteredPatients]": ()=>{
            if (!patients) return [];
            if (!searchQuery.trim()) return patients;
            const q = searchQuery.toLowerCase();
            return patients.filter({
                "SynopticDashboard.useMemo[filteredPatients]": (p)=>p.demographics.givenName.toLowerCase().includes(q) || p.demographics.familyName.toLowerCase().includes(q) || p.demographics.patientId.toLowerCase().includes(q)
            }["SynopticDashboard.useMemo[filteredPatients]"]);
        }
    }["SynopticDashboard.useMemo[filteredPatients]"], [
        patients,
        searchQuery
    ]);
    const dimensionScores = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SynopticDashboard.useMemo[dimensionScores]": ()=>{
            if (!selectedPatient) return [];
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$dashboardData$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["computeDimensionScores"])(selectedPatient);
        }
    }["SynopticDashboard.useMemo[dimensionScores]"], [
        selectedPatient
    ]);
    const drillDownData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SynopticDashboard.useMemo[drillDownData]": ()=>{
            if (!drillDownDimension || !selectedPatient) return null;
            const score = dimensionScores.find({
                "SynopticDashboard.useMemo[drillDownData].score": (s)=>s.dimensionId === drillDownDimension
            }["SynopticDashboard.useMemo[drillDownData].score"]);
            if (!score) return null;
            return {
                patient: selectedPatient,
                score
            };
        }
    }["SynopticDashboard.useMemo[drillDownData]"], [
        drillDownDimension,
        selectedPatient,
        dimensionScores
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-6 print:hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-12 w-64 rounded-lg bg-slate-200 animate-pulse"
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3",
                    children: Array.from({
                        length: 14
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-28 rounded-xl bg-slate-200 animate-pulse"
                        }, i, false, {
                            fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                            lineNumber: 63,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this);
    }
    if (error || !patients?.length) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-semibold mb-1",
                    children: "Unable to load dashboard data"
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: error ?? "No patient data available."
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
            lineNumber: 75,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row gap-4 print:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$MagnifyingGlassIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MagnifyingGlassIcon$3e$__["MagnifyingGlassIcon"], {
                                className: "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "search",
                                placeholder: "Search patients by name or ID...",
                                value: searchQuery,
                                onChange: (e)=>setSearchQuery(e.target.value),
                                className: "w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                                "aria-label": "Search patients"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CalendarIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarIcon$3e$__["CalendarIcon"], {
                                className: "h-5 w-5 text-slate-500",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: dateRange,
                                onChange: (e)=>setDateRange(e.target.value),
                                className: "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500",
                                "aria-label": "Date range for data",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "7d",
                                        children: "Last 7 days"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                        lineNumber: 107,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "30d",
                                        children: "Last 30 days"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                        lineNumber: 108,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "90d",
                                        children: "Last 90 days"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                        lineNumber: 109,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: "All time"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                        lineNumber: 110,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                lineNumber: 99,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-3 print:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserCircleIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircleIcon$3e$__["UserCircleIcon"], {
                        className: "h-5 w-5 text-slate-500",
                        "aria-hidden": true
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-medium text-slate-700",
                        children: "Selected patient:"
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedPatient?.demographics.patientId ?? "",
                        onChange: (e)=>setSelectedPatientId(e.target.value || null),
                        className: "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-brand-500",
                        "aria-label": "Select patient",
                        children: filteredPatients.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: p.demographics.patientId,
                                children: [
                                    p.demographics.givenName,
                                    " ",
                                    p.demographics.familyName,
                                    " (",
                                    p.demographics.patientId,
                                    ")"
                                ]
                            }, p.demographics.patientId, true, {
                                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl bg-white p-4 shadow-sm border border-slate-200 print:shadow-none print:border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-slate-800 mb-2",
                        children: "Synoptic health overview"
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg font-semibold text-slate-900",
                        children: [
                            selectedPatient?.demographics.givenName,
                            " ",
                            selectedPatient?.demographics.familyName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-slate-600",
                        children: [
                            "ID ",
                            selectedPatient?.demographics.patientId,
                            " • DOB",
                            " ",
                            selectedPatient?.demographics.dateOfBirth,
                            " •",
                            " ",
                            selectedPatient?.demographics.sex.toUpperCase()
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-500 mt-1",
                        children: [
                            "Data range: ",
                            dateRange === "all" ? "All time" : `Last ${dateRange.replace("d", "")} days`,
                            " • Generated for clinical review (mock)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3",
                role: "list",
                "aria-label": "Health dimension status cards",
                children: dimensionScores.map((score)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$HealthDimensionCard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["HealthDimensionCard"], {
                        dimension: score,
                        onDrillDown: ()=>setDrillDownDimension(score.dimensionId)
                    }, score.dimensionId, false, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 167,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-4 text-xs text-slate-600 print:mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-block h-3 w-3 rounded-full bg-emerald-500",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this),
                            "Normal / low risk"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-block h-3 w-3 rounded-full bg-amber-500",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                lineNumber: 185,
                                columnNumber: 11
                            }, this),
                            "Monitor / moderate"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-block h-3 w-3 rounded-full bg-red-500",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this),
                            "Action needed / high risk"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            drillDownData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$DimensionDrillDown$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DimensionDrillDown"], {
                dimensionId: drillDownData.score.dimensionId,
                score: drillDownData.score,
                patient: drillDownData.patient,
                insight: drillDownData.score.aiRecommendation ? {
                    text: drillDownData.score.aiRecommendation,
                    recommendation: undefined
                } : null,
                onClose: ()=>setDrillDownDimension(null)
            }, void 0, false, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 202,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_s(SynopticDashboard, "FJXpsze4mzIy7wHL/MkYuH96Gcw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$usePatients$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["usePatients"]
    ];
});
_c = SynopticDashboard;
var _c;
__turbopack_context__.k.register(_c, "SynopticDashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/lib/ai/riskScoring.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeBaselineRiskScores",
    ()=>computeBaselineRiskScores,
    "recomputeRiskScores",
    ()=>recomputeRiskScores
]);
function getLatestLab(patient, testName) {
    const labs = patient.labResults.filter((l)=>l.testName === testName).sort((a, b)=>new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());
    const latest = labs[0];
    return typeof latest?.value === "number" ? latest.value : undefined;
}
function computeBaselineRiskScores(patient) {
    const { genomic, medicalHistory } = patient;
    const hasBrac1Pathogenic = genomic.variants.some((v)=>v.geneSymbol === "BRCA1" && (v.acmgClassification === "pathogenic" || v.acmgClassification === "likely_pathogenic" || v.clinVarSignificance === "pathogenic" || v.clinVarSignificance === "likely_pathogenic"));
    const hasApoE4 = genomic.variants.some((v)=>v.geneSymbol === "APOE" && typeof v.proteinChange === "string" && v.proteinChange.toLowerCase().includes("e4"));
    const hasHypertension = medicalHistory.some((c)=>c.code === "I10");
    const ldl = getLatestLab(patient, "LDL cholesterol");
    const breastCancerRisk = hasBrac1Pathogenic ? 0.85 : 0.25;
    let cardioRisk = 0.15;
    if (hasHypertension) cardioRisk += 0.15;
    if (typeof ldl === "number" && ldl > 130) cardioRisk += 0.1;
    if (hasApoE4) cardioRisk += 0.1;
    cardioRisk = Math.min(1, cardioRisk);
    const alzRisk = hasApoE4 ? 0.35 : 0.1;
    const scores = [
        {
            id: `${patient.demographics.patientId}-breast`,
            name: "Breast cancer genomic risk",
            score: breastCancerRisk,
            interpretation: hasBrac1Pathogenic ? "High risk driven by pathogenic BRCA1 variant; consider enhanced surveillance and PARP eligibility." : "Baseline population-level breast cancer risk."
        },
        {
            id: `${patient.demographics.patientId}-cardio`,
            name: "10-year cardiovascular risk (integrated)",
            score: cardioRisk,
            interpretation: "Composite cardiovascular risk derived from hypertension history, LDL values, and APOE-related risk."
        },
        {
            id: `${patient.demographics.patientId}-alz`,
            name: "Alzheimer disease genomic risk",
            score: alzRisk,
            interpretation: hasApoE4 ? "Elevated Alzheimer disease risk associated with APOE e4 genotype." : "Baseline population-level Alzheimer disease risk."
        }
    ];
    return scores;
}
async function recomputeRiskScores(patient) {
    await new Promise((resolve)=>setTimeout(resolve, 600));
    const baseline = computeBaselineRiskScores(patient);
    return baseline.map((score)=>{
        const jitter = (Math.random() - 0.5) * 0.05;
        const adjusted = Math.max(0, Math.min(1, score.score + jitter));
        return {
            ...score,
            score: adjusted,
            interpretation: `${score.interpretation} (recomputed by mock model)`
        };
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClinicalDocumentationPanel",
    ()=>ClinicalDocumentationPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$DocumentTextIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DocumentTextIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/DocumentTextIcon.js [client] (ecmascript) <export default as DocumentTextIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClipboardDocumentCheckIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardDocumentCheckIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/ClipboardDocumentCheckIcon.js [client] (ecmascript) <export default as ClipboardDocumentCheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$FlagIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlagIcon$3e$__ = __turbopack_context__.i("[project]/health_ai/node_modules/@heroicons/react/24/outline/esm/FlagIcon.js [client] (ecmascript) <export default as FlagIcon>");
;
;
function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}
function priorityColor(priority) {
    switch(priority){
        case "high":
            return "bg-amber-100 text-amber-800";
        case "medium":
            return "bg-slate-100 text-slate-700";
        default:
            return "bg-slate-50 text-slate-600";
    }
}
function statusColor(status) {
    switch(status){
        case "completed":
            return "bg-emerald-100 text-emerald-800";
        case "in_progress":
            return "bg-blue-100 text-blue-800";
        default:
            return "bg-slate-100 text-slate-700";
    }
}
function ClinicalDocumentationPanel({ patient }) {
    const { clinicalNotes, treatmentPlans, followUpRecommendations } = patient;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-base font-semibold text-slate-800 border-b border-slate-200 pb-2",
                children: "Clinical documentation"
            }, void 0, false, {
                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-6 md:grid-cols-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-white p-4 shadow-sm border border-slate-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$DocumentTextIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DocumentTextIcon$3e$__["DocumentTextIcon"], {
                                        className: "h-5 w-5 text-slate-500"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                        lineNumber: 56,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold text-slate-800",
                                        children: "Clinical notes"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                        lineNumber: 57,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this),
                            clinicalNotes.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-500",
                                children: "No notes on file."
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-3",
                                children: clinicalNotes.map((note)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "rounded-lg border border-slate-200 px-3 py-2 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-medium text-slate-900",
                                                children: note.title
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 70,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-slate-600",
                                                children: note.summary
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 71,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 flex flex-wrap items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 uppercase",
                                                        children: note.noteType.replace("_", " ")
                                                    }, void 0, false, {
                                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                        lineNumber: 73,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-400",
                                                        children: [
                                                            formatDate(note.createdAt),
                                                            " · ",
                                                            note.authorRole
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                        lineNumber: 76,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 72,
                                                columnNumber: 19
                                            }, this),
                                            note.tags && note.tags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 flex flex-wrap gap-1",
                                                children: note.tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700",
                                                        children: tag
                                                    }, tag, false, {
                                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                        lineNumber: 83,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 81,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, note.id, true, {
                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                        lineNumber: 66,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                lineNumber: 64,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-white p-4 shadow-sm border border-slate-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClipboardDocumentCheckIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardDocumentCheckIcon$3e$__["ClipboardDocumentCheckIcon"], {
                                        className: "h-5 w-5 text-slate-500"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                        lineNumber: 101,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold text-slate-800",
                                        children: "Treatment plans"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                        lineNumber: 102,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                lineNumber: 100,
                                columnNumber: 11
                            }, this),
                            treatmentPlans.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-500",
                                children: "No active plans."
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                lineNumber: 107,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-3",
                                children: treatmentPlans.map((plan)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "rounded-lg border border-slate-200 px-3 py-2 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-medium text-slate-900 mb-1",
                                                children: "Goals"
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 115,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: "list-disc list-inside text-slate-600 space-y-0.5",
                                                children: plan.goals.map((g, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: g
                                                    }, i, false, {
                                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                        lineNumber: 118,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 116,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-medium text-slate-900 mt-2 mb-0.5",
                                                children: "Planned medications"
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 121,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-slate-600",
                                                children: plan.plannedMedications.join(", ")
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 124,
                                                columnNumber: 19
                                            }, this),
                                            plan.genomicConsiderations && plan.genomicConsiderations.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-medium text-slate-900 mt-2 mb-0.5",
                                                        children: "Genomic considerations"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                        lineNumber: 130,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                        className: "list-disc list-inside text-slate-600 space-y-0.5",
                                                        children: plan.genomicConsiderations.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                children: c
                                                            }, i, false, {
                                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                                lineNumber: 135,
                                                                columnNumber: 29
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                        lineNumber: 133,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true),
                                            plan.followUpIntervalMonths != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-2 text-slate-500",
                                                children: [
                                                    "Follow-up every ",
                                                    plan.followUpIntervalMonths,
                                                    " month",
                                                    plan.followUpIntervalMonths !== 1 ? "s" : ""
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 141,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-slate-400",
                                                children: [
                                                    "Updated ",
                                                    formatDate(plan.updatedAt ?? plan.createdAt)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 146,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, plan.id, true, {
                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                        lineNumber: 111,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-white p-4 shadow-sm border border-slate-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$FlagIcon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlagIcon$3e$__["FlagIcon"], {
                                        className: "h-5 w-5 text-slate-500"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                        lineNumber: 158,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold text-slate-800",
                                        children: "Follow-up recommendations"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                        lineNumber: 159,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this),
                            followUpRecommendations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-500",
                                children: "No open recommendations."
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-3",
                                children: followUpRecommendations.map((rec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "rounded-lg border border-slate-200 px-3 py-2 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-slate-900",
                                                children: rec.recommendationText
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 172,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 flex flex-wrap items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `rounded px-2 py-0.5 text-[10px] font-medium ${priorityColor(rec.priority)}`,
                                                        children: rec.priority
                                                    }, void 0, false, {
                                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                        lineNumber: 174,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `rounded px-2 py-0.5 text-[10px] font-medium ${statusColor(rec.status)}`,
                                                        children: rec.status.replace("_", " ")
                                                    }, void 0, false, {
                                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                        lineNumber: 179,
                                                        columnNumber: 21
                                                    }, this),
                                                    rec.dueDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-500",
                                                        children: [
                                                            "Due ",
                                                            formatDate(rec.dueDate)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                        lineNumber: 185,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                                lineNumber: 173,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, rec.id, true, {
                                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                        lineNumber: 168,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_c = ClinicalDocumentationPanel;
var _c;
__turbopack_context__.k.register(_c, "ClinicalDocumentationPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/components/patients/PatientOverview.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PatientOverview",
    ()=>PatientOverview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$usePatients$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/lib/usePatients.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$ai$2f$riskScoring$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/lib/ai/riskScoring.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$patients$2f$ClinicalDocumentationPanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/patients/ClinicalDocumentationPanel.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function PatientOverview() {
    _s();
    const { data, loading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$usePatients$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["usePatients"])();
    const [recomputing, setRecomputing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [recomputeError, setRecomputeError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [updatedRiskScores, setUpdatedRiskScores] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({});
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid gap-4 md:grid-cols-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "col-span-2 h-40 rounded-xl bg-slate-200 animate-pulse"
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-40 rounded-xl bg-slate-200 animate-pulse"
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                    lineNumber: 19,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-56 rounded-xl bg-slate-200 animate-pulse"
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-56 rounded-xl bg-slate-200 animate-pulse"
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this);
    }
    if (error || !data) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-semibold mb-1",
                    children: "Unable to load patient data"
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: error ?? "Unknown error occurred."
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this);
    }
    const [firstPatient] = data;
    const riskScores = updatedRiskScores[firstPatient.demographics.patientId] ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$ai$2f$riskScoring$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["computeBaselineRiskScores"])(firstPatient);
    async function handleRecomputeRisk() {
        setRecomputing(true);
        setRecomputeError(null);
        try {
            const res = await fetch(`/api/patients/${firstPatient.demographics.patientId}/recompute-risk`, {
                method: "POST"
            });
            if (!res.ok) {
                let message = "Failed to recompute risk scores";
                try {
                    const body = await res.json();
                    if (body?.error) message = body.error;
                } catch  {
                // ignore
                }
                throw new Error(message);
            }
            const body = await res.json();
            setUpdatedRiskScores((prev)=>({
                    ...prev,
                    [firstPatient.demographics.patientId]: body.riskScores
                }));
        } catch (err) {
            setRecomputeError(err instanceof Error ? err.message : "Unknown error during recompute");
        } finally{
            setRecomputing(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "grid gap-4 md:grid-cols-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-span-2 rounded-xl bg-white p-4 shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-sm font-semibold text-slate-800 mb-2",
                                            children: "Patient summary"
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 80,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-lg font-semibold text-slate-900",
                                            children: [
                                                firstPatient.demographics.givenName,
                                                " ",
                                                firstPatient.demographics.familyName
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 83,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-slate-600",
                                            children: [
                                                "ID ",
                                                firstPatient.demographics.patientId,
                                                " • DOB",
                                                " ",
                                                firstPatient.demographics.dateOfBirth,
                                                " •",
                                                " ",
                                                firstPatient.demographics.sex.toUpperCase()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 87,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-xs text-slate-500",
                                            children: "Synthetic data for development only – not real PHI."
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 92,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                    lineNumber: 79,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-end gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleRecomputeRisk,
                                            disabled: recomputing,
                                            className: "rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-500 disabled:opacity-60",
                                            children: recomputing ? "Recomputing…" : "Recompute risk (mock AI)"
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 97,
                                            columnNumber: 15
                                        }, this),
                                        recomputeError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] text-red-600 text-right max-w-xs",
                                            children: recomputeError
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 105,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                    lineNumber: 96,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-white p-4 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold text-slate-800 mb-2",
                                children: "Genomic risk snapshot"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this),
                            riskScores.map((rs)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-3 last:mb-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-medium text-slate-700",
                                            children: rs.name
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 119,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-1 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 h-2 rounded-full bg-slate-200",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-2 rounded-full bg-brand-500",
                                                        style: {
                                                            width: `${rs.score * 100}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-mono text-slate-700",
                                                    children: [
                                                        (rs.score * 100).toFixed(0),
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                    lineNumber: 127,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 120,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-xs text-slate-500",
                                            children: rs.interpretation
                                        }, void 0, false, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 131,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, rs.id, true, {
                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "grid gap-4 md:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-white p-4 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold text-slate-800 mb-3",
                                children: "Pathogenic variants"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-2",
                                children: firstPatient.genomic.variants.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "rounded-lg border border-slate-200 px-3 py-2 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-semibold text-slate-900",
                                                        children: [
                                                            v.geneSymbol,
                                                            " ",
                                                            v.codingChange
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                        lineNumber: 151,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 uppercase",
                                                        children: v.acmgClassification ?? v.clinVarSignificance ?? "vus"
                                                    }, void 0, false, {
                                                        fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                        lineNumber: 154,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                lineNumber: 150,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-slate-600",
                                                children: v.proteinChange
                                            }, void 0, false, {
                                                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                lineNumber: 158,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, v.id, true, {
                                        fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                        lineNumber: 146,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-white p-4 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold text-slate-800 mb-3",
                                children: "Medical history & recent labs"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                lineNumber: 167,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-2",
                                children: [
                                    firstPatient.medicalHistory.map((cond)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "rounded-lg border border-slate-200 px-3 py-2 text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-medium text-slate-900",
                                                            children: cond.display
                                                        }, void 0, false, {
                                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                            lineNumber: 177,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase",
                                                            children: cond.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                            lineNumber: 180,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                    lineNumber: 176,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-slate-500",
                                                    children: [
                                                        "Code ",
                                                        cond.code,
                                                        " (",
                                                        cond.codeSystem,
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                    lineNumber: 184,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, cond.id, true, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 172,
                                            columnNumber: 15
                                        }, this)),
                                    firstPatient.labResults.map((lab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "rounded-lg border border-slate-200 px-3 py-2 text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-medium text-slate-900",
                                                            children: lab.testName
                                                        }, void 0, false, {
                                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                            lineNumber: 195,
                                                            columnNumber: 19
                                                        }, this),
                                                        lab.flag && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase",
                                                            children: lab.flag
                                                        }, void 0, false, {
                                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                            lineNumber: 199,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                    lineNumber: 194,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-slate-500",
                                                    children: [
                                                        new Date(lab.collectedAt).toLocaleDateString(),
                                                        " •",
                                                        " ",
                                                        lab.loincCode ?? "no LOINC"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                    lineNumber: 204,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-slate-600",
                                                    children: [
                                                        "Value: ",
                                                        lab.value,
                                                        " ",
                                                        lab.unit ?? ""
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                                    lineNumber: 208,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, lab.id, true, {
                                            fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                            lineNumber: 190,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                                lineNumber: 170,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$patients$2f$ClinicalDocumentationPanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ClinicalDocumentationPanel"], {
                patient: firstPatient
            }, void 0, false, {
                fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
                lineNumber: 217,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health_ai/components/patients/PatientOverview.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
_s(PatientOverview, "dz9K+sRz308ALWPvbf4DWAAbEbo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$usePatients$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["usePatients"]
    ];
});
_c = PatientOverview;
var _c;
__turbopack_context__.k.register(_c, "PatientOverview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/health_ai/pages/index.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__N_SSP",
    ()=>__N_SSP,
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$DashboardLayout$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/layout/DashboardLayout.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$SynopticDashboard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/dashboard/SynopticDashboard.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$patients$2f$PatientOverview$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/patients/PatientOverview.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
var __N_SSP = true;
function Home() {
    _s();
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("synoptic");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$DashboardLayout$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DashboardLayout"], {
        wide: view === "synoptic",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between gap-4 flex-wrap",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex rounded-lg border border-slate-200 bg-white p-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setView("synoptic"),
                                className: `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${view === "synoptic" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`,
                                children: "Synoptic"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/pages/index.tsx",
                                lineNumber: 17,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setView("detailed"),
                                className: `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${view === "detailed" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`,
                                children: "Detailed"
                            }, void 0, false, {
                                fileName: "[project]/health_ai/pages/index.tsx",
                                lineNumber: 27,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/pages/index.tsx",
                        lineNumber: 16,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/health_ai/pages/index.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this),
                view === "synoptic" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$SynopticDashboard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["SynopticDashboard"], {}, void 0, false, {
                    fileName: "[project]/health_ai/pages/index.tsx",
                    lineNumber: 39,
                    columnNumber: 32
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$patients$2f$PatientOverview$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["PatientOverview"], {}, void 0, false, {
                    fileName: "[project]/health_ai/pages/index.tsx",
                    lineNumber: 39,
                    columnNumber: 56
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/pages/index.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/health_ai/pages/index.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_s(Home, "ErwYYgruhFH3zJJU5rDkso56N1A=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/health_ai/pages/index.tsx [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/health_ai/pages/index.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/health_ai/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/health_ai/pages/index.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__4daf8553._.js.map