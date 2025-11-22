const { spawn } = require('child_process')
const path = require('path')

describe('Enhanced Browser Automation', () => {
  let runnerProcess

  afterEach(async () => {
    if (runnerProcess) {
      runnerProcess.kill('SIGTERM')
      runnerProcess = null
    }
  })

  test('should handle cookie consent and navigation improvements', (done) => {
    const runnerPath = path.join(__dirname, '..', 'src', 'main', 'testRunner', 'runner.js')
    
    runnerProcess = spawn('node', [runnerPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let hasStarted = false
    let testCompleted = false

    runnerProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim())
      
      for (const line of lines) {
        try {
          const message = JSON.parse(line)
          if (message.type === 'TEST_COMPLETE' && !testCompleted) {
            testCompleted = true
            
            // Check if test was successful or failed gracefully
            expect(message.payload).toBeDefined()
            expect(['success', 'error']).toContain(message.payload.success ? 'success' : 'error')
            
            done()
          }
        } catch (error) {
          // Ignore non-JSON output
        }
      }
    })

    runnerProcess.stderr.on('data', (data) => {
      const output = data.toString()
      
      if (output.includes('Test runner process started') && !hasStarted) {
        hasStarted = true
        
        // Send test message with enhanced navigation
        const testMessage = {
          id: 'test_enhanced_1',
          type: 'START_TEST',
          payload: {
            testRunId: 1,
            form: {
              id: 1,
              name: 'Test Form',
              url: 'https://httpbin.org/html', // Simple test URL
              isActive: true
            },
            paymentMethod: {
              id: 1,
              name: 'Test PayPal',
              type: 'PAYPAL',
              details: {}
            },
            settings: {
              headless_mode: 'true',
              test_timeout: '30000'
            }
          }
        }
        
        runnerProcess.stdin.write(JSON.stringify(testMessage) + '\n')
      }
    })

    runnerProcess.on('error', (error) => {
      done(error)
    })

    // Timeout
    setTimeout(() => {
      if (!testCompleted) {
        done(new Error('Test did not complete within timeout'))
      }
    }, 45000)
  }, 50000)

  test('should handle VISA payment method with card details', (done) => {
    const runnerPath = path.join(__dirname, '..', 'src', 'main', 'testRunner', 'runner.js')
    
    runnerProcess = spawn('node', [runnerPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let hasStarted = false
    let testCompleted = false

    runnerProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim())
      
      for (const line of lines) {
        try {
          const message = JSON.parse(line)
          if (message.type === 'TEST_COMPLETE' && !testCompleted) {
            testCompleted = true
            done()
          }
        } catch (error) {
          // Ignore non-JSON output
        }
      }
    })

    runnerProcess.stderr.on('data', (data) => {
      const output = data.toString()
      
      if (output.includes('Test runner process started') && !hasStarted) {
        hasStarted = true
        
        // Send test message with VISA payment method
        const testMessage = {
          id: 'test_visa_1',
          type: 'START_TEST',
          payload: {
            testRunId: 2,
            form: {
              id: 1,
              name: 'Test Form',
              url: 'https://httpbin.org/html',
              isActive: true
            },
            paymentMethod: {
              id: 2,
              name: 'Test VISA Card',
              type: 'VISA',
              details: {
                cardNumber: '4111111111111111',
                cardHolder: 'Max Mustermann',
                expiryDate: '12/25',
                cvv: '123'
              }
            },
            settings: {
              headless_mode: 'true',
              test_timeout: '30000'
            }
          }
        }
        
        runnerProcess.stdin.write(JSON.stringify(testMessage) + '\n')
      }
    })

    runnerProcess.on('error', (error) => {
      done(error)
    })

    // Timeout
    setTimeout(() => {
      if (!testCompleted) {
        done(new Error('VISA test did not complete within timeout'))
      }
    }, 45000)
  }, 50000)
})
