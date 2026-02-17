const fs = require('fs');
const path = require('path');

// Target file path
const p = path.join('c:', 'Users', 'franc', 'OneDrive', 'Desktop', 'lio oficial', 'components', 'ProfileScreen.tsx');

console.log("Script started.");
console.log("Target path:", p);

try {
    if (!fs.existsSync(p)) {
        console.log("File does not exist!");
        process.exit(1);
    }

    let c = fs.readFileSync(p, 'utf8');
    console.log("Read " + c.length + " bytes.");

    // Fix tags with spaces
    c = c.replace(/< Modal/g, '<Modal');
    c = c.replace(/<\/Modal >/g, '</Modal>');
    c = c.replace(/<\/View >/g, '</View>');

    // Fix props with spaces
    c = c.replace(/visible = {/g, 'visible={');
    c = c.replace(/transparent = {/g, 'transparent={');
    c = c.replace(/animationType = "/g, 'animationType="');
    c = c.replace(/onRequestClose = {/g, 'onRequestClose={');

    // Fix comments
    c = c.replace(/\*\/ }/g, '*/}');

    fs.writeFileSync(p, c);
    console.log("Wrote " + c.length + " bytes.");
    console.log("Fix completed successfully.");

} catch (e) {
    console.log("Error: " + e.message);
    process.exit(1);
}
