/**
 * @vitest-environment node
 */
const { spawn } = require('child_process')
const path = require('path')

describe('Browser Automation Integration', () => {
  let runnerProcess

  afterEach(async () => {
    if (runnerProcess) {
      runnerProcess.kill('SIGTERM')
      runnerProcess = null
    }
  })

  test('should start test runner process successfully', () => {
    return new Promise((resolve, reject) => {
      const runnerPath = path.join(__dirname, '..', 'src', 'main', 'testRunner', 'runner.js')
      
      runnerProcess = spawn('node', [runnerPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let hasStarted = false

      runnerProcess.stderr.on('data', (data) => {
        const output = data.toString()
        // console.log('Runner log:', output)
        
        if (output.includes('Test runner process started') && !hasStarted) {
          hasStarted = true
          resolve()
        }
      })

      runnerProcess.on('error', (error) => {
        reject(error)
      })

      runnerProcess.on('exit', (code) => {
        if (!hasStarted) {
          reject(new Error(`Process exited with code ${code} before starting`))
        }
      })

      // Give it a moment to start
      setTimeout(() => {
        if (!hasStarted) {
          reject(new Error('Process did not start within timeout'))
        }
      }, 5000)
    })
  }, 10000)

  test('should respond to ping message', () => {
    return new Promise((resolve, reject) => {
      const runnerPath = path.join(__dirname, '..', 'src', 'main', 'testRunner', 'runner.js')
      
      runnerProcess = spawn('node', [runnerPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let hasStarted = false
      let hasPonged = false

      runnerProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const message = JSON.parse(line)
            if (message.type === 'PONG' && !hasPonged) {
              hasPonged = true
              resolve()
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
          
          // Send ping message
          const pingMessage = {
            id: 'test_ping_1',
            type: 'PING'
          }
          
          runnerProcess.stdin.write(JSON.stringify(pingMessage) + '\n')
        }
      })

      runnerProcess.on('error', (error) => {
        reject(error)
      })

      // Timeout
      setTimeout(() => {
        if (!hasPonged) {
          reject(new Error('No pong response received within timeout'))
        }
      }, 8000)
    })
  }, 10000)

  test('should handle invalid message gracefully', () => {
    return new Promise((resolve, reject) => {
      const runnerPath = path.join(__dirname, '..', 'src', 'main', 'testRunner', 'runner.js')
      
      runnerProcess = spawn('node', [runnerPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let hasStarted = false
      let processStillRunning = true

      runnerProcess.stderr.on('data', (data) => {
        const output = data.toString()
        
        if (output.includes('Test runner process started') && !hasStarted) {
          hasStarted = true
          
          // Send invalid JSON
          runnerProcess.stdin.write('invalid json message\n')
          
          // Wait a bit and check if process is still running
          setTimeout(() => {
            if (processStillRunning) {
              resolve() // Success - process handled invalid message gracefully
            }
          }, 2000)
        }
      })

      runnerProcess.on('exit', () => {
        processStillRunning = false
        if (hasStarted) {
          reject(new Error('Process exited after invalid message - should handle gracefully'))
        }
      })

      runnerProcess.on('error', (error) => {
        reject(error)
      })

      // Timeout
      setTimeout(() => {
        if (!hasStarted) {
          reject(new Error('Process did not start within timeout'))
        }
      }, 5000)
    })
  }, 8000)
})
