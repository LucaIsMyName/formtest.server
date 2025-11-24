# Step-Based Test Logging Implementation Plan

## Overview
Implement structured step logging in the test runner to provide granular visibility into test execution phases. Each test will log specific steps with timestamps, status, and metadata to create a detailed timeline view.

## Current State Analysis

### Current Logging System
- **Location**: `src/main/testRunner/runner.js`
- **Method**: Simple string-based logging via `this.log(message)`
- **Storage**: Logs stored as JSON array in `logDetails` field
- **Display**: Basic timeline parsing in `TestTimeline` component

### Current Test Flow
1. Browser initialization
2. Page navigation
3. Cookie handling
4. Form analysis
5. Form filling
6. Form submission
7. Success detection
8. Screenshot capture

## Proposed Step Structure

### Step Schema
```typescript
interface TestStep {
  id: string;                    // Unique step identifier
  name: string;                  // Human-readable step name
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  startTime: string;             // ISO timestamp
  endTime?: string;              // ISO timestamp when completed
  duration?: number;             // Duration in milliseconds
  message?: string;              // Additional details
  metadata?: Record<string, any>; // Step-specific data
  error?: string;                // Error message if failed
}
```

### Predefined Test Steps

#### 1. Browser Initialization
- **ID**: `browser-init`
- **Name**: "Initialize Browser"
- **Metadata**: `{ browserType: 'chromium', headless: boolean }`

#### 2. Page Navigation
- **ID**: `page-navigation`
- **Name**: "Navigate to URL"
- **Metadata**: `{ url: string, loadTime: number }`

#### 3. Cookie Handling
- **ID**: `cookie-handling`
- **Name**: "Handle Cookie Banner"
- **Metadata**: `{ cookieBannerFound: boolean, action: 'accepted' | 'dismissed' | 'none' }`

#### 4. Form Analysis
- **ID**: `form-analysis`
- **Name**: "Analyze Form Structure"
- **Metadata**: `{ fieldsFound: number, formType: string, paymentMethods: string[] }`

#### 5. Form Filling
- **ID**: `form-filling`
- **Name**: "Fill Form Fields"
- **Metadata**: `{ fieldsFilledCount: number, donationAmount: number, interval: number }`

#### 6. Payment Method Selection
- **ID**: `payment-selection`
- **Name**: "Select Payment Method"
- **Metadata**: `{ paymentMethod: string, isRecurring: boolean }`

#### 7. Validation Check
- **ID**: `validation-check`
- **Name**: "Validate Form Data"
- **Metadata**: `{ isValid: boolean, validationRules: string[] }`

#### 8. Form Submission
- **ID**: `form-submission`
- **Name**: "Submit Form"
- **Metadata**: `{ submitMethod: 'click' | 'enter', buttonSelector: string }`

#### 9. Redirect Detection
- **ID**: `redirect-detection`
- **Name**: "Detect Payment Redirect"
- **Metadata**: `{ redirectUrl: string, paymentProvider: string, redirectTime: number }`

#### 10. Success Confirmation
- **ID**: `success-confirmation`
- **Name**: "Confirm Test Success"
- **Metadata**: `{ successType: 'redirect' | 'message', finalUrl: string }`

#### 11. Screenshot Capture
- **ID**: `screenshot-capture`
- **Name**: "Capture Screenshot"
- **Metadata**: `{ screenshotPath: string, screenshotType: 'final' | 'error' }`

## Implementation Plan

### Phase 1: Core Step Infrastructure

#### 1.1 Update TestRunner Class (`runner.js`)
```javascript
class TestRunner {
  constructor() {
    this.steps = [];
    this.currentStep = null;
    // ... existing properties
  }

  // New step management methods
  startStep(stepId, stepName, metadata = {}) {
    const step = {
      id: stepId,
      name: stepName,
      status: 'running',
      startTime: new Date().toISOString(),
      metadata
    };
    
    this.steps.push(step);
    this.currentStep = step;
    this.log(`STEP_START: ${stepName}`, { stepId, metadata });
    return step;
  }

  completeStep(stepId, status = 'success', message = '', metadata = {}) {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.status = status;
      step.endTime = new Date().toISOString();
      step.duration = new Date(step.endTime) - new Date(step.startTime);
      step.message = message;
      step.metadata = { ...step.metadata, ...metadata };
      
      this.log(`STEP_COMPLETE: ${step.name} - ${status}`, { 
        stepId, 
        duration: step.duration,
        message,
        metadata 
      });
    }
    
    if (this.currentStep?.id === stepId) {
      this.currentStep = null;
    }
  }

  failStep(stepId, error, metadata = {}) {
    this.completeStep(stepId, 'error', error, metadata);
  }

  skipStep(stepId, reason, metadata = {}) {
    this.completeStep(stepId, 'skipped', reason, metadata);
  }
}
```

#### 1.2 Update Database Schema
Add new field to store structured steps:
```sql
ALTER TABLE test_runs ADD COLUMN steps TEXT; -- JSON array of TestStep objects
```

#### 1.3 Update TypeScript Types (`src/common/types.ts`)
```typescript
interface TestStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  startTime: string;
  endTime?: string;
  duration?: number;
  message?: string;
  metadata?: Record<string, any>;
  error?: string;
}

interface TestRun {
  // ... existing fields
  steps?: TestStep[]; // New field
}
```

### Phase 2: Integrate Steps into Test Flow

#### 2.1 Update `runFormTest` Method
```javascript
async runFormTest() {
  try {
    // Step 1: Browser Initialization
    const browserStep = this.startStep('browser-init', 'Initialize Browser', {
      browserType: 'chromium',
      headless: !this.config.showBrowser
    });

    // ... browser setup code ...
    this.completeStep('browser-init', 'success', 'Browser initialized successfully');

    // Step 2: Page Navigation
    const navStep = this.startStep('page-navigation', 'Navigate to URL', {
      url: this.config.url
    });

    const startTime = Date.now();
    await this.page.goto(this.config.url, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    this.completeStep('page-navigation', 'success', `Page loaded in ${loadTime}ms`, {
      loadTime
    });

    // Continue with other steps...
    
  } catch (error) {
    if (this.currentStep) {
      this.failStep(this.currentStep.id, error.message);
    }
    throw error;
  }
}
```

#### 2.2 Update Each Test Phase
- **Cookie Handling**: Wrap cookie detection/acceptance in steps
- **Form Analysis**: Track form discovery and analysis
- **Form Filling**: Log each field filled
- **Payment Selection**: Track payment method selection
- **Submission**: Track form submission attempt
- **Success Detection**: Track redirect detection and success confirmation

### Phase 3: Enhanced UI Components

#### 3.1 Update TestTimeline Component
```typescript
interface EnhancedTimelineStep extends TestStep {
  // Add UI-specific properties
  icon: React.ReactNode;
  color: string;
  description: string;
}

const TestTimeline: React.FC<{ steps?: TestStep[]; logDetails?: string; status: string }> = ({ 
  steps, 
  logDetails, 
  status 
}) => {
  // Prioritize structured steps over log parsing
  const timelineSteps = steps?.length ? 
    convertStepsToTimeline(steps) : 
    parseLogDetails(logDetails);
    
  // ... render enhanced timeline
};
```

#### 3.2 Step Icons and Colors
```typescript
const STEP_CONFIG = {
  'browser-init': { icon: <Globe />, color: 'blue' },
  'page-navigation': { icon: <Navigation />, color: 'blue' },
  'cookie-handling': { icon: <Cookie />, color: 'yellow' },
  'form-analysis': { icon: <Search />, color: 'purple' },
  'form-filling': { icon: <Edit />, color: 'blue' },
  'payment-selection': { icon: <CreditCard />, color: 'green' },
  'validation-check': { icon: <CheckCircle />, color: 'orange' },
  'form-submission': { icon: <Send />, color: 'blue' },
  'redirect-detection': { icon: <ExternalLink />, color: 'purple' },
  'success-confirmation': { icon: <CheckCircle2 />, color: 'green' },
  'screenshot-capture': { icon: <Camera />, color: 'gray' }
};
```

### Phase 4: Advanced Features

#### 4.1 Step Duration Analytics
- Track average duration per step type
- Identify performance bottlenecks
- Show duration comparisons in UI

#### 4.2 Step Retry Logic
```javascript
async executeStepWithRetry(stepId, stepName, stepFunction, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const step = this.startStep(`${stepId}-${attempt}`, stepName, { attempt });
    
    try {
      const result = await stepFunction();
      this.completeStep(step.id, 'success', `Completed on attempt ${attempt + 1}`);
      return result;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        this.failStep(step.id, `Failed after ${maxRetries} attempts: ${error.message}`);
        throw error;
      } else {
        this.completeStep(step.id, 'error', `Attempt ${attempt} failed, retrying...`);
      }
    }
  }
}
```

#### 4.3 Conditional Steps
```javascript
// Skip payment selection for one-time donations with invalid recurring setup
if (isRecurring && !isSepaPayment) {
  this.skipStep('payment-selection', 'Invalid recurring payment method combination');
  this.skipStep('form-submission', 'Skipping submission due to validation rules');
}
```

## Database Migration

### Migration Script
```sql
-- Add steps column to test_runs table
ALTER TABLE test_runs ADD COLUMN steps TEXT;

-- Update existing records with empty steps array
UPDATE test_runs SET steps = '[]' WHERE steps IS NULL;
```

## Testing Strategy

### Unit Tests
- Test step creation and completion
- Test step serialization/deserialization
- Test error handling in steps

### Integration Tests
- Test full step flow in sample test run
- Verify step data persistence
- Test UI rendering of steps

### Performance Tests
- Measure overhead of step logging
- Ensure step logging doesn't significantly impact test execution time

## Rollout Plan

### Phase 1 (Week 1)
- [ ] Implement core step infrastructure
- [ ] Add database migration
- [ ] Update TypeScript types
- [ ] Basic unit tests

### Phase 2 (Week 2)
- [ ] Integrate steps into browser initialization
- [ ] Integrate steps into page navigation
- [ ] Integrate steps into cookie handling
- [ ] Update UI to display structured steps

### Phase 3 (Week 3)
- [ ] Integrate steps into form analysis and filling
- [ ] Integrate steps into payment selection
- [ ] Integrate steps into form submission
- [ ] Add step retry logic

### Phase 4 (Week 4)
- [ ] Integrate steps into success detection
- [ ] Add step duration analytics
- [ ] Polish UI with icons and colors
- [ ] Comprehensive testing

## Benefits

### For Developers
- **Better Debugging**: Clear visibility into where tests fail
- **Performance Insights**: Identify slow steps and bottlenecks
- **Test Reliability**: Retry logic for flaky steps

### For Users
- **Clear Progress**: Visual indication of test progress
- **Better Understanding**: Know exactly what the test is doing
- **Faster Troubleshooting**: Quickly identify failure points

### For System
- **Structured Data**: Machine-readable test execution data
- **Analytics**: Historical performance data per step
- **Monitoring**: Alert on specific step failures

## Future Enhancements

### Advanced Analytics
- Step success rates over time
- Performance trends per step type
- Failure pattern analysis

### Real-time Updates
- WebSocket updates for live step progress
- Real-time test execution monitoring

### Step Templates
- Reusable step definitions
- Custom step types for specific test scenarios
- Step composition and nesting

## Risk Mitigation

### Performance Impact
- **Risk**: Step logging adds overhead
- **Mitigation**: Minimal logging, async where possible, performance testing

### Backward Compatibility
- **Risk**: Breaking existing log parsing
- **Mitigation**: Fallback to old log parsing when steps not available

### Data Storage
- **Risk**: Increased database size
- **Mitigation**: Optional step storage, cleanup policies for old data

## Success Metrics

- [ ] 100% of test runs include structured steps
- [ ] UI displays meaningful step timeline for all tests
- [ ] Step logging overhead < 5% of total test execution time
- [ ] Developer feedback positive on debugging improvements
- [ ] User feedback positive on test visibility improvements
