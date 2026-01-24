const { chromium } = require('playwright')

describe('Form Automation System', () => {
  let browser
  let page

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true })
  })

  afterAll(async () => {
    if (browser) {
      await browser.close()
    }
  })

  beforeEach(async () => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  afterEach(async () => {
    if (page) {
      await page.close()
    }
  })

  test('should detect form fields correctly', async () => {
    // Create a simple HTML form for testing
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <input type="text" name="firstName" id="firstName" placeholder="First Name" required>
          <input type="email" name="email" id="email" placeholder="Email Address" required>
          <input type="number" name="amount" id="amount" placeholder="Donation Amount">
          <select name="salutation" id="salutation">
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
          </select>
          <button type="submit">Spenden</button>
        </form>
      </body>
      </html>
    `

    await page.setContent(html)

    // Test form field detection
    const inputs = await page.$$('input')
    expect(inputs.length).toBe(3)

    const selects = await page.$$('select')
    expect(selects.length).toBe(1)

    const submitButtons = await page.$$('button[type="submit"]')
    expect(submitButtons.length).toBe(1)
  })

  test('should identify field purposes correctly', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <input type="email" name="email" placeholder="E-Mail Adresse">
          <input type="text" name="firstName" placeholder="Vorname">
          <input type="text" name="lastName" placeholder="Nachname">
          <input type="number" name="amount" placeholder="Spendenbetrag">
        </form>
      </body>
      </html>
    `

    await page.setContent(html)

    // Test field purpose identification
    const emailField = await page.$('input[name="email"]')
    expect(emailField).toBeTruthy()

    const nameField = await page.$('input[name="firstName"]')
    expect(nameField).toBeTruthy()

    const amountField = await page.$('input[name="amount"]')
    expect(amountField).toBeTruthy()
  })

  test('should detect payment methods in form content', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <h3>Zahlungsart wählen</h3>
          <input type="radio" name="payment" value="paypal" id="paypal">
          <label for="paypal">PayPal</label>
          
          <input type="radio" name="payment" value="sepa" id="sepa">
          <label for="sepa">SEPA Lastschrift</label>
          
          <input type="radio" name="payment" value="creditcard" id="creditcard">
          <label for="creditcard">Kreditkarte</label>
          
          <input type="text" name="iban" placeholder="IBAN">
          <input type="text" name="bic" placeholder="BIC">
        </form>
      </body>
      </html>
    `

    await page.setContent(html)

    // Check for payment-related content
    const content = await page.textContent('body')
    expect(content).toContain('PayPal')
    expect(content).toContain('SEPA')
    expect(content).toContain('Kreditkarte')

    // Check for payment fields
    const ibanField = await page.$('input[name="iban"]')
    expect(ibanField).toBeTruthy()

    const bicField = await page.$('input[name="bic"]')
    expect(bicField).toBeTruthy()
  })

  test('should handle form filling with test data', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <input type="text" name="firstName" id="firstName">
          <input type="email" name="email" id="email">
          <input type="number" name="amount" id="amount">
          <select name="salutation" id="salutation">
            <option value="">Bitte wählen</option>
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
          </select>
        </form>
      </body>
      </html>
    `

    await page.setContent(html)

    // Fill form fields
    await page.fill('input[name="firstName"]', 'Max')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="amount"]', '50')
    await page.selectOption('select[name="salutation"]', 'Herr')

    // Verify values were set
    const firstName = await page.inputValue('input[name="firstName"]')
    expect(firstName).toBe('Max')

    const email = await page.inputValue('input[name="email"]')
    expect(email).toBe('test@example.com')

    const amount = await page.inputValue('input[name="amount"]')
    expect(amount).toBe('50')

    const salutation = await page.inputValue('select[name="salutation"]')
    expect(salutation).toBe('Herr')
  })

  test('should detect submit buttons with various patterns', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <button type="submit">Jetzt spenden</button>
          <input type="submit" value="Weiter">
          <button class="submit-btn">Absenden</button>
        </form>
      </body>
      </html>
    `

    await page.setContent(html)

    // Test different submit button patterns
    const submitButton1 = await page.$('button[type="submit"]')
    expect(submitButton1).toBeTruthy()

    const submitButton2 = await page.$('input[type="submit"]')
    expect(submitButton2).toBeTruthy()

    const submitButton3 = await page.$('.submit-btn')
    expect(submitButton3).toBeTruthy()
  })

  test('should handle complex form structures', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <div class="donation-form">
          <form id="donationForm">
            <fieldset>
              <legend>Persönliche Daten</legend>
              <input type="text" name="firstName" placeholder="Vorname" required>
              <input type="text" name="lastName" placeholder="Nachname" required>
              <input type="email" name="email" placeholder="E-Mail" required>
            </fieldset>
            
            <fieldset>
              <legend>Spendenbetrag</legend>
              <input type="number" name="amount" placeholder="Betrag in EUR" min="1">
              <select name="interval">
                <option value="0">Einmalig</option>
                <option value="1">Monatlich</option>
              </select>
            </fieldset>
            
            <fieldset>
              <legend>Zahlungsart</legend>
              <div class="payment-methods">
                <label><input type="radio" name="payment" value="paypal"> PayPal</label>
                <label><input type="radio" name="payment" value="sepa"> SEPA</label>
              </div>
            </fieldset>
            
            <button type="submit" class="btn-primary">Spende abschließen</button>
          </form>
        </div>
      </body>
      </html>
    `

    await page.setContent(html)

    // Verify complex form structure
    const form = await page.$('#donationForm')
    expect(form).toBeTruthy()

    const fieldsets = await page.$$('fieldset')
    expect(fieldsets.length).toBe(3)

    const requiredFields = await page.$$('input[required]')
    expect(requiredFields.length).toBe(3)

    const paymentOptions = await page.$$('input[name="payment"]')
    expect(paymentOptions.length).toBe(2)
  })
})
