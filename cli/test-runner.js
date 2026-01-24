#!/usr/bin/env node

/**
 * CLI Test Runner for FormTest Server
 * 
 * Usage:
 *   node cli/test-runner.js --form <form-id|form-name> --payment <payment-id|payment-type>
 *   node cli/test-runner.js --list-forms
 *   node cli/test-runner.js --list-payments
 *   node cli/test-runner.js --validate <form-id> <payment-type> <interval>
 * 
 * Valid combinations:
 *   - SEPA: all intervals (0=one-time, 1=monthly, 3=quarterly, 12=yearly)
 *   - EPS, Credit Card, PayPal: only one-time (interval=0)
 */

const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// Payment method interval rules
const PAYMENT_RULES = {
  sepa: { allowedIntervals: [0, 1, 3, 12], description: 'All intervals (one-time, monthly, quarterly, yearly)' },
  eps: { allowedIntervals: [0], description: 'One-time only' },
  creditcard: { allowedIntervals: [0], description: 'One-time only' },
  paypal: { allowedIntervals: [0], description: 'One-time only' },
};

// Interval labels
const INTERVAL_LABELS = {
  0: 'One-time',
  1: 'Monthly',
  3: 'Quarterly',
  12: 'Yearly',
};

class CLITestRunner {
  constructor() {
    this.dbPath = this.findDatabasePath();
    this.db = null;
  }

  findDatabasePath() {
    // Try common locations for the database
    const possiblePaths = [
      path.join(os.homedir(), 'Library/Application Support/formtest-server/formtest.db'),
      path.join(os.homedir(), '.config/formtest-server/formtest.db'),
      path.join(process.cwd(), 'formtest.db'),
      path.join(__dirname, '../formtest.db'),
    ];

    for (const p of possiblePaths) {
      try {
        const db = new Database(p, { readonly: true });
        db.close();
        return p;
      } catch (e) {
        // Try next path
      }
    }

    return possiblePaths[0]; // Default to first path
  }

  connect() {
    try {
      this.db = new Database(this.dbPath, { readonly: true });
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to database at ${this.dbPath}`);
      console.error(`   Error: ${error.message}`);
      return false;
    }
  }

  disconnect() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  listForms() {
    if (!this.connect()) return;

    try {
      const forms = this.db.prepare('SELECT id, name, url, isActive FROM forms ORDER BY name').all();
      
      console.log('\n📋 Available Forms:\n');
      console.log('ID\tActive\tName\t\t\t\tURL');
      console.log('─'.repeat(80));
      
      for (const form of forms) {
        const active = form.isActive ? '✅' : '❌';
        const name = form.name.padEnd(24);
        console.log(`${form.id}\t${active}\t${name}\t${form.url.substring(0, 40)}...`);
      }
      
      console.log(`\nTotal: ${forms.length} forms\n`);
    } finally {
      this.disconnect();
    }
  }

  listPaymentMethods() {
    if (!this.connect()) return;

    try {
      const methods = this.db.prepare('SELECT id, name, type, isActive FROM payment_methods ORDER BY type, name').all();
      
      console.log('\n💳 Available Payment Methods:\n');
      console.log('ID\tActive\tType\t\tName\t\t\tAllowed Intervals');
      console.log('─'.repeat(90));
      
      for (const method of methods) {
        const active = method.isActive ? '✅' : '❌';
        const type = method.type.padEnd(12);
        const name = method.name.padEnd(20);
        const rules = PAYMENT_RULES[method.type.toLowerCase()];
        const intervals = rules ? rules.allowedIntervals.map(i => INTERVAL_LABELS[i]).join(', ') : 'Unknown';
        console.log(`${method.id}\t${active}\t${type}\t${name}\t${intervals}`);
      }
      
      console.log(`\nTotal: ${methods.length} payment methods\n`);
      
      console.log('📌 Payment Rules:');
      for (const [type, rules] of Object.entries(PAYMENT_RULES)) {
        console.log(`   ${type.toUpperCase()}: ${rules.description}`);
      }
      console.log('');
    } finally {
      this.disconnect();
    }
  }

  validateCombination(paymentType, interval) {
    const type = paymentType.toLowerCase();
    const rules = PAYMENT_RULES[type];
    
    if (!rules) {
      return { valid: false, reason: `Unknown payment type: ${paymentType}` };
    }
    
    const intervalNum = parseInt(interval);
    if (rules.allowedIntervals.includes(intervalNum)) {
      return { 
        valid: true, 
        reason: `${paymentType.toUpperCase()} supports ${INTERVAL_LABELS[intervalNum]} donations` 
      };
    }
    
    return { 
      valid: false, 
      reason: `${paymentType.toUpperCase()} only supports: ${rules.allowedIntervals.map(i => INTERVAL_LABELS[i]).join(', ')}` 
    };
  }

  getForm(identifier) {
    const id = parseInt(identifier);
    if (!isNaN(id)) {
      return this.db.prepare('SELECT * FROM forms WHERE id = ?').get(id);
    }
    return this.db.prepare('SELECT * FROM forms WHERE name LIKE ?').get(`%${identifier}%`);
  }

  getPaymentMethod(identifier) {
    const id = parseInt(identifier);
    if (!isNaN(id)) {
      return this.db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id);
    }
    // Try by type first, then by name
    let method = this.db.prepare('SELECT * FROM payment_methods WHERE LOWER(type) = LOWER(?)').get(identifier);
    if (!method) {
      method = this.db.prepare('SELECT * FROM payment_methods WHERE name LIKE ?').get(`%${identifier}%`);
    }
    return method;
  }

  getSettings() {
    const settings = {};
    const rows = this.db.prepare('SELECT key, value FROM global_settings').all();
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  }

  async runTest(formIdentifier, paymentIdentifier, options = {}) {
    if (!this.connect()) return;

    try {
      const form = this.getForm(formIdentifier);
      if (!form) {
        console.error(`❌ Form not found: ${formIdentifier}`);
        return;
      }

      const paymentMethod = this.getPaymentMethod(paymentIdentifier);
      if (!paymentMethod) {
        console.error(`❌ Payment method not found: ${paymentIdentifier}`);
        return;
      }

      const settings = this.getSettings();
      const interval = options.interval !== undefined ? options.interval : (settings.default_interval || '0');

      // Validate combination
      const validation = this.validateCombination(paymentMethod.type, interval);
      
      console.log('\n🧪 Test Configuration:\n');
      console.log(`   Form:           ${form.name} (ID: ${form.id})`);
      console.log(`   URL:            ${form.url}`);
      console.log(`   Payment:        ${paymentMethod.name} (${paymentMethod.type.toUpperCase()})`);
      console.log(`   Interval:       ${INTERVAL_LABELS[parseInt(interval)]} (${interval})`);
      console.log(`   Validation:     ${validation.valid ? '✅ Valid' : '❌ Invalid'}`);
      console.log(`   Reason:         ${validation.reason}`);
      console.log('');

      if (!validation.valid) {
        console.log('⚠️  This combination will be skipped during test execution.');
        console.log('   The test runner will mark it as successful but skip form submission.\n');
        
        if (!options.force) {
          console.log('   Use --force to run anyway (for debugging purposes).\n');
          return { success: false, skipped: true, reason: validation.reason };
        }
      }

      if (options.dryRun) {
        console.log('🔍 Dry run mode - not executing test.\n');
        return { success: true, dryRun: true };
      }

      // Execute the test
      console.log('🚀 Starting test execution...\n');
      
      const result = await this.executeTest(form, paymentMethod, settings, interval);
      
      if (result.success) {
        console.log(`\n✅ Test completed successfully!`);
        if (result.skippedSubmission) {
          console.log(`   ⚠️  Form submission was skipped (invalid combination)`);
        }
        console.log(`   Duration: ${result.duration}ms`);
        if (result.screenshot) {
          console.log(`   Screenshot: ${result.screenshot}`);
        }
      } else {
        console.log(`\n❌ Test failed!`);
        console.log(`   Error: ${result.error}`);
      }

      return result;
    } finally {
      this.disconnect();
    }
  }

  executeTest(form, paymentMethod, settings, interval) {
    return new Promise((resolve) => {
      const runnerPath = path.join(__dirname, '../src/main/testRunner/runner.js');
      
      const child = spawn('node', [runnerPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'cli' }
      });

      let output = '';
      let result = null;

      child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const msg = JSON.parse(line);
              if (msg.type === 'log') {
                console.log(`   [LOG] ${msg.message}`);
              } else if (msg.type === 'result') {
                result = msg.data;
              } else if (msg.type === 'error') {
                console.error(`   [ERROR] ${msg.message}`);
              }
            } catch (e) {
              // Not JSON, just log it
              if (line.includes('STEP_')) {
                console.log(`   ${line}`);
              }
            }
          }
        }
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        console.error(`   [STDERR] ${data.toString()}`);
      });

      child.on('close', (code) => {
        if (result) {
          resolve(result);
        } else {
          resolve({
            success: code === 0,
            error: code !== 0 ? `Process exited with code ${code}` : null,
            output
          });
        }
      });

      // Parse payment details
      let details = {};
      try {
        details = typeof paymentMethod.details === 'string' 
          ? JSON.parse(paymentMethod.details) 
          : paymentMethod.details;
      } catch (e) {
        // Details might be encrypted
      }

      // Send test configuration
      const config = {
        type: 'run',
        form: {
          id: form.id,
          name: form.name,
          url: form.url,
          fieldMappings: form.fieldMappings ? JSON.parse(form.fieldMappings) : []
        },
        paymentMethod: {
          id: paymentMethod.id,
          name: paymentMethod.name,
          type: paymentMethod.type,
          details
        },
        settings: {
          ...settings,
          default_interval: interval
        }
      };

      child.stdin.write(JSON.stringify(config) + '\n');
    });
  }

  showHelp() {
    console.log(`
FormTest Server CLI
===================

Usage:
  node cli/test-runner.js [command] [options]

Commands:
  --list-forms, -lf              List all available forms
  --list-payments, -lp           List all payment methods with rules
  --validate <type> <interval>   Validate a payment/interval combination
  --run, -r                      Run a test

Run Options:
  --form, -f <id|name>           Form ID or name to test
  --payment, -p <id|type|name>   Payment method ID, type, or name
  --interval, -i <0|1|3|12>      Donation interval (default: from settings)
  --dry-run                      Validate without running
  --force                        Run even if combination is invalid

Examples:
  # List all forms
  node cli/test-runner.js --list-forms

  # List payment methods and their rules
  node cli/test-runner.js --list-payments

  # Validate a combination
  node cli/test-runner.js --validate sepa 1
  node cli/test-runner.js --validate paypal 0

  # Run a test
  node cli/test-runner.js --run --form 1 --payment sepa --interval 0
  node cli/test-runner.js -r -f "WWF" -p eps -i 0

Payment Rules:
  SEPA:        All intervals (one-time, monthly, quarterly, yearly)
  EPS:         One-time only
  Credit Card: One-time only
  PayPal:      One-time only
`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const cli = new CLITestRunner();

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    cli.showHelp();
    return;
  }

  if (args.includes('--list-forms') || args.includes('-lf')) {
    cli.listForms();
    return;
  }

  if (args.includes('--list-payments') || args.includes('-lp')) {
    cli.listPaymentMethods();
    return;
  }

  if (args.includes('--validate')) {
    const idx = args.indexOf('--validate');
    const type = args[idx + 1];
    const interval = args[idx + 2] || '0';
    
    if (!type) {
      console.error('❌ Usage: --validate <payment-type> <interval>');
      return;
    }
    
    const result = cli.validateCombination(type, interval);
    console.log(`\n${result.valid ? '✅' : '❌'} ${result.reason}\n`);
    return;
  }

  if (args.includes('--run') || args.includes('-r')) {
    const getArg = (flags) => {
      for (const flag of flags) {
        const idx = args.indexOf(flag);
        if (idx !== -1 && args[idx + 1]) {
          return args[idx + 1];
        }
      }
      return null;
    };

    const form = getArg(['--form', '-f']);
    const payment = getArg(['--payment', '-p']);
    const interval = getArg(['--interval', '-i']);
    const dryRun = args.includes('--dry-run');
    const force = args.includes('--force');

    if (!form || !payment) {
      console.error('❌ Usage: --run --form <id|name> --payment <id|type|name> [--interval <0|1|3|12>]');
      return;
    }

    await cli.runTest(form, payment, { interval, dryRun, force });
    return;
  }

  cli.showHelp();
}

main().catch(console.error);
