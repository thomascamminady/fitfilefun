import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.openFitFile', async () => {
		// Get the currently selected file in the Explorer view
		const uri = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			filters: {
				'FIT files': ['fit']
			}
		});


		// Check if a file was selected
		if (uri && uri[0].fsPath.endsWith('.fit')) {
			// Build the command to convert the .fit file to .csv using crFitTool
			const config = vscode.workspace.getConfiguration('fitfilefun');
			const fitToolPath = config.get('fitToolPath');
			const inputFilePath = uri[0].fsPath;
			const baseName = path.basename(inputFilePath, '.fit');
			const outputFolder = path.join(path.dirname(inputFilePath), `.${baseName}.fit`);
			const outputFilePath = path.join(outputFolder, `data`);
			const command = `${fitToolPath} --in ${inputFilePath} --csv ${outputFilePath}`;

			// Create the output folder if it doesn't exist
			if (!fs.existsSync(outputFolder)) {
				fs.mkdirSync(outputFolder);
			}


			const terminal = vscode.window.createTerminal();
			terminal.sendText(command);
			//terminal.sendText(`exit`);
			terminal.show();
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Open the generated CSV file in a new editor tab
			const csvUri = vscode.Uri.file(outputFilePath + `.records.csv`);
			const csvDocument = await vscode.workspace.openTextDocument(csvUri);
			await vscode.window.showTextDocument(csvDocument);
		}
	});
	context.subscriptions.push(disposable);
}
