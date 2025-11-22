import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Forms from './pages/Forms'
import PaymentMethods from './pages/PaymentMethods'
import Settings from './pages/Settings'
import TestResults from './pages/TestResults'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/test-results" element={<TestResults />} />
      </Routes>
    </Layout>
  )
}

export default App
