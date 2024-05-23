import * as vscode from 'vscode';

function padString(padding: string, str: string, count: number): string {
    const out = padding.repeat(count - str.length);
    return out + str;
}

export function activate(context: vscode.ExtensionContext) {
    const outChannel = vscode.window.createOutputChannel("Number Tooltip");
    outChannel.appendLine("extension loaded successfully...");

    const provider = vscode.languages.registerHoverProvider({ scheme: 'file', language: '*' }, {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position,
					/(?:0[xX][0-9a-fA-F]+)|(?:\b\d+\b)|(?:0[bB][01]+)/);

            if (range) {
                const numberText = document.getText(range);
                let number, radix;

                if (numberText.startsWith("0x") || numberText.startsWith("0X")) {
                    number = parseInt(numberText, 16);
                    radix = 16;
                } else if (numberText.startsWith("0b") || numberText.startsWith("0B")) {
                    number = parseInt(numberText.substring(2), 2);
                    radix = 2;
                } else {
                    number = parseInt(numberText, 10);
                    radix = 10;
                }

                outChannel.appendLine(`hover: <${numberText}>`);

                if (isNaN(number)) {
					outChannel.appendLine("hover: NaN");
					return null;
				}

				let binary = number.toString(2);
				const bits = Math.ceil(Math.log2(number + 1));
				let bitCount;
				if (bits <= 8) {
					bitCount = 8;
				} else if (bits <= 16) {
					bitCount = 16;
				} else if (bits <= 32) {
					bitCount = 32;
				} else if (bits <= 32) {
					bitCount = 64;
				} else {
					outChannel.appendLine("hover: use smaller numbers you psycho");
					return null;
				}

				binary = padString("0", binary, bitCount);
				const binGroups = binary.match(/.{1,8}/g);
				if (!binGroups) {
					outChannel.appendLine("hover: invalid binary format");
					return null;
				}

				const binaryOutput = `**Bin:** \`${binGroups.join("'")}\`\n`;
				const hex = `**Hex:** \`${number.toString(16)}\`\n`;
				const decimal = `**Dec:** \`${number}\`\n`;
				const formats = [binaryOutput, hex, decimal].join('\n');
				const hoverString = new vscode.MarkdownString();
				hoverString.appendMarkdown(`${formats}`);
				hoverString.isTrusted = true;
				outChannel.appendLine(`binary: <${binaryOutput}>, hexadecimal: <${hex}>, decimal: <${decimal}>`);
				return new vscode.Hover(hoverString);
            }
            outChannel.appendLine("hover: unreachable");
            return null;
        }
    });

    context.subscriptions.push(provider);
}

export function deactivate() {
	// cleanup, provide because the docs say so
}
