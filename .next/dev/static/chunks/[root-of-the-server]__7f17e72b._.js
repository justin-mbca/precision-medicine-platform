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
function DashboardLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex bg-slate-100",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Sidebar"], {}, void 0, false, {
                fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$Header$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Header"], {}, void 0, false, {
                        fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                        lineNumber: 14,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 p-4 md:p-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto max-w-6xl",
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                            lineNumber: 16,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health_ai/components/layout/DashboardLayout.tsx",
        lineNumber: 11,
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
/** Inverse: higher is better (e.g. renal function). */ function statusFromScoreInverse(score) {
    if (score >= 0.66) return "green";
    if (score >= 0.33) return "yellow";
    return "red";
}
function computeDimensionScores(patient) {
    const { genomic, medicalHistory, labResults } = patient;
    const patientId = patient.demographics.patientId;
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
    const ca125 = getLatestLab(patient, "CA-125");
    const dimensions = [
        {
            id: "cardiovascular",
            patientId,
            score: (()=>{
                let s = 0.2;
                if (hasHypertension) s += 0.25;
                if (typeof ldl === "number" && ldl > 130) s += 0.2;
                if (hasApoE4) s += 0.15;
                return Math.min(1, s);
            })(),
            status: statusFromScore((()=>{
                let s = 0.2;
                if (hasHypertension) s += 0.25;
                if (typeof ldl === "number" && ldl > 130) s += 0.2;
                if (hasApoE4) s += 0.15;
                return Math.min(1, s);
            })()),
            summary: hasHypertension ? "Hypertension present; LDL and APOE genotype contribute to cardiovascular risk." : "No major cardiovascular risk factors identified.",
            genomicFindings: hasApoE4 ? genomic.variants.filter((v)=>v.geneSymbol === "APOE") : [],
            clinicalData: medicalHistory.filter((c)=>c.code === "I10" || c.display?.toLowerCase().includes("heart")).concat(labResults.filter((l)=>l.testName?.toLowerCase().includes("ldl"))),
            aiInsight: hasApoE4 && typeof ldl === "number" && ldl > 130 ? "APOE e4 genotype and elevated LDL support aggressive lipid management per guidelines." : null
        },
        {
            id: "metabolic",
            patientId,
            score: (()=>{
                let s = 0.15;
                if (hasDiabetes) s += 0.4;
                if (typeof hba1c === "number" && hba1c > 6.5) s += 0.35;
                return Math.min(1, s);
            })(),
            status: statusFromScore(hasDiabetes || typeof hba1c === "number" && hba1c > 6.5 ? 0.7 : 0.2),
            summary: hasDiabetes ? "Diabetes documented; metabolic parameters require monitoring." : "No significant metabolic dysfunction identified.",
            genomicFindings: [],
            clinicalData: medicalHistory.filter((c)=>c.display?.toLowerCase().includes("diabetes") || c.display?.toLowerCase().includes("metabolic")).concat(labResults.filter((l)=>l.testName?.toLowerCase().includes("hba1c") || l.testName?.toLowerCase().includes("glucose"))),
            aiInsight: null
        },
        {
            id: "cancer",
            patientId,
            score: hasBrac1Pathogenic ? 0.88 : hasCancerHistory ? 0.6 : 0.25,
            status: statusFromScore(hasBrac1Pathogenic ? 0.88 : hasCancerHistory ? 0.6 : 0.25),
            summary: hasBrac1Pathogenic ? "Pathogenic BRCA1 variant confers high hereditary cancer risk." : hasCancerHistory ? "Cancer history present; ongoing surveillance recommended." : "Baseline cancer risk; no high-penetrance variants identified.",
            genomicFindings: genomic.variants.filter((v)=>v.geneSymbol === "BRCA1" || v.geneSymbol === "BRCA2" || v.associatedDiseases?.some((d)=>d.toLowerCase().includes("cancer"))),
            clinicalData: medicalHistory.filter((c)=>c.display?.toLowerCase().includes("cancer") || c.display?.toLowerCase().includes("neoplasm")),
            aiInsight: hasBrac1Pathogenic ? "NCCN guidelines support enhanced breast/ovarian surveillance and PARP inhibitor eligibility discussion." : null
        },
        {
            id: "neurological",
            patientId,
            score: hasApoE4 ? 0.5 : 0.15,
            status: statusFromScore(hasApoE4 ? 0.5 : 0.15),
            summary: hasApoE4 ? "APOE e4 genotype associated with increased Alzheimer disease risk." : "No major neurological risk factors from genomic profile.",
            genomicFindings: genomic.variants.filter((v)=>v.geneSymbol === "APOE"),
            clinicalData: [],
            aiInsight: hasApoE4 ? "Consider cognitive screening and lifestyle interventions per AAN guidelines." : null
        },
        {
            id: "immune",
            patientId,
            score: (()=>{
                const wbcVal = typeof wbc === "number" ? wbc : 0;
                if (wbcVal < 4 || wbcVal > 11) return 0.55;
                return 0.2;
            })(),
            status: statusFromScoreInverse(typeof wbc === "number" && wbc >= 4 && wbc <= 11 ? 0.8 : 0.4),
            summary: typeof wbc === "number" && (wbc < 4 || wbc > 11) ? "WBC outside reference range; consider follow-up." : "Immune parameters within expected range.",
            genomicFindings: [],
            clinicalData: labResults.filter((l)=>l.testName?.toLowerCase().includes("wbc") || l.testName?.toLowerCase().includes("immune")),
            aiInsight: null
        },
        {
            id: "renal",
            patientId,
            score: (()=>{
                const cr = typeof creatinine === "number" ? creatinine : 0.9;
                const gfrEst = cr > 0 ? 140 / cr : 100;
                return gfrEst < 60 ? 0.7 : gfrEst < 90 ? 0.4 : 0.15;
            })(),
            status: statusFromScoreInverse((()=>{
                const cr = typeof creatinine === "number" ? creatinine : 0.9;
                const gfrEst = cr > 0 ? 140 / cr : 100;
                return gfrEst >= 90 ? 0.9 : gfrEst >= 60 ? 0.6 : 0.3;
            })()),
            summary: typeof creatinine === "number" && creatinine > 1.2 ? "Creatinine elevated; assess eGFR and kidney function." : "Renal function within expected range.",
            genomicFindings: [],
            clinicalData: labResults.filter((l)=>l.testName?.toLowerCase().includes("creatinine") || l.testName?.toLowerCase().includes("gfr")),
            aiInsight: null
        },
        {
            id: "hepatic",
            patientId,
            score: typeof alt === "number" && alt > 40 ? 0.6 : 0.2,
            status: statusFromScoreInverse(typeof alt === "number" && alt <= 40 ? 0.85 : 0.45),
            summary: typeof alt === "number" && alt > 40 ? "ALT elevated; consider hepatic workup." : "Hepatic enzymes within reference range.",
            genomicFindings: [],
            clinicalData: labResults.filter((l)=>l.testName?.toLowerCase().includes("alt") || l.testName?.toLowerCase().includes("ast") || l.testName?.toLowerCase().includes("liver")),
            aiInsight: null
        },
        {
            id: "respiratory",
            patientId,
            score: 0.2,
            status: "green",
            summary: "No respiratory conditions or abnormal findings in current data.",
            genomicFindings: [],
            clinicalData: [],
            aiInsight: null
        },
        {
            id: "hematologic",
            patientId,
            score: 0.25,
            status: "green",
            summary: "Hematologic parameters within expected range.",
            genomicFindings: [],
            clinicalData: labResults.filter((l)=>l.testName?.toLowerCase().includes("hemoglobin") || l.testName?.toLowerCase().includes("platelet") || l.testName?.toLowerCase().includes("cbc")),
            aiInsight: null
        },
        {
            id: "endocrine",
            patientId,
            score: hasDiabetes ? 0.55 : 0.2,
            status: statusFromScore(hasDiabetes ? 0.55 : 0.2),
            summary: hasDiabetes ? "Endocrine disorder (diabetes) documented." : "No significant endocrine dysfunction identified.",
            genomicFindings: [],
            clinicalData: medicalHistory.filter((c)=>c.display?.toLowerCase().includes("diabetes") || c.display?.toLowerCase().includes("thyroid")),
            aiInsight: null
        },
        {
            id: "gastrointestinal",
            patientId,
            score: 0.2,
            status: "green",
            summary: "No GI conditions or abnormal findings in current data.",
            genomicFindings: [],
            clinicalData: [],
            aiInsight: null
        },
        {
            id: "musculoskeletal",
            patientId,
            score: 0.2,
            status: "green",
            summary: "No musculoskeletal conditions in current data.",
            genomicFindings: [],
            clinicalData: [],
            aiInsight: null
        },
        {
            id: "dermatologic",
            patientId,
            score: 0.2,
            status: "green",
            summary: "No dermatologic conditions in current data.",
            genomicFindings: [],
            clinicalData: [],
            aiInsight: null
        },
        {
            id: "mental_health",
            patientId,
            score: 0.25,
            status: "green",
            summary: "No documented mental health conditions; consider screening in high-risk contexts.",
            genomicFindings: [],
            clinicalData: [],
            aiInsight: hasApoE4 ? "APOE e4 may influence mood; consider psychosocial support in at-risk patients." : null
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
    "HEALTH_DIMENSIONS",
    ()=>HEALTH_DIMENSIONS
]);
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
    const label = __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$types$2f$dashboard$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["DIMENSION_LABELS"][dimension.id];
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
                            onClick: ()=>onDrillDown(dimension.id),
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
(()=>{
    const e = new Error("Cannot find module 'recharts'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
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
    const relevantConditions = patient.medicalHistory.filter((c)=>score.contributors.some((co)=>co.source === "condition" && co.label.toLowerCase().includes(c.display.toLowerCase())));
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
                                    lineNumber: 82,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    id: "drilldown-title",
                                    className: "text-lg font-semibold text-slate-900",
                                    children: label
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 81,
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
                                lineNumber: 99,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                    lineNumber: 80,
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
                                    lineNumber: 106,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-600",
                                    children: score.summary
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 109,
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
                                            lineNumber: 112,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 110,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 105,
                            columnNumber: 11
                        }, this),
                        chartData.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-semibold text-slate-800 mb-2",
                                    children: "Contributing factors"
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 119,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-48",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResponsiveContainer, {
                                        width: "100%",
                                        height: "100%",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BarChart, {
                                            data: chartData,
                                            layout: "vertical",
                                            margin: {
                                                top: 0,
                                                right: 20,
                                                left: 0,
                                                bottom: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CartesianGrid, {
                                                    strokeDasharray: "3 3",
                                                    stroke: "#e2e8f0"
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 129,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(XAxis, {
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
                                                    lineNumber: 130,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(YAxis, {
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
                                                    lineNumber: 137,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tooltip, {
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
                                                    lineNumber: 145,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Bar, {
                                                    dataKey: "value",
                                                    radius: [
                                                        0,
                                                        4,
                                                        4,
                                                        0
                                                    ],
                                                    maxBarSize: 24,
                                                    children: chartData.map((entry, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Cell, {
                                                            fill: entry.status === "green" ? CHART_COLORS.green : entry.status === "yellow" ? CHART_COLORS.yellow : CHART_COLORS.red
                                                        }, i, false, {
                                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                            lineNumber: 158,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                            lineNumber: 124,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                        lineNumber: 123,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 122,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 118,
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
                                            lineNumber: 180,
                                            columnNumber: 17
                                        }, this),
                                        "Genomic findings"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 179,
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
                                                    lineNumber: 189,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "ml-2 text-slate-600",
                                                    children: v.acmgClassification ?? v.clinVarSignificance ?? "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                                    lineNumber: 192,
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
                                                    lineNumber: 196,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, v.id, true, {
                                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                            lineNumber: 185,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 183,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 178,
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
                                            lineNumber: 210,
                                            columnNumber: 17
                                        }, this),
                                        "Clinical conditions"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 209,
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
                                            lineNumber: 215,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 213,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 208,
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
                                            lineNumber: 230,
                                            columnNumber: 17
                                        }, this),
                                        "AI-generated insight"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 229,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-700",
                                    children: insight.text
                                }, void 0, false, {
                                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                                    lineNumber: 233,
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
                                    lineNumber: 235,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                            lineNumber: 228,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
                    lineNumber: 103,
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
                    lineNumber: 243,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
            lineNumber: 79,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/health_ai/components/dashboard/DimensionDrillDown.tsx",
        lineNumber: 73,
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
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$lib$2f$dashboardData$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["computeDimensionScores"])(selectedPatient, dateRange);
        }
    }["SynopticDashboard.useMemo[dimensionScores]"], [
        selectedPatient,
        dateRange
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
                    lineNumber: 63,
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
                            lineNumber: 66,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
            lineNumber: 62,
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
                    lineNumber: 79,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: error ?? "No patient data available."
                }, void 0, false, {
                    fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
            lineNumber: 78,
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
                                lineNumber: 90,
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
                                lineNumber: 91,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 89,
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
                                lineNumber: 101,
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
                                        lineNumber: 110,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "30d",
                                        children: "Last 30 days"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                        lineNumber: 111,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "90d",
                                        children: "Last 90 days"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                        lineNumber: 112,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: "All time"
                                    }, void 0, false, {
                                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                        lineNumber: 113,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                                lineNumber: 102,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 88,
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
                        lineNumber: 120,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-medium text-slate-700",
                        children: "Selected patient:"
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 121,
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
                                lineNumber: 133,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 119,
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
                        lineNumber: 146,
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
                        lineNumber: 149,
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
                        lineNumber: 153,
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
                        lineNumber: 158,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3",
                role: "list",
                "aria-label": "Health dimension status cards",
                children: dimensionScores.map((score)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$HealthDimensionCard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["HealthDimensionCard"], {
                        score: score,
                        onDrillDown: ()=>setDrillDownDimension(score.dimensionId)
                    }, score.dimensionId, false, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 170,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 164,
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
                                lineNumber: 181,
                                columnNumber: 11
                            }, this),
                            "Normal / low risk"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 180,
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
                                lineNumber: 188,
                                columnNumber: 11
                            }, this),
                            "Monitor / moderate"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 187,
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
                                lineNumber: 195,
                                columnNumber: 11
                            }, this),
                            "Action needed / high risk"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this),
            drillDownData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$DimensionDrillDown$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DimensionDrillDown"], {
                patient: drillDownData.patient,
                score: drillDownData.score,
                onClose: ()=>setDrillDownDimension(null)
            }, void 0, false, {
                fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
                lineNumber: 205,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/health_ai/components/dashboard/SynopticDashboard.tsx",
        lineNumber: 86,
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
"[project]/health_ai/pages/index.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__N_SSP",
    ()=>__N_SSP,
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$DashboardLayout$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/layout/DashboardLayout.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$SynopticDashboard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/health_ai/components/dashboard/SynopticDashboard.tsx [client] (ecmascript)");
;
;
;
var __N_SSP = true;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$layout$2f$DashboardLayout$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["DashboardLayout"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$health_ai$2f$components$2f$dashboard$2f$SynopticDashboard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["SynopticDashboard"], {}, void 0, false, {
            fileName: "[project]/health_ai/pages/index.tsx",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/health_ai/pages/index.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
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

//# sourceMappingURL=%5Broot-of-the-server%5D__7f17e72b._.js.map