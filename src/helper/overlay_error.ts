export function getErrorStack(traceParsedStack,errorStack, sourceMapConsumer) {
    let errorString = errorStack.split('\n').find(line => line.trim().length > 0);
    errorString = `<h3 style="font-size: 18px; margin-bottom: 8px; color: #f45556;"><b>${errorString}</b></h3>`;

    traceParsedStack?.forEach(({ methodName, lineNumber, column }) => {
        try {
            if (lineNumber == null || lineNumber < 1) {
                errorString += `<p style="color: #dda2aa">      at  <strong>${methodName || ''
                    }</strong></p>`;
            } else {
                const pos = sourceMapConsumer.originalPositionFor({ line: lineNumber, column });
                if (pos && pos.line != null) {
                    errorString += `<p style="color: #dda2aa">      at  <strong>${methodName || pos.name || ''
                        }</strong> (${pos.source}:${pos.line}:${pos.column})</p>`;
                }
            }
        } catch (err) {
            console.log(`    at FAILED_TO_PARSE_LINE`);
        }
    });
    return errorString
}

export default function getOverlayErrorHtml({message, pathToFile, name, info, errorString, noCloseButton = false}){
    return `
    <div
        class="overlay"
        style="
        position: absolute;
        inset: 0;
        background: #454545;
        color: white;
        padding: 50px 32px;
        z-index: 10000;
        font-family: monospace;
        "
    >
        ${!noCloseButton ? '<button class="close-error-boundry-btn" style="position: absolute; top: 16px; right: 16px; z-index: 10000; border: none; background: none; color: white; font-size: 20px; cursor: pointer;">&#x2715;</button>' : ""}
        <div class="header-wrapper" style="margin-bottom: 16px">
            <h1 style="color: #f45556; font-size: 24px;">${message}</h1>
        </div>
        <div class="location" style="margin-bottom: 16px">
            <a href="vscode://file${pathToFile}" style="color: #878888; font-size: 20px; line-height: 23px; text-decoration: none;border: none; text-align: left;">
                <span style="color: #fff;">${name} ${info}</span>
                <br />
                <span style="font-size: 16px; line-height: 19px;">
                ${pathToFile}
                </span>
            </a>
        </div>
        <a href="vscode://file${pathToFile}"  style="padding: 10px; background: #564143; display: block; font-size: 16px; line-height: 19px; text-decoration: none;">${errorString}</a>
        <a style="background: #0078d7; color: white; text-decoration: none; padding: 8px 16px; margin-top: 16px; display: block; width: max-content; border-radius: 2px; font-family: arial; border: none;" href="vscode://file${pathToFile}">Open in VS Code</a>
    </div>`
}

