import * as vscode from 'vscode';
import * as os from 'os';

function padStringLeft(padding: string, str: string, count: number): string {
	const out = padding.repeat(count - str.length);
	return out + str;
}

export function activate(context: vscode.ExtensionContext) {
	const outChannel = vscode.window.createOutputChannel("Number Tooltip");
	outChannel.appendLine("extension loaded successfully...");

	const platform = os.platform();

	const provider = vscode.languages.registerHoverProvider({ scheme: 'file', language: '*' }, {
		provideHover(document, position, token) {
			const range = document.getWordRangeAtPosition(position,
				/(?:0[xX][0-9a-fA-F]+[uUlL]{0,3}\b)|(?:\b\d+[uUlL]{0,3}\b)|(?:0[bB][01]+[uUlL]{0,3}\b)/
			);			

			if (range) {
				const numString = document.getText(range);
				outChannel.appendLine(`hover: on <${numString}>`);
				let number, radix;

				if (numString.startsWith("0x") || numString.startsWith("0X")) {
					number = parseInt(numString, 16);
					radix = 16;
				} else if (numString.startsWith("0b") || numString.startsWith("0B")) {
					number = parseInt(numString.substring(2), 2);
					radix = 2;
				} else {
					number = parseInt(numString, 10);
					radix = 10;
				}

				outChannel.appendLine(`hover: <${numString}>`);

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
				} else if (bits <= 64) {
					bitCount = 64;
				} else {
					outChannel.appendLine("hover: use smaller numbers you psycho");
					return null;
				}

				// fixup for ull, ul, u, ll, l: assume a 64 bit platform and an LP64
				// size scheme if not on windows, which should work fine?
				let use_llp64 = false;
				if (platform == 'win32')
					use_llp64 = true;

				if (numString.endsWith("ull")) {
					bitCount = 64;
				} else if (numString.endsWith("ll")) {
					bitCount = 64;
				} else if (numString.endsWith("ul")) {
					bitCount = use_llp64 ? 32 : 64;
				} else if (numString.endsWith("l")) {
					bitCount = use_llp64 ? 32 : 64;
				} else if (numString.endsWith("u")) {
					bitCount = 32;
				}

				binary = padStringLeft("0", binary, bitCount);
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
			outChannel.appendLine("hover: failed to match number string");
			return null;
		}
	});

	context.subscriptions.push(provider);
}

export function deactivate() {
	// cleanup, provide skeleton because the docs say so
}
