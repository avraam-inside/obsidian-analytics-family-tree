<%*
    // obsidian quick add append link to current file in created file
    // https://www.reddit.com/r/ObsidianMD/comments/z3hmhq/auto_parent_templater_template_that_can_be/?utm_source=share&utm_medium=android_app&utm_name=androidcss&utm_term=1&utm_content=share_button
    async function getLastOpenFile(){
		const lastActiveFile = app.workspace.lastActiveFile;

		// If the last active file is different from the current one, then it can be used
		if (lastActiveFile !== null && lastActiveFile.basename !== tp.file.title ) {
			const lastActiveFileBaseName = lastActiveFile.basename;
			console.log(`No match on last active file, using it!. (${lastActiveFileBaseName} !== ${tp.file.title})`);

			await tp.file.move(`${lastActiveFile.parent.path}/${tp.file.title}`);

			return lastActiveFileBaseName;
		}

		// If it's the same, then in the history the last opened one can be retrieved.
		const lastFile = app.workspace.recentFileTracker.lastOpenFiles[0];
		const lastNameParts = lastFile.split("/");
		console.log( "Last active filed matched, using:", lastNameParts);
		const fileName = lastNameParts.pop();
		const name = fileName.replaceAll(".md", "");

		await tp.file.move(`${lastNameParts.join("/")}/${tp.file.title}`);

		return name;
	}
-%>
[[<% await getLastOpenFile() %>]]