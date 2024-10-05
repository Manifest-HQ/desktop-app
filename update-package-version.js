const fs = require('fs')
const path = require('path')

// Path to package.json
const packagePath = path.join(__dirname, 'package.json')

// Read package.json
const packageData = fs.readFileSync(packagePath, 'utf8')
const packageJson = JSON.parse(packageData)

// Split the version
const [major, minor, patch] = packageJson.version.split('.').map(Number)

// Increment version based on conditions
let newMajor = major
let newMinor = minor
let newPatch = patch

if (patch === 9) {
  newPatch = 0
  newMinor += 1
  if (newMinor === 10) {
    newMinor = 0
    newMajor += 1
  }
} else {
  newPatch += 1
}

packageJson.version = `${newMajor}.${newMinor}.${newPatch}`

// Write the updated package.json back to disk
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n')

console.log(`Updated version to: ${packageJson.version}`)
