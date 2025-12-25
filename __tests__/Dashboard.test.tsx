import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../src/renderer/src/pages/Dashboard';

// Mock the stores
vi.mock('../src/renderer/src/store/useFormsStore', () => ({
  useFormsStore: () => ({
    forms: [
      { id: 1, name: 'Test Form 1', isActive: true },
      { id: 2, name: 'Test Form 2', isActive: false }
    ],
    loadForms: vi.fn()
  })
}));

vi.mock('../src/renderer/src/store/usePaymentMethodsStore', () => ({
  usePaymentMethodsStore: () => ({
    paymentMethods: [
      { id: 1, name: 'PayPal', type: 'PAYPAL', isActive: true },
      { id: 2, name: 'SEPA', type: 'SEPA', isActive: true }
    ],
    loadPaymentMethods: vi.fn()
  })
}));

vi.mock('../src/renderer/src/store/useTestRunsStore', () => ({
  useTestRunsStore: () => ({
    testRuns: [
      {
        id: 1,
        formId: 1,
        paymentMethodId: 1,
        status: 'SUCCESS',
        runAt: new Date('2024-01-01T10:00:00Z').toISOString(),
        durationMs: 5000
      },
      {
        id: 2,
        formId: 1,
        paymentMethodId: 2,
        status: 'FAILURE',
        runAt: new Date('2024-01-15T14:00:00Z').toISOString(),
        durationMs: 3000
      },
      {
        id: 3,
        formId: 2,
        paymentMethodId: 1,
        status: 'SUCCESS',
        runAt: new Date('2024-02-01T09:00:00Z').toISOString(),
        durationMs: 4500
      }
    ],
    loadTestRuns: vi.fn(),
    isRunning: false
  })
}));

// Mock the components that might cause issues
vi.mock('../src/renderer/src/components/TestRunDialog', () => ({
  default: () => <div data-testid="test-run-dialog">Test Run Dialog</div>
}));

const DashboardWrapper = () => (
  <BrowserRouter>
    <Dashboard />
  </BrowserRouter>
);

describe('Dashboard All-Time Statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard with all-time chart titles', async () => {
    render(<DashboardWrapper />);
    
    // Wait for the component to load
    const dashboardTitle = await screen.findByText('Dashboard');
    expect(dashboardTitle).toBeDefined();
    
    // Check that chart titles reflect all-time data
    const timelineChart = screen.getByText('Test-Verlauf (Gesamter Zeitraum)');
    const successRateChart = screen.getByText('Erfolgsrate (Gesamter Zeitraum)');
    
    expect(timelineChart).toBeDefined();
    expect(successRateChart).toBeDefined();
  });

  it('should display statistics cards', async () => {
    render(<DashboardWrapper />);
    
    // Wait for the component to load
    await screen.findByText('Dashboard');
    
    // Check that stats cards are present
    expect(screen.getByText('Gesamt Tests')).toBeDefined();
    expect(screen.getByText('Bezahlmethoden')).toBeDefined();
    expect(screen.getByText('Erfolgreich')).toBeDefined();
    expect(screen.getByText('Erfolgsrate')).toBeDefined();
  });

  it('should show charts when test runs exist', async () => {
    render(<DashboardWrapper />);
    
    // Wait for the component to load
    await screen.findByText('Dashboard');
    
    // Check that chart sections are rendered
    expect(screen.getByText('Erfolgsrate Übersicht')).toBeDefined();
    expect(screen.getByText('Bezahlmethoden Performance')).toBeDefined();
    expect(screen.getByText('Formular Performance')).toBeDefined();
  });
});
