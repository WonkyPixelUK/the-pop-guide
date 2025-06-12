"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var supabase_js_1 = require("@supabase/supabase-js");
var cheerio = require("cheerio");
// Config (replace with your actual values or use env vars)
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
function scrapeProductData(productUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var data, $, name, number, series, variant, description, release_date, is_exclusive, exclusive_to, is_vaulted, is_chase, estimated_value, fandom, genre, edition, category, upc, ean, rarity, images;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(productUrl)];
                case 1:
                    data = (_a.sent()).data;
                    $ = cheerio.load(data);
                    name = $('h1').first().text().trim();
                    number = $('[data-label="Number"], .pop-number, .pop-details__number').first().text().trim();
                    series = $('[data-label="Line"], .pop-series, .pop-details__series').first().text().trim();
                    variant = $('[data-label="Variant"], .pop-variant, .pop-details__variant').first().text().trim();
                    description = $('[data-label="Description"], .pop-description, .pop-details__description').first().text().trim() || $('meta[name="description"]').attr('content') || '';
                    release_date = $('[data-label="Release Date"], .pop-release-date, .pop-details__release-date').first().text().trim();
                    is_exclusive = /exclusive/i.test($('[data-label="Exclusive"], .pop-exclusive, .pop-details__exclusive').first().text());
                    exclusive_to = $('[data-label="Exclusive"], .pop-exclusive, .pop-details__exclusive').first().text().trim();
                    is_vaulted = /vaulted/i.test($('[data-label="Vaulted"], .pop-vaulted, .pop-details__vaulted').first().text());
                    is_chase = /chase/i.test($('[data-label="Chase"], .pop-chase, .pop-details__chase').first().text());
                    estimated_value = parseFloat($('[data-label="Estimated Value"], .pop-value, .pop-details__value').first().text().replace(/[^\d.]/g, '')) || null;
                    fandom = $('[data-label="Fandom"], .pop-fandom, .pop-details__fandom').first().text().trim();
                    genre = $('[data-label="Genre"], .pop-genre, .pop-details__genre').first().text().trim();
                    edition = $('[data-label="Edition"], .pop-edition, .pop-details__edition').first().text().trim();
                    category = $('[data-label="Category"], .pop-category, .pop-details__category').first().text().trim();
                    upc = $('[data-label="UPC"], .pop-upc, .pop-details__upc').first().text().trim();
                    ean = $('[data-label="EAN"], .pop-ean, .pop-details__ean').first().text().trim();
                    rarity = $('[data-label="Rarity"], .pop-rarity, .pop-details__rarity').first().text().trim();
                    images = [];
                    $('img').each(function (_, el) {
                        var src = $(el).attr('src');
                        if (src && /collectible/.test(src))
                            images.push(src);
                    });
                    return [2 /*return*/, {
                            name: name,
                            number: number,
                            series: series,
                            variant: variant,
                            description: description,
                            release_date: release_date,
                            is_exclusive: is_exclusive,
                            exclusive_to: exclusive_to,
                            is_vaulted: is_vaulted,
                            is_chase: is_chase,
                            estimated_value: estimated_value,
                            fandom: fandom,
                            genre: genre,
                            edition: edition,
                            category: category,
                            upc: upc,
                            ean: ean,
                            rarity: rarity,
                            images: images,
                        }];
            }
        });
    });
}
function uploadImageToSupabase(imageUrl, ownerId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, ext, filename, path, error;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(imageUrl, { responseType: 'arraybuffer' })];
                case 1:
                    response = _b.sent();
                    ext = ((_a = imageUrl.split('.').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0]) || 'jpg';
                    filename = "".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2), ".").concat(ext);
                    path = "".concat(ownerId, "/").concat(filename);
                    return [4 /*yield*/, supabase.storage.from('funko-images').upload(path, response.data, {
                            contentType: response.headers['content-type'] || 'image/jpeg',
                            upsert: false,
                        })];
                case 2:
                    error = (_b.sent()).error;
                    if (error)
                        throw error;
                    return [2 /*return*/, path];
            }
        });
    });
}
function findFunkoPopByName(name) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('funko_pops')
                        .select('id')
                        .ilike('name', name)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data && data.length > 0 ? data[0].id : null];
            }
        });
    });
}
function upsertFunkoPop(data, imagePaths) {
    return __awaiter(this, void 0, void 0, function () {
        var existingId, updates, _a, updated, error, _b, inserted, error;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, findFunkoPopByName(data.name)];
                case 1:
                    existingId = _c.sent();
                    updates = {
                        name: data.name || null,
                        number: data.number || null,
                        series: data.series || null,
                        variant: data.variant || null,
                        description: data.description || null,
                        release_date: data.release_date || null,
                        is_exclusive: data.is_exclusive || false,
                        exclusive_to: data.exclusive_to || null,
                        is_vaulted: data.is_vaulted || false,
                        is_chase: data.is_chase || false,
                        estimated_value: data.estimated_value || null,
                        fandom: data.fandom || null,
                        genre: data.genre || null,
                        edition: data.edition || null,
                        category: data.category || null,
                        upc: data.upc || null,
                        ean: data.ean || null,
                        rarity: data.rarity || null,
                        image_url: imagePaths[0] || null,
                        image_urls: imagePaths.length ? JSON.stringify(imagePaths) : null,
                        updated_at: new Date().toISOString(),
                    };
                    if (!existingId) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase
                            .from('funko_pops')
                            .update(updates)
                            .eq('id', existingId)
                            .select()];
                case 2:
                    _a = _c.sent(), updated = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, updated === null || updated === void 0 ? void 0 : updated[0]];
                case 3:
                    // Insert
                    updates.created_at = new Date().toISOString();
                    return [4 /*yield*/, supabase
                            .from('funko_pops')
                            .insert(updates)
                            .select()];
                case 4:
                    _b = _c.sent(), inserted = _b.data, error = _b.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, inserted === null || inserted === void 0 ? void 0 : inserted[0]];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var productUrl, productData, ownerId, supabasePaths, _i, _a, url, path, updated;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    productUrl = process.argv[2];
                    if (!productUrl)
                        throw new Error('Product URL required as first argument');
                    return [4 /*yield*/, scrapeProductData(productUrl)];
                case 1:
                    productData = _b.sent();
                    if (!productData.name)
                        throw new Error('No product data found');
                    ownerId = productData.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
                    supabasePaths = [];
                    _i = 0, _a = productData.images;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    url = _a[_i];
                    return [4 /*yield*/, uploadImageToSupabase(url, ownerId)];
                case 3:
                    path = _b.sent();
                    supabasePaths.push(path);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, upsertFunkoPop(productData, supabasePaths)];
                case 6:
                    updated = _b.sent();
                    console.log('Upserted funko_pops row:', updated);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error(err);
    process.exit(1);
});
