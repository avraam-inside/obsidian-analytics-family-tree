<%*
// https://forum.obsidian.md/t/template-for-insert-callout/65074/19

//get selection
noteContent = await tp.file.selection();

// Check if the selected text has one or two strings
let numberOfStrings = noteContent.split('\n').length;
let titre;
let corps;

if (numberOfStrings === 1) {
    // Ingest titre only
    titre = noteContent.match(/.*/g)[0];
    corps = "";
} else if (numberOfStrings > 1) {
    // Ingest titre and corps
    titre = noteContent.match(/.*(?=\n.*)/g)[0];
    corps = noteContent.match(/(?<=.*\n)(.|\n)*/g).join('\n');
}

console.log(corps);

// list callouts
const callouts = {
    quote:           '🔘 💬 Quote / Cite',
    // tip:             '🌐 🔥 Tip / Hint / Important',
    "личное-мнение": '🌐 🔥 Личное мнение',
    failure:         '🔴 ❌ Failure / Fail / Missing',
    success:         '🟢 ✔ Success / Check / Done',
    question:        '🟡 ❓ Question / Help / FAQ',
    warning:         '🟠 ⚠ Warning / Caution / Attention',
    note:            '🔵 ✏ Note',
    abstract:        '🌐 📋 Abstract / Summary / TLDR',
    example:         '🟣 📑 Example'
};

const type = await tp.system.suggester(Object.values(callouts), Object.keys(callouts), true, 'Select callout type.');

const title = titre;

//get array of lines
lines = corps.split('\n');

//make a new string with > prepended to each line
let newContent = "";
lines.forEach(l => {
    newContent += '> ' + l + "\n";
})

//remove the last newline character
newContent = newContent.replace(/\n$/, "");

//define callout header
header = "> [!"+type+"]" + " " + title +"\n";

// Return the complete callout block
if (numberOfStrings === 1) {
    return header;
} else {
    return header + newContent;
}
%>