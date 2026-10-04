"use strict";
// Headless tests for the rendered message preview. They load the real dialog.html, style.css,
// html-preview.js and dialog.js (with the real merge-field substitution) into a browser page.
// Firefox uses the same Gecko engine as Thunderbird; Chromium is an optional second engine.
//
//   npm install
//   npm test            FIREFOX_PATH / CHROME_PATH override the browser locations.
//   npm run screenshots also saves screenshots/*.png (Firefox).

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const puppeteer = require("puppeteer-core");

const root = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, "addon", name), "utf8");
const messages = (locale) => Object.fromEntries(Object.entries(JSON.parse(read("_locales/" + locale + "/messages.json"))).map(([key, value]) => [key, value.message]));
const locales = { en: messages("en"), tr: messages("tr") };
const screenshots = process.argv.includes("--screenshots");
const temporary = [];

const rows = [
	{ "Ad": "Ayşe", "Soyad": "Yılmaz", "E-posta": "ayse@example.com", "Puan": "85", "No": "1001" },
	{ "Ad": "Mehmet", "Soyad": "", "E-posta": "mehmet@example.com", "Puan": "", "No": "1002" },
	{ "Ad": "Zeynep", "Soyad": "Kaya", "E-posta": "zeynep@example.com", "Puan": "42", "No": "1003" },
];

function template(origin) {
	// Shaped like the body Thunderbird's compose API returns, including a head style sheet.
	return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <style>.score { border-collapse: collapse; background: #edf3fb; } .score td { border: 1px solid #999; padding: 6px 10px; }</style>
  </head>
  <body text="#000000" bgcolor="#FFFFCC">
    <p><b>Sayın {{Ad}} {{Soyad}},</b></p>
    <p>Ödevinizin değerlendirmesi tamamlanmıştır.</p>
    <table class="score"><tr><td>Puan</td><td id="score">{{Puan}}</td></tr><tr><td>Durum</td><td id="state">{{Puan|&gt;=|50|Geçti|Kaldı}}</td></tr></table>
    <p>Ayrıntılar: <a href="https://obs.example.edu/odev?no={{No}}">öğrenci sayfası</a></p>
    <p id="red" style="color: #c00000;">Son teslim: 10 Ekim</p>
    <p><img id="cid" src="cid:part1.logo@example.edu" alt="logo" width="120" height="40"> <img id="remote" src="${origin}/image/logo.svg" alt="uzak" width="64" height="32"></p>
  </body>
</html>
`;
}

function details(origin, changes = {}) {
	return {
		identityId: "id1", attachVCard: false, deliveryFormat: "auto", deliveryStatusNotification: false, priority: "normal", returnReceipt: false,
		from: "Ders <ders@example.edu>", to: ["{{E-posta}}"], cc: [], bcc: [], replyTo: [],
		subject: "Ödev sonucu: {{Ad}}", body: template(origin), plainTextBody: "", isPlainText: false,
		attachments: [], customHeaders: [],
		...changes,
	};
}

function chromePath() {
	if (process.env.CHROME_PATH) { return process.env.CHROME_PATH; }
	let cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
	try {
		for (let dir of fs.readdirSync(cache).filter(name => name.startsWith("chromium_headless_shell-")).sort().reverse()) {
			let candidate = path.join(cache, dir, "chrome-headless-shell-mac-arm64/chrome-headless-shell");
			if (fs.existsSync(candidate)) { return candidate; }
		}
	} catch(e) {}
	return null;
}

async function launch(engine, dark) {
	if (engine === "firefox") {
		// A private home keeps the run away from the user's own Firefox profiles.
		let home = fs.mkdtempSync(path.join(os.tmpdir(), "mailmerge-firefox-"));
		temporary.push(home);
		fs.mkdirSync(path.join(home, "profile"));
		return puppeteer.launch({
			browser: "firefox",
			executablePath: process.env.FIREFOX_PATH || "/Applications/Firefox.app/Contents/MacOS/firefox",
			headless: true,
			userDataDir: path.join(home, "profile"),
			env: { ...process.env, HOME: home, CFFIXED_USER_HOME: home },
			extraPrefsFirefox: { "layout.css.prefers-color-scheme.content-override": (dark) ? 0 : 1 },
		});
	}
	return puppeteer.launch({ browser: "chrome", executablePath: chromePath(), headless: true });
}

async function until(check, label, timeout = 5000) {
	let last;
	for (let start = Date.now(); Date.now() - start < timeout; await new Promise(resolve => setTimeout(resolve, 50))) {
		try {
			last = await check();
			if (last) { return last; }
		} catch(e) { last = e; }
	}
	throw new Error("Timed out: " + label + " (last: " + (last?.message ?? JSON.stringify(last)) + ")");
}

const preview = (page) => page.frames().find(frame => frame.parentFrame() === page.mainFrame());
const inPreview = (page, check, label) => until(() => preview(page).evaluate(check), label);
const notices = (page) => page.$$eval("#mailmerge-preview-notice p", lines => lines.map(line => line.textContent));
const text = (page, selector) => page.$eval(selector, element => element.textContent);

async function open(browser, engine, dark) {

	let page = await browser.newPage();
	await page.setViewport({ width: 800, height: 820 });
	if (dark && engine === "chrome") {
		await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
	}

	let html = read("content/dialog.html").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<link[^>]+>/g, "");
	await page.setContent(html);
	await page.addStyleTag({ content: read("content/style.css") });
	await page.evaluate((locales) => {
		window.messenger = { i18n: { getMessage(key, substitutions = []) {
			let message = locales.tr[key] ?? locales.en[key] ?? "";
			return message.replace(/[$](\d)/g, (match, n) => substitutions[n - 1] ?? "");
		} } };
	}, locales);
	await page.addScriptTag({ content: read("content/html-preview.js") });
	await page.addScriptTag({ content: read("content/dialog.js") });

	await page.evaluate(() => {
		// The parts of dialog.js's startup (which needs Thunderbird) that the message tab uses.
		for (let element of document.querySelectorAll("[data-i18n]")) {
			for (let attribute of element.dataset.i18n.split(";")) {
				if (attribute.includes("=")) {
					element.setAttribute(attribute.split("=")[0], messenger.i18n.getMessage(attribute.split("=")[1]));
				} else {
					element.textContent = messenger.i18n.getMessage(attribute);
				}
			}
		}
		document.getElementById("mailmerge-message-index").addEventListener("change", mailmerge.message.index);
		for (let name of ["begin", "previous", "next", "end", "accept"]) {
			document.getElementById("mailmerge-message-" + name).addEventListener("click", mailmerge.message[name]);
		}
		mailmergePreview.init();
		let source = document.getElementById("mailmerge-dialog-source");
		source.add(new Option("CSV", "CSV"));
		source.value = "CSV";
		let mode = document.getElementById("mailmerge-dialog-delivermode");
		mode.add(new Option("Send Now", "SendNow"));
		mode.value = "SendNow";
	});

	return page;

}

// Like mailmerge.message.init() after the data file has been read.
async function show(page, details, data) {
	await page.evaluate((details, data) => {
		compose.details = details;
		compose.extras = { listHeaders: [] };
		window.messages = data.map(object => ({ to: details.to, object }));
		document.getElementById("mailmerge-dialog").classList.remove("active");
		document.getElementById("mailmerge-message").classList.add("active");
		let index = document.getElementById("mailmerge-message-index");
		index.value = (window.messages.length === 0) ? 0 : 1;
		index.min = (window.messages.length === 0) ? 0 : 1;
		index.max = (window.messages.length === 0) ? 0 : window.messages.length;
		index.dispatchEvent(new Event("change"));
	}, details, data);
}

async function pixels(page, x, y, width = 1, height = 1) {
	let image = await page.screenshot({ encoding: "base64" });
	return page.evaluate(async (image, x, y, width, height) => {
		let bitmap = await createImageBitmap(await (await fetch("data:image/png;base64," + image)).blob());
		let canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		let context = canvas.getContext("2d");
		context.drawImage(bitmap, 0, 0);
		let data = context.getImageData(x, y, width, height).data;
		let result = [];
		for (let i = 0; i < data.length; i += 4) { result.push([data[i], data[i + 1], data[i + 2]]); }
		return result;
	}, image, x, y, width, height);
}

const pixel = async (page, x, y) => (await pixels(page, x, y))[0];

const near = (actual, expected, label) => assert.ok(actual.every((value, i) => Math.abs(value - expected[i]) <= 3), label + ": " + actual + " ≠ " + expected);

async function light(engine, origin, hits) {

	let browser = await launch(engine, false);
	try {

		let page = await open(browser, engine, false);

		/* Rendering: head styles, body attributes, real merge values */
		await show(page, details(origin), rows);
		await inPreview(page, () => document.getElementById("score")?.textContent === "85", "first recipient rendered");
		let first = await preview(page).evaluate(() => ({
			background: getComputedStyle(document.body).backgroundColor,
			table: getComputedStyle(document.querySelector(".score")).backgroundColor,
			bold: getComputedStyle(document.querySelector("b")).fontWeight,
			heading: document.querySelector("b").textContent,
			state: document.getElementById("state").textContent,
			red: getComputedStyle(document.getElementById("red")).color,
			href: document.querySelector("a").getAttribute("href"),
			title: document.querySelector("a").title,
			linkColor: getComputedStyle(document.querySelector("a")).color,
			underline: getComputedStyle(document.querySelector("a")).textDecorationLine,
			cid: document.getElementById("cid").src.slice(0, 19),
			cidTitle: document.getElementById("cid").title,
			remote: document.getElementById("remote").src.slice(0, 19),
		}));
		assert.equal(first.background, "rgb(255, 255, 204)", "body bgcolor is kept");
		assert.equal(first.table, "rgb(237, 243, 251)", "head style sheet is kept");
		assert.equal(first.bold, "700");
		assert.equal(first.heading, "Sayın Ayşe Yılmaz,");
		assert.equal(first.state, "Geçti", "conditional field uses the real substitution");
		assert.equal(first.red, "rgb(192, 0, 0)");
		assert.equal(first.href, "#mailmerge-preview-link", "links cannot navigate");
		assert.equal(first.title, "https://obs.example.edu/odev?no=1001", "personalized link target is shown on hover");
		assert.notEqual(first.linkColor, "rgb(0, 0, 0)", "links keep the link color");
		assert.equal(first.underline, "underline");
		assert.equal(first.cid, "data:image/svg+xml,");
		assert.equal(first.cidTitle, "Önizlemede gösterilemiyor: cid:part1.logo@example.edu");
		assert.equal(first.remote, "data:image/svg+xml,", "remote images wait for the user");
		assert.equal(await text(page, "#mailmerge-message-subject"), "Ödev sonucu: Ayşe");
		assert.equal(await text(page, "#mailmerge-message-to"), "ayse@example.com");
		assert.equal(await text(page, "#mailmerge-message-total"), "/ 3");
		assert.equal(await page.$eval("#mailmerge-message-previous", button => button.disabled), true);
		assert.equal(await page.$eval("#mailmerge-message-next", button => button.disabled), false);
		assert.equal(await page.$eval("#mailmerge-message-cc", span => span.parentElement.hidden), true);
		assert.equal(await page.$eval("#mailmerge-message-body", frame => frame.title), "İleti önizlemesi");
		assert.deepEqual(await notices(page), [
			"Boş alanı olan alıcı: 1 / 3 Sıradakine git",
			"Yüklenmeyen uzak resim: 1 Uzak resimleri göster",
			"Bu önizlemede gösterilemeyen resim: 1",
		]);

		/* Layout: one scroll area; the frame fills the window below the headers */
		let layout = await page.evaluate(() => ({
			frame: document.getElementById("mailmerge-message-body").getBoundingClientRect().toJSON(),
			footer: document.querySelector("#mailmerge-message .footer").getBoundingClientRect().top,
			scroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
		}));
		assert.ok(layout.frame.height > 300, "frame uses the free height: " + layout.frame.height);
		assert.ok(layout.frame.bottom <= layout.footer, "frame ends above the footer");
		assert.equal(layout.scroll, 0, "the dialog page itself does not scroll");
		near(await pixel(page, Math.round(layout.frame.right - 20), Math.round(layout.frame.bottom - 20)), [255, 255, 204], "light mode colors");
		if (screenshots && engine === "firefox") { await page.screenshot({ path: path.join(root, "screenshots", "preview.png") }); }

		/* Field check: jump to the recipient with empty fields */
		await page.click("#mailmerge-preview-notice button");
		await inPreview(page, () => document.querySelector("b")?.textContent === "Sayın Mehmet ,", "second recipient");
		assert.equal(await page.$eval("#mailmerge-message-index", index => index.value), "2");
		assert.equal(await preview(page).evaluate(() => document.getElementById("state").textContent), "Kaldı");
		assert.deepEqual(await notices(page), [
			"Bu alıcıda boş kalan alanlar: {{Soyad}}, {{Puan}}",
			"Boş alanı olan alıcı: 1 / 3",
			"Yüklenmeyen uzak resim: 1 Uzak resimleri göster",
			"Bu önizlemede gösterilemeyen resim: 1",
		]);
		if (screenshots && engine === "firefox") { await page.screenshot({ path: path.join(root, "screenshots", "fields.png") }); }

		/* Navigation boundaries */
		await page.click("#mailmerge-message-next");
		await inPreview(page, () => document.getElementById("score")?.textContent === "42", "third recipient");
		assert.equal(await page.$eval("#mailmerge-message-next", button => button.disabled), true);
		assert.equal(await page.$eval("#mailmerge-message-end", button => button.disabled), true);
		assert.equal(await page.$eval("#mailmerge-message-begin", button => button.disabled), false);

		/* Remote images only after asking */
		await new Promise(resolve => setTimeout(resolve, 300));
		assert.deepEqual(hits, [], "nothing was loaded before asking");
		await page.evaluate(() => [...document.querySelectorAll("#mailmerge-preview-notice button")].find(button => button.textContent === "Uzak resimleri göster").click());
		await inPreview(page, () => { let image = document.getElementById("remote"); return image?.src.startsWith("http:") && image.complete && image.naturalWidth === 64; }, "remote image loaded");
		assert.deepEqual(hits, ["/image/logo.svg"]);
		assert.equal((await notices(page)).some(line => line.startsWith("Yüklenmeyen uzak resim")), false);
		hits.length = 0;

		/* Desktop / phone width */
		await page.click("#mailmerge-preview-mobile");
		await inPreview(page, () => document.getElementById("score")?.textContent === "42", "mobile render");
		assert.equal(await page.$eval("#mailmerge-message-body", frame => Math.round(frame.getBoundingClientRect().width)), 390);
		assert.equal(await page.$eval("#mailmerge-preview-mobile", button => button.getAttribute("aria-pressed")), "true");
		assert.match(await page.$eval("#mailmerge-message-body", frame => frame.srcdoc), /:where\(img\) \{ max-width: 100%/);
		if (screenshots && engine === "firefox") { await page.screenshot({ path: path.join(root, "screenshots", "mobile.png") }); }
		await page.click("#mailmerge-preview-wide");
		assert.ok(await page.$eval("#mailmerge-message-body", frame => frame.getBoundingClientRect().width) > 600);
		hits.length = 0;

		/* Closing the tab clears the preview and forgets the remote image choice */
		await page.click("#mailmerge-message-accept");
		assert.equal(await page.$eval("#mailmerge-message-body", frame => frame.getAttribute("srcdoc")), "");
		assert.equal(await page.$eval("#mailmerge-preview-notice", notice => notice.hidden), true);
		assert.equal(await page.evaluate(() => mailmergePreview.remote), false);

		/* Template mistakes are reported */
		let mistakes = details(origin, { subject: "Ödev {{Nmae}}", body: "<p>Sayın {{Ad}} {{<b>Soyad</b>}}, {{Puan|50}}</p>" });
		await show(page, mistakes, rows);
		await inPreview(page, () => document.body?.textContent.includes("Sayın Ayşe"), "template with mistakes");
		assert.deepEqual(await notices(page), [
			"Veride bulunmayan alanlar: {{Nmae}}, {{<b>Soyad</b>}} → {{Soyad}} {{ }} içindeki biçimlendirmeyi kaldırın ya da alanı yeniden yazın.",
			"Yerine konamayan ifadeler: {{Puan|50}}",
		]);

		/* Plain text and the plain-text-only delivery format */
		await show(page, details(origin, { isPlainText: true, plainTextBody: "Sayın {{Ad}},\n<table>{{Puan}}</table>" }), rows);
		await inPreview(page, () => document.querySelector("pre")?.textContent === "Sayın Ayşe,\n<table>85</table>", "plain text");
		assert.equal(await preview(page).evaluate(() => document.querySelectorAll("table").length), 0);
		await show(page, details(origin, { deliveryFormat: "plaintext" }), rows);
		await inPreview(page, () => document.getElementById("score")?.textContent === "85", "html with plain text delivery");
		assert.equal((await notices(page))[0], "Teslim biçimi yalnızca düz metin: alıcılar bu biçimlendirmeyi görmeyecek.");

		/* A slow earlier request cannot overwrite a newer one */
		await page.evaluate(() => {
			let compose = mailmerge.utils.compose;
			mailmerge.utils.compose = async (index) => {
				if (index === 2) { await new Promise(resolve => setTimeout(resolve, 400)); }
				return compose(index);
			};
			let index = document.getElementById("mailmerge-message-index");
			index.value = 2;
			index.dispatchEvent(new Event("change"));
			index.value = 3;
			index.dispatchEvent(new Event("change"));
		});
		await new Promise(resolve => setTimeout(resolve, 700));
		assert.equal(await text(page, "#mailmerge-message-to"), "zeynep@example.com");
		assert.equal(await preview(page).evaluate(() => document.getElementById("score").textContent), "42");

		/* Active content and network loads never run in the preview */
		let unsafe = `<html><head><meta http-equiv="refresh" content="0;url=${origin}/refresh"><link rel="stylesheet" href="${origin}/link.css"><base href="${origin}/base/">
<style>@import url(${origin}/import.css); .bg { background: url(${origin}/background.png); }</style></head>
<body onload="parent.__executed = true"><script>parent.__executed = true</script>
<iframe src="${origin}/frame"></iframe><object data="${origin}/object"></object><embed src="${origin}/embed">
<img src="${origin}/image.png" srcset="${origin}/srcset.png 2x" onerror="parent.__executed = true">
<table background="${origin}/table.png"><tr><td class="bg">bg</td></tr></table><video poster="${origin}/poster.png" src="${origin}/video.mp4"></video>
<form action="${origin}/form"><input type="image" src="${origin}/input.png"><p id="inside">Form content</p></form>
<svg width="20" height="20"><a xlink:href="${origin}/svg"><rect width="20" height="20"/></a><image href="${origin}/svgimage.png" width="5" height="5"/></svg>
<a id="link" href="${origin}/link" target="_blank" ping="${origin}/ping">link</a><p id="done">Rendered</p></body></html>`;
		await new Promise(resolve => setTimeout(resolve, 500));
		hits.length = 0;
		await show(page, details(origin, { body: unsafe }), rows.slice(0, 1));
		await inPreview(page, () => document.getElementById("done") != null, "unsafe template rendered");
		let safe = await preview(page).evaluate(() => ({
			active: document.querySelectorAll("script, iframe, object, embed, meta[http-equiv=refresh], link, form").length,
			base: [...document.querySelectorAll("base")].map(base => base.getAttribute("href")),
			form: document.getElementById("inside")?.textContent,
			handlers: document.querySelectorAll("[onload], [onerror]").length,
			svg: document.querySelector("svg a").getAttribute("xlink:href"),
			target: document.getElementById("link").getAttribute("target"),
		}));
		assert.deepEqual(safe, { active: 0, base: ["about:srcdoc"], form: "Form content", handlers: 0, svg: "#mailmerge-preview-link", target: null });
		await preview(page).evaluate(() => document.getElementById("link").click());
		await new Promise(resolve => setTimeout(resolve, 1000));
		assert.equal(await page.evaluate(() => window.__executed), undefined, "no script ran");
		assert.equal(await preview(page).evaluate(() => document.getElementById("done") != null), true, "a link click stays in the preview");
		assert.deepEqual(hits, [], "no network request was made");
		assert.equal(await page.$eval("#mailmerge-message-body", frame => frame.getAttribute("sandbox")), "");

		/* Empty recipient list */
		await show(page, details(origin), []);
		await until(() => page.$eval("#mailmerge-message-total", span => span.textContent === "/ 0"), "empty list");
		assert.equal(await page.$eval("#mailmerge-message-body", frame => frame.getAttribute("srcdoc")), "");
		assert.equal(await page.$eval("#mailmerge-message-next", button => button.disabled), true);
		assert.equal(await page.$eval("#mailmerge-message-previous", button => button.disabled), true);
		assert.equal(await page.$eval("#mailmerge-preview-notice", notice => notice.hidden), true);
		assert.equal(await text(page, "#mailmerge-message-to"), "");

	} finally {
		await browser.close();
	}

}

async function dark(engine, origin) {

	let browser = await launch(engine, true);
	try {

		let page = await open(browser, engine, true);
		assert.equal(await page.evaluate(() => matchMedia("(prefers-color-scheme: dark)").matches), true);
		await show(page, details(origin), rows);
		await inPreview(page, () => document.getElementById("score")?.textContent === "85", "dark mode render");

		let frame = await page.$eval("#mailmerge-message-body", frame => frame.getBoundingClientRect().toJSON());
		near(await pixel(page, Math.round(frame.right - 20), Math.round(frame.bottom - 20)), [255, 255, 204], "dark mode keeps the message colors");
		let red = await preview(page).evaluate(() => document.getElementById("red").getBoundingClientRect().toJSON());
		let text = await pixels(page, Math.round(frame.left + red.left), Math.round(frame.top + red.top), Math.round(red.width), Math.round(red.height));
		assert.ok(text.some(([r, g, b]) => r > 170 && g < 40 && b < 40), "red text stays red");

		// The rest of the dialog still looks like the original dark mode.
		let colors = await page.evaluate(() => ["#mailmerge-message-to", ".mailmerge-preview-bar p", "#mailmerge-preview-notice p"].map(selector => getComputedStyle(document.querySelector(selector)).color));
		assert.deepEqual(colors, ["rgb(0, 0, 0)", "rgb(0, 0, 0)", "rgb(0, 0, 0)"], "filtered parts keep the light-mode text color");
		let header = await page.$eval("#mailmerge-message .header", header => header.getBoundingClientRect().toJSON());
		near(await pixel(page, 400, Math.round(header.top + 5)), [39, 39, 39], "header in dark mode");
		let content = await page.$eval("#mailmerge-message .content", content => content.getBoundingClientRect().toJSON());
		near(await pixel(page, 5, Math.round(content.top + 70)), [32, 33, 35], "page background in dark mode");
		if (screenshots && engine === "firefox") { await page.screenshot({ path: path.join(root, "screenshots", "dark.png") }); }

	} finally {
		await browser.close();
	}

}

(async () => {

	let hits = [];
	let server = http.createServer((request, response) => {
		hits.push(request.url);
		if (request.url.startsWith("/image/")) {
			response.writeHead(200, { "Content-Type": "image/svg+xml" });
			response.end('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32"><rect width="64" height="32" fill="#3973c1"/></svg>');
		} else {
			response.writeHead(200, { "Content-Type": "text/plain" });
			response.end("loaded");
		}
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	let origin = "http://127.0.0.1:" + server.address().port;

	let engines = ["firefox"];
	if (chromePath() != null) { engines.push("chrome"); }

	try {
		for (let engine of engines) {
			hits.length = 0;
			await light(engine, origin, hits);
			await dark(engine, origin);
			console.log("PASS " + engine);
		}
	} finally {
		server.close();
		for (let dir of temporary) { try { fs.rmSync(dir, { recursive: true, force: true }); } catch(e) {} }
	}

	console.log("PASS: rendering with head styles and body attributes, real merge values, links, images, field checks, navigation, widths, layout, dark mode, plain text, stale requests, sandboxing, empty list, closing.");

})().catch(e => { console.error(e); process.exit(1); });
