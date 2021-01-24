
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var DataSources;
        (function (DataSources) {
            var Bootstrap = LiteMol.Bootstrap;
            var Entity = Bootstrap.Entity;
            DataSources.DownloadMolecule = Entity.Transformer.Molecule.downloadMoleculeSource({
                sourceId: 'url-molecule',
                name: 'URL',
                description: 'Download a molecule from the specified Url (if the host server supports cross domain requests).',
                defaultId: 'https://cs.litemol.org/1tqn/cartoon',
                urlTemplate: function (id) { return id; },
                isFullUrl: true
            });
            DataSources.ObtainDownloadSources = ['CoordinateServer', 'PDBe Updated mmCIF', 'URL', 'File on Disk'];
            DataSources.ObtainMolecule = Bootstrap.Tree.Transformer.action({
                id: 'viewer-obtain-molecule',
                name: 'Molecule',
                description: 'Download or open a molecule from various sources.',
                from: [Entity.Root],
                to: [Entity.Action],
                defaultParams: function (ctx) { return ({
                    sourceKind: 'CoordinateServer',
                    sources: {
                        'CoordinateServer': { kind: 'CoordinateServer', id: '1cbs', type: 'Full', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'https://cs.litemol.org' },
                        'PDBe Updated mmCIF': { kind: 'PDBe Updated mmCIF', id: '1cbs' },
                        'URL': { kind: 'URL', format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF, url: 'https://cs.litemol.org/1tqn/cartoon' },
                        'File on Disk': { kind: 'File on Disk', file: void 0 }
                    }
                }); },
                validateParams: function (p) {
                    var src = p.sources[p.sourceKind];
                    switch (src.kind) {
                        case 'CoordinateServer':
                            return (!src.id || !src.id.trim().length) ? ['Enter Id'] : (!src.serverUrl || !src.serverUrl.trim().length) ? ['Enter CoordinateServer base URL'] : void 0;
                        case 'PDBe Updated mmCIF':
                            return (!src.id || !src.id.trim().length) ? ['Enter Id'] : void 0;
                        case 'URL':
                            return (!src.url || !src.url.trim().length) ? ['Enter URL'] : void 0;
                        case 'File on Disk':
                            return (!src.file) ? ['Select a File'] : void 0;
                    }
                    return void 0;
                }
            }, function (context, a, t) {
                var src = t.params.sources[t.params.sourceKind];
                var transform = Bootstrap.Tree.Transform.build();
                switch (src.kind) {
                    case 'CoordinateServer':
                        transform.add(a, Viewer.PDBe.Data.DownloadBinaryCIFFromCoordinateServer, src);
                        break;
                    case 'PDBe Updated mmCIF':
                        transform.add(a, Viewer.PDBe.Data.DownloadMolecule, { id: src.id });
                        break;
                    case 'URL':
                        transform.add(a, DataSources.DownloadMolecule, { format: src.format, id: src.url });
                        break;
                    case 'File on Disk':
                        transform.add(a, Bootstrap.Entity.Transformer.Molecule.OpenMoleculeFromFile, { file: src.file });
                        break;
                }
                return transform;
            });
        })(DataSources = Viewer.DataSources || (Viewer.DataSources = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Data;
            (function (Data) {
                "use strict";
                var Bootstrap = LiteMol.Bootstrap;
                var Entity = Bootstrap.Entity;
                var Transformer = Bootstrap.Entity.Transformer;
                // straigtforward
                Data.DownloadMolecule = Transformer.Molecule.downloadMoleculeSource({
                    sourceId: 'pdbe-molecule',
                    name: 'PDBe (mmCIF)',
                    description: 'Download a molecule from PDBe.',
                    defaultId: '1cbs',
                    specificFormat: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF,
                    urlTemplate: function (id) { return "https://www.ebi.ac.uk/pdbe/static/entry/" + id.toLowerCase() + "_updated.cif"; }
                });
                Data.DownloadBinaryCIFFromCoordinateServer = Bootstrap.Tree.Transformer.action({
                    id: 'molecule-download-bcif-from-coordinate-server',
                    name: 'Download Molecule',
                    description: 'Download full or cartoon representation of a PDB entry using the BinaryCIF format.',
                    from: [Entity.Root],
                    to: [Entity.Action],
                    defaultParams: function (ctx) { return ({ id: '1cbs', type: 'Full', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'https://cs.litemol.org' }); },
                    validateParams: function (p) { return (!p.id || !p.id.trim().length) ? ['Enter Id'] : (!p.serverUrl || !p.serverUrl.trim().length) ? ['Enter CoordinateServer base URL'] : void 0; },
                }, function (context, a, t) {
                    var query = t.params.type === 'Cartoon' ? 'cartoon' : 'full';
                    var id = t.params.id.toLowerCase().trim();
                    var url = "" + t.params.serverUrl + (t.params.serverUrl[t.params.serverUrl.length - 1] === '/' ? '' : '/') + id + "/" + query + "?encoding=bcif&lowPrecisionCoords=" + (t.params.lowPrecisionCoords ? '1' : '0');
                    return Bootstrap.Tree.Transform.build()
                        .add(a, Entity.Transformer.Data.Download, { url: url, type: 'Binary', id: id, title: 'Molecule' })
                        .then(Entity.Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { isBinding: true })
                        .then(Entity.Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false });
                });
            })(Data = PDBe.Data || (PDBe.Data = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Data;
            (function (Data) {
                "use strict";
                var Bootstrap = LiteMol.Bootstrap;
                var Entity = Bootstrap.Entity;
                var Transformer = Bootstrap.Entity.Transformer;
                var Tree = Bootstrap.Tree;
                var Visualization = Bootstrap.Visualization;
                Data.DensitySourceLabels = {
                    'electron-density': 'X-ray (from PDB Id)',
                    'emdb-pdbid': 'EMDB (from PDB Id)',
                    'emdb-id': 'EMDB (from EMDB Id)'
                };
                Data.DensitySources = ['electron-density', 'emdb-pdbid', 'emdb-id'];
                function doElectron(a, t, id) {
                    var action = Bootstrap.Tree.Transform.build();
                    id = id.trim().toLowerCase();
                    var groupRef = t.props.ref ? t.props.ref : Bootstrap.Utils.generateUUID();
                    var group = action.add(a, Transformer.Basic.CreateGroup, { label: id, description: 'Density' }, { ref: groupRef });
                    var diffRef = Bootstrap.Utils.generateUUID();
                    var mainRef = Bootstrap.Utils.generateUUID();
                    var diff = group
                        .then(Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/coordinates/files/" + id + "_diff.ccp4", type: 'Binary', id: id, description: 'Fo-Fc', title: 'Density' })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: 'Fo-Fc' }, { isBinding: true, ref: diffRef });
                    diff
                        .then(Transformer.Density.CreateVisualBehaviour, {
                            id: 'Fo-Fc(-ve)',
                            isoSigmaMin: -5,
                            isoSigmaMax: 0,
                            minRadius: 0,
                            maxRadius: 10,
                            radius: 5,
                            showFull: false,
                            style: Visualization.Density.Style.create({
                                isoValue: -3,
                                isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                                color: LiteMol.Visualization.Color.fromHex(0xBB3333),
                                isWireframe: true,
                                transparency: { alpha: 1.0 }
                            })
                        });
                    diff
                        .then(Transformer.Density.CreateVisualBehaviour, {
                            id: 'Fo-Fc(+ve)',
                            isoSigmaMin: 0,
                            isoSigmaMax: 5,
                            minRadius: 0,
                            maxRadius: 10,
                            radius: 5,
                            showFull: false,
                            style: Visualization.Density.Style.create({
                                isoValue: 3,
                                isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                                color: LiteMol.Visualization.Color.fromHex(0x33BB33),
                                isWireframe: true,
                                transparency: { alpha: 1.0 }
                            })
                        });
                    group
                        .then(Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/coordinates/files/" + id + ".ccp4", type: 'Binary', id: id, description: '2Fo-Fc', title: 'Density' })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc' }, { isBinding: true, ref: mainRef })
                        .then(Transformer.Density.CreateVisualBehaviour, {
                            id: '2Fo-Fc',
                            isoSigmaMin: 0,
                            isoSigmaMax: 2,
                            minRadius: 0,
                            maxRadius: 10,
                            radius: 5,
                            showFull: false,
                            style: Visualization.Density.Style.create({
                                isoValue: 1.5,
                                isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                                color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                                isWireframe: false,
                                transparency: { alpha: 0.4 }
                            })
                        });
                    return {
                        action: action,
                        context: { id: id, refs: [mainRef, diffRef], groupRef: groupRef }
                    };
                }
                function doEmdb(a, t, id, contourLevel) {
                    var action = Bootstrap.Tree.Transform.build();
                    var mainRef = Bootstrap.Utils.generateUUID();
                    var labelId = 'EMD-' + id;
                    action
                        .add(a, Transformer.Data.Download, {
                            url: "https://www.ebi.ac.uk/pdbe/static/files/em/maps/emd_" + id + ".map.gz",
                            type: 'Binary',
                            id: labelId,
                            description: 'EMDB Density',
                            responseCompression: Bootstrap.Utils.DataCompressionMethod.Gzip,
                            title: 'Density'
                        })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: labelId }, { isBinding: true, ref: mainRef })
                        .then(Transformer.Density.CreateVisualBehaviour, {
                            id: 'Density',
                            isoSigmaMin: -5,
                            isoSigmaMax: 5,
                            minRadius: 0,
                            maxRadius: 50,
                            radius: 5,
                            showFull: false,
                            style: Visualization.Density.Style.create({
                                isoValue: contourLevel !== void 0 ? contourLevel : 1.5,
                                isoValueType: contourLevel !== void 0 ? Bootstrap.Visualization.Density.IsoValueType.Absolute : Bootstrap.Visualization.Density.IsoValueType.Sigma,
                                color: LiteMol.Visualization.Color.fromHex(0x638F8F),
                                isWireframe: false,
                                transparency: { alpha: 0.3 }
                            })
                        });
                    return {
                        action: action,
                        context: { id: id, refs: [mainRef] }
                    };
                }
                function fail(a, message) {
                    return {
                        action: Bootstrap.Tree.Transform.build()
                            .add(a, Transformer.Basic.Fail, { title: 'Density', message: message }),
                        context: void 0
                    };
                }
                function doEmdbPdbId(ctx, a, t, id) {
                    return __awaiter(this, void 0, void 0, function () {
                        var s, json, emdbId, e, emdb;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    id = id.trim().toLowerCase();
                                    return [4 /*yield*/, Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/" + id, 'PDB API').run(ctx)];
                                case 1:
                                    s = _a.sent();
                                    try {
                                        json = JSON.parse(s);
                                        emdbId = void 0;
                                        e = json[id];
                                        if (e && e[0] && e[0].related_structures) {
                                            emdb = e[0].related_structures.filter(function (s) { return s.resource === 'EMDB'; });
                                            if (!emdb.length) {
                                                return [2 /*return*/, fail(a, "No related EMDB entry found for '" + id + "'.")];
                                            }
                                            emdbId = emdb[0].accession.split('-')[1];
                                        }
                                        else {
                                            return [2 /*return*/, fail(a, "No related EMDB entry found for '" + id + "'.")];
                                        }
                                        return [2 /*return*/, doEmdbId(ctx, a, t, emdbId)];
                                    }
                                    catch (e) {
                                        return [2 /*return*/, fail(a, 'PDBe API call failed.')];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    });
                }
                function doEmdbId(ctx, a, t, id) {
                    return __awaiter(this, void 0, void 0, function () {
                        var s, json, contour, e;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    id = id.trim();
                                    return [4 /*yield*/, Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/EMD-" + id, 'EMDB API').run(ctx)];
                                case 1:
                                    s = _a.sent();
                                    try {
                                        json = JSON.parse(s);
                                        contour = void 0;
                                        e = json['EMD-' + id];
                                        if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
                                            contour = +e[0].map.contour_level.value;
                                        }
                                        return [2 /*return*/, doEmdb(a, t, id, contour)];
                                    }
                                    catch (e) {
                                        return [2 /*return*/, fail(a, 'EMDB API call failed.')];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    });
                }
                // this creates the electron density based on the spec you sent me
                Data.DownloadDensity = Bootstrap.Tree.Transformer.actionWithContext({
                    id: 'pdbe-density-download-data',
                    name: 'Density Data from PDBe',
                    description: 'Download density data from PDBe.',
                    from: [Entity.Root],
                    to: [Entity.Action],
                    defaultParams: function () { return ({
                        sourceId: 'electron-density',
                        id: {
                            'electron-density': '1cbs',
                            'emdb-id': '3121',
                            'emdb-pdbid': '5aco'
                        }
                    }); },
                    validateParams: function (p) {
                        var source = p.sourceId ? p.sourceId : 'electron-density';
                        if (!p.id)
                            return ['Enter Id'];
                        var id = typeof p.id === 'string' ? p.id : p.id[source];
                        return !id.trim().length ? ['Enter Id'] : void 0;
                    }
                }, function (context, a, t) {
                    var id;
                    if (typeof t.params.id === 'string')
                        id = t.params.id;
                    else
                        id = t.params.id[t.params.sourceId];
                    switch (t.params.sourceId || 'electron-density') {
                        case 'electron-density': return doElectron(a, t, id);
                        case 'emdb-id': return doEmdbId(context, a, t, id);
                        case 'emdb-pdbid': return doEmdbPdbId(context, a, t, id);
                        default: return fail(a, 'Unknown source.');
                    }
                }, function (ctx, actionCtx) {
                    var _a;
                    if (!actionCtx)
                        return;
                    var _b = actionCtx, id = _b.id, refs = _b.refs, groupRef = _b.groupRef;
                    var sel = ctx.select((_a = Tree.Selection).byRef.apply(_a, refs));
                    if (sel.length === refs.length) {
                        ctx.logger.message('Density loaded, click on a residue or an atom to view the data.');
                    }
                    else if (sel.length > 0) {
                        ctx.logger.message('Density partially loaded, click on a residue or an atom to view the data.');
                    }
                    else {
                        ctx.logger.error("Density for ID '" + id + "' failed to load.");
                        if (groupRef) {
                            Bootstrap.Command.Tree.RemoveNode.dispatch(ctx, groupRef);
                        }
                    }
                });
            })(Data = PDBe.Data || (PDBe.Data = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Validation;
            (function (Validation) {
                var _this = this;
                var Entity = LiteMol.Bootstrap.Entity;
                var Transformer = LiteMol.Bootstrap.Entity.Transformer;
                Validation.Report = Entity.create({ name: 'PDBe Molecule Validation Report', typeClass: 'Behaviour', shortName: 'VR', description: 'Represents PDBe validation report.' });
                var Api;
                (function (Api) {
                    function getResidueId(seqNumber, insCode) {
                        var id = seqNumber.toString();
                        if ((insCode || "").length !== 0 && insCode !== " ")
                            id += " " + insCode;
                        return id;
                    }
                    Api.getResidueId = getResidueId;
                    function getEntry(report, modelId, entity, asymId, residueId) {
                        var e = report[entity];
                        if (!e)
                            return void 0;
                        e = e[asymId];
                        if (!e)
                            return void 0;
                        e = e[modelId];
                        if (!e)
                            return void 0;
                        return e[residueId];
                    }
                    Api.getEntry = getEntry;
                    function createReport(data) {
                        var report = {};
                        if (!data.molecules)
                            return report;
                        for (var _i = 0, _a = data.molecules; _i < _a.length; _i++) {
                            var entity = _a[_i];
                            var chains = report[entity.entity_id.toString()] || {};
                            for (var _c = 0, _d = entity.chains; _c < _d.length; _c++) {
                                var chain = _d[_c];
                                var models = chains[chain.struct_asym_id] || {};
                                for (var _e = 0, _f = chain.models; _e < _f.length; _e++) {
                                    var model = _f[_e];
                                    var residues = models[model.model_id.toString()] || {};
                                    for (var _g = 0, _h = model.residues; _g < _h.length; _g++) {
                                        var residue = _h[_g];
                                        var id = getResidueId(residue.residue_number, residue.author_insertion_code), entry = residues[id];
                                        if (entry) {
                                            entry.residues.push(residue);
                                            entry.numIssues = Math.max(entry.numIssues, residue.outlier_types.length);
                                        }
                                        else {
                                            residues[id] = {
                                                residues: [residue],
                                                numIssues: residue.outlier_types.length
                                            };
                                        }
                                    }
                                    models[model.model_id.toString()] = residues;
                                }
                                chains[chain.struct_asym_id] = models;
                            }
                            report[entity.entity_id.toString()] = chains;
                        }
                        return report;
                    }
                    Api.createReport = createReport;
                })(Api = Validation.Api || (Validation.Api = {}));
                var Interactivity;
                (function (Interactivity) {
                    var Behaviour = /** @class */ (function () {
                        function Behaviour(context, report) {
                            var _this = this;
                            this.context = context;
                            this.report = report;
                            this.provider = function (info) {
                                try {
                                    return _this.processInfo(info);
                                }
                                catch (e) {
                                    console.error('Error showing validation label', e);
                                    return void 0;
                                }
                            };
                        }
                        Behaviour.prototype.dispose = function () {
                            this.context.highlight.removeProvider(this.provider);
                        };
                        Behaviour.prototype.register = function (behaviour) {
                            this.context.highlight.addProvider(this.provider);
                        };
                        Behaviour.prototype.processInfo = function (info) {
                            var i = LiteMol.Bootstrap.Interactivity.Molecule.transformInteraction(info);
                            if (!i || i.residues.length !== 1)
                                return void 0;
                            var r = i.residues[0];
                            var e = Api.getEntry(this.report, i.modelId, r.chain.entity.entityId, r.chain.asymId, Api.getResidueId(r.seqNumber, r.insCode));
                            if (!e)
                                return void 0;
                            var label;
                            if (e.residues.length === 1) {
                                var vr = e.residues[0];
                                label = 'Validation: ';
                                if (!vr.outlier_types.length)
                                    label += 'no issue';
                                else
                                    label += "<b>" + e.residues[0].outlier_types.join(", ") + "</b>";
                                return label;
                            }
                            else {
                                label = '';
                                var index = 0;
                                for (var _i = 0, _a = e.residues; _i < _a.length; _i++) {
                                    var v = _a[_i];
                                    if (index > 0)
                                        label += ', ';
                                    label += "Validation (altLoc " + v.alt_code + "): <b>" + v.outlier_types.join(", ") + "</b>";
                                    index++;
                                }
                                return label;
                            }
                        };
                        return Behaviour;
                    }());
                    Interactivity.Behaviour = Behaviour;
                })(Interactivity = Validation.Interactivity || (Validation.Interactivity = {}));
                var Theme;
                // (function (Theme) {
                //     var colorMap = (function () {
                //         var colors = LiteMol.Core.Utils.FastMap.create();
                //         colors.set(0, { r: 0, g: 1, b: 0 });
                //         colors.set(1, { r: 1, g: 1, b: 0 });
                //         colors.set(2, { r: 1, g: 0.5, b: 0 });
                //         colors.set(3, { r: 1, g: 0, b: 0 });
                //         colors.set(4, { r: 0.7, g: 0.7, b: 0.7 }); // not applicable
                //         return colors;
                //     })();
                //     var defaultColor = { r: 0.6, g: 0.6, b: 0.6 };
                //     var selectionColor = { r: 0, g: 0, b: 1 };
                //     var highlightColor = { r: 1, g: 0, b: 1 };
                //     function createResidueMapNormal(model, report) {
                //         var map = new Uint8Array(model.data.residues.count);
                //         var mId = model.modelId;
                //         var _a = model.data.residues, asymId = _a.asymId, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode, isHet = _a.isHet;
                //         for (var i = 0, _b = model.data.residues.count; i < _b; i++) {
                //             var entry = Api.getEntry(report, mId, entityId[i], asymId[i], Api.getResidueId(seqNumber[i], insCode[i]));
                //             if (entry) {
                //                 map[i] = Math.min(entry.numIssues, 3);
                //             }
                //             else if (isHet[i]) {
                //                 map[i] = 4;
                //             }
                //         }
                //         return map;
                //     }
                //     function createResidueMapComputed(model, report) {
                //         var map = new Uint8Array(model.data.residues.count);
                //         var mId = model.modelId;
                //         var parent = model.parent;
                //         var _a = model.data.residues, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode, chainIndex = _a.chainIndex, isHet = _a.isHet;
                //         var sourceChainIndex = model.data.chains.sourceChainIndex;
                //         var asymId = parent.data.chains.asymId;
                //         for (var i = 0, _b = model.data.residues.count; i < _b; i++) {
                //             var aId = asymId[sourceChainIndex[chainIndex[i]]];
                //             var e = Api.getEntry(report, mId, entityId[i], aId, Api.getResidueId(seqNumber[i], insCode[i]));
                //             if (e) {
                //                 map[i] = Math.min(e.numIssues, 3);
                //             }
                //             else if (isHet[i]) {
                //                 map[i] = 4;
                //             }
                //         }
                //         return map;
                //     }
                //     function create(entity, report) {
                //         var model = entity.props.model;
                //         var map = model.source === LiteMol.Core.Structure.Molecule.Model.Source.File
                //             ? createResidueMapNormal(model, report)
                //             : createResidueMapComputed(model, report);
                //         var colors = LiteMol.Core.Utils.FastMap.create();
                //         colors.set('Uniform', defaultColor);
                //         colors.set('Selection', selectionColor);
                //         colors.set('Highlight', highlightColor);
                //         var residueIndex = model.data.atoms.residueIndex;
                //         var mapping = LiteMol.Visualization.Theme.createColorMapMapping(function (i) { return map[residueIndex[i]]; }, colorMap, defaultColor);
                //         return LiteMol.Visualization.Theme.createMapping(mapping, { colors: colors, interactive: true, transparency: { alpha: 1.0 } });
                //     }
                //     Theme.create = create;
                // })(Theme || (Theme = {}));
                var Create = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'pdbe-validation-create',
                    name: 'PDBe Validation',
                    description: 'Create the validation report from a string.',
                    from: [Entity.Data.String],
                    to: [Validation.Report],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    return LiteMol.Bootstrap.Task.create("Validation Report (" + t.params.id + ")", 'Normal', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var data, model, report;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.updateProgress('Parsing...')];
                                case 1:
                                    _a.sent();
                                    data = JSON.parse(a.props.data);
                                    model = data[t.params.id];
                                    report = Api.createReport(model || {});
                                    return [2 /*return*/, Validation.Report.create(t, { label: 'Validation Report', behaviour: new Interactivity.Behaviour(context, report) })];
                            }
                        });
                    }); }).setReportTime(true);
                });
                Validation.DownloadAndCreate = LiteMol.Bootstrap.Tree.Transformer.action({
                    id: 'pdbe-validation-download-and-create',
                    name: 'PDBe Validation Report',
                    description: 'Download Validation Report from PDBe',
                    from: [Entity.Molecule.Molecule],
                    to: [Entity.Action],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    var id = a.props.molecule.id.trim().toLocaleLowerCase();
                    var action = LiteMol.Bootstrap.Tree.Transform.build()
                        .add(a, Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/" + id, type: 'String', id: id, description: 'Validation Data', title: 'Validation' })
                        .then(Create, { id: id }, { isBinding: true, ref: t.params.reportRef });
                    return action;
                }, "Validation report loaded. Hovering over residue will now contain validation info. To apply validation coloring, select the entity in the tree and apply it the right panel.");
                Validation.ApplyTheme = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'pdbe-validation-apply-theme',
                    name: 'Apply Coloring',
                    description: 'Colors all visuals using the validation report.',
                    from: [Validation.Report],
                    to: [Entity.Action],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    return LiteMol.Bootstrap.Task.create('Validation Coloring', 'Background', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var molecule, themes, visuals, _i, visuals_1, v, model, theme;
                        return __generator(this, function (_a) {
                            molecule = LiteMol.Bootstrap.Tree.Node.findAncestor(a, LiteMol.Bootstrap.Entity.Molecule.Molecule);
                            if (!molecule) {
                                throw 'No suitable parent found.';
                            }
                            themes = LiteMol.Core.Utils.FastMap.create();
                            visuals = context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
                            for (_i = 0, visuals_1 = visuals; _i < visuals_1.length; _i++) {
                                v = visuals_1[_i];
                                model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
                                if (!model)
                                    continue;
                                theme = themes.get(model.id);
                                if (!theme) {
                                    theme = Theme.create(model, a.props.behaviour.report);
                                    themes.set(model.id, theme);
                                }
                                LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v, theme: theme });
                            }
                            context.logger.message('Validation coloring applied.');
                            return [2 /*return*/, LiteMol.Bootstrap.Tree.Node.Null];
                        });
                    }); });
                });
            })(Validation = PDBe.Validation || (PDBe.Validation = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LiteMol;
(function (LiteMol) {
    var Example;
    (function (Example) {
        var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
        var Controls = LiteMol.Plugin.Controls;
        // this defines a custom view for coordinate streaming and lets the user pick from two backing servers
        // check more examples of views in LiteMol.Plugin/View/Transform folder.
        //
        // this uses a default controller for transforms, you can write your own. How to do that, check LiteMol.Bootstrap/Components/Transform folder
        //
        // Transforms transform entities. On how to define custom entities, check LiteMol.Bootstrap/Entity/Types.ts where there are plenty of examples.
        var CoordianteStreamingCustomView = /** @class */ (function (_super) {
            __extends(CoordianteStreamingCustomView, _super);
            function CoordianteStreamingCustomView() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                // this is for demonstration only, for dynamic options, store them in the transform params or in the underlying entity props.
                _this.servers = [
                    { name: 'PDBe', url: 'https://wwwdev.ebi.ac.uk/pdbe/coordinates/' },
                    { name: 'WebChem', url: 'https://cs.litemol.org/' }
                ];
                return _this;
            }
            CoordianteStreamingCustomView.prototype.renderControls = function () {
                var _this = this;
                var params = this.params;
                // this will only work if the "molecule.coordinateStreaming.defaultServer" setting is one of the servers, which now is.
                // normally you would not use hacks like this and store the list of available server for example in the params of the transforms
                // or in the underlying entity.
                var currentServer = this.servers.filter(function (s) { return s.url === params.server; })[0];
                // to update the params, you can use "this.updateParams" or "this.autoUpdateParams". Auto update params will work only on "updateable transforms"
                // and will work similarly to how visuals are updated. If autoUpdateParams is not used, the user has to click "Update" buttom manually.
                return React.createElement("div", null,
                    React.createElement(Controls.OptionsGroup, { options: this.servers, caption: function (s) { return s.name; }, current: currentServer, onChange: function (o) { return _this.updateParams({ server: o.url }); }, label: 'Server' }),
                    React.createElement(Controls.TextBoxGroup, { value: params.id, onChange: function (v) { return _this.updateParams({ id: v }); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'PDB id...' }));
            };
            return CoordianteStreamingCustomView;
        }(LiteMol.Plugin.Views.Transform.ControllerBase));
        Example.CoordianteStreamingCustomView = CoordianteStreamingCustomView;
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMolPluginInstance;
(function (LiteMolPluginInstance) {
    var CustomTheme;
    (function (CustomTheme) {
        var Core = LiteMol.Core;
        var Visualization = LiteMol.Visualization;
        var Bootstrap = LiteMol.Bootstrap;
        var Q = Core.Structure.Query;
        var ColorMapper = /** @class */ (function () {
            function ColorMapper() {
                this.uniqueColors = [];
                this.map = Core.Utils.FastMap.create();
            }
            Object.defineProperty(ColorMapper.prototype, "colorMap", {
                get: function () {
                    var map = Core.Utils.FastMap.create();
                    this.uniqueColors.forEach(function (c, i) { return map.set(i, c); });
                    return map;
                },
                enumerable: true,
                configurable: true
            });
            ColorMapper.prototype.addColor = function (color) {
                var id = color.r + "-" + color.g + "-" + color.b;
                if (this.map.has(id))
                    return this.map.get(id);
                var index = this.uniqueColors.length;
                this.uniqueColors.push(Visualization.Color.fromRgb(color.r, color.g, color.b));
                this.map.set(id, index);
                return index;
            };
            return ColorMapper;
        }());
        function createTheme(model, colorDef) {
            var mapper = new ColorMapper();
            mapper.addColor(colorDef.base);
            var map = new Uint8Array(model.data.atoms.count);
            for (var _i = 0, _a = colorDef.entries; _i < _a.length; _i++) {
                var e = _a[_i];
                var query = Q.sequence(e.entity_id.toString(), e.struct_asym_id, { seqNumber: e.start_residue_number }, { seqNumber: e.end_residue_number }).compile();
                var colorIndex = mapper.addColor(e.color);
                for (var _b = 0, _c = query(model.queryContext).fragments; _b < _c.length; _b++) {
                    var f = _c[_b];
                    for (var _d = 0, _e = f.atomIndices; _d < _e.length; _d++) {
                        var a = _e[_d];
                        map[a] = colorIndex;
                    }
                }
            }
            var fallbackColor = { r: 0.6, g: 0.6, b: 0.6 };
            var selectionColor = { r: 0, g: 0, b: 1 };
            var highlightColor = { r: 1, g: 0, b: 1 };
            var colors = Core.Utils.FastMap.create();
            colors.set('Uniform', fallbackColor);
            colors.set('Selection', selectionColor);
            colors.set('Highlight', highlightColor);
            var mapping = Visualization.Theme.createColorMapMapping(function (i) { return map[i]; }, mapper.colorMap, fallbackColor);
            // make the theme "sticky" so that it persist "ResetScene" command.
            return Visualization.Theme.createMapping(mapping, { colors: colors, isSticky: true });
        }
        CustomTheme.createTheme = createTheme;
        function applyTheme(plugin, modelRef, theme) {
            var visuals = plugin.selectEntities(Bootstrap.Tree.Selection.byRef(modelRef).subtree().ofType(Bootstrap.Entity.Molecule.Visual));
            for (var _i = 0, visuals_2 = visuals; _i < visuals_2.length; _i++) {
                var v = visuals_2[_i];
                plugin.command(Bootstrap.Command.Visual.UpdateBasicTheme, { visual: v, theme: theme });
            }
        }
        CustomTheme.applyTheme = applyTheme;
    })(CustomTheme = LiteMolPluginInstance.CustomTheme || (LiteMolPluginInstance.CustomTheme = {}));
})(LiteMolPluginInstance || (LiteMolPluginInstance = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


    


