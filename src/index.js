import {PDFDocument} from "pdf-lib";
import fs from "fs";
import path from "path";

const extFile = filename => filename.split('.').pop();

export async function cut({file, output, start = 0, end = 1}) {
    await fs.promises.access(file);

    const outputPDF = await PDFDocument.create();
    const loadedPDF = await PDFDocument.load(await fs.promises.readFile(file));

    const pages = await outputPDF.copyPages(loadedPDF, loadedPDF.getPageIndices().slice(start, end));

    for (let i = 0; i < pages.length; i++) {
        outputPDF.addPage(pages[i]);
    }

    await fs.promises.writeFile(output, await outputPDF.save());
}

export async function buildDir({dir, output, extension}) {
    await fs.promises.access(dir);

    extension = extension ? String(extension).split(',') : null;
    const files = await fs.promises.readdir(dir)
        // Extension filters
        .then(files => extension ? files.filter(file => extension.includes(extFile(file))) : files);

    if (!files.length) {
        return;
    }

    const PDF = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
        const file = path.resolve(dir, files[i]);
        let ext = extFile(files[i]);
        let buffer = await fs.promises.readFile(file);

        try {
            if (['jpeg', 'jpg', 'png'].includes(ext)) {
                const image = ext === 'png' ? await PDF.embedPng(buffer) : await PDF.embedJpg(buffer);
                const page = PDF.addPage();

                page.setSize(image.width, image.height);
                page.drawImage(image, {x: 0, y: 0});
            } else if (['pdf'].includes(ext)) {
                const mergePDF = await PDFDocument.load(buffer);
                const pages = await PDF.copyPages(mergePDF, mergePDF.getPageIndices());

                for (let i = 0; i < pages.length; i++) {
                    PDF.addPage(pages[i]);
                }
            }
        } catch (e) {
            console.warn(e);
        }
    }

    await fs.promises.writeFile(output, await PDF.save());
}
