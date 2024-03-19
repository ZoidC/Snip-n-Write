import { exec } from 'child_process';
import { createWorker } from 'tesseract.js';

const performOCR = async (base64img, lang) => {
    const worker = await createWorker(lang);
    const ret = await worker.recognize(Buffer.from(base64img, "base64"));
    await worker.terminate();
    return ret.data.text;
};

export const SnipAndWrite = (lang) => {
    return new Promise((resolve, reject) => {
        exec('SnippingTool.exe /clip', (snError, _SnStdOut, snStdErr) => {

            if (snError) {
                reject(`Erreur lors de la capture d'écran : ${snError.message}`);
                return;
            }
            if (snStdErr) {
                reject(`Erreur lors de la capture d'écran : ${snStdErr}`);
                return;
            }

            exec(
                'powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys(\'^{PRTSC}\');' +
                'Start-Sleep -Milliseconds 100; Add-Type -AssemblyName System.Windows.Forms;' +
                '$image = [System.Windows.Forms.Clipboard]::GetImage();' +
                '$image.Save(\'clipboard.png\');' +
                '$base64Image = [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes(\'clipboard.png\'));' +
                'Write-Output $base64Image"',

                async (error, stdout, stderr) => {

                if (error) {
                    reject(`Error capturing screen and converting to base64: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`Error capturing screen and converting to base64: ${stderr}`);
                    return;
                }

                const text = await performOCR(stdout.trim(), lang);

                if (text) {
                    resolve(text);
                } else {
                    reject('OCR failed to extract text from the screen.');
                }
            });
        });
    });
}
