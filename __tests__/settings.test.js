const Database = require('better-sqlite3')

describe('Settings Database Operations', () => {
  let db
  let settingsQueries

  beforeEach(() => {
    // Create in-memory database for testing
    db = new Database(':memory:')
    
    // Create global_settings table
    db.exec(`
      CREATE TABLE global_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT
      )
    `)

    // Replicate the settings queries
    settingsQueries = {
      getAll: () => db.prepare('SELECT * FROM global_settings ORDER BY key').all(),
      get: (key) => db.prepare('SELECT * FROM global_settings WHERE key = ?').get(key),
      set: (key, value, description) => 
        db.prepare('INSERT OR REPLACE INTO global_settings (key, value, description) VALUES (?, ?, ?)').run(key, value, description)
    }
  })

  afterEach(() => {
    if (db) {
      db.close()
    }
  })

  test('should create and retrieve settings', () => {
    const result = settingsQueries.set('test_key', 'test_value', 'Test description')
    expect(result.changes).toBe(1)

    const setting = settingsQueries.get('test_key')
    expect(setting).toEqual({
      key: 'test_key',
      value: 'test_value',
      description: 'Test description'
    })
  })

  test('should update existing settings', () => {
    // Create initial setting
    settingsQueries.set('update_key', 'initial_value', 'Initial description')
    
    // Update the setting
    const result = settingsQueries.set('update_key', 'updated_value', 'Updated description')
    expect(result.changes).toBe(1)

    const setting = settingsQueries.get('update_key')
    expect(setting.value).toBe('updated_value')
    expect(setting.description).toBe('Updated description')
  })

  test('should retrieve all settings', () => {
    settingsQueries.set('key1', 'value1', 'Description 1')
    settingsQueries.set('key2', 'value2', 'Description 2')
    settingsQueries.set('key3', 'value3', 'Description 3')

    const allSettings = settingsQueries.getAll()
    expect(allSettings).toHaveLength(3)
    expect(allSettings[0].key).toBe('key1') // Should be ordered by key
    expect(allSettings[1].key).toBe('key2')
    expect(allSettings[2].key).toBe('key3')
  })

  test('should handle default settings', () => {
    const defaultSettings = [
      { key: 'default_donation_amount', value: '50', description: 'Default donation amount in EUR' },
      { key: 'default_interval', value: '0', description: 'Default donation interval (0=once, 1=monthly)' },
      { key: 'test_timeout', value: '30000', description: 'Test timeout in milliseconds' },
      { key: 'headless_mode', value: 'true', description: 'Run tests in headless mode' }
    ]

    // Insert default settings
    defaultSettings.forEach(setting => {
      settingsQueries.set(setting.key, setting.value, setting.description)
    })

    const allSettings = settingsQueries.getAll()
    expect(allSettings).toHaveLength(4)
    
    const donationAmount = settingsQueries.get('default_donation_amount')
    expect(donationAmount.value).toBe('50')
    
    const headlessMode = settingsQueries.get('headless_mode')
    expect(headlessMode.value).toBe('true')
  })

  test('should handle settings without description', () => {
    const result = settingsQueries.set('no_desc_key', 'some_value')
    expect(result.changes).toBe(1)

    const setting = settingsQueries.get('no_desc_key')
    expect(setting.key).toBe('no_desc_key')
    expect(setting.value).toBe('some_value')
    expect(setting.description).toBeNull()
  })

  test('should return undefined for non-existent setting', () => {
    const setting = settingsQueries.get('non_existent_key')
    expect(setting).toBeUndefined()
  })
})
