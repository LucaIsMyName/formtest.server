#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const os = require('os')

// Get the user data directory path (same as Electron app.getPath('userData'))
const appName = 'FormTest.Server' // This should match your app name in package.json
const userDataPath = path.join(os.homedir(), 'Library', 'Application Support', appName)
const dbPath = path.join(userDataPath, 'formtest.db')

console.log('🔧 FormTest Server Database Reset Tool')
console.log('=====================================')
console.log(`Database path: ${dbPath}`)

if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath)
    console.log('✅ Database file deleted successfully!')
    console.log('📝 The database will be recreated with proper foreign key constraints when you next start the app.')
  } catch (error) {
    console.error('❌ Error deleting database:', error.message)
    console.log('💡 Try closing the FormTest Server app first, then run this script again.')
  }
} else {
  console.log('ℹ️  Database file not found. It may have already been deleted or the app hasn\'t been run yet.')
}

console.log('\n🚀 You can now start FormTest Server - it will create a fresh database with CASCADE DELETE support.')
