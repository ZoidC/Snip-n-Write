import { SnipAndWrite } from "./utils.js";

// Supported language
// https://tesseract-ocr.github.io/tessdoc/Data-Files#data-files-for-version-400-november-29-2016
const LANG = 'fra';

try {
    const text = await SnipAndWrite(LANG);
    console.log(text);
} catch (error) {
    console.log(error);
}
